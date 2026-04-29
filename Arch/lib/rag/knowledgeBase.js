// ─── Static Vastu RAG Knowledge Base ─────────────────────────────────────────
// Organised by dimension key, BHK count, and facing direction.
// Each entry is a text chunk that can be embedded and retrieved at generation time.

export const POPULAR_DIMENSIONS = [
  "20x30", "20x40", "25x40", "25x50",
  "30x40", "30x50", "30x60",
  "40x40", "40x50", "40x60",
  "50x60", "50x80", "60x60", "60x90",
];

// ─── Zone placement rules per facing direction ─────────────────────────────────
export const VASTU_ZONE_RULES = {
  North: {
    ideal: {
      "Master Bed":  "SW",  "Kitchen": "SE",  "Puja":  "NE",
      "Living":      "N",   "Dining":  "S",   "Toilet":"NW",
      "Bathroom":    "NW",  "Utility": "NW",  "Corridor":"C",
      "Bedroom 2":   "W",   "Bedroom 3":"E",  "Bedroom 4":"W",
      "Bedroom 5":   "NW",  "Staircase":"SW", "Study": "E",
    },
    entrance: "North wall — preferably in the North or East half",
    notes: "North-facing is the most auspicious after East. Keep NE quadrant completely open and uncluttered. Living room should occupy the North wing to welcome prosperity energy.",
  },
  East: {
    ideal: {
      "Master Bed":  "SW",  "Kitchen": "SE",  "Puja":  "NE",
      "Living":      "E",   "Dining":  "S",   "Toilet":"NW",
      "Bathroom":    "NW",  "Utility": "NW",  "Corridor":"C",
      "Bedroom 2":   "W",   "Bedroom 3":"N",  "Bedroom 4":"W",
      "Bedroom 5":   "NW",  "Staircase":"SW", "Study": "NE",
    },
    entrance: "East wall — the most auspicious direction per Vastu",
    notes: "East-facing is considered most auspicious. The Living room should face East to receive morning sunlight. Puja room in NE receives first sunlight. Master Bed must remain in SW regardless of facing.",
  },
  South: {
    ideal: {
      "Master Bed":  "SW",  "Kitchen": "SE",  "Puja":  "NE",
      "Living":      "SE",  "Dining":  "E",   "Toilet":"NW",
      "Bathroom":    "NW",  "Utility": "NW",  "Corridor":"C",
      "Bedroom 2":   "W",   "Bedroom 3":"N",  "Bedroom 4":"W",
      "Bedroom 5":   "NW",  "Staircase":"SW", "Study": "N",
    },
    entrance: "South-facing entrance — place in SE portion of South wall to reduce negative effects",
    notes: "South-facing plots need extra care. Keep the South wall heavier. Master Bed in SW is critical. Kitchen in SE is essential. Never place entrance in SW portion of South wall.",
  },
  West: {
    ideal: {
      "Master Bed":  "SW",  "Kitchen": "SE",  "Puja":  "NE",
      "Living":      "W",   "Dining":  "S",   "Toilet":"NW",
      "Bathroom":    "NW",  "Utility": "NW",  "Corridor":"C",
      "Bedroom 2":   "N",   "Bedroom 3":"E",  "Bedroom 4":"N",
      "Bedroom 5":   "NW",  "Staircase":"SW", "Study": "N",
    },
    entrance: "West wall — place in NW half of the West wall for better energy",
    notes: "West-facing is acceptable. Keep North and East sides lighter. Living room can be in West or North. Master Bed always SW.",
  },
};

