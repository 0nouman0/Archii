import { analyzeLayoutQuality } from "../../../lib/rag/retriever.js";
import { scoreVastuLayout } from "../../../lib/vastuRules.js";

/**
 * AI Design Audit Endpoint
 * Performs a deep technical audit of a floor plan using:
 *  1. CSP Constraint Engine (inspired by z-aqib repo)
 *  2. GNN-inspired Room Adjacency Graph (inspired by mo7amed7assan repo)
 *  3. Standard Vastu scoring rules
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { params, rooms, layout: providedLayout } = body;

    if (!params || (!rooms && !providedLayout)) {
      return Response.json({ error: "Missing params or layout data" }, { status: 400 });
    }

    const plotW = Number(params.plotW);
    const plotH = Number(params.plotH);
    const bhk   = params.bhk;
    const facing = params.facing;

    let layout = providedLayout;
    if (!layout && rooms) layout = { rooms };

    // 1. Run Technical AI Audit (CSP + Adjacency Graph)
    const audit = analyzeLayoutQuality(layout, { plotW, plotH, bhk, facing });

    // 2. Run traditional Vastu score for comparison
    const vastu = scoreVastuLayout(layout.rooms);

    // 3. Generate summary insights
    const insights = [];
    if (audit.compositeScore >= 90) insights.push("Excellent technical design: All critical constraints and adjacency requirements met.");
    else if (audit.compositeScore >= 75) insights.push("Good design: Most critical constraints met, minor sub-optimal placements detected.");
    else insights.push("Action required: Multiple technical design violations detected. Adjacency or zone placement needs correction.");

    if (audit.adjScore < 70) insights.push("Flow issue: Essential room adjacencies (e.g. Kitchen-Dining) are missing or forbidden adjacencies detected.");
    if (audit.cspScore < 70) insights.push("Zoning issue: Critical rooms are placed in forbidden Vastu zones according to the CSP engine.");

    return Response.json({
      success: true,
      auditScore: audit.compositeScore,
      technicalBreakdown: {
        cspScore: audit.cspScore,
        adjacencyScore: audit.adjScore,
        cspViolations: audit.cspViolations,
        adjacencyViolations: audit.adjViolations,
      },
      vastuComparison: {
        score: vastu.score,
        violations: vastu.violations,
      },
      insights,
      metadata: {
        plot: `${plotW}x${plotH}`,
        bhk,
        facing,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (err) {
    console.error("[design-audit] error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
