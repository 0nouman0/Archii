// ─── Room Adjacency Graph ─────────────────────────────────────────────────────
// Inspired by: mo7amed7assan1911/Floor_Plan_Generation_using_GNNs
// Reference:   https://github.com/mo7amed7assan1911/Floor_Plan_Generation_using_GNNs
//
// The GNN repo models rooms as graph nodes and room relationships as weighted
// edges — MUST_ADJACENT, SHOULD_ADJACENT, MUST_NOT_ADJACENT.
// This module ports that graph structure to JavaScript, using zone-proximity
// to infer adjacency (instead of GNN inference, which needs GPU).
//
// The graph is used to:
//   1. Score layout quality based on room adjacency compliance
//   2. Surface adjacency violations as structured hints for the RAG loop
//   3. Inform the AI prompt about which rooms should share walls

// ─── Adjacency edge types ─────────────────────────────────────────────────────
export const EDGE = {
  MUST:     "MUST_ADJACENT",      // Critical — share a wall or be directly connected
  SHOULD:   "SHOULD_ADJACENT",    // Preferred — nearby or in the same zone cluster
  AVOID:    "MUST_NOT_ADJACENT",  // Hard constraint — must not share a wall
};

// ─── Room Adjacency Graph (node → edges) ─────────────────────────────────────
// Based on residential floor plan graph structure from GNN paper + Vastu rules
// Each entry: [roomB, edgeType, weight(1-10), reason]
export const ROOM_ADJACENCY_GRAPH = {
  "Kitchen": [
    ["Dining",     EDGE.MUST,   10, "Kitchen must be directly accessible to Dining"],
    ["Utility",    EDGE.SHOULD,  7, "Utility room near Kitchen for service access"],
    ["Corridor",   EDGE.SHOULD,  6, "Kitchen needs corridor access"],
    ["Master Bed", EDGE.AVOID,   9, "Kitchen and Master Bed should never share a wall (odor/noise)"],
    ["Puja",       EDGE.AVOID,  10, "Kitchen (fire) must never be adjacent to Puja (sacred)"],
    ["Toilet",     EDGE.AVOID,  10, "Kitchen must not be adjacent or face Toilet door"],
  ],
  "Dining": [
    ["Kitchen",    EDGE.MUST,   10, "Dining must connect directly to Kitchen"],
    ["Living",     EDGE.SHOULD,  8, "Dining and Living are the social cluster"],
    ["Corridor",   EDGE.SHOULD,  5, "Dining accessible via corridor"],
  ],
  "Living": [
    ["Dining",     EDGE.SHOULD,  8, "Living and Dining form the social zone"],
    ["Corridor",   EDGE.MUST,    9, "Living room must open to main corridor/entrance"],
    ["Puja",       EDGE.SHOULD,  6, "Puja room near Living for family prayer access"],
    ["Bathroom",   EDGE.AVOID,   7, "Living room should not share wall with Bathroom"],
    ["Toilet",     EDGE.AVOID,   8, "Toilet must not be directly visible from Living"],
  ],
  "Master Bed": [
    ["Master Bath",EDGE.MUST,   10, "Master Bedroom MUST have attached Master Bath"],
    ["Corridor",   EDGE.MUST,    9, "Master Bed must access corridor"],
    ["Kitchen",    EDGE.AVOID,   9, "Master Bed and Kitchen must not share a wall"],
    ["Toilet",     EDGE.AVOID,  10, "Toilet never adjacent to or entering from Master Bed"],
    ["Puja",       EDGE.SHOULD,  4, "Puja near Master Bed is auspicious (optional)"],
  ],
  "Puja": [
    ["Living",     EDGE.SHOULD,  6, "Puja accessible from Living room"],
    ["Corridor",   EDGE.SHOULD,  7, "Puja accessible from corridor"],
    ["Kitchen",    EDGE.AVOID,  10, "Puja (sacred) must never touch Kitchen (fire)"],
    ["Bathroom",   EDGE.AVOID,  10, "Puja must never be adjacent to any wet room"],
    ["Toilet",     EDGE.AVOID,  10, "Puja must never be adjacent to Toilet"],
    ["Master Bed", EDGE.SHOULD,  4, "Puja near Master Bed is auspicious"],
  ],
  "Bathroom": [
    ["Toilet",     EDGE.SHOULD,  7, "Bathroom and Toilet can be grouped in NW cluster"],
    ["Utility",    EDGE.SHOULD,  6, "Utility near Bathroom for plumbing cluster"],
    ["Corridor",   EDGE.MUST,    8, "Bathroom must access corridor"],
    ["Kitchen",    EDGE.AVOID,  10, "Bathroom must not be adjacent to Kitchen"],
    ["Puja",       EDGE.AVOID,  10, "Bathroom must not be adjacent to Puja"],
    ["Living",     EDGE.AVOID,   7, "Bathroom should not share wall with Living room"],
  ],
  "Toilet": [
    ["Bathroom",   EDGE.SHOULD,  7, "Toilet grouped with Bathroom in NW cluster"],
    ["Utility",    EDGE.SHOULD,  5, "Utility near Toilet for plumbing"],
    ["Kitchen",    EDGE.AVOID,  10, "Toilet must not be adjacent to or opposite Kitchen"],
    ["Puja",       EDGE.AVOID,  10, "Toilet must never be adjacent to Puja"],
    ["Dining",     EDGE.AVOID,   9, "Toilet never adjacent to Dining room"],
  ],
  "Staircase": [
    ["Corridor",   EDGE.MUST,    9, "Staircase must connect to main corridor"],
    ["Living",     EDGE.SHOULD,  5, "Staircase accessible from Living/common area"],
    ["Puja",       EDGE.AVOID,   7, "Staircase should not be directly beside Puja"],
    ["Master Bed", EDGE.AVOID,   6, "Staircase noise should not disturb Master Bed"],
  ],
  "Utility": [
    ["Kitchen",    EDGE.SHOULD,  7, "Utility near Kitchen for service access"],
    ["Bathroom",   EDGE.SHOULD,  6, "Utility near Bathroom for plumbing cluster"],
    ["Corridor",   EDGE.SHOULD,  5, "Utility accessible from corridor"],
  ],
  "Study": [
    ["Bedroom 2",  EDGE.SHOULD,  5, "Study near secondary bedroom cluster"],
    ["Living",     EDGE.SHOULD,  4, "Study accessible from Living"],
    ["Kitchen",    EDGE.AVOID,   5, "Study should not be adjacent to noisy Kitchen"],
  ],
  "Family Room": [
    ["Living",     EDGE.SHOULD,  8, "Family Room and Living form the social cluster"],
    ["Corridor",   EDGE.SHOULD,  7, "Family Room central and accessible"],
    ["Dining",     EDGE.SHOULD,  6, "Family Room near Dining for entertainment"],
  ],
};

