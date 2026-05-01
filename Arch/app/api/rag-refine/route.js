// ─── LangGraph Refinement Loop ───────────────────────────────────────────────
// Uses a stateful graph to iteratively improve a floor plan until score ≥ 75.
// Max 2 refinement iterations to control cost.
//
// POST body:
//   params:      { plotW, plotH, bhk, facing, city, budget, belief, floors }
//   layout:      computed layout from layoutEngine
import { computeLayout } from "../../../lib/layoutEngine.js";
import { scoreVastuLayout } from "../../../lib/vastuRules.js";
import { buildFloorPlanSVGPromptWithRAG } from "../../../lib/prompts.js";
import { retrieveRAGContext, buildRefinementHint } from "../../../lib/rag/retriever.js";
import { callAI } from "../../../lib/ai-provider.js";

const MAX_ITERATIONS = 2;
const SCORE_TARGET   = 75;

// ─── LangGraph-style state machine ───────────────────────────────────────────

function parseJSON(raw) {
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
  catch { return null; }
}

function extractSVG(raw) {
  const match = raw.match(/<svg[\s\S]*?<\/svg>/i);
  return match ? match[0] : raw;
}

// Node: generate SVG
async function nodeGenerate(state) {
  const { params, layout, ragContext, refinementHint, iteration } = state;
  const strategy = iteration === 0
    ? "Initial vastu-optimised layout"
    : `Refinement attempt ${iteration} — fixing violations from previous attempt`;

  const svgPrompt = buildFloorPlanSVGPromptWithRAG(params, layout, strategy, ragContext, refinementHint);
  
  // Use multi-provider AI call
  const { text, provider } = await callAI(
    "You are a world-class architectural SVG drafter. Output ONLY raw SVG — no markdown, no explanation. Start with <svg and end with </svg>.",
    svgPrompt,
    8000
  );

  console.log(`[rag-refine] Generated via ${provider}`);
  const svgCode = extractSVG(text);
  return { ...state, svgCode };
}

// Node: evaluate Vastu score
async function nodeEvaluate(state) {
  const { params, layout, svgCode } = state;
  const { buildBeliefCriticPrompt, buildBeliefContext } = await import("../../../lib/prompts.js");
  const { getVastuRemedies } = await import("../../../lib/vastuRules.js");
  const { analyzeLayoutQuality } = await import("../../../lib/rag/retriever.js");

  // 1. Technical Audit (CSP + Graph)
  const technicalAudit = analyzeLayoutQuality(layout, params);

  // 2. AI Belief Critic
  const beliefCtx = buildBeliefContext(params.belief || "vastu");
  const { text: raw } = await callAI(
    `You are a strict ${beliefCtx.label} expert. Respond ONLY as valid JSON with no markdown.`,
    buildBeliefCriticPrompt(svgCode, layout.rooms, params.plotW, params.plotH, params.belief || "vastu"),
    2000
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

// Node: build refinement hint from violations
async function nodeRefine(state) {
  const { vastuReport, ragContext, layout, params } = state;
  
  // Make the hint more aggressive and structured to force changes
  let refinementHint = buildRefinementHint(vastuReport, ragContext, layout, params);
  
  if (vastuReport?.violations?.length) {
    refinementHint = `CRITICAL ARCHITECTURAL REVISION REQUIRED:\n${refinementHint}\n\n` + 
                     `IMPORTANT: You MUST move the rooms specified above. Do NOT return the same SVG as before.\n` +
                     `Current violations count: ${vastuReport.violations.length}. Target count: 0.`;
  }

  return { ...state, refinementHint, iteration: state.iteration + 1 };
}



// ─── Main LangGraph workflow ──────────────────────────────────────────────────
async function runRefinementWorkflow(initialState) {
  const steps = [];
  let state = { ...initialState, iteration: 0, refinementHint: "" };

  // Node 1: Retrieve RAG context (if not already provided)
  if (!state.ragContext?.formattedContext) {
    const rag = await retrieveRAGContext(state.params);
    state = { ...state, ragContext: rag };
  }

  // Node 2: Initial generation
  steps.push({ node: "generate", iteration: 0 });
  state = await nodeGenerate(state);

  // Node 3: Evaluate
  steps.push({ node: "evaluate", iteration: 0 });
  state = await nodeEvaluate(state);
  steps.push({ node: "score", score: state.vastuReport?.score, iteration: 0 });

  // Conditional refinement loop (max MAX_ITERATIONS)
  let iteration = 0;
  while (state.vastuReport?.score < SCORE_TARGET && iteration < MAX_ITERATIONS) {
    // Node: Refine (build hint from violations)
    steps.push({ node: "refine", iteration: iteration + 1 });
    state = await nodeRefine(state);

    // Node: Re-generate with hints
    steps.push({ node: "generate", iteration: iteration + 1 });
    state = await nodeGenerate(state);

    // Node: Re-evaluate
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

    if (!params || !layoutData) {
      return Response.json({ error: "Missing params or layout" }, { status: 400 });
    }

    // If score is already ≥ target, skip refinement
    if (initialReport?.score >= SCORE_TARGET) {
      return Response.json({
        refined: false,
        reason: `Score ${initialReport.score} already meets target ${SCORE_TARGET}`,
        svgCode: null,
        vastuReport: initialReport,
        steps: [],
      });
    }

    const layout = layoutData;
    const { state, steps } = await runRefinementWorkflow({
      params, layout,
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
