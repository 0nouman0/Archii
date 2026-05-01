// ─── Room Interior Render ─────────────────────────────────────────────────────
// Uses Pollinations.ai (Flux) — keyless, no extra API keys required.
// Returns a URL to a photorealistic interior render of the requested room.

const STYLE_MAP = {
  modern:       "modern minimalist interior, clean white walls, light oak flooring, warm pendant lighting, minimal clutter, abundant natural light through large windows",
  traditional:  "traditional Indian interior, warm ochre walls, teak wood furniture, brass decorative accents, terracotta or Jaipur tile flooring, hand-woven textiles",
  contemporary: "contemporary Scandinavian interior, muted grey and beige palette, natural linen textiles, exposed concrete ceiling, warm Edison bulb lighting",
  luxury:       "luxury interior design, Carrara marble flooring, bespoke cabinetry, designer furniture, dramatic indirect cove lighting, floor-to-ceiling glazing",
};

const ROOM_HINTS = {
  "master bed":  "king bed, bedside tables, wardrobe, attached en-suite visible, soft mood lighting",
  "bedroom":     "queen bed, study desk, wardrobe, large window with natural light",
  "living":      "sectional sofa, coffee table, TV unit, indoor plants, statement rug",
  "kitchen":     "modular kitchen, island counter, open shelving, stainless appliances, window above sink",
  "dining":      "6-seater dining table, pendant chandelier, buffet sideboard, large window",
  "bathroom":    "vanity sink, walk-in shower, freestanding bathtub, heated towel rail, marble tiles",
  "puja":        "marble altar, brass diyas, flower offerings, latticed window for morning light, serene atmosphere",
  "study":       "built-in bookshelves, ergonomic desk, task lamp, reading nook, large window",
  "utility":     "washing machine, laundry shelving, drying rack, utility sink, ventilation window",
};

function getRoomHint(roomName) {
  const lower = (roomName || "").toLowerCase();
  for (const [key, hint] of Object.entries(ROOM_HINTS)) {
    if (lower.includes(key)) return hint;
  }
  return "tastefully furnished, well-lit, professionally staged";
}

export async function POST(request) {
  const { roomName, ftW, ftH, style = "modern", belief = "vastu" } = await request.json();

  if (!roomName) {
    return Response.json({ error: "roomName is required" }, { status: 400 });
  }

  const styleDesc  = STYLE_MAP[style] || STYLE_MAP.modern;
  const roomHint   = getRoomHint(roomName);
  const roomArea   = ((parseFloat(ftW) || 12) * (parseFloat(ftH) || 12)).toFixed(0);
  const vastuNote  = belief === "vastu" ? ", east-facing window with warm morning sunlight, vastu-compliant serene atmosphere" : "";
  const dimNote    = ftW && ftH ? ` ${ftW} feet wide and ${ftH} feet deep (${roomArea} sq ft),` : "";

  const prompt = [
    `Photorealistic interior design render of a ${roomName},`,
    dimNote,
    styleDesc + ",",
    roomHint + vastuNote + ",",
    "architectural interior photography, eye-level perspective, 8K ultra-detailed,",
    "professional staging, no people, no text overlays",
  ].join(" ").replace(/\s+/g, " ").trim();

  const seed = Math.floor(Math.random() * 1_000_000);
  const url  = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=768&nologo=true&model=flux&seed=${seed}&enhance=true`;

  return Response.json({ url, prompt, provider: "Pollinations (Flux)", seed });
}