// ─── Zone-proximity matrix ────────────────────────────────────────────────────
// Which zones are adjacent to each other (share a wall or corner)
// Used to infer room adjacency from zone assignments without pixel math
const ZONE_ADJACENT = {
  NW: ["N","W","C"],
  N:  ["NW","NE","C"],
  NE: ["N","E","C"],
  W:  ["NW","SW","C"],
  C:  ["NW","N","NE","W","E","SW","S","SE"],  // Center touches all
  E:  ["NE","SE","C"],
  SW: ["W","S","C"],
  S:  ["SW","SE","C"],
  SE: ["S","E","C"],
};

function zonesAreAdjacent(zoneA, zoneB) {
  if (!zoneA || !zoneB) return false;
  if (zoneA === zoneB) return true; // same zone = touching
  return ZONE_ADJACENT[zoneA]?.includes(zoneB) || false;
}

// ─── Adjacency scoring ────────────────────────────────────────────────────────
/**
 * Scores a layout based on room adjacency graph compliance.
 * Adapted from GNN paper's graph-based evaluation metric.
 *
 * @param {Array} rooms - computed rooms with .name and .vastu properties
 * @returns {{ adjacencyScore, violations, satisfied }}
 */
export function scoreRoomAdjacency(rooms) {
  const roomMap = {};
  for (const r of rooms) roomMap[r.name] = r;

  const violations = [];
  const satisfied  = [];
  let totalPenalty = 0;
  let maxPossible  = 0;

  for (const [roomA, edges] of Object.entries(ROOM_ADJACENCY_GRAPH)) {
    const rA = roomMap[roomA];
    if (!rA) continue;

    for (const [roomB, edgeType, weight, reason] of edges) {
      const rB = roomMap[roomB];
      if (!rB) continue;

      // Avoid double-counting symmetric edges
      if (roomA > roomB) continue;

      maxPossible += weight;
      const adjacent = zonesAreAdjacent(rA.vastu, rB.vastu);

      if (edgeType === EDGE.MUST && !adjacent) {
        totalPenalty += weight;
        violations.push({
          type:     "adjacency_must",
          roomA,
          roomB,
          zoneA:    rA.vastu,
          zoneB:    rB.vastu,
          severity: weight >= 9 ? "major" : "minor",
          rule:     `${roomA} (${rA.vastu}) and ${roomB} (${rB.vastu}) must be adjacent`,
          fix:      `Move ${roomA} or ${roomB} so their zones touch (currently ${rA.vastu} ↔ ${rB.vastu})`,
          reason,
          source:   "GNN-Graph",
        });
      } else if (edgeType === EDGE.AVOID && adjacent) {
        totalPenalty += weight;
        violations.push({
          type:     "adjacency_avoid",
          roomA,
          roomB,
          zoneA:    rA.vastu,
          zoneB:    rB.vastu,
          severity: weight >= 9 ? "critical" : "major",
          rule:     `${roomA} (${rA.vastu}) and ${roomB} (${rB.vastu}) must NOT be adjacent`,
          fix:      `Separate ${roomA} and ${roomB} — insert a buffer zone (Corridor) between them`,
          reason,
          source:   "GNN-Graph",
        });
      } else if (edgeType === EDGE.SHOULD && !adjacent) {
        // Should-adjacent violations are informational only
        satisfied.push(`${roomA}↔${roomB}: should-adjacent (currently ${rA.vastu}↔${rB.vastu}) — acceptable`);
      } else {
        satisfied.push(`${roomA}↔${roomB} (${edgeType}) ✓`);
      }
    }
  }

  const adjacencyScore = maxPossible > 0
    ? Math.max(0, Math.round(100 * (1 - totalPenalty / maxPossible)))
    : 100;

  return { adjacencyScore, violations, satisfied };
}

