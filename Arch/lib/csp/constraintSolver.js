// ─── CSP Constraint Solver ────────────────────────────────────────────────────
// Inspired by: z-aqib/Floor-Plan-Generator-Using-AI (Python CSP Tree)
// Ports the Constraint Satisfaction Problem approach to JavaScript.
// Validates room zone domains, size bounds, and Brahmasthan rules.

export const ROOM_DOMAIN_CONSTRAINTS = {
  "Master Bed":  { allowed:["SW"],            forbidden:["NE","SE","NW","N","E"],  priority:"critical", reason:"Master Bed MUST be SW — heaviest, most stable zone" },
  "Kitchen":     { allowed:["SE","NW"],        forbidden:["NE","SW","N","C"],       priority:"critical", reason:"Kitchen in fire zone SE (ideal) or NW (acceptable)" },
  "Puja":        { allowed:["NE"],             forbidden:["SW","SE","S","NW","W"],  priority:"critical", reason:"Puja ONLY in NE (Ishanya) — first morning light" },
  "Bathroom":    { allowed:["NW","W"],         forbidden:["NE","C","SW"],           priority:"major",    reason:"Bathroom in NW/W — never NE (most inauspicious for water)" },
  "Toilet":      { allowed:["NW","W"],         forbidden:["NE","C","SW"],           priority:"major",    reason:"Toilet in NW/W zone only" },
  "Master Bath": { allowed:["S","SW","W"],     forbidden:["NE","N","E"],            priority:"major",    reason:"Attached bath on South or West wall of Master Bed" },
  "Utility":     { allowed:["NW","W","SW"],    forbidden:["NE","E"],                priority:"minor",    reason:"Utility/service areas in West/NW zone" },
  "Staircase":   { allowed:["SW","S","W"],     forbidden:["NE","C","N","E"],        priority:"critical", reason:"Staircase in SW/S/W — never center or NE" },
  "Living":      { allowed:["N","E","W","NE","NW"], forbidden:[],                  priority:"minor",    reason:"Living in North or East wing for light and prosperity" },
  "Dining":      { allowed:["S","E","SE","W"], forbidden:[],                        priority:"minor",    reason:"Dining in West or South zone preferred" },
  "Study":       { allowed:["N","NE","E","NW"],forbidden:["SW","S"],               priority:"minor",    reason:"Study in North or East for concentration" },
  "Bedroom 2":   { allowed:["W","N","E","NW"], forbidden:["NE","SE"],              priority:"minor",    reason:"Secondary bedrooms in West or North zones" },
  "Bedroom 3":   { allowed:["W","N","E","NW"], forbidden:["NE","SE"],              priority:"minor",    reason:"Secondary bedrooms in West or North zones" },
  "Bedroom 4":   { allowed:["W","N","E","NW"], forbidden:["NE","SE"],              priority:"minor",    reason:"Secondary bedrooms in West or North zones" },
  "Bedroom 5":   { allowed:["W","N","E","NW"], forbidden:["NE","SE"],              priority:"minor",    reason:"Secondary bedrooms in West or North zones" },
  "Family Room": { allowed:["C","N","W"],      forbidden:["NE"],                   priority:"minor",    reason:"Family room in center (Brahmasthan) for gathering" },
  "Corridor":    { allowed:["C","N","E","W","S"], forbidden:[],                    priority:"info",     reason:"Corridor in center keeps Brahmasthan open" },
  "Balcony":     { allowed:["N","E","NE","NW"],forbidden:["SW","SE","S"],          priority:"minor",    reason:"Balcony North/East for morning light" },
  "Store":       { allowed:["SW","W","NW","S"],forbidden:["NE"],                   priority:"minor",    reason:"Store room in SW/W — heavy items in heavy zone" },
  "Guest Room":  { allowed:["NW","W","N"],     forbidden:["SW","SE"],              priority:"minor",    reason:"Guest room in NW or West zone is ideal" },
  "Servant Quarter": { allowed:["SE","NW"],    forbidden:["NE","C","SW"],           priority:"major",    reason:"Servant room in SE or NW corners only" },
  "Library":     { allowed:["NE","N","E"],     forbidden:["SW","SE","S"],          priority:"minor",    reason:"Library/Study in NE/N/E for knowledge" },
  "Gym":         { allowed:["W","S","SW"],     forbidden:["NE","C"],               priority:"minor",    reason:"Gym/Physical activity in heavy/hot zones (W, S, SW)" },
  "Home Office": { allowed:["N","E","NE"],     forbidden:["SW","S"],               priority:"minor",    reason:"Home office in North or East for prosperity and light" },
};