// ─── Room-specific vastu rules ──────────────────────────────────────────────────
export const ROOM_VASTU_RULES = {
  "Master Bed": {
    mandatory: "ALWAYS in SW (South-West) zone — the heaviest, most stable zone",
    door: "Door on East or North wall of the room",
    window: "Windows on East or North wall only; avoid South and West windows",
    orientation: "Head of bed toward South wall (feet pointing North) or East wall",
    forbidden: ["NE", "SE", "NW", "N", "E"],
  },
  "Kitchen": {
    mandatory: "SE (South-East, Agneya/fire zone) is ideal; NW is acceptable",
    door: "Door on East or North wall",
    window: "East-facing window mandatory for cook to face East",
    orientation: "Cook must face East while cooking",
    forbidden: ["NE", "SW", "N", "C"],
  },
  "Puja": {
    mandatory: "NE (North-East, Ishanya) corner — ONLY acceptable position",
    door: "Door on East or North wall",
    window: "East or North window for morning light",
    orientation: "Face East while praying",
    forbidden: ["SW", "SE", "S", "NW", "W"],
  },
  "Living": {
    mandatory: "North or East wing — open and airy",
    door: "Main entrance door faces North or East",
    window: "North and East windows for maximum light",
    orientation: "Seating arrangement facing East or South",
    forbidden: [],
  },
  "Bathroom": {
    mandatory: "NW or W zone — never in NE (extremely inauspicious)",
    door: "Door on East or North wall of bathroom",
    window: "North or West window for ventilation",
    orientation: "WC should not face North or East",
    forbidden: ["NE", "C", "SW"],
  },
  "Toilet": {
    mandatory: "NW or W zone — same as Bathroom",
    door: "Never directly visible from kitchen or puja room",
    window: "Exhaust or window on North or West wall",
    orientation: "WC faces South or West",
    forbidden: ["NE", "C", "SW"],
  },
  "Staircase": {
    mandatory: "SW, S, or W zone — never in the center (Brahmasthan)",
    door: "Landing area connects to corridor on W or S side",
    window: "Small window on South wall",
    orientation: "Steps rise from North to South or East to West",
    forbidden: ["NE", "C", "N", "E"],
  },
  "Dining": {
    mandatory: "West or South zone is preferred",
    door: "Connect to Kitchen on one wall",
    window: "East or South windows for light",
    forbidden: [],
  },
};

