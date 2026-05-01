// ─── Room Adjacency Graph Validator ──────────────────────────────────────────
// Inspired by research in: mo7amed7assan1911/Floor_Plan_Generation_using_GNNs
// Ported to a proximity-based weighted graph for Archii.

/**
 * Adjacency Rules Matrix:
 * 1: Must be adjacent (sharing a wall or direct door)
 * -1: Must NOT be adjacent (hygiene or sound isolation)
 * 0: Neutral / Optional
 */
export const ROOM_ADJACENCY_GRAPH = {
  "Kitchen": {
    "Dining": 1,
    "Toilet": -1,
    "Bathroom": -1,
    "Puja": -1,
  },
  "Master Bed": {
    "Bathroom": 1, // Ensuite
    "Living": 0,
  },
  "Dining": {
    "Living": 1,
    "Kitchen": 1,
  },
  "Puja": {
    "Toilet": -1,
    "Bathroom": -1,
    "Kitchen": -1,
  },
  "Toilet": {
    "Kitchen": -1,
    "Dining": -1,
    "Puja": -1,
  }
};

/**
 * Checks if two rooms are adjacent (sharing a boundary or within 2ft proximity).
 */
function checkProximity(r1, r2) {
  // Simple AABB overlap check with a small epsilon
  const eps = 2; // ft
  const xOverlap = Math.max(0, Math.min(r1.x + r1.ftW, r2.x + r2.ftW) - Math.max(r1.x, r2.x));
  const yOverlap = Math.max(0, Math.min(r1.y + r1.ftH, r2.y + r2.ftH) - Math.max(r1.y, r2.y));
  
  return (xOverlap >= -eps && yOverlap >= 0) || (yOverlap >= -eps && xOverlap >= 0);
}

/**
 * Scores a layout's adjacency compliance using a graph-based approach.
 */
export function scoreRoomAdjacency(rooms = []) {
  const violations = [];
  let adjacencyScore = 100;
  const penalty = 10;

  // Build Adjacency Map
  const adjMap = {};
  rooms.forEach(r => { adjMap[r.name] = rooms.filter(other => other.name !== r.name && checkProximity(r, other)); });

  Object.entries(ROOM_ADJACENCY_GRAPH).forEach(([roomName, rules]) => {
    const actualRoom = rooms.find(r => r.name.includes(roomName));
    if (!actualRoom) return;

    const neighbors = adjMap[actualRoom.name] || [];

    Object.entries(rules).forEach(([targetName, weight]) => {
      const targetRoom = rooms.find(r => r.name.includes(targetName));
      if (!targetRoom) return;

      const isAdjacent = neighbors.some(n => n.name.includes(targetName));

      if (weight === 1 && !isAdjacent) {
        violations.push({
          type: "ADJ_REQUIRED_MISSING",
          severity: "major",
          message: `${roomName} and ${targetName} should be adjacent for better flow.`,
          fix: `Move ${roomName} and ${targetName} next to each other.`
        });
        adjacencyScore -= penalty;
      }

      if (weight === -1 && isAdjacent) {
        violations.push({
          type: "ADJ_FORBIDDEN_PRESENT",
          severity: "critical",
          message: `${roomName} should NOT be adjacent to ${targetName} (hygiene/ritual rule).`,
          fix: `Separate ${roomName} from ${targetName} using a corridor or another room.`
        });
        adjacencyScore -= penalty * 1.5;
      }
    });
  });

  return {
    adjacencyScore: Math.max(0, adjacencyScore),
    violations,
    compliant: violations.length === 0
  };
}

export function formatAdjacencyHint(result) {
  if (result.compliant) return "";
  return `CIRCULATION & FLOW AUDIT (GNN Graph):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The following room connectivity issues were detected:
${result.violations.map(v => `• ${v.message} -> FIX: ${v.fix}`).join("\n")}
`;
}

export function computeCompositeScore(csp, adj) {
  return Math.round((csp * 0.6) + (adj * 0.4));
}
