// ─── RAG Retriever ─────────────────────────────────────────────────────────────
// Tries semantic search first, falls back to keyword matching on static knowledge base.
// Integrates CSP constraint validation + GNN-inspired room adjacency scoring.
// Sources: z-aqib/Floor-Plan-Generator-Using-AI + mo7amed7assan1911/Floor_Plan_Generation_using_GNNs

import { searchSimilarPlans, getByDimension } from "./vectorStore.js";
import { isEmbeddingAvailable } from "./embeddings.js";
import {
  EXAMPLE_LAYOUTS,
  VASTU_ZONE_RULES,
  buildQueryDocument,
  formatRAGContext,
} from "./knowledgeBase.js";
import { validateLayoutWithCSP, formatCSPRefinementHint } from "../csp/constraintSolver.js";
import { scoreRoomAdjacency, formatAdjacencyHint, computeCompositeScore } from "../graph/roomAdjacency.js";

// ─── Keyword-based fallback retrieval from static examples ───────────────────
function keywordRetrieve(params, topK = 3) {
  const { plotW, plotH, bhk, facing } = params;
  const dimKey = `${plotW}x${plotH}`;

  const scored = EXAMPLE_LAYOUTS.map(ex => {
    let score = 0;
    if (ex.dimension === dimKey) score += 40;
    if (ex.bhk === bhk || ex.bhk === parseInt(bhk)) score += 30;
    if (ex.facing === facing) score += 20;
    const [ew, eh] = ex.dimension.split("x").map(Number);
    const areaDiff = Math.abs(ew * eh - plotW * plotH) / (plotW * plotH);
    if (areaDiff < 0.3) score += 10;
    return { ...ex, matchScore: score };
  });

  return scored
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, topK)
    .map(ex => ({
      content:   ex.description,
      score:     ex.score,
      source:    "static",
      dimension: ex.dimension,
      bhk:       ex.bhk,
      facing:    ex.facing,
    }));
}

// ─── Main retrieval function ──────────────────────────────────────────────────
export async function retrieveRAGContext(params) {
  const queryText = buildQueryDocument(params);
  let docs = [];

  // 1. Try exact dimension match from vector store
  if (isEmbeddingAvailable()) {
    try {
      const dimKey = `${params.plotW}x${params.plotH}`;
      const exact = await getByDimension(dimKey, parseInt(params.bhk), params.facing);
      if (exact.length > 0) docs = exact;
    } catch (e) {
      console.warn("Exact dimension lookup failed:", e.message);
    }
  }

  // 2. Try semantic search from vector store
  if (docs.length < 2 && isEmbeddingAvailable()) {
    try {
      const semantic = await searchSimilarPlans(queryText, { topK: 5, minScore: 0.25 });
      docs = [...docs, ...semantic.filter(d => !docs.some(e => e.id === d.id))];
    } catch (e) {
      console.warn("Semantic search failed:", e.message);
    }
  }

  // 3. Keyword fallback from static knowledge base
  if (docs.length < 2) {
    const fallback = keywordRetrieve(params, 3);
    docs = [...docs, ...fallback];
  }

  const zoneRules = VASTU_ZONE_RULES[params.facing] || VASTU_ZONE_RULES.North;

  return {
    docs,
    zoneRules,
    formattedContext: formatRAGContext(docs, params),
    source: docs[0]?.source || "static",
  };
}

// ─── Build violation-based refinement hint (Vastu + CSP + GNN adjacency) ──────
/**
 * Merges three layers of violations into one structured refinement prompt:
 *  1. Standard Vastu rule violations (existing AI evaluation)
 *  2. CSP domain constraint violations (z-aqib/Floor-Plan-Generator-Using-AI approach)
 *  3. Room adjacency graph violations (mo7amed7assan1911/Floor_Plan_Generation_using_GNNs approach)
 *
 * @param {Object} vastuReport - { score, violations, compliant }
 * @param {Object} ragContext  - { formattedContext }
 * @param {Object} layout      - { rooms } from layoutEngine (optional)
 * @param {Object} params      - { plotW, plotH, bhk, facing } (optional)
 */