// ─── High-scoring example layouts (text descriptions for embedding) ─────────────
export const EXAMPLE_LAYOUTS = [
  {
    layoutId: "20x30_2BHK_North",
    dimension: "20x30", bhk: 2, facing: "North", score: 92,
    description: `20x30ft 2BHK North-facing vastu floor plan. Score: 92/100.
Room zones: Living→N, Kitchen→SE, Master Bed→SW, Bedroom 2→W, Bathroom→NW, Toilet→NW, Utility→NW, Puja→NE, Dining→S, Master Bath→S, Corridor→C.
Key vastu features: Puja occupies the NE corner (top-right, most auspicious). Kitchen in SE (fire zone, cook faces East). Master Bed in SW (heaviest zone, head pointing South). Toilet and Bathroom grouped in NW (West zone, acceptable). Living room in North wing receives prosperity energy. Center (Brahmasthan) kept open as corridor. Entrance on North wall. No heavy structure in NE.
Door placements: Entrance door on North wall center. Living room door faces corridor. Kitchen door on North wall facing corridor. Bedroom doors open toward corridor. Puja room door opens East. Bathroom door opens toward corridor not toward kitchen.
Window placements: Living room has North and East facing windows. Kitchen has East-facing window (cook faces East). Master Bedroom has North window only. Puja room has East window for morning light. Bathrooms have North windows for ventilation.`,
  },
  {
    layoutId: "30x40_3BHK_North",
    dimension: "30x40", bhk: 3, facing: "North", score: 95,
    description: `30x40ft 3BHK North-facing vastu floor plan. Score: 95/100.
Room zones: Living→N, Kitchen→SE, Master Bed→SW, Bedroom 2→W, Bedroom 3→E, Bathroom→NW, Toilet→NW, Utility→NW, Puja→NE, Dining→S, Master Bath→S, Corridor→C.
Key vastu features: Puja in NE fills entire top-right quadrant. Three water/hygiene rooms (Utility, Toilet, Bathroom) stacked in NW column. Living in full North wing. Kitchen in SE with cook facing East. Master Bed SW with attached bath on South wall. Corridor is the Brahmasthan (center) — kept open. Both secondary bedrooms in acceptable zones (W and E). Entrance on North wall in East half (more auspicious).
Door placements: Entrance door on North wall, East half. All bedroom doors face corridor (South wall of room). Kitchen door on North wall of kitchen. Puja door opens East. Staircase if present in SW zone with steps rising South to North.
Window placements: Living room — North and East windows. Bedroom 2 (W) — West and North windows. Bedroom 3 (E) — East and North windows. Master Bed (SW) — South and West windows only as per vastu (heavier walls on SW). Kitchen — East window mandatory. Puja — East window. Bathrooms — North windows for ventilation.`,
  },
  {
    layoutId: "30x40_3BHK_East",
    dimension: "30x40", bhk: 3, facing: "East", score: 93,
    description: `30x40ft 3BHK East-facing vastu floor plan. Score: 93/100.
Room zones: Bedroom 3→N, Living→E, Kitchen→SE, Master Bed→SW, Bedroom 2→W, Bathroom→NW, Toilet→NW, Utility→NW, Puja→NE, Dining→S, Master Bath→S, Corridor→C.
Key vastu features: East-facing is the most auspicious direction. Entrance on East wall. Puja in NE receives first morning light. Living room in East wing — receives morning sun, most social zone. Kitchen in SE. Master Bed in SW. Bedrooms on N, W sides. Brahmasthan (corridor, center) open.
Door placements: Entrance on East wall, North half. Living room faces East entrance. Kitchen door on West wall. Puja faces East. All bedrooms open toward central corridor.
Window placements: Living room — East-facing large windows (main orientation). Kitchen — East window. Puja — East window. Master Bed — South window (minimal on SW). Secondary bedrooms — East/North windows.`,
  },
  {
    layoutId: "40x60_4BHK_North",
    dimension: "40x60", bhk: 4, facing: "North", score: 90,
    description: `40x60ft 4BHK North-facing vastu floor plan. Score: 90/100.
Room zones: Living→N, Kitchen→SE, Master Bed→SW, Bedroom 2→W, Bedroom 3→E, Bedroom 4→W, Bathroom→NW, Toilet→NW, Utility→NW, Puja→NE, Dining→S, Master Bath→S, Corridor→C.
Key vastu features: Large plot allows proper zone separation. Puja fills NE quadrant. Three service rooms in NW. Living room spans full North wing. Kitchen in SE corner. Two secondary bedrooms in W zone (acceptable per vastu). Master Bed in SW with private attached bath on South wall. Brahmasthan kept open as corridor/family room. Entrance on North wall.
Staircase (if 2-floor): Located in SW or W zone — never in center or NE. Steps rise from East to West or North to South. Landing at half-height on South wall. Staircase labeled with step count (typically 12-14 steps for ground to first floor at standard 7-inch rise).
Door placements: Entrance North wall, slight East offset. All rooms connect to central corridor. Master Bed door opens North (toward corridor). Kitchen door faces corridor. Puja opens East.
Window placements: Living — large North and East windows. Kitchen — East window. Puja — East window. All bedrooms — prefer East or North windows. Master Bed — South window only (not East or North per vastu for SW rooms).`,
  },
  {
    layoutId: "20x30_2BHK_East",
    dimension: "20x30", bhk: 2, facing: "East", score: 89,
    description: `20x30ft 2BHK East-facing compact vastu floor plan. Score: 89/100.
Room zones: Bedroom 2→N, Living→E, Kitchen→SE, Master Bed→SW, Bathroom→NW, Toilet→NW, Utility→NW, Puja→NE, Dining→E, Master Bath→S, Corridor→C.
Key vastu features: Compact East-facing plot. Entrance on East wall. Living room in East wing. Puja in NE (top-right). Kitchen in SE. Master Bed SW. Service rooms NW. Corridor in center.
Door placements: Entrance on East wall. Living room opens East. Kitchen door on West wall (interior). All rooms connect to small central corridor.
Window placements: East wall — Living room large window. Puja — small East window. Kitchen — East window. Bedrooms — North windows preferred.`,
  },
  {
    layoutId: "30x50_3BHK_North",
    dimension: "30x50", bhk: 3, facing: "North", score: 94,
    description: `30x50ft 3BHK North-facing vastu floor plan. Score: 94/100.
Room zones: Living→N, Kitchen→SE, Master Bed→SW, Bedroom 2→W, Bedroom 3→E, Bathroom→NW, Toilet→NW, Utility→NW, Puja→NE, Dining→S, Master Bath→S, Corridor→C.
Similar to 30x40 but with more depth. Extra space allows larger Master Bed in SW and expanded Kitchen in SE. Puja room larger in NE. Living room spans North with more width. Corridor wider for better circulation.
Key vastu features: All critical zones maintained. More space for proper door swing arcs. Better separation between Puja and service areas. Master Bath attached to Master Bed on South wall.`,
  },
  {
    layoutId: "40x40_3BHK_North",
    dimension: "40x40", bhk: 3, facing: "North", score: 91,
    description: `40x40ft 3BHK North-facing square plot vastu floor plan. Score: 91/100.
Square plot requires special attention to Brahmasthan (exact center). Corridor must be centered precisely. No room can encroach on the center 20% of the plot.
Room zones: Living→N, Kitchen→SE, Master Bed→SW, Bedroom 2→W, Bedroom 3→E, Bathroom→NW, Toilet→NW, Utility→NW, Puja→NE, Dining→S, Corridor→C.
Key vastu features: Perfect square allows symmetric zoning. NE quadrant has Puja with open space. SW has Master Bed. SE has Kitchen. NW has service rooms. Brahmasthan open corridor. All zones well-balanced.`,
  },
  {
    layoutId: "50x80_5BHK_North",
    dimension: "50x80", bhk: 5, facing: "North", score: 88,
    description: `50x80ft 5BHK North-facing large plot vastu floor plan. Score: 88/100.
Large plot with Family Room in center, multiple bedrooms in W and N zones.
Room zones: Living→N, Kitchen→SE, Master Bed→SW, Bedroom 2→W, Bedroom 3→S, Bedroom 4→E, Bedroom 5→W, Bathroom→NW, Toilet→NW, Utility→NW, Puja→NE, Dining→SE, Family Room→C, Corridor→C.
Key vastu features: Family Room in center zone (Brahmasthan) — this is the gathering heart of home. Multiple service rooms in NW column. Puja in NE. Kitchen in SE. Master Bed in SW. 5 bedrooms distributed in W, N, E zones.
Staircase: SW zone, steps rise from East to West, 14 steps, labeled "UP" with step count.`,
  },
];

