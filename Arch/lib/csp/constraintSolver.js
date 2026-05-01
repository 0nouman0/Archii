// ─── CSP Constraint Engine for Floor Plans ──────────────────────────────────
// Inspired by research in: z-aqib/Floor-Plan-Generator-Using-AI
// Ported to symbolic JS logic for Archii.

export const ROOM_TYPE_CONSTRAINTS = {
  "Master Bed": {
    preferredZones: ["South West", "South", "West"],
    minArea: 120, // sqft (National Building Code approx)
    mandatory: true
  },
  "Kitchen": {
    preferredZones: ["South East", "North West"],
    minArea: 80,
    mandatory: true
  },
  "Puja": {
    preferredZones: ["North East", "North", "East"],
    minArea: 20,
    mandatory: false
  },
  "Living": {
    preferredZones: ["North", "East", "North East"],
    minArea: 150,
    mandatory: true
  },
  "Dining": {
    preferredZones: ["West", "East", "South East"],
    minArea: 100,
    mandatory: false
  },
  "Bathroom": {
    preferredZones: ["West", "North West", "South"],
    minArea: 35,
    mandatory: true
  },
  "Toilet": {
    preferredZones: ["West", "North West", "South"],
    minArea: 15,
    mandatory: false
  },
  "Staircase": {
    preferredZones: ["South", "West", "South West"],
    minArea: 60,
    mandatory: false
  },
  // Research port: Extended Room Types (from DeepFloorplan dataset)
  "Home Office": { preferredZones: ["North", "East"], minArea: 80 },
  "Guest Room":  { preferredZones: ["North West", "West"], minArea: 100 },
  "Store":       { preferredZones: ["South West", "South", "West"], minArea: 30 },
  "Servant Quarter": { preferredZones: ["South East", "North West"], minArea: 60 },
};

/**
 * Validates a layout using Constraint Satisfaction Problem (CSP) principles.
 * Checks:
 *  1. Domain constraints (Vastu zones)
 *  2. Unary constraints (Minimum area requirements)
 *  3. Global constraints (Brahmasthan structural integrity)
 */
export function validateLayoutWithCSP(layout, params) {
  const rooms = layout.rooms || [];
  const violations = [];
  let cspScore = 100;

  const penaltyMap = {
    "zone": 15, // Penalty for being in a forbidden zone
    "area": 10, // Penalty for being undersized
    "brahmasthan": 20 // Penalty for cluttering the center
  };

  rooms.forEach(room => {
    const constraint = ROOM_TYPE_CONSTRAINTS[room.name] || 
                      Object.entries(ROOM_TYPE_CONSTRAINTS).find(([k]) => room.name.includes(k))?.[1];

    if (constraint) {
      // 1. Zone Domain Constraint
      if (constraint.preferredZones && room.zone) {
        if (!constraint.preferredZones.includes(room.zone)) {
          violations.push({
            room: room.name,
            type: "CSP_ZONE_VIOLATION",
            severity: "major",
            message: `${room.name} is in ${room.zone} zone. Preferred: ${constraint.preferredZones.join(", ")}.`,
            fix: `Relocate ${room.name} to the ${constraint.preferredZones[0]} portion of the plot.`
          });
          cspScore -= penaltyMap.zone;
        }
      }

      // 2. Unary Area Constraint
      const area = room.ftW * room.ftH;
      if (constraint.minArea && area < constraint.minArea) {
        violations.push({
          room: room.name,
          type: "CSP_AREA_VIOLATION",
          severity: "minor",
          message: `${room.name} area (${Math.round(area)} sqft) is below NBC minimum (${constraint.minArea} sqft).`,
          fix: `Expand ${room.name} to at least ${constraint.minArea} sqft.`
        });
        cspScore -= penaltyMap.area;
      }
    }

    // 3. Brahmasthan Global Constraint
    // The center 20% of the plot should be relatively clear
    const centerX = params.plotW / 2;
    const centerY = params.plotH / 2;
    const bufferW = params.plotW * 0.1;
    const bufferH = params.plotH * 0.1;

    if (
      room.x < centerX + bufferW && room.x + room.w > centerX - bufferW &&
      room.y < centerY + bufferH && room.y + room.h > centerY - bufferH
    ) {
      // Small rooms (Puja/Toilet) in center are major violations
      if (room.name === "Toilet" || room.name === "Bathroom") {
        violations.push({
          room: room.name,
          type: "CSP_BRAHMASTHAN_VIOLATION",
          severity: "critical",
          message: `Sanitary zone (${room.name}) detected in Brahmasthan (center).`,
          fix: `Move ${room.name} away from the center of the house.`
        });
        cspScore -= penaltyMap.brahmasthan;
      }
    }
  });

  return {
    cspScore: Math.max(0, cspScore),
    violations,
    compliant: violations.length === 0
  };
}

export function formatCSPRefinementHint(result) {
  if (result.compliant) return "";
  return `TECHNICAL DESIGN AUDIT (CSP Engine):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The following structural/zoning constraints were violated:
${result.violations.map(v => `• ${v.message} -> FIX: ${v.fix}`).join("\n")}
`;
}
