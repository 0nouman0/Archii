// ─── RAG Retriever ────────────────────────────────────────────────────────────
// Tries semantic search first, falls back to keyword matching on static knowledge base.

import { searchSimilarPlans, getByDimension } from "./vectorStore.js";
import { isEmbeddingAvailable } from "./embeddings.js";
import {
  EXAMPLE_LAYOUTS,
  VASTU_ZONE_RULES,
  VALIDATION_RULES,
  VALIDATION_RULES_PROMPT,
  ALLOCATION_RULES,
  buildAllocationPrompt,
  buildQueryDocument,
  formatRAGContext,
} from "./knowledgeBase.js";

export { VALIDATION_RULES, VALIDATION_RULES_PROMPT, ALLOCATION_RULES, buildAllocationPrompt };

// ─── Keyword-based fallback retrieval from static examples ───────────────────
function keywordRetrieve(params, topK = 3) {
  const { plotW, plotH, bhk, facing } = params;
  const dimKey = `${plotW}x${plotH}`;

  // Score each example by how well it matches the query
  const scored = EXAMPLE_LAYOUTS.map(ex => {
    let score = 0;
    if (ex.dimension === dimKey) score += 40;
    if (ex.bhk === bhk || ex.bhk === parseInt(bhk)) score += 30;
    if (ex.facing === facing) score += 20;
    // Partial dimension match (e.g. 30x40 when asked for 30x50)
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

  // Always include zone rules for the specific facing direction
  const zoneRules = VASTU_ZONE_RULES[params.facing] || VASTU_ZONE_RULES.North;

  return {
    docs,
    zoneRules,
    formattedContext: formatRAGContext(docs, params),
    source: docs[0]?.source || "static",
  };
}

// ─── Build violation-based refinement hint ────────────────────────────────────
export function buildRefinementHint(vastuReport, ragContext) {
  if (!vastuReport?.violations?.length) return "";

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

  return `
VASTU REFINEMENT REQUIRED (current score: ${vastuReport.score}/100 — target ≥75):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL VIOLATIONS TO FIX:
${criticalViolations || "None"}

MINOR VIOLATIONS TO FIX:
${minorViolations || "None"}

ZONE ENFORCEMENT:
${zoneEnforcements || "None"}

COMPLIANT RULES (do NOT change these):
${vastuReport.compliant?.join(", ") || "None"}

Re-draw the floor plan fixing ALL violations above. Maintain the same plot size and BHK count.
${ragContext?.formattedContext || ""}
`;
}