// ─── Door placement rules ──────────────────────────────────────────────────────
export const DOOR_RULES = `DOOR PLACEMENT RULES:
1. Main entrance: Always on the facing-direction wall (North wall for North-facing, East wall for East-facing, etc.)
2. Room doors: Place on the wall closest to the central corridor
   - Rooms in North row: door on SOUTH wall of the room (facing corridor)
   - Rooms in South row: door on NORTH wall of the room (facing corridor)
   - Rooms in West column: door on EAST wall of the room (facing corridor)
   - Rooms in East column: door on WEST wall of the room (facing corridor)
3. Kitchen door: Never directly opposite or adjacent to bathroom/toilet door
4. Puja room door: Always on East or North wall
5. Master Bedroom door: East or North wall (never South or West)
6. Door swing: All interior doors swing INWARD (toward the room interior)
7. Door gap: 28px wide, white rectangle erases the wall, quarter-circle arc shows swing
8. Entrance door: 36px wide, swings OUTWARD toward setback zone`;

// ─── Window placement rules ────────────────────────────────────────────────────
export const WINDOW_RULES = `WINDOW PLACEMENT RULES:
1. Living room: Large windows on North and East walls (preferred), South acceptable
2. Kitchen: MANDATORY East-facing window (cook faces East per Vastu)
3. Puja room: East-facing window for morning light (essential)
4. Master Bedroom (SW): South and West windows ONLY — no East or North windows in SW rooms per Vastu
5. Bedroom 2 (W zone): West and North windows
6. Bedroom 3 (E zone): East and North windows preferred
7. Bathroom/Toilet: North or West facing windows for ventilation (no East or South)
8. No windows: On walls shared between two rooms (only exterior walls get windows)
9. Window symbol: 3 parallel lines perpendicular to wall, 24px wide, centered on wall segment`;

// ─── Staircase notation rules ─────────────────────────────────────────────────
export const STAIRCASE_RULES = `STAIRCASE DRAWING RULES (only if Staircase room exists in room list):
1. Zone: MUST be in SW, S, or W zone — NEVER in NE or center
2. Steps: Draw horizontal lines across the staircase room representing each step tread
   - Typically 10-14 steps for ground floor to first floor
   - Space steps evenly: step_height = room_height / step_count
   - Each step: <line x1="room_x" y1="room_y + (i * step_height)" x2="room_x + room_w" y2="room_y + (i * step_height)" stroke="#555" stroke-width="1"/>
3. Direction arrow: Draw arrow pointing in direction of ascent (UP)
4. Labels: Add "UP" text and step count (e.g., "12 STEPS") in the room center
5. Railing: Draw a thick line along one side (usually the wall side) stroke-width="3"`;

