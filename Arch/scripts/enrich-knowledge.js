// ─── Knowledge Base Enrichment: Vocabulary + Spatial Rules ───────────────────
// Appends extended room vocabulary and ChatHouseDiffusion-inspired spatial rules
// to lib/rag/knowledgeBase.js

const fs = require('fs');
const path = 'lib/rag/knowledgeBase.js';
let f = fs.readFileSync(path, 'utf8');

// ── 1. Add vocabulary + spatial rules export after formatRAGContext ────────────
const APPEND_MARKER = '\r\n// ─── Build a rich text document for a retrieval query';
const INSERT_BEFORE = `
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
  const mustStr   = must.map(r => \`  \u2022 \${r.from} MUST be \${r.relation}\${r.to ? " to " + r.to : ""}: \${r.reason}\`).join("\\n");
  const shouldStr = should.map(r => \`  \u2022 \${r.from} SHOULD be \${r.relation}\${r.to ? " to " + r.to : ""}: \${r.reason}\`).join("\\n");
  return \`MANDATORY SPATIAL RELATIONSHIPS:\\n\${mustStr}\\n\\nRECOMMENDED SPATIAL RELATIONSHIPS:\\n\${shouldStr}\`;
}

`;

if (f.includes('ROOM_TYPE_VOCABULARY')) {
  console.log('Already added. Skipping vocabulary insert.');
} else {
  const markerIdx = f.indexOf(APPEND_MARKER);
  if (markerIdx === -1) { console.error('Marker not found'); process.exit(1); }
  f = f.slice(0, markerIdx) + '\r\n' + INSERT_BEFORE.replace(/\n/g, '\r\n') + f.slice(markerIdx + 2);
  console.log('Vocabulary inserted at index:', markerIdx);
}

// ── 2. Enrich formatRAGContext to include spatial rules + South/West warnings ──
const OLD_RETURN = `  return \`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## RAG CONTEXT — VASTU-COMPLIANT REFERENCE LAYOUTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MANDATORY ZONE MAP for \${facing}-facing \${bhk}BHK:
\${zoneList}

DOOR RULES:
\${DOOR_RULES}

WINDOW RULES:
\${WINDOW_RULES}

\${STAIRCASE_RULES}

HIGH-SCORING REFERENCE EXAMPLES:
\${examples}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Apply the zone map and door/window rules STRICTLY. The reference examples show what a 90+ scoring plan looks like.
\`;`;

const NEW_RETURN = `  const spatialRules = formatSpatialRulesContext ? formatSpatialRulesContext() : "";
  const southWestWarn = facing === "South"
    ? "\\n\u26a0\ufe0f SOUTH-FACING SPECIAL: Keep South wall heavy. Entrance ONLY in SE portion of South wall — NEVER in SW. No large South-facing windows."
    : facing === "West"
    ? "\\n\u26a0\ufe0f WEST-FACING SPECIAL: Entrance in NW half of West wall ONLY — NEVER in SW half. Keep North and East sides lighter."
    : "";

  return \`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## RAG CONTEXT — VASTU-COMPLIANT REFERENCE LAYOUTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MANDATORY ZONE MAP for \${facing}-facing \${bhk}BHK:
\${zoneList}

DOOR RULES:
\${DOOR_RULES}

WINDOW RULES:
\${WINDOW_RULES}

\${STAIRCASE_RULES}

SPATIAL RELATIONSHIP RULES (ChatHouseDiffusion schema):
\${spatialRules}
\${southWestWarn}

HIGH-SCORING REFERENCE EXAMPLES:
\${examples}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Apply zone map, door/window rules, and spatial relationships STRICTLY.
The reference examples show what a 90+ scoring plan looks like for \${facing}-facing \${bhk}BHK.
\`;`;

if (f.includes(OLD_RETURN)) {
  f = f.replace(OLD_RETURN, NEW_RETURN);
  console.log('formatRAGContext enriched with spatial rules and South/West warnings.');
} else {
  console.log('WARNING: formatRAGContext return block not found — possibly already updated.');
}

fs.writeFileSync(path, f, 'utf8');
console.log('DONE. File size:', fs.statSync(path).size, 'bytes');
console.log('Total layoutIds:', (f.match(/layoutId:/g) || []).length);
console.log('Has ROOM_TYPE_VOCABULARY:', f.includes('ROOM_TYPE_VOCABULARY'));
console.log('Has formatSpatialRulesContext:', f.includes('formatSpatialRulesContext'));