export function buildRefinementHint(vastuReport, ragContext, layout, params) {
  const parts = [];

  // ── Part 1: Standard Vastu violations ─────────────────────────────────────
  if (vastuReport?.violations?.length) {
    const criticalViolations = vastuReport.violations
      .filter(v => v.severity === "critical" || v.severity === "major")
      .map(v => `[CRITICAL FIX REQUIRED] ${v.rule}: ${v.fix}`)
      .join("\n");

    const minorViolations = vastuReport.violations
      .filter(v => v.severity === "minor")
      .map(v => `[FIX] ${v.rule}: ${v.fix}`)
      .join("\n");

    const zoneEnforcements = vastuReport.violations
      .map(v => {
        const roomMatch = v.rule.match(/^([A-Za-z\s]+)\s+in\s+(\w+)/);
        if (!roomMatch) return null;
        return `ENFORCE: Move "${roomMatch[1].trim()}" OUT of ${roomMatch[2]} zone to its correct zone`;
      })
      .filter(Boolean)
      .join("\n");

    parts.push(`VASTU REFINEMENT REQUIRED (current score: ${vastuReport.score}/100 — target ≥75):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL VIOLATIONS TO FIX:
${criticalViolations || "None"}

MINOR VIOLATIONS TO FIX:
${minorViolations || "None"}

ZONE ENFORCEMENT:
${zoneEnforcements || "None"}

COMPLIANT RULES (do NOT change these):
${vastuReport.compliant?.join(", ") || "None"}`);
  }

  // ── Part 2: CSP constraint violations ─────────────────────────────────────
  if (layout?.rooms && params) {
    try {
      const cspResult = validateLayoutWithCSP(layout, params);
      if (cspResult.violations.length > 0) {
        parts.push(formatCSPRefinementHint(cspResult));
      } else {
        parts.push(`CSP VALIDATION: All zone domain constraints satisfied (score: ${cspResult.cspScore}/100) ✓`);
      }
    } catch (e) {
      console.warn("[retriever] CSP validation error:", e.message);
    }
  }

  // ── Part 3: Room adjacency graph violations ────────────────────────────────
  if (layout?.rooms) {
    try {
      const adjResult = scoreRoomAdjacency(layout.rooms);
      if (adjResult.violations.length > 0) {
        parts.push(formatAdjacencyHint(adjResult));
      } else {
        parts.push(`ADJACENCY GRAPH: All room adjacency requirements satisfied (score: ${adjResult.adjacencyScore}/100) ✓`);
      }
    } catch (e) {
      console.warn("[retriever] Adjacency scoring error:", e.message);
    }
  }

  // ── Compose final hint ─────────────────────────────────────────────────────
  parts.push(`Re-draw the floor plan fixing ALL violations above. Maintain the same plot size and BHK count.`);
  if (ragContext?.formattedContext) {
    parts.push(ragContext.formattedContext);
  }

  return parts.join("\n\n");
}

// ─── Composite layout quality analysis ────────────────────────────────────────
/**
 * Runs CSP + adjacency graph analysis on a layout and returns a composite score.
 * Weights: 60% CSP zone compliance + 40% adjacency graph compliance.
 */
export function analyzeLayoutQuality(layout, params) {
  let cspScore = 100, adjScore = 100;
  let cspViolations = [], adjViolations = [];

  try {
    const csp = validateLayoutWithCSP(layout, params);
    cspScore = csp.cspScore;
    cspViolations = csp.violations;
  } catch (e) {
    console.warn("[retriever] CSP analysis error:", e.message);
  }

  try {
    const adj = scoreRoomAdjacency(layout?.rooms || []);
    adjScore = adj.adjacencyScore;
    adjViolations = adj.violations;
  } catch (e) {
    console.warn("[retriever] Adjacency analysis error:", e.message);
  }

  const compositeScore = computeCompositeScore(cspScore, adjScore);
  return { cspScore, adjScore, compositeScore, cspViolations, adjViolations };
}