// ─── Floor restriction rules ──────────────────────────────────────────────────
export const FLOOR_RESTRICTION_RULES = {
  "BBMP (Bengaluru)":   { maxFAR: 2.5,  maxHeight: 15, groundPlusFloors: 3 },
  "BMC (Mumbai)":       { maxFAR: 1.33, maxHeight: 11, groundPlusFloors: 2 },
  "MCD (Delhi)":        { maxFAR: 3.5,  maxHeight: 15, groundPlusFloors: 4 },
  "GHMC (Hyderabad)":   { maxFAR: 2.0,  maxHeight: 12, groundPlusFloors: 3 },
  "CMDA (Chennai)":     { maxFAR: 1.5,  maxHeight: 10, groundPlusFloors: 2 },
  "PMC (Pune)":         { maxFAR: 1.5,  maxHeight: 12, groundPlusFloors: 2 },
  "NBC (Generic)":      { maxFAR: 1.5,  maxHeight: 10, groundPlusFloors: 2 },
};

export function getMaxFloors(params) {
  const { plotW, plotH, city, floors } = params;
  const plotArea = plotW * plotH;
  const rules = FLOOR_RESTRICTION_RULES[city] || FLOOR_RESTRICTION_RULES["NBC (Generic)"];
  const builtUpPerFloor = plotArea * 0.65;
  const maxFloorsByFAR = Math.floor((plotArea * rules.maxFAR) / builtUpPerFloor);
  const maxAllowed = Math.min(maxFloorsByFAR, rules.groundPlusFloors);
  const requested = parseInt(floors) || 1;
  return {
    maxAllowed,
    requested,
    isExceeded: requested > maxAllowed,
    message: requested > maxAllowed
      ? `${city} FAR ${rules.maxFAR} allows max ${maxAllowed} floor(s) on ${plotArea}sqft plot. Requested ${requested} exceeds limit.`
      : `${city}: ${requested} floor(s) approved (max ${maxAllowed} allowed)`,
  };
}

// ─── Architectural Validation Rules (R01–R51) ─────────────────────────────────
// Parsed from dataset_metadata v1.0 — 21 curated rules across 9 categories.
// action_on_violation: "reject" = hard constraint | "penalty" = soft constraint | "cost_penalty" / "cultural_penalty" = advisory
export const VALIDATION_RULES = [
  // ── Geometry ──────────────────────────────────────────────────────────────
  { id:"R01", cat:"Geometry",     action:"reject",           rule:"Room aspect ratio (short/long wall) must be ≥ 0.5625 (no corridor-thin rooms)." },
  { id:"R02", cat:"Geometry",     action:"reject",           rule:"Room length-to-width ratio must be ≤ 2.0; layouts with any room > 2.5 are rejected outright." },
  { id:"R03", cat:"Geometry",     action:"penalty",          rule:"Furniture bounding boxes must not exceed 40% of their room's floor area (60/40 spatial efficiency rule)." },
  { id:"R04", cat:"Geometry",     action:"reject",           rule:"Every habitable room must be ≥ 7 ft in its shortest dimension. Exempt: kitchen, bathroom, utility, closet." },
  // ── Hierarchy ─────────────────────────────────────────────────────────────
  { id:"R07", cat:"Hierarchy",    action:"penalty",          rule:"Primary bedroom must have greater area than every secondary bedroom." },
  { id:"R08", cat:"Hierarchy",    action:"reject",           rule:"Minimum floor areas: primary living ≥ 144 sqft, medium living ≥ 216 sqft, guest bedroom ≥ 120 sqft." },
  // ── Circulation ───────────────────────────────────────────────────────────
  { id:"R12", cat:"Circulation",  action:"reject",           rule:"Corridors must be 36–60 inches wide. Optimal range 42–48 inches." },
  { id:"R13", cat:"Circulation",  action:"penalty",          rule:"No more than 4 doors may open onto a single linear corridor segment." },
  { id:"R14", cat:"Circulation",  action:"reject",           rule:"Dead-end corridor segments must not exceed 20 ft in length." },
  // ── Zoning ────────────────────────────────────────────────────────────────
  { id:"R20", cat:"Zoning",       action:"penalty",          rule:"Acoustic buffer required between sleep zones (bedroom, primary bath) and active zones (living, kitchen, dining). They must not share a wall without insulation." },
  { id:"R21", cat:"Zoning",       action:"reject",           rule:"Bathrooms and powder rooms must NOT be directly adjacent (door-connected) to kitchen, dining room, or living room." },
  // ── Vastu ─────────────────────────────────────────────────────────────────
  { id:"R26", cat:"Vastu",        action:"cultural_penalty", rule:"Kitchen must be placed in SE (South-East) or NW (North-West) quadrant. Placement outside these zones is a cultural violation." },
  { id:"R28", cat:"Vastu",        action:"cultural_penalty", rule:"Bathroom/toilet must NOT be placed in the NE (North-East) quadrant. Toilet seat axis must align North–South." },
  // ── Ergonomics ────────────────────────────────────────────────────────────
  { id:"R30", cat:"Ergonomics",   action:"penalty",          rule:"Kitchen work triangle (stove–sink–refrigerator): each leg must be 4–9 ft. Triangle perimeter must stay 13–26 ft." },
  { id:"R33", cat:"Ergonomics",   action:"reject",           rule:"Minimum 30-inch frontal clearance in front of every bathroom fixture (sink, toilet, tub/shower)." },
  { id:"R34", cat:"Ergonomics",   action:"reject",           rule:"Toilet centerline must have ≥ 15 inches lateral clearance to each side wall (18 inches optimal)." },
  { id:"R35", cat:"Ergonomics",   action:"reject",           rule:"Door swing arcs must not intersect any fixture, furniture footprint, or standing zone. Zero overlap allowed." },
  // ── Structural ────────────────────────────────────────────────────────────
  { id:"R37", cat:"Structural",   action:"cost_penalty",     rule:"Load-bearing walls on upper floors must stack within 12 inches of load-bearing walls below. Misalignment requires a transfer beam (cost penalty)." },
  // ── Plumbing ──────────────────────────────────────────────────────────────
  { id:"R42", cat:"Plumbing",     action:"cost_penalty",     rule:"Bathroom, kitchen, and utility rooms should share wet walls where possible to minimise plumbing run lengths and cost." },
  // ── Fenestration ──────────────────────────────────────────────────────────
  { id:"R46", cat:"Fenestration", action:"reject",           rule:"Total glazing area per room must be ≥ 8% of that room's floor area (natural light minimum)." },
  // ── ADA ───────────────────────────────────────────────────────────────────
  { id:"R51", cat:"ADA",          action:"penalty",          rule:"Pull-type doors require ≥ 18 inches of clear latch-side wall space for wheelchair approach." },
];

