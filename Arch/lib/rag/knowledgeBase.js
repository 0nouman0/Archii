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

  // ── South-facing layouts (new — ChatHouseDiffusion + DeepFloorplan inspired) ─
  {
    layoutId: "30x40_3BHK_South",
    dimension: "30x40", bhk: 3, facing: "South", score: 85,
    description: `30x40ft 3BHK South-facing vastu floor plan. Score: 85/100.
Room zones: Living->SE, Kitchen->SE, Master Bed->SW, Bedroom 2->W, Bedroom 3->N, Bathroom->NW, Toilet->NW, Utility->NW, Puja->NE, Dining->E, Master Bath->S, Corridor->C.
Key vastu: South-facing keeps South wall heavy. Entrance in SE portion of South wall ONLY (never SW). Living in SE. Kitchen SE fire zone. Master Bed SW (critical). Puja NE. Service NW. Bedroom 3 North. Corridor center Brahmasthan.
Entrance CRITICAL: NEVER place entrance in SW portion of South wall. Use SE quadrant only.
Door placements: Entrance South wall East half (SE). Master Bed door opens North. Kitchen faces corridor. Puja opens East.
Window placements: Living-South+East. Kitchen-East(mandatory). Puja-East. Master Bed SW-West+South. Bedroom 2 W-West+North. Bedroom 3 N-North+East. No large South windows except Living.`,
  },
  {
    layoutId: "20x40_2BHK_South",
    dimension: "20x40", bhk: 2, facing: "South", score: 83,
    description: `20x40ft 2BHK South-facing vastu floor plan. Score: 83/100.
Room zones: Living->SE, Kitchen->SE, Master Bed->SW, Bedroom 2->W, Bathroom->NW, Toilet->NW, Utility->NW, Puja->NE, Dining->E, Corridor->C.
South-facing compact. Entrance South wall SE quadrant only. Keep North heavy with bedrooms and Puja. South wall solid.
Door placements: Entrance South wall East half. Bedrooms to central corridor.
Window placements: Living-SE. Kitchen-East. Puja-East. Bathrooms-North.`,
  },
  {
    layoutId: "40x50_4BHK_South",
    dimension: "40x50", bhk: 4, facing: "South", score: 84,
    description: `40x50ft 4BHK South-facing vastu floor plan. Score: 84/100.
Room zones: Living->SE, Kitchen->SE, Master Bed->SW, Bedroom 2->W, Bedroom 3->N, Bedroom 4->E, Bathroom->NW, Toilet->NW, Utility->NW, Puja->NE, Dining->E, Family Room->C, Corridor->C.
Large South-facing. Entrance SE portion of South wall. Family Room center. South wall heavy and solid. No balcony on South side.
Door placements: Entrance SE of South wall. Master Bed door North. Bedroom doors face corridor.
Window placements: No large South windows. East for Kitchen/Puja. North for Bedroom 3. West for Bedroom 2.`,
  },
  {
    layoutId: "25x50_3BHK_South",
    dimension: "25x50", bhk: 3, facing: "South", score: 81,
    description: `25x50ft 3BHK South-facing narrow-deep vastu floor plan. Score: 81/100.
Room zones: Bedroom 3->N, Kitchen->SE, Master Bed->SW, Bedroom 2->W, Bathroom->NW, Toilet->NW, Utility->NW, Puja->NE, Dining->E, Living->SE, Corridor->C.
Narrow South-facing. South wall heavy. Entrance South wall SE quadrant ONLY - never SW. Compound wall taller on South.
Window placements: No South-facing windows. East for Kitchen/Puja. North for Bedroom 3. West for Bedroom 2.`,
  },

  // ── West-facing layouts ──────────────────────────────────────────────
  {
    layoutId: "30x40_3BHK_West",
    dimension: "30x40", bhk: 3, facing: "West", score: 87,
    description: `30x40ft 3BHK West-facing vastu floor plan. Score: 87/100.
Room zones: Living->W, Kitchen->SE, Master Bed->SW, Bedroom 2->N, Bedroom 3->E, Bathroom->NW, Toilet->NW, Utility->NW, Puja->NE, Dining->S, Master Bath->S, Corridor->C.
West-facing acceptable per Vastu. Entrance West wall NW half (never SW). Living West wing evening light. Service NW. Kitchen SE. Master Bed SW. Puja NE.
Entrance: West wall entrance in NW half ONLY. Never SW half of West wall.
Door placements: Entrance West wall North half (NW). Living opens West. Bedrooms to central corridor.
Window placements: Living-West(large)+North. Kitchen-East(mandatory). Puja-East/North. Master Bed SW-South+West. Bedroom 2 N-North+East. Bedroom 3 E-East+North.`,
  },
  {
    layoutId: "25x50_3BHK_West",
    dimension: "25x50", bhk: 3, facing: "West", score: 86,
    description: `25x50ft 3BHK West-facing narrow-deep plot vastu floor plan. Score: 86/100.
Room zones: Living->W, Kitchen->SE, Master Bed->SW, Bedroom 2->N, Bedroom 3->N, Bathroom->NW, Toilet->NW, Utility->NW, Puja->NE, Dining->S, Corridor->C.
Narrow West-facing. Living West (entrance). Service NW. Two bedrooms North. Kitchen SE. Master Bed SW. Puja NE. Corridor center.
Window placements: Living-West. Kitchen-East. Puja-North+East. Bedrooms-North. No South windows.`,
  },
  {
    layoutId: "40x60_4BHK_West",
    dimension: "40x60", bhk: 4, facing: "West", score: 85,
    description: `40x60ft 4BHK West-facing vastu floor plan. Score: 85/100.
Room zones: Living->W, Kitchen->SE, Master Bed->SW, Bedroom 2->N, Bedroom 3->N, Bedroom 4->E, Bathroom->NW, Toilet->NW, Utility->NW, Puja->NE, Dining->S, Family Room->C, Corridor->C.
Large West-facing. Family Room center. Living West. Bedrooms N, E, NW. Kitchen SE. Master Bed SW. Service NW. Puja NE.
Window placements: Living-West(large). Kitchen-East(mandatory). Puja-East/North. All bedrooms-North or East. No South windows.`,
  },
  {
    layoutId: "20x40_2BHK_West",
    dimension: "20x40", bhk: 2, facing: "West", score: 83,
    description: `20x40ft 2BHK West-facing compact vastu floor plan. Score: 83/100.
Room zones: Living->W, Kitchen->SE, Master Bed->SW, Bedroom 2->N, Bathroom->NW, Toilet->NW, Utility->NW, Puja->NE, Dining->S, Corridor->C.
Compact West-facing. Entrance West wall NW. Living West (front). Puja NE. Kitchen SE. Master Bed SW. Service NW. Bedroom 2 North.
Window placements: Living-West. Kitchen-East. Puja-East+North. Bedroom 2-North. No South windows.`,
  },

  // ── Large plots and additional East/North facing ─────────────────────────
  {
    layoutId: "40x50_4BHK_East",
    dimension: "40x50", bhk: 4, facing: "East", score: 92,
    description: `40x50ft 4BHK East-facing vastu floor plan. Score: 92/100.
Room zones: Bedroom 4->N, Living->E, Kitchen->SE, Master Bed->SW, Bedroom 2->W, Bedroom 3->N, Bathroom->NW, Toilet->NW, Utility->NW, Puja->NE, Dining->S, Family Room->C, Corridor->C.
East-facing most auspicious. Entrance East wall North half. Living East receives morning sun. Puja NE first sunlight. Family Room center.
Window placements: Living-East(large). Puja-East. Kitchen-East. Bedrooms-North+East. Master Bed-South.`,
  },
  {
    layoutId: "60x90_5BHK_North",
    dimension: "60x90", bhk: 5, facing: "North", score: 90,
    description: `60x90ft 5BHK North-facing bungalow vastu floor plan. Score: 90/100.
Room zones: Living->N, Kitchen->SE, Master Bed->SW, Bedroom 2->W, Bedroom 3->W, Bedroom 4->E, Bedroom 5->N, Bathroom->NW, Toilet->NW, Utility->NW, Puja->NE, Dining->S, Study->NE, Family Room->C, Balcony->NE, Corridor->C.
Large bungalow. Study in NE (knowledge zone - excellent for scholars). Balcony NE facing East. Master Bed SW with private garden.
Adjacency: Kitchen-Dining MUST adjacent. Puja+Study both NE knowledge zone. Master Bed+Master Bath MUST.
Window placements: Living-North+East. Puja-East. Study-East(morning light for concentration). Kitchen-East. Bedrooms-North+East.`,
  },
  {
    layoutId: "50x60_4BHK_North_2Storey",
    dimension: "50x60", bhk: 4, facing: "North", score: 92,
    description: `50x60ft 4BHK North-facing 2-storey vastu floor plan. Score: 92/100.
Room zones: Living->N, Kitchen->SE, Master Bed->SW, Bedroom 2->W, Bedroom 3->W, Bedroom 4->E, Bathroom->NW, Toilet->NW, Utility->NW, Puja->NE, Dining->S, Study->E, Staircase->SW, Corridor->C.
Two-storey home. Staircase in SW (vastu compliant). Study East zone (morning light and concentration). Bedrooms in W and E. Kitchen SE. Master Bed SW. Puja NE.
Staircase: SW zone. 14 steps rise East to West. Landing South side. Labeled UP with step count.
Window placements: Study-large East window. Living-North. Kitchen-East. Puja-East/North.`,
  },
  {
    layoutId: "25x40_2BHK_North_Compact",
    dimension: "25x40", bhk: 2, facing: "North", score: 91,
    description: `25x40ft 2BHK North-facing compact plot vastu floor plan. Score: 91/100.
Room zones: Living->N, Kitchen->SE, Master Bed->SW, Bedroom 2->W, Bathroom->NW, Toilet->NW, Utility->NW, Puja->NE, Dining->S, Corridor->C.
Compact North-facing. Living spans North. Puja NE. Service NW. Kitchen SE. Master Bed SW. Bedroom 2 West. Corridor center (Brahmasthan).
Key vastu: All critical zones maintained even on compact 25x40ft plot. No compromise on Master Bed SW or Puja NE placement.
Window placements: Living-North(large). Kitchen-East. Puja-East. Master Bed-South. Bedroom 2-West.`,
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


// ─── Extended Room Type Vocabulary (from zlzeng/DeepFloorplan) ─────────────────
// 30+ room types recognised by deep learning floor plan models
export const ROOM_TYPE_VOCABULARY = [
  // Core habitable
  "Living", "Dining", "Kitchen", "Master Bed", "Bedroom 2", "Bedroom 3", "Bedroom 4", "Bedroom 5",
  // Prayer / spiritual
  "Puja", "Prayer Room", "Meditation Room", "Pooja Hall",
  // Service / utility
  "Bathroom", "Master Bath", "Toilet", "Utility", "Laundry", "Store",
  // Circulation
  "Corridor", "Staircase", "Foyer", "Passage", "Lobby", "Entrance Hall",
  // Outdoor-connected
  "Balcony", "Terrace", "Car Porch", "Verandah", "Garden Room",
  // Work / study
  "Study", "Home Office", "Library", "Reading Room",
  // Large / social
  "Family Room", "Entertainment Room", "Game Room",
  // Service staff
  "Servant Quarter", "Driver Room",
  // Architectural
  "Basement", "Loft", "Mezzanine",
];

// ─── Spatial Relationship Rules (from ChatHouseDiffusion structured schema) ────
// ChatHouseDiffusion encodes floor plans as: roomA [spatial_relation] roomB
export const MANDATORY_SPATIAL_RULES = [
  { from:"Kitchen",    relation:"adjacent",  to:"Dining",      priority:"MUST",   reason:"Direct food service flow" },
  { from:"Master Bed", relation:"connected", to:"Master Bath",  priority:"MUST",   reason:"Ensuite access without leaving bedroom" },
  { from:"Living",     relation:"connected", to:"Corridor",    priority:"MUST",   reason:"Main social space opens to circulation" },
  { from:"Kitchen",    relation:"separated", to:"Puja",         priority:"MUST",   reason:"Fire zone cannot touch sacred space" },
  { from:"Toilet",     relation:"separated", to:"Kitchen",      priority:"MUST",   reason:"Hygiene separation — NBC code" },
  { from:"Puja",       relation:"separated", to:"Bathroom",     priority:"MUST",   reason:"Sacred space cannot be near wet rooms" },
  { from:"Puja",       relation:"corner",    to:"NE",           priority:"MUST",   reason:"NE is Ishanya — only acceptable Puja position" },
  { from:"Master Bed", relation:"corner",    to:"SW",           priority:"MUST",   reason:"SW heaviest zone — ideal for Master Bed" },
  { from:"Kitchen",    relation:"cluster",   to:"Utility",      priority:"SHOULD", reason:"Service cluster for plumbing efficiency" },
  { from:"Bathroom",   relation:"cluster",   to:"Toilet",       priority:"SHOULD", reason:"Wet rooms cluster in NW for plumbing" },
  { from:"Study",      relation:"adjacent",  to:"Living",       priority:"SHOULD", reason:"Study accessible from main living area" },
  { from:"Balcony",    relation:"connected", to:"Living",       priority:"SHOULD", reason:"Balcony extends living space outward" },
  { from:"Staircase",  relation:"adjacent",  to:"Corridor",     priority:"MUST",   reason:"Staircase always connects to main corridor" },
];

export function formatSpatialRulesContext() {
  const must   = MANDATORY_SPATIAL_RULES.filter(r => r.priority === "MUST");
  const should = MANDATORY_SPATIAL_RULES.filter(r => r.priority === "SHOULD");
  const mustStr   = must.map(r => `  • ${r.from} MUST be ${r.relation}${r.to ? " to " + r.to : ""}: ${r.reason}`).join("\n");
  const shouldStr = should.map(r => `  • ${r.from} SHOULD be ${r.relation}${r.to ? " to " + r.to : ""}: ${r.reason}`).join("\n");
  return `MANDATORY SPATIAL RELATIONSHIPS:\n${mustStr}\n\nRECOMMENDED SPATIAL RELATIONSHIPS:\n${shouldStr}`;
}

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

  const spatialRulesCtx = typeof formatSpatialRulesContext === "function" ? formatSpatialRulesContext() : "";
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

SPATIAL RELATIONSHIP RULES (from ChatHouseDiffusion schema):
${spatialRulesCtx}

HIGH-SCORING REFERENCE EXAMPLES:
${examples}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Apply the zone map, door/window rules, and spatial relationships STRICTLY. The reference examples show what a 90+ scoring plan looks like for ${facing}-facing ${bhk}BHK.
${facing === "South" ? "\n⚠️ SOUTH-FACING: Entrance ONLY in SE portion of South wall. Keep South wall heavy. No large South windows." : facing === "West" ? "\n⚠️ WEST-FACING: Entrance in NW half of West wall ONLY. Keep North/East sides lighter." : ""}
`;
}
