// ─── Vastu Rule Engine ────────────────────────────────────────────────────────
// Tier 1 = hard constraints, Tier 2 = important, Tier 3 = optimisation

export const VASTU_RULES_LIST = [
  "Entrance in East/North (avoid South/Southwest)",
  "Puja/Prayer room in Northeast corner",
  "Kitchen in Southeast — cook faces East",
  "Master Bedroom in Southwest",
  "Children's rooms in West or Northwest",
  "Toilets in Northwest or West (never Northeast/Center)",
  "Brahmasthan (center) kept open/unobstructed",
  "Living room in North or East wing",
  "Study/Work room facing East or North",
  "Staircase in South, Southwest, or West",
  "Store room in Northwest or West",
  "Overhead water tank in Southwest or Northwest",
  "Underground water/sump in Northeast",
  "Garage/Car porch in Southeast or Northwest",
];

// Zone preference map: room → ideal vastu zones
export const VASTU_PREFS = {
  "Living":       ["N","E","NE"],
  "Dining":       ["W","S","E"],
  "Kitchen":      ["SE","NW"],
  "Master Bed":   ["SW","S","W"],
  "Bedroom 2":    ["W","NW","E"],
  "Bedroom 3":    ["E","NW","W"],
  "Bedroom 4":    ["W","NW","E"],
  "Bedroom 5":    ["NW","W","E"],
  "Puja":         ["NE","E","N"],
  "Bathroom":     ["NW","W","S"],
  "Master Bath":  ["W","NW","S"],
  "Toilet":       ["NW","W","S"],
  "Utility":      ["NW","W","S"],
  "Store":        ["NW","W","SW"],
  "Corridor":     ["C","N","E"],
  "Study":        ["E","N","NE"],
  "Family Room":  ["E","N","NE"],
  "Staircase":    ["SW","S","W"],
  "Balcony":      ["NE","E","N"],
};

// Absolute forbidden zones per room
export const VASTU_FORBIDDEN = {
  "Kitchen":    ["NE","SW","N"],
  "Bathroom":   ["NE","C","SW"],
  "Toilet":     ["NE","C","SW"],
  "Puja":       ["SW","SE","S","NW"],
  "Master Bed": ["NE","SE"],
};

export function scoreVastuLayout(rooms) {
  let total = 0;
  let max = 0;
  const violations = [];
  const compliant = [];

  for (const room of rooms) {
    const zone = room.vastu;
    const prefs = VASTU_PREFS[room.name];
    const forbidden = VASTU_FORBIDDEN[room.name];
    if (!prefs) continue;
    max += 10;

    if (forbidden && forbidden.includes(zone)) {
      violations.push({
        rule: `${room.name} in ${zone} zone`,
        severity: "critical",
        fix: `Move ${room.name} to ${prefs[0]} zone`,
      });
    } else if (prefs[0] === zone) {
      total += 10;
      compliant.push(`${room.name} in optimal ${zone} zone`);
    } else if (prefs.includes(zone)) {
      total += 7;
      compliant.push(`${room.name} in acceptable ${zone} zone`);
    } else {
      total += 3;
      violations.push({
        rule: `${room.name} in suboptimal ${zone} zone`,
        severity: "minor",
        fix: `Ideally move to ${prefs[0]} zone`,
      });
    }
  }

  const score = max > 0 ? Math.round((total / max) * 100) : 80;
  const summary = score >= 85
    ? "Excellent Vastu compliance — auspicious layout"
    : score >= 70
    ? "Good Vastu compliance with minor optimisations possible"
    : score >= 55
    ? "Moderate Vastu compliance — some key rules violated"
    : "Poor Vastu compliance — significant corrections needed";

  return { score, violations, compliant, summary };
}

export function getVastuRemedies(violations) {
  const remedyMap = {
    "Kitchen in NE": "Place a copper pyramid in NE corner of kitchen. Ensure cook faces East.",
    "Toilet in NE": "Keep door closed always, place sea-salt bowl inside, use exhaust fan.",
    "Toilet in C": "This is a serious Brahmasthan defect. Place Vastu pyramids in all four corners.",
    "Master Bed in NE": "Use light colours, keep minimal furniture, keep windows open for maximum light.",
    "Master Bed in SE": "Sleep with head towards South, use cool/calming colours (blue, green).",
    "Puja in SW": "Relocate if possible. Until then, face East while praying, keep area very clean.",
  };
  return violations
    .filter(v => v.severity !== "minor")
    .map(v => {
      const key = Object.keys(remedyMap).find(k => v.rule.includes(k.split(" in ")[0]) && v.rule.includes(k.split(" in ")[1]));
      return key ? { violation: v.rule, remedy: remedyMap[key] } : null;
    })
    .filter(Boolean);
}
