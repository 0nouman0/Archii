import { retrieveRAGContext, analyzeLayoutQuality } from "../../../lib/rag/retriever.js";
import { getIngestionStats } from "../../../lib/rag/vectorStore.js";
import { computeLayout } from "../../../lib/layoutEngine.js";

export async function POST(req) {
  try {
    const params = await req.json();
    const { plotW, plotH, bhk, facing, belief = "vastu" } = params;

    if (!plotW || !plotH || !bhk || !facing) {
      return Response.json({ error: "Missing required params: plotW, plotH, bhk, facing" }, { status: 400 });
    }

    // Retrieve RAG context (semantic search → keyword fallback)
    const result = await retrieveRAGContext({ plotW, plotH, bhk, facing, belief });
    const stats  = await getIngestionStats().catch(() => ({ total: 0 }));

    // Run CSP + adjacency graph pre-analysis on the template layout
    // Gives callers a quality baseline BEFORE AI generation starts
    let layoutQuality = null;
    try {
      const layout = computeLayout({
        plotW: Number(plotW), plotH: Number(plotH), bhk, facing,
      });
      layoutQuality = analyzeLayoutQuality(layout, {
        plotW: Number(plotW), plotH: Number(plotH), bhk, facing,
      });
    } catch (e) {
      console.warn("[rag-retrieve] layout quality analysis failed:", e.message);
    }

    return Response.json({
      formattedContext: result.formattedContext,
      zoneRules:        result.zoneRules,
      docsFound:        result.docs.length,
      source:           result.source,
      ingestionStats:   stats,
      // NEW: CSP + GNN adjacency composite score (from GitHub repo integration)
      layoutQuality,    // { cspScore, adjScore, compositeScore, cspViolations, adjViolations }
    });
  } catch (err) {
    console.error("[rag-retrieve]", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
