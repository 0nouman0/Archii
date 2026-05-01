// ─── Floor Plan Ingestion API ────────────────────────────────────────────────
// Accepts floor plan images, extracts vastu data via Claude Vision, stores as vector embeddings.
// Use this to ingest your 10-15 reference images per popular dimension.
//
// POST body:
//   imageBase64: string   (base64-encoded PNG/JPG)
//   dimensionKey: string  (e.g. "30x40")
//   plotW: number         (feet)
//   plotH: number         (feet)
//   bhk: number
//   facing: string        (North/South/East/West)
//   vastuScore: number    (optional — known score for this reference plan)
//   notes: string         (optional human notes about this plan)

import Anthropic from "@anthropic-ai/sdk";
import { upsertFloorPlanDocument } from "../../../lib/rag/vectorStore.js";

const EXTRACTION_SYSTEM = `You are a Vastu Shastra expert and architectural analyst.
Analyse the floor plan image and extract structured data.
Respond ONLY as strict JSON — no markdown, no code fences.`;

const EXTRACTION_PROMPT = (plotW, plotH, bhk, facing) =>
  `Analyse this ${plotW}x${plotH}ft ${bhk}BHK ${facing}-facing floor plan image.
Extract:
1. List of rooms detected with their approximate compass zone (N/S/E/W/NE/NW/SE/SW/C)
2. Door positions for each room (which wall: top/bottom/left/right)
3. Window positions for exterior rooms
4. Whether entrance is on the correct facing wall
5. Vastu compliance issues observed
6. Positive vastu features

Respond as:
{
  "rooms": [{"name": "...", "zone": "...", "area_approx_sqft": 0}],
  "doors": [{"room": "...", "wall": "..."}],
  "windows": [{"room": "...", "wall": "..."}],
  "entrance": {"wall": "...", "position": "left/center/right"},
  "vastu_positives": ["..."],
  "vastu_issues": ["..."],
  "estimated_score": 0,
  "layout_description": "One paragraph describing the layout in natural language suitable for RAG retrieval"
}`;

export async function POST(req) {
  try {
    const body = await req.json();
    const { imageBase64, dimensionKey, plotW, plotH, bhk, facing, vastuScore, notes } = body;

    if (!imageBase64 || !plotW || !plotH || !bhk || !facing) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const key = process.env.ANTHROPIC_API_KEY;
    if (!key || key.includes("...")) {
      return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
    }

    // Use Claude Vision to extract floor plan data
    const client = new Anthropic({ apiKey: key });
    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      system: EXTRACTION_SYSTEM,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ""),
            },
          },
          { type: "text", text: EXTRACTION_PROMPT(plotW, plotH, bhk, facing) },
        ],
      }],
    });

    let extracted;
    try {
      const raw = message.content[0]?.text || "{}";
      extracted = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      extracted = { layout_description: message.content[0]?.text || "" };
    }

    const dimKey = dimensionKey || `${plotW}x${plotH}`;
    const finalScore = vastuScore || extracted.estimated_score || null;

    // Build rich text content for embedding
    const roomSummary = (extracted.rooms || [])
      .map(r => `${r.name}→${r.zone}`)
      .join(", ");

    const content = `${plotW}x${plotH}ft ${bhk}BHK ${facing}-facing vastu floor plan. Score: ${finalScore || "estimated"}/100.
Room zones: ${roomSummary || "extracted from image"}.
${extracted.layout_description || ""}
Vastu positives: ${(extracted.vastu_positives || []).join("; ")}.
Vastu issues: ${(extracted.vastu_issues || []).join("; ")}.
${notes ? `Notes: ${notes}` : ""}`;

    // Store in vector database
    await upsertFloorPlanDocument({
      dimensionKey: dimKey,
      bhk:          parseInt(bhk),
      facing,
      vastuScore:   finalScore,
      content,
      metadata: {
        plotW, plotH, bhk, facing,
        rooms:   extracted.rooms || [],
        doors:   extracted.doors || [],
        windows: extracted.windows || [],
        entrance: extracted.entrance || {},
        ingestedAt: new Date().toISOString(),
      },
    });

    return Response.json({
      success:      true,
      dimensionKey: dimKey,
      extractedData: extracted,
      contentStored: content.slice(0, 300) + "...",
      message: `Floor plan ingested successfully for ${dimKey} ${bhk}BHK ${facing}-facing`,
    });

  } catch (err) {
    console.error("[ingest-floorplan]", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// GET: Check ingestion stats
export async function GET() {
  try {
    const { getIngestionStats } = await import("../../../lib/rag/vectorStore.js");
    const stats = await getIngestionStats();
    return Response.json(stats);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
