import OpenAI from "openai";

// ── City setbacks lookup ──────────────────────────────────────────────────────
const CITY_DATA = {
  "BBMP (Bengaluru)":  { authority:"BBMP",    front:"3m (10ft)", rear:"3m (10ft)", left:"1.5m (5ft)", right:"1.5m (5ft)" },
  "BMC (Mumbai)":      { authority:"BMC",     front:"4.5m (15ft)", rear:"3m (10ft)", left:"2.4m (8ft)", right:"2.4m (8ft)" },
  "MCD/DDA (Delhi)":   { authority:"MCD/DDA", front:"3m (10ft)", rear:"3m (10ft)", left:"2m (7ft)", right:"2m (7ft)" },
  "GHMC (Hyderabad)":  { authority:"GHMC",    front:"3m (10ft)", rear:"3m (10ft)", left:"1.5m (5ft)", right:"1.5m (5ft)" },
  "CMDA (Chennai)":    { authority:"CMDA",    front:"3m (10ft)", rear:"3m (10ft)", left:"1.5m (5ft)", right:"1.5m (5ft)" },
  "PMC (Pune)":        { authority:"PMC",     front:"3m (10ft)", rear:"3m (10ft)", left:"1.5m (5ft)", right:"1.5m (5ft)" },
};

const VASTU_ENTRANCE = {
  North: "North or North-East", South: "South or South-East",
  East:  "East or North-East",  West:  "West or North-West",
};

// ── Per-floor room distribution ───────────────────────────────────────────────
function floorRooms(floorNum, totalFloors, bhk) {
  if (totalFloors === 1) {
    return {
      name: "Ground Floor", occupants: bhk + 1,
      bedrooms: bhk, living: 1, kitchen: 1, utility: 1,
      lounge: 0, balcony: bhk >= 3 ? 1 : 0, pooja: 1, store: 1,
      attached: { count: Math.floor(bhk / 2), types: ["Western","Indian"] },
      common:   { count: 1, types: ["Indian"] },
    };
  }
  if (floorNum === 1) {
    const gfBeds = Math.floor(bhk / 2);
    return {
      name: "Ground Floor", occupants: gfBeds + 2,
      bedrooms: gfBeds, living: 1, kitchen: 1, utility: 1,
      lounge: 0, balcony: 1, pooja: 1, store: 1,
      attached: { count: Math.max(1, Math.floor(gfBeds / 2)), types: ["Western"] },
      common:   { count: 1, types: ["Indian"] },
    };
  }
  const ufBeds = floorNum === 2 ? bhk - Math.floor(bhk / 2) : Math.max(1, bhk - 2);
  return {
    name: floorNum === 2 ? "First Floor" : "Second Floor", occupants: ufBeds + 1,
    bedrooms: ufBeds, living: 0, kitchen: 0, utility: 0,
    lounge: 1, balcony: 1, pooja: 0, store: 0,
    attached: { count: ufBeds, types: ["Western"] },
    common:   { count: 0, types: [] },
  };
}