export const ROOM_SIZE_CONSTRAINTS = {
  "Master Bed":  { minSqft:120, minFtW:10, minFtH:10 },
  "Bedroom 2":   { minSqft: 90, minFtW: 9, minFtH: 9 },
  "Bedroom 3":   { minSqft: 90, minFtW: 9, minFtH: 9 },
  "Bedroom 4":   { minSqft: 80, minFtW: 8, minFtH: 8 },
  "Bedroom 5":   { minSqft: 80, minFtW: 8, minFtH: 8 },
  "Kitchen":     { minSqft: 60, minFtW: 7, minFtH: 7 },
  "Living":      { minSqft:100, minFtW:10, minFtH:10 },
  "Dining":      { minSqft: 60, minFtW: 7, minFtH: 7 },
  "Bathroom":    { minSqft: 25, minFtW: 4, minFtH: 5 },
  "Toilet":      { minSqft: 15, minFtW: 3, minFtH: 4 },
  "Master Bath": { minSqft: 30, minFtW: 5, minFtH: 5 },
  "Utility":     { minSqft: 20, minFtW: 4, minFtH: 4 },
  "Puja":        { minSqft: 20, minFtW: 4, minFtH: 4 },
  "Staircase":   { minSqft: 40, minFtW: 4, minFtH: 8 },
  "Corridor":    { minSqft: 30, minFtW: 3, minFtH: 3 },
  "Guest Room":  { minSqft: 80, minFtW: 8, minFtH: 10 },
  "Servant Quarter": { minSqft: 60, minFtW: 6, minFtH: 8 },
  "Library":     { minSqft: 60, minFtW: 7, minFtH: 8 },
  "Gym":         { minSqft: 80, minFtW: 8, minFtH: 10 },
  "Home Office": { minSqft: 70, minFtW: 7, minFtH: 9 },
};

const HEAVY_ROOMS = ["Master Bed","Kitchen","Staircase","Bathroom","Toilet","Store", "Servant Quarter", "Library", "Gym"];

function getWeight(severity) {
  return { critical:20, major:10, minor:5, info:1 }[severity] || 5;
}

export function runCSPConstraints(rooms) {
  const violations = [], compliant = [];
  for (const room of rooms) {
    const c = ROOM_DOMAIN_CONSTRAINTS[room.name];
    if (!c) continue;
    const zone = room.vastu;
    const inForbidden = c.forbidden.includes(zone);
    const inAllowed   = c.allowed.length === 0 || c.allowed.includes(zone);
    if (inForbidden) {
      violations.push({ type:"zone_forbidden", room:room.name, zone, severity:c.priority,
        rule:`${room.name} in ${zone} (FORBIDDEN)`,
        fix:`Move ${room.name} to: ${c.allowed.join(" or ")}`,
        reason:c.reason, source:"CSP" });
    } else if (!inAllowed) {
      violations.push({ type:"zone_not_ideal", room:room.name, zone, severity:"minor",
        rule:`${room.name} in ${zone} (sub-optimal)`,
        fix:`Prefer ${c.allowed.join(" or ")} for ${room.name}`,
        reason:c.reason, source:"CSP" });
    } else {
      compliant.push(`${room.name}→${zone} ✓`);
    }
    const sc = ROOM_SIZE_CONSTRAINTS[room.name];
    if (sc && room.ftW && room.ftH) {
      const area = room.ftW * room.ftH;
      if (area < sc.minSqft) {
        violations.push({ type:"size_too_small", room:room.name, zone, severity:"minor",
          rule:`${room.name} is ${area}sqft (min ${sc.minSqft}sqft per NBC)`,
          fix:`Increase ${room.name} to at least ${sc.minFtW}×${sc.minFtH}ft`,
          reason:"NBC minimum habitable room size", source:"CSP-NBC" });
      }
    }
  }
  const penalty  = violations.reduce((a,v) => a + getWeight(v.severity), 0);
  return { violations, compliant, cspScore: Math.max(0, 100 - penalty) };
}