// ─── Build adjacency RAG context string ──────────────────────────────────────
/**
 * Formats adjacency violations as a structured prompt hint.
 * Used by the RAG refinement loop to guide re-generation.
 */
export function formatAdjacencyHint(adjResult) {
  if (!adjResult?.violations?.length) {
    return `ADJACENCY GRAPH: All room adjacency requirements satisfied (score: ${adjResult?.adjacencyScore||100}/100).`;
  }

  const critical = adjResult.violations.filter(v => v.severity === "critical")
    .map(v => `  ✗ [CRITICAL] ${v.rule}\n    FIX: ${v.fix}`).join("\n");
  const major = adjResult.violations.filter(v => v.severity === "major")
    .map(v => `  ✗ [MAJOR] ${v.rule}\n    FIX: ${v.fix}`).join("\n");
  const minor = adjResult.violations.filter(v => v.severity === "minor")
    .map(v => `  ! [INFO] ${v.rule} → ${v.fix}`).join("\n");

  const parts = ["━━━ ROOM ADJACENCY GRAPH VIOLATIONS (GNN-inspired) ━━━"];
  if (critical) parts.push("CRITICAL (forbidden adjacency):\n" + critical);
  if (major)    parts.push("MAJOR (missing required adjacency):\n" + major);
  if (minor)    parts.push("MINOR:\n" + minor);
  parts.push(`Adjacency Score: ${adjResult.adjacencyScore}/100`);
  return parts.join("\n\n");
}

// ─── Composite layout quality score ──────────────────────────────────────────
/**
 * Combines CSP score + adjacency score into a single layout quality metric.
 * Weights: CSP zone compliance 60%, Adjacency graph 40%
 */
export function computeCompositeScore(cspScore, adjacencyScore) {
  return Math.round(0.6 * (cspScore || 0) + 0.4 * (adjacencyScore || 0));
}