// Human-readable block for prompt injection
export const VALIDATION_RULES_PROMPT = (() => {
  const byCategory = {};
  for (const r of VALIDATION_RULES) {
    if (!byCategory[r.cat]) byCategory[r.cat] = [];
    byCategory[r.cat].push(`  [${r.id}|${r.action.toUpperCase()}] ${r.rule}`);
  }
  const lines = ["ARCHITECTURAL VALIDATION RULES (must be satisfied before finalising any layout):"];
  for (const [cat, items] of Object.entries(byCategory)) {
    lines.push(`\n${cat}:`);
    lines.push(...items);
  }
  return lines.join("\n");
})();

// ─── Build a rich text document for a retrieval query ─────────────────────────
export function buildQueryDocument(params) {
  const { plotW, plotH, bhk, facing, belief = 'vastu', city } = params;
  const dimKey = `${plotW}x${plotH}`;
  return `${dimKey}ft ${bhk}BHK ${facing}-facing ${belief} floor plan ${city} India vastu optimal layout room placement`;
}

// ─── Format retrieved context for prompt injection ────────────────────────────
export function formatRAGContext(retrievedDocs, params) {
  if (!retrievedDocs?.length) return "";
  const { facing, bhk } = params;
  const zoneMap = VASTU_ZONE_RULES[facing]?.ideal || VASTU_ZONE_RULES.North.ideal;
  const zoneList = Object.entries(zoneMap).map(([room, zone]) => `${room}→${zone}`).join(", ");

  const examples = retrievedDocs
    .slice(0, 3)
    .map((doc, i) => `Example ${i + 1} (score ${doc.score || '~90'}/100):\n${doc.content || doc.description}`)
    .join("\n\n");

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## RAG CONTEXT — VASTU-COMPLIANT REFERENCE LAYOUTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MANDATORY ZONE MAP for ${facing}-facing ${bhk}BHK:
${zoneList}

DOOR RULES:
${DOOR_RULES}

WINDOW RULES:
${WINDOW_RULES}

${STAIRCASE_RULES}

HIGH-SCORING REFERENCE EXAMPLES:
${examples}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${VALIDATION_RULES_PROMPT}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REJECT actions are hard constraints — violating them makes the layout invalid.
PENALTY actions are soft constraints — violations lower the plan score but do not block generation.
Apply ALL rules above before finalising any room positions, dimensions, or adjacencies.
Apply the zone map and door/window rules STRICTLY. The reference examples show what a 90+ scoring plan looks like.
`;
}
