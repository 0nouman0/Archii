// ─── LangGraph Refinement Loop ───────────────────────────────────────────────
// Uses a stateful graph to iteratively improve a floor plan until score ≥ 75.
// Ported from architectural research papers (z-aqib, mo7amed7assan).

import { computeLayout } from "../../../lib/layoutEngine.js";
import { scoreVastuLayout } from "../../../lib/vastuRules.js";
import { buildFloorPlanSVGPromptWithRAG } from "../../../lib/prompts.js";
import { retrieveRAGContext, buildRefinementHint, analyzeLayoutQuality } from "../../../lib/rag/retriever.js";
import { callAI } from "../../../lib/ai-provider.js";

const MAX_ITERATIONS = 2;
const SCORE_TARGET   = 75;

// ─── Utility Helpers ─────────────────────────────────────────────────────────

function parseJSON(raw) {
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
  catch { return null; }
}

function extractSVG(raw) {
  const match = raw.match(/<svg[\s\S]*?<\/svg>/i);
  return match ? match[0] : raw;
}

// ─── LangGraph Nodes ─────────────────────────────────────────────────────────

// Node: generate SVG
async function nodeGenerate(state) {
  const { params, layout, ragContext, refinementHint, iteration } = state;
  const strategy = iteration === 0
    ? "Initial layout"
    : `Refinement attempt ${iteration} — fixing violations from previous attempt`;

  const svgPrompt = buildFloorPlanSVGPromptWithRAG(params, layout, strategy, ragContext, refinementHint);
  
  // Use multi-provider AI call (tries Groq → Gemini → Nemotron)
  const { text, provider } = await callAI(
    "You are a world-class architectural SVG drafter. Output ONLY raw SVG. Start with <svg and end with </svg>.",
    svgPrompt,
    8000,
    ["groq", "gemini"] // Priority for speed
  );

  console.log(`[rag-refine] Generated via ${provider}`);
  return { ...state, svgCode: extractSVG(text) };
}

// Node: evaluate Vastu + Technical scores
async function nodeEvaluate(state) {
  const { params, layout, svgCode } = state;
  const { buildBeliefCriticPrompt, buildBeliefContext } = await import("../../../lib/prompts.js");
  const { getVastuRemedies } = await import("../../../lib/vastuRules.js");

  // 1. Technical Audit (CSP + Graph)
  const technicalAudit = analyzeLayoutQuality(layout, params);

  // 2. AI Belief Critic
  const beliefCtx = buildBeliefContext(params.belief || "vastu");
  const { text: raw } = await callAI(
    `You are a strict ${beliefCtx.label} expert. Respond ONLY as valid JSON.`,
    buildBeliefCriticPrompt(svgCode, layout.rooms, params.plotW, params.plotH, params.belief || "vastu"),
    2000,
    ["gemini", "groq"] // Priority for JSON stability
  );

  const parsed = parseJSON(raw);
  const vastuReport = parsed || scoreVastuLayout(layout.rooms);
  const remedies = getVastuRemedies(vastuReport.violations || []);

  return {
    ...state,
    vastuReport: {
      ...vastuReport,
      remedies,
      technicalScore: technicalAudit.compositeScore,
      technicalAudit: {
        cspScore: technicalAudit.cspScore,
        adjScore: technicalAudit.adjScore,
        violations: [...technicalAudit.cspViolations, ...technicalAudit.adjViolations]
      }
    }
  };
}

// Node: build refinement hint
async function nodeRefine(state) {
  const { vastuReport, ragContext, layout, params } = state;
  
  let refinementHint = buildRefinementHint(vastuReport, ragContext, layout, params);
  
  if (vastuReport?.violations?.length) {
    refinementHint = `CRITICAL ARCHITECTURAL REVISION REQUIRED:\n${refinementHint}\n\n` + 
                     `IMPORTANT: Move rooms to correct zones. Do NOT return the same SVG as before.\n` +
                     `Current violations count: ${vastuReport.violations.length}. Target: 0.`;
  }

  return { ...state, refinementHint, iteration: state.iteration + 1 };
}

// ─── Main Workflow ────────────────────────────────────────────────────────────

async function runRefinementWorkflow(initialState) {
  const steps = [];
  let state = { ...initialState, iteration: 0, refinementHint: "" };

  if (!state.ragContext?.formattedContext) {
    state = { ...state, ragContext: await retrieveRAGContext(state.params) };
  }

  // Initial Cycle
  steps.push({ node: "generate", iteration: 0 });
  state = await nodeGenerate(state);
  steps.push({ node: "evaluate", iteration: 0 });
  state = await nodeEvaluate(state);
  steps.push({ node: "score", score: state.vastuReport?.score, iteration: 0 });

  // Refinement Cycle
  let iteration = 0;
  while (state.vastuReport?.score < SCORE_TARGET && iteration < MAX_ITERATIONS) {
    steps.push({ node: "refine", iteration: iteration + 1 });
    state = await nodeRefine(state);
    steps.push({ node: "generate", iteration: iteration + 1 });
    state = await nodeGenerate(state);
    steps.push({ node: "evaluate", iteration: iteration + 1 });
    state = await nodeEvaluate(state);
    steps.push({ node: "score", score: state.vastuReport?.score, iteration: iteration + 1 });
    iteration++;
  }

  return { state, steps };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { params, layout: layoutData, vastuReport: initialReport, ragContext } = body;

    if (!params || !layoutData) return Response.json({ error: "Missing params or layout" }, { status: 400 });

    if (initialReport?.score >= SCORE_TARGET) {
      return Response.json({ refined: false, vastuReport: initialReport, steps: [] });
    }

    const { state, steps } = await runRefinementWorkflow({
      params, layout: layoutData,
      vastuReport: initialReport,
      ragContext: ragContext || null,
      svgCode: null,
    });

    return Response.json({
      refined:     true,
      svgCode:     state.svgCode,
      vastuReport: state.vastuReport,
      steps,
      finalScore:  state.vastuReport?.score,
      improved:    (state.vastuReport?.score || 0) > (initialReport?.score || 0),
    });

  } catch (err) {
    console.error("[rag-refine]", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