export function checkBrahmasthan(rooms) {
  return rooms
    .filter(r => r.vastu === "C" && HEAVY_ROOMS.includes(r.name))
    .map(r => ({
      type:"brahmasthan_violation", room:r.name, zone:"C", severity:"critical",
      rule:`${r.name} placed in Brahmasthan (center)`,
      fix:`Move ${r.name} out of center. Center should be Corridor or Family Room only.`,
      reason:"Brahmasthan must stay open — heavy rooms block cosmic energy",
      source:"CSP-Vastu",
    }));
}

export function checkEntranceOrientation(facing, entrance) {
  if (!facing || !entrance) return [];
  const expected = { North:"top", South:"bottom", East:"right", West:"left" }[facing];
  if (entrance.wall !== expected) {
    return [{
      type:"entrance_wrong_wall", severity:"critical",
      rule:`Entrance on ${entrance.wall} wall for ${facing}-facing plot`,
      fix:`Place entrance on the ${expected} wall (${facing} side)`,
      reason:`${facing}-facing plot entrance MUST face ${facing} per Vastu`,
      source:"CSP",
    }];
  }
  return [];
}

export function validateLayoutWithCSP(layout, params = {}) {
  const rooms = layout?.rooms || [];
  const d = runCSPConstraints(rooms);
  const bv = checkBrahmasthan(rooms);
  const ev = layout?.entrance ? checkEntranceOrientation(params.facing, layout.entrance) : [];
  const all = [...d.violations, ...bv, ...ev];
  const seen = new Set();
  const unique = all.filter(v => {
    const key = `${v.room}-${v.type}-${v.zone}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
  const penalty = unique.reduce((a,v) => a + getWeight(v.severity), 0);
  return {
    cspScore:   Math.max(0, 100 - penalty),
    violations: unique,
    compliant:  d.compliant,
    summary: {
      totalRooms:    rooms.length,
      criticalCount: unique.filter(v => v.severity==="critical").length,
      majorCount:    unique.filter(v => v.severity==="major").length,
      minorCount:    unique.filter(v => v.severity==="minor").length,
      compliantCount:d.compliant.length,
    },
  };
}

export function formatCSPRefinementHint(cspResult) {
  if (!cspResult?.violations?.length)
    return `CSP VALIDATION: All constraints satisfied (score: ${cspResult?.cspScore||100}/100).`;
  const critical = cspResult.violations.filter(v=>v.severity==="critical")
    .map(v=>`  ✗ [CRITICAL] ${v.rule}\n    FIX: ${v.fix}`).join("\n");
  const major = cspResult.violations.filter(v=>v.severity==="major")
    .map(v=>`  ✗ [MAJOR] ${v.rule}\n    FIX: ${v.fix}`).join("\n");
  const minor = cspResult.violations.filter(v=>v.severity==="minor")
    .map(v=>`  ! [MINOR] ${v.rule} → ${v.fix}`).join("\n");
  const parts = ["━━━ CSP CONSTRAINT VIOLATIONS ━━━"];
  if (critical) parts.push("CRITICAL:\n" + critical);
  if (major)    parts.push("MAJOR:\n" + major);
  if (minor)    parts.push("MINOR:\n" + minor);
  parts.push(`CSP Score: ${cspResult.cspScore}/100 (target ≥75)`);
  return parts.join("\n\n");
}
