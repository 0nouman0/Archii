// ─── RAG-Enhanced SVG Prompt ──────────────────────────────────────────────────
// Drop-in replacement for buildFloorPlanSVGPrompt with RAG context, improved
// door/window/staircase instructions, and explicit vastu zone enforcement.
export function buildFloorPlanSVGPromptWithRAG(params, layout, strategy = "", ragContext = null, refinementHint = "") {
  const basePrompt = buildFloorPlanSVGPrompt(params, layout, strategy);
  const ragSection = ragContext?.formattedContext || "";
  const refineSection = refinementHint
    ? `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n## REFINEMENT INSTRUCTIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${refinementHint}\n`
    : "";

  // Build explicit zone enforcement from layout rooms
  const zoneEnforcement = layout.rooms
    .map(r => `  • ${r.name} → MUST be in ${r.vastu} zone (x≈${r.x}, y≈${r.y})`)
    .join("\n");

  const zoneSection = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## VASTU ZONE ENFORCEMENT (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
These zones are PRE-COMPUTED as a baseline.
IMPORTANT: If the Refinement Instructions or Vastu rules conflict with the (x,y) coordinates provided below, you MUST DISREGARD the coordinates and move the rooms to the correct zone.
${zoneEnforcement}

CRITICAL VASTU RULES for ${params.facing}-facing layout:
  • Puja/Prayer → NE corner (top-right) — NEVER move this
  • Master Bed → SW corner (bottom-left) — NEVER move this
  • Kitchen → SE corner (bottom-right) — NEVER move this
  • Bathroom/Toilet → NW zone (top-left) — NEVER place in NE
  • Staircase (if present) → SW or W zone only
  • Center (Brahmasthan) → Keep as open Corridor — no heavy walls
`;

  // Staircase instructions (only if staircase room exists)
  const hasStaircase = layout.rooms.some(r => r.name === "Staircase");
  const staircaseSection = hasStaircase ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STAIRCASE NOTATION (MANDATORY for Staircase room)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Draw the Staircase room with proper architectural notation:
1. Fill room with color as usual
2. Draw 12 horizontal step lines evenly spaced inside the room:
   for i in 0..11: <line x1="[room_x+4]" y1="[room_y + i*(room_h/12)]" x2="[room_x+room_w-4]" y2="[room_y + i*(room_h/12)]" stroke="#555555" stroke-width="1.2"/>
3. Draw a bold railing line along the left wall: <line x1="[room_x+4]" y1="[room_y]" x2="[room_x+4]" y2="[room_y+room_h]" stroke="#333" stroke-width="3"/>
4. Add "UP" text with arrow at bottom of room: <text ...>↑ UP</text>
5. Add step count: <text ...>12 STEPS</text> at top of room
6. NO door arc for staircase room — steps fill the opening
` : "";

  // Topology-based door wall hints
  const { bldX, bldY, bldW, bldH } = layout;
  const centerX = bldX + bldW / 2;
  const centerY = bldY + bldH / 2;
  const topologyDoorHints = layout.rooms
    .filter(r => !["Corridor", "Utility", "Staircase"].includes(r.name))
    .map(r => {
      const rx = r.x + r.w / 2;
      const ry = r.y + r.h / 2;
      // Door goes on the wall closest to corridor center
      const dx = rx - centerX;
      const dy = ry - centerY;
      let doorWall;
      if (r.name === "Puja") doorWall = "left";       // Puja door always faces East/corridor
      else if (r.name === "Kitchen") doorWall = "top"; // Kitchen door toward corridor
      else if (Math.abs(dy) > Math.abs(dx)) doorWall = dy < 0 ? "bottom" : "top";
      else doorWall = dx < 0 ? "right" : "left";
      return `  • ${r.name}: door on ${doorWall} wall`;
    }).join("\n");

  const topologySection = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## TOPOLOGY-BASED DOOR PLACEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use these door walls (pointing toward the central corridor):
${topologyDoorHints}
Kitchen door: NEVER directly opposite bathroom/toilet door.
Puja room door: opens EAST (left wall of puja room).
`;

  // Vastu-aware window hints
  const windowSection = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## VASTU-AWARE WINDOW PLACEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Place windows on EXTERIOR walls only, per vastu:
  • Living room → North and East walls (large windows for light + prosperity)
  • Kitchen → East wall MANDATORY (cook faces East)
  • Puja → East wall (morning sunlight, sacred)
  • Master Bedroom (SW) → South and West walls ONLY
  • Secondary Bedrooms (W/E zones) → same-facing exterior wall
  • Bathrooms/Toilets → North or West wall (ventilation, never East)
  • Do NOT place windows on walls shared between two rooms
`;

  // Adjacency & Flow rules (from graph/roomAdjacency.js logic)
  const adjacencySection = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ADJACENCY & FLOW (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Follow these room-to-room connectivity rules:
  • Kitchen MUST be adjacent to Dining (direct service flow)
  • Master Bed MUST have an attached Master Bath (ensuite access)
  • All Bedrooms SHOULD be accessible via a central Corridor
  • Kitchen MUST be separated from Puja (fire vs sacred zone)
  • Toilet/Bathroom MUST be separated from Kitchen (hygiene rule)
  • Puja MUST NOT be adjacent to any Bathroom/Toilet
`;

  // Extended vocabulary (from DeepFloorplan)
  const vocabSection = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ARCHITECTURAL VOCABULARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You may use these expanded room types if they fit the design:
  • Study / Home Office (N or E zone)
  • Guest Room (NW or W zone)
  • Servant Quarter (SE or NW corner, separate entry)
  • Utility / Laundry (NW service zone)
  • Store Room (SW or S zone)
  • Balcony / Verandah (N or E for morning light)
`;

  // Cap RAG section to avoid blowing past Groq's 12K TPM limit
  const ragTrimmed = ragSection.length > 1500
    ? ragSection.slice(0, 1500) + "\n...[truncated for token limit]\n"
    : ragSection;

  return basePrompt + zoneSection + adjacencySection + vocabSection + topologySection + windowSection + staircaseSection + ragTrimmed + refineSection;
}


export function buildFloorPlanSVGPrompt(params, layout, strategy = "") {
  const { plotW, plotH, bhk, city, facing, budget } = params;
  const { rooms, W, H, bldX, bldY, bldW, bldH, OUTER, setbacks, entrance, scale } = layout;

  // Setback dimensions in metres (1px = 0.1m at scale 10px/ft, 1ft ≈ 0.305m)
  const ftToM = 0.305;
  const sbFrontM = ((facing === "South" || facing === "East" || facing === "West"
    ? setbacks.bottom : setbacks.top) / scale * ftToM).toFixed(1);
  const sbRearM  = ((facing === "North" ? setbacks.bottom : setbacks.top) / scale * ftToM).toFixed(1);
  const sbSideM  = (setbacks.left / scale * ftToM).toFixed(1);

  const doorSize  = 28;   // door opening width px
  const doorSwing = 28;   // arc radius px

  // Per-room door data: which wall the door opens from (heuristic)
  const roomDoorHints = rooms.map(r => {
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    // Door goes on whichever internal edge is most accessible
    const wall = r.h >= r.w ? "left" : "top";
    const dx = wall === "left" ? r.x : cx - doorSize / 2;
    const dy = wall === "top"  ? r.y : cy - doorSize / 2;
    return { name: r.name, x: r.x, y: r.y, w: r.w, h: r.h, ftW: r.ftW, ftH: r.ftH, wall, dx, dy };
  }).filter(r => !["Corridor", "Utility"].includes(r.name));

  const roomList = roomDoorHints.map(r => {
    const roomData = rooms.find(room => room.name === r.name);
    const color = roomData?.color || "#F7F7F7";
    // We provide the dimensions in FT for the label
    const dimLabel = `${r.ftW}'×${r.ftH}'`;
    return `  • ${r.name}: rect x=${r.x} y=${r.y} w=${r.w} h=${r.h} fill="${color}" dim="${dimLabel}" door-wall=${r.wall} door-at=(${r.dx},${r.dy})`;
  }).join("\n");

  // Entrance door coords on building wall
  const ew = entrance.wall;
  const ex = Math.round(entrance.x);
  const ey = Math.round(entrance.y);

  const totalW = W + 80;   // canvas wider for dimension annotations
  const totalH = H + 80;

  return `You are a professional architectural CAD drafter. Produce a clean, precise Indian residential floor plan in SVG.
Study the rules below carefully — every rule is mandatory.

## CANVAS
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}">
Plot: ${plotW}×${plotH} ft | ${bhk}BHK | ${facing}-facing | ${city}
All coordinates below are in pixels. Origin (0,0) = top-left of canvas.
${strategy ? `Design strategy: ${strategy}` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 1 — DEFS (define patterns first, before any shapes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<defs>
  <!-- Arrowhead for dimension lines -->
  <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
    <path d="M0,0 L6,3 L0,6 Z" fill="#333333"/>
  </marker>
  <marker id="arrl" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
    <path d="M6,0 L0,3 L6,6 Z" fill="#333333"/>
  </marker>
  <!-- Diagonal hatch for setback zones -->
  <pattern id="hatch" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <line x1="0" y1="0" x2="0" y2="8" stroke="#AAAACC" stroke-width="0.8"/>
  </pattern>
</defs>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 2 — BACKGROUND & PLOT BOUNDARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. White background:
   <rect x="0" y="0" width="${totalW}" height="${totalH}" fill="#FFFFFF"/>

2. Outer plot boundary (dashed):
   <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="#555577" stroke-width="1.2" stroke-dasharray="8,5"/>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 3 — SETBACK ZONES (hatched, semi-transparent)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Draw exactly 4 setback rectangles filled with url(#hatch) at opacity="0.35":
- Top setback:    x=0     y=0            w=${W}             h=${setbacks.top}     → label "${sbFrontM}m ${facing === "South" ? "Rear" : "Front"} Setback"
- Bottom setback: x=0     y=${H - setbacks.bottom}   w=${W}  h=${setbacks.bottom}  → label "${sbRearM}m ${facing === "South" ? "Front" : "Rear"} Setback"
- Left setback:   x=0     y=${setbacks.top}  w=${setbacks.left}  h=${H - setbacks.top - setbacks.bottom}  → label "${sbSideM}m Side"
- Right setback:  x=${W - setbacks.right} y=${setbacks.top}  w=${setbacks.right}  h=${H - setbacks.top - setbacks.bottom}  → label "${sbSideM}m Side"

Each label: font-size="9" fill="#5555AA" font-family="Arial,sans-serif" text-anchor="middle"
Place label at the centre of each setback rectangle.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 4 — BUILDING FOOTPRINT (outer walls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Draw thick outer wall rectangle:
<rect x="${bldX}" y="${bldY}" width="${bldW}" height="${bldH}" fill="none" stroke="#111111" stroke-width="${OUTER}"/>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 5 — ROOMS (strict rules)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALLOWED SVG elements per room: <rect>, <line>, <text>, <path> (door arc only).
FORBIDDEN: <circle>, <ellipse>, <polygon>, <image>, <use>, gradients, filters, clip-paths, random decorations.

For EVERY room listed below, draw:

a) Room fill rectangle:
   <rect x=… y=… width=… height=… fill="[provided room color]" stroke="#333333" stroke-width="2.5"/>
   (Use the specific hex color provided for each room in the list below.)

b) Room name (bold, centered):
   <text x="[cx]" y="[cy-2]" font-size="10" font-weight="700" font-family="Arial,sans-serif" fill="#111111" text-anchor="middle">[Room Name]</text>

c) Dimension label (below name, smaller):
   <text x="[cx]" y="[cy+10]" font-size="7.5" font-family="Arial,sans-serif" fill="#666666" text-anchor="middle">[dim provided in list]</text>

d) Door opening on the indicated wall:
   - ERASE a ${doorSize}px gap in that wall by drawing a white rect over it:
     <rect fill="#FFFFFF" stroke="none" …/> — exactly ${doorSize}px wide, ${OUTER + 3}px tall, positioned at the gap
   - Door swing arc (quarter circle, opens inward):
     <path d="M [hinge-x],[hinge-y] L [gap-end-x],[gap-end-y] M [hinge-x],[hinge-y] A ${doorSwing},${doorSwing} 0 0,1 [arc-end-x],[arc-end-y]" fill="none" stroke="#333333" stroke-width="1.2"/>
   - Place the door opening 1/4 of the way along the indicated wall from the corner.

ROOM LIST (x,y,w,h are pixel coords of the room rectangle):
${roomList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 6 — ENTRANCE DOOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Main entrance is on the ${ew} wall of the building at approximately (${ex}, ${ey}).
Door width = 36px.

- Erase gap in outer wall: white rect ${OUTER + 2}px thick × 36px wide at the gap position
- Door swing arc (opens outward toward setback zone):
  <path d="M [hinge],[hinge] L [far-end] M [hinge],[hinge] A 36,36 0 0,[sweep] [arc-end]" fill="none" stroke="#111111" stroke-width="1.8"/>
- Label near arc (shifted to avoid wall overlap): <text font-size="9" font-weight="700" fill="#0055AA" font-family="Arial" text-anchor="middle">ENTRANCE</text>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 7 — WINDOWS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

On each exterior wall of rooms that touch the building boundary, add window indicators:
- Window = 3 parallel lines perpendicular to the wall, 24px wide, spaced 4px apart
- stroke="#666666" stroke-width="1.5"
- Add one window per exterior room wall, centred on that wall segment
- No window on walls that have doors

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 8 — COMPASS ROSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Top-right corner at (${W - 55}, 10), size 44×44px:
- Circle: <circle cx="[cx]" cy="[cy]" r="20" fill="none" stroke="#333333" stroke-width="1.2"/>
- North arrow: filled dark triangle pointing up, red fill
- N/S/E/W labels: font-size="9" font-weight="700" font-family="Arial" fill="#222222"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 9 — DIMENSION ANNOTATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Outside the plot boundary:
- Bottom dimension line from (0, \${H + 20}) to (\${W}, \${H + 20}) with arrowheads
- Label "PLOT WIDTH: \${plotW}ft" centred below, font-size="11" font-weight="700" fill="#222222"
- Right dimension line from (\${W + 20}, 0) to (\${W + 20}, \${H}) with arrowheads
- Label "\${plotH}ft" rotated 90°, font-size="11" fill="#222222"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 10 — TITLE BLOCK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bottom-left corner, clean text only:
<text x="10" y="\${totalH - 8}" font-size="9" font-family="Arial,sans-serif" fill="#444444">\${plotW}×\${plotH}ft · \${facing}-Facing · \${bhk}BHK · \${city} · \${budget}</text>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ABSOLUTE RULES — violating these fails the task
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✗ DO NOT draw any random circles, stars, polygons, or decorative shapes
✗ DO NOT place rooms beyond the building footprint (x=\${bldX}, y=\${bldY}, w=\${bldW}, h=\${bldH})
✗ DO NOT overlap text labels; if a room is too small, move text outside or shrink it further
✗ DO NOT use <image>, <use>, filters, or clip-paths
✗ DO NOT place any element outside the SVG canvas (0,0,\${totalW},\${totalH})
✓ Every room MUST have a door arc
✓ Exterior rooms MUST have at least one window indicator
✓ Setback zones MUST be visible with hatch fill
✓ Start response with <svg and end with </svg> — NO markdown, NO code fences, NO explanation`;
}



export function buildVastuCriticPrompt(svgSnippet, rooms, plotW, plotH) {
  const roomSummary = rooms.map(r => `${r.name}→${r.vastu}`).join(", ");
  return `You are a strict Vastu Shastra expert. Audit this ${plotW}×${plotH}ft floor plan.

Room placements: ${roomSummary}

SVG snippet (first 1500 chars for visual context):
${svgSnippet.substring(0, 1500)}

Respond ONLY as strict JSON (no markdown, no code fences):
{
  "score": <integer 0-100>,
  "violations": [
    {"rule": "<which Vastu rule is violated>", "severity": "critical|major|minor", "fix": "<actionable fix>"}
  ],
  "compliant": ["<list of rules that pass>"],
  "summary": "<one sentence overall assessment>",
  "remedies": ["<short remedy suggestion if any critical violation>"]
}`;
}

export function buildCostEstimatorPrompt(params) {
  const { plotW, plotH, bhk, city, budget, floors } = params;
  const plotArea = plotW * plotH;
  const builtUp = Math.round(plotArea * 0.65 * floors);
  const budgetRanges = {
    "Economy (₹20-40L)":          { low:20,  high:40,  rate:1800 },
    "Lower-Premium (₹40-60L)":    { low:40,  high:60,  rate:2800 },
    "Premium (₹60-100L)":         { low:60,  high:100, rate:3800 },
    "Luxury (₹1Cr+)":             { low:100, high:200, rate:5500 },
  };
  const tier = budgetRanges[budget] || budgetRanges["Lower-Premium (₹40-60L)"];
  return `You are a senior Indian construction cost estimator with deep knowledge of ${city} rates (2025).

Project: ${plotW}×${plotH}ft plot (${plotArea} sqft), built-up ~${builtUp} sqft, ${bhk}BHK, ${floors} floor(s), ${city}, budget tier: ${budget}.
Expected rate: ₹${tier.rate}/sqft ± 20%.

Respond ONLY as strict JSON (no markdown, no code fences):
{
  "totalCost": <number, in lakhs, 1 decimal>,
  "breakdown": {
    "structure":   <lakhs>,
    "finishing":   <lakhs>,
    "electrical":  <lakhs>,
    "plumbing":    <lakhs>,
    "flooring":    <lakhs>,
    "painting":    <lakhs>,
    "misc":        <lakhs>
  },
  "bom": [
    {"item":"OPC 53 Cement",        "qty":<n>,"unit":"bags",   "rate":<INR>,"amount":<INR>},
    {"item":"TMT Steel Fe500",       "qty":<n>,"unit":"MT",     "rate":<INR>,"amount":<INR>},
    {"item":"Wire-cut Bricks",       "qty":<n>,"unit":"nos",    "rate":<INR>,"amount":<INR>},
    {"item":"River Sand",            "qty":<n>,"unit":"CFT",    "rate":<INR>,"amount":<INR>},
    {"item":"M-Sand",                "qty":<n>,"unit":"CFT",    "rate":<INR>,"amount":<INR>},
    {"item":"20mm Aggregates",       "qty":<n>,"unit":"CFT",    "rate":<INR>,"amount":<INR>},
    {"item":"Vitrified Floor Tiles", "qty":<n>,"unit":"sqft",   "rate":<INR>,"amount":<INR>},
    {"item":"Main Teak Door",        "qty":<n>,"unit":"nos",    "rate":<INR>,"amount":<INR>},
    {"item":"UPVC Windows",          "qty":<n>,"unit":"nos",    "rate":<INR>,"amount":<INR>},
    {"item":"Electrical Points",     "qty":<n>,"unit":"points", "rate":<INR>,"amount":<INR>},
    {"item":"Sanitary Fittings",     "qty":<n>,"unit":"sets",   "rate":<INR>,"amount":<INR>},
    {"item":"Interior Painting",     "qty":<n>,"unit":"sqft",   "rate":<INR>,"amount":<INR>}
  ],
  "perSqftRate": <number>,
  "builtUpArea": ${builtUp},
  "timeline": "<X–Y months>",
  "notes": "<any important cost notes for this city/budget>"
}`;
}

export function buildFurniturePrompt(rooms, bhk) {
  const roomList = rooms.map(r => `${r.name}(x=${r.x},y=${r.y},w=${r.w},h=${r.h})`).join("; ");
  return `You are an expert interior furniture planner for Indian homes.

${bhk}BHK floor plan rooms (SVG coords): ${roomList}

Place realistic furniture with proper circulation clearance (min 90cm between pieces).
Respond ONLY as strict JSON (no markdown):
{
  "placements": [
    {
      "room": "<room name>",
      "items": [
        {"name":"<furniture name>","x":<int>,"y":<int>,"w":<int>,"h":<int>,"color":"<hex>","rotation":0}
      ]
    }
  ]
}
Rules:
- Living: L-sofa(w≈80,h≈40), coffee table(w≈35,h≈25), TV unit(w≈60,h≈12) against a wall
- Master Bed: king bed(w≈60,h≈50) head against solid wall, wardrobe(w≈40,h≈12), dresser(w≈25,h≈12)
- Bedroom 2/3: double bed(w≈50,h≈40), wardrobe(w≈35,h≈12)
- Kitchen: L-counter along SE walls (w≈10,h≈60+60), refrigerator(w≈20,h≈22)
- Dining: rectangular table(w≈50,h≈30) with chairs around
- Bathroom/Toilet: WC symbol circle r≈10, wash basin rect w≈18,h≈12
Keep all items strictly inside room boundaries with at least 8px margin from walls.`;
}

export function buildExplainToParentsPrompt(report, language) {
  const langMap = { Hindi:'हिंदी', Kannada:'ಕನ್ನಡ', Tamil:'தமிழ்' };
  const script = langMap[language] || language;
  return `Explain this Vastu report in simple, warm language suitable for elderly Indian parents who don't know architectural terms.

Vastu Score: ${report?.score}/100
Summary: "${report?.summary}"
Main Issues: ${report?.violations?.map(v => v.rule).join(', ') || 'None'}
Rules followed: ${report?.compliant?.length || 0} of 14

Write ONLY in this exact format — no extra text, no markdown:

ENGLISH:
[2-3 simple, reassuring sentences. Say whether the home energy is good overall. Mention the main issue if any. End with a positive note. No jargon.]

${language} (${script}):
[Translate the English sentences exactly into ${language}. Keep a warm, respectful tone. Use "ji" where natural.]`;
}

export function buildChatAnalysisPrompt(params, userMsg) {
  return `You are an architectural AI assistant. The user has a ${params.bhk}BHK floor plan on a ${params.plotW}×${params.plotH}ft ${params.facing}-facing plot in ${params.city}.

User request: "${userMsg}"

Analyse feasibility considering: (1) Vastu Shastra rules, (2) practical dimensions, (3) building regulations.
Respond ONLY as JSON (no markdown):
{
  "feasible": true/false,
  "vastuImpact": "positive|neutral|negative",
  "changes": ["<specific change 1>", "<specific change 2>"],
  "warnings": ["<concern if any>"],
  "refinementNote": "<single paragraph instruction for SVG regeneration — be specific about which rooms to move/resize>",
  "summary": "<friendly 1-2 sentence reply to user>"
}`;
}

// ─── Belief-system context injected into floor-plan & critic prompts ──────────
export function buildBeliefContext(belief = 'vastu') {
  const rules = {
    vastu: [
      "North-East (Ishanya) must stay open and uncluttered — no heavy rooms.",
      "Main entrance preferred on North or East wall.",
      "Master Bedroom in South-West — heaviest, most stable zone.",
      "Kitchen in South-East (Agneya — fire zone); cooking to face East.",
      "Pooja/prayer room in North-East, on ground floor only.",
      "Bathrooms/toilets in North-West or West — never in NE or SW.",
      "Living room in North or East wing.",
      "Staircase in South, West, or South-West — never in centre (Brahmasthan).",
      "Brahmasthan (centre) to remain open — no column, pillar, or heavy wall.",
      "Overhead water tank on South-West of terrace; underground sump in NE.",
      "No beam running over sleeping heads (bed positions must avoid beams).",
      "Setbacks: larger on North and East sides, smaller on South and West.",
    ],
    islamic: [
      "Entrance (Bab) must NOT directly face the Qibla direction (toward Mecca, ~SW from India); offset it to reduce distraction during Salah.",
      "Vestibule (Darhliz) at entry — visitors must not directly see into the private interior from the door.",
      "Salamlik (men's formal reception / Majlis) near entrance; Haramlik (family/women's quarters) deep inside — strict public→private gradient.",
      "Wudu (ablution) space with running water adjacent to any prayer room; also near main bathroom.",
      "Central courtyard (Sahn/Hawsh) preferred — sky connection, natural ventilation, spiritual focus.",
      "Mashrabiya or Jali screens on windows facing the street — privacy without blocking light or air.",
      "Kitchen (food preparation) must be separate from prayer space; no direct visual connection.",
      "Garden (Bustan/Char Bagh) in four-quadrant pattern when space allows — paradise symbolism.",
      "Riwaq (shaded colonnade) along courtyard edges for summer circulation without sun exposure.",
      "No figurative artwork or sculpture as permanent architectural element in primary rooms.",
      "Geometric tile or plasterwork patterns (Islīmī) preferred for ornamentation over figurative motifs.",
      "Guest bathroom (for Wudu) accessible without passing through private family zones.",
    ],
    christian: [
      "Primary living spaces and main entrance should face East — toward sunrise, symbol of resurrection.",
      "Entry sequence: porch/portico (threshold) → vestibule (narthex-like) → main hall — three-stage liminal progression.",
      "Main hall / family gathering space as the spiritual heart of home; higher ceiling preferred (connection to the divine).",
      "A dedicated prayer/contemplation alcove or chapel niche in the East or North-East of the home.",
      "Garden or outdoor courtyard (Hortus Conclusus) ideally enclosed on three sides — paradise and refuge symbolism.",
      "Proportions: rooms should follow harmonic ratios — 1:1 (square), 1:√2, or 1:φ (golden ratio ≈ 1:1.618).",
      "Natural light from East and South preferred — no primary windows on North or West of sanctuary spaces.",
      "Clerestory or high windows in main hall where height allows — 'Lux Divina' (divine light from above).",
      "Cruciform or cross-axis plan encouraged — living/dining on one axis, bedrooms/prayer on perpendicular axis.",
      "Strong threshold at front door — visible, well-framed, welcoming; hospitality is a core Christian spatial value.",
      "Labyrinthine or processional path from gate to front door (not a straight driveway) encourages contemplative approach.",
      "Bell tower element or prominent vertical feature at home's highest or most visible corner — optional but spiritually evocative.",
    ],
    universal: [
      "Maximise natural light: primary living areas face South or East.",
      "Privacy gradient: entrance zone → semi-public living → private bedrooms.",
      "Cross-ventilation: openings on opposite walls of primary rooms.",
      "Kitchen near rear or side entry for service access.",
      "Bathrooms grouped on one plumbing wall to reduce pipe runs.",
      "Bedroom away from street-facing walls for noise reduction.",
      "Open plan living-dining for social connection.",
      "Adequate storage in every room.",
    ],
  };
  const labels = {
    vastu: 'Vastu Shastra',
    islamic: 'Islāmī Mīmārī (Islamic Architecture)',
    christian: 'Sacred Christian Design',
    universal: 'Universal Design Principles',
  };
  const list = (rules[belief] || rules.vastu).map((r,i) => `${i+1}. ${r}`).join('\n');
  return { label: labels[belief] || labels.vastu, rules: list };
}

export function buildBeliefCriticPrompt(svgSnippet, rooms, plotW, plotH, belief = 'vastu') {
  const { label, rules } = buildBeliefContext(belief);
  const roomSummary = rooms.map(r => `${r.name}→${r.vastu || r.zone || 'placed'}`).join(", ");
  return `You are a strict ${label} expert. Audit this ${plotW}×${plotH}ft floor plan against ${label} principles.

Room placements: ${roomSummary}

${label} Rules to audit:
${rules}

SVG snippet (first 1500 chars for visual context):
${svgSnippet.substring(0, 1500)}

Respond ONLY as strict JSON (no markdown, no code fences):
{
  "score": <integer 0-100>,
  "violations": [
    {"rule": "<which rule is violated>", "severity": "critical|major|minor", "fix": "<actionable fix>"}
  ],
  "compliant": ["<list of rules that pass>"],
  "summary": "<one sentence overall assessment>",
  "remedies": ["<short remedy suggestion if any critical violation>"]
}`;
}