// ── Main prompt builder ───────────────────────────────────────────────────────
function buildPrompt(params) {
  const { plotW, plotH, bhk, facing, city, budget, belief } = params;
  const floors = params.floors || 1;
  const cd = CITY_DATA[city] || CITY_DATA["BBMP (Bengaluru)"];
  const vastuOn = !belief || belief === "vastu";
  const buildingType = floors === 1 ? "Single Storey" : floors === 2 ? "Duplex" : "Triplex";
  const largePlot = plotW * plotH > 1200;
  const floorLayouts = Array.from({ length: floors }, (_, i) => floorRooms(i + 1, floors, bhk));

  const floorsBlock = floorLayouts.map((fl, i) => `
    Floor ${i + 1} — ${fl.name}:
      Occupants: ${fl.occupants}
      Bedrooms: ${fl.bedrooms}
      Living room: ${fl.living ? "yes" : "no"}
      Kitchen: ${fl.kitchen ? "yes" : "no"}
      Utility / Wash area: ${fl.utility ? "yes" : "no"}
      Family lounge: ${fl.lounge ? "yes" : "no"}
      Balcony: ${fl.balcony ? "yes" : "no"}
      Pooja room: ${fl.pooja ? "yes" : "no"}
      Store room: ${fl.store ? "yes" : "no"}
      Attached toilets: ${fl.attached.count}${fl.attached.count ? ` (${fl.attached.types.join(", ")})` : ""}
      Common toilets: ${fl.common.count}${fl.common.count ? ` (${fl.common.types.join(", ")})` : ""}`
  ).join("\n");

  return `Generate a precise architectural floor plan image for the following project.

---
title: "${plotW}x${plotH}ft ${bhk}BHK ${buildingType} — ${city}"

intent:
  generate: "architectural floor plan"
  style: "clean technical 2D top-down drawing, black lines on white background, blueprint quality"
  exclude: ["3D views", "perspective drawings", "elevations", "photo-realistic rendering", "decorative elements", "furniture silhouettes", "title blocks outside the plan"]

plot:
  size:
    length: "${plotH}"
    width: "${plotW}"
    unit: "ft"
  facing: "${facing}"
  type: "${buildingType}"
  city_context: "urban"
  constraints:
    maximize_usable_space: true
    allow_garden: ${largePlot}

compliance:
  authority: "${cd.authority}"
  setbacks:
    front: "${cd.front}"
    rear: "${cd.rear}"
    side_left: "${cd.left}"
    side_right: "${cd.right}"
  parking:
    car: ${bhk >= 3 ? 2 : 1}
    bike: 2
    location: "${facing.toLowerCase()}-side near entrance"

vastu:
  enabled: ${vastuOn}
  preferences:
    entrance: "${VASTU_ENTRANCE[facing] || "North or North-East"}"
    kitchen: "South-East corner — MANDATORY"
    master_bedroom: "South-West corner — MANDATORY"
    living: "North or North-East area"
    toilets: ["North-West", "West"] — NEVER place toilets in North-East
    staircase: ["South", "South-West", "West"]
    pooja: "North-East corner — MANDATORY"

floors:
  total_floors: ${floors}
  layout:${floorsBlock}

visual:
  layout: "${floors > 1 ? "stacked — each floor drawn separately, top to bottom" : "single centered plan"}"
  elements: ["room name labels", "dimension annotations in feet", "north arrow top-right", "scale bar bottom-left", "thick wall lines", "door swing arcs", "window notches on walls"]
  colors: "black walls, white/very light grey room fills, no colour fills"
  resolution: "high detail 1024x1024"

output:
  format: "image"
  focus: "floor_plan_only"
  remove_text_blocks: true
---

Draw all ${floors} floor${floors > 1 ? "s" : ""} in a single image. Label each room clearly. Show all doors and windows. Include a north arrow and scale bar. Walls must be thick solid black lines. This is a ${plotW}×${plotH}ft plot.`;
}

function isKey(k) { return !!(k && !k.includes("...") && k.length >= 20); }

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request) {
  const params = await request.json();
  const prompt = buildPrompt(params);

  // ── 1. Pollinations.ai (Keyless, high-quality fallback) ──────────────────
  try {
    console.log("[image-gen] Generating with Pollinations.ai (Flux)...");
    // We use a simplified prompt for Pollinations/Flux for better results
    const visualPrompt = `Architectural floor plan, ${params.plotW}x${params.plotH}ft, ${params.bhk}BHK, ${params.facing} facing. 2D technical drawing, black lines on white background, highly detailed, blueprint style, room labels.`;
    const encodedPrompt = encodeURIComponent(visualPrompt);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&model=flux&seed=${Math.floor(Math.random() * 1000000)}`;
    
    // Test if the service is up by doing a quick HEAD request or just return the URL
    // Pollinations URLs are direct links to the generated image.
    return Response.json({ url: pollinationsUrl, provider: "pollinations-flux" });
  } catch (e) {
    console.error("[image-gen] Pollinations failed:", e.message);
  }

  return Response.json(
    { error: "Image generation failed. Please try again." },
    { status: 503 }
  );
}
