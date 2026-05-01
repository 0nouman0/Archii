"use client";
import { useState } from "react";

function planLabel(p) {
  const date = new Date(p.created_at).toLocaleDateString("en-IN");
  return `${p.plot_width}×${p.plot_height}ft · ${p.bhk}BHK · ${date}`;
}

function fmt(n) {
  if (n === null || n === undefined || n === "") return "—";
  return Number(n).toLocaleString("en-IN");
}

function betterColor(a, b, higherBetter) {
  if (a === null || a === undefined || b === null || b === undefined) return ["#888", "#888"];
  const na = Number(a), nb = Number(b);
  if (isNaN(na) || isNaN(nb) || na === nb) return ["#D8D8EC", "#D8D8EC"];
  if (higherBetter) {
    return na > nb ? ["#44DD88", "#FF5544"] : ["#FF5544", "#44DD88"];
  } else {
    return na < nb ? ["#44DD88", "#FF5544"] : ["#FF5544", "#44DD88"];
  }
}

export default function ComparisonPanel({ savedPlans }) {
  const [idxA, setIdxA] = useState(0);
  const [idxB, setIdxB] = useState(1);

  if (!savedPlans || savedPlans.length < 2) {
    return (
      <div style={{
        padding: "32px 24px",
        background: "#0A0A14",
        border: "1px solid #1A1A28",
        borderRadius: 8,
        fontFamily: "monospace",
        color: "#888",
        fontSize: 12,
        lineHeight: 1.7,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 28, marginBottom: 14 }}>📊</div>
        <div style={{ color: "#D8D8EC", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
          No plans to compare yet
        </div>
        Save at least 2 plans first (generate plans and they auto-save to your account).
      </div>
    );
  }

  const planA = savedPlans[idxA];
  const planB = savedPlans[idxB];

  const areaA = (planA.plot_width || 0) * (planA.plot_height || 0);
  const areaB = (planB.plot_width || 0) * (planB.plot_height || 0);

  const scoreA = planA.vastu_score;
  const scoreB = planB.vastu_score;

  const costA = planA.total_cost;
  const costB = planB.total_cost;

  const roomsA = Array.isArray(planA.rooms) ? planA.rooms.length : "—";
  const roomsB = Array.isArray(planB.rooms) ? planB.rooms.length : "—";

  const violA = planA.vastu_report?.violations?.length ?? "—";
  const violB = planB.vastu_report?.violations?.length ?? "—";

  const compA = planA.vastu_report?.compliant?.length ?? "—";
  const compB = planB.vastu_report?.compliant?.length ?? "—";

  const timeA = planA.cost_report?.timeline ?? "—";
  const timeB = planB.cost_report?.timeline ?? "—";

  const selectStyle = {
    background: "#0A0A14",
    border: "1px solid #1A1A28",
    borderRadius: 4,
    color: "#D8D8EC",
    fontFamily: "monospace",
    fontSize: 10,
    padding: "5px 8px",
    cursor: "pointer",
    outline: "none",
    width: "100%",
  };

  const [aScoreC, bScoreC] = betterColor(scoreA, scoreB, true);
  const [aCostC, bCostC] = betterColor(costA, costB, false);
  const [aAreaC, bAreaC] = betterColor(areaA, areaB, true);

  const rows = [
    {
      label: "Plot Size",
      a: `${planA.plot_width}×${planA.plot_height} ft`,
      b: `${planB.plot_width}×${planB.plot_height} ft`,
      aColor: "#D8D8EC", bColor: "#D8D8EC",
    },
    {
      label: "BHK",
      a: planA.bhk ? `${planA.bhk} BHK` : "—",
      b: planB.bhk ? `${planB.bhk} BHK` : "—",
      aColor: "#D8D8EC", bColor: "#D8D8EC",
    },
    {
      label: "Total Area (sqft)",
      a: fmt(areaA),
      b: fmt(areaB),
      aColor: aAreaC, bColor: bAreaC,
    },
    {
      label: "Vastu Score",
      a: scoreA != null ? `${scoreA} / 100` : "—",
      b: scoreB != null ? `${scoreB} / 100` : "—",
      aColor: aScoreC, bColor: bScoreC,
    },
    {
      label: "Est. Cost",
      a: costA != null ? `₹${costA}L` : "—",
      b: costB != null ? `₹${costB}L` : "—",
      aColor: aCostC, bColor: bCostC,
    },
    {
      label: "City",
      a: planA.city || "—",
      b: planB.city || "—",
      aColor: "#888", bColor: "#888",
    },
    {
      label: "Facing",
      a: planA.facing || "—",
      b: planB.facing || "—",
      aColor: "#888", bColor: "#888",
    },
    {
      label: "Rooms Count",
      a: roomsA === "—" ? "—" : String(roomsA),
      b: roomsB === "—" ? "—" : String(roomsB),
      aColor: "#D8D8EC", bColor: "#D8D8EC",
    },
    {
      label: "Violations",
      a: violA === "—" ? "—" : String(violA),
      b: violB === "—" ? "—" : String(violB),
      aColor: violA !== "—" && violA > 0 ? "#FF5544" : "#44DD88",
      bColor: violB !== "—" && violB > 0 ? "#FF5544" : "#44DD88",
    },
    {
      label: "Compliant Rules",
      a: compA === "—" ? "—" : String(compA),
      b: compB === "—" ? "—" : String(compB),
      aColor: "#44DD88", bColor: "#44DD88",
    },
    {
      label: "Timeline",
      a: timeA,
      b: timeB,
      aColor: "#FFAA22", bColor: "#FFAA22",
    },
  ];

  // Winner logic
  let winner = "Tied";
  let winnerColor = "#888";
  let crown = "🤝";
  if (scoreA != null && scoreB != null) {
    const sa = Number(scoreA), sb = Number(scoreB);
    if (sa > sb) { winner = "Plan A wins"; winnerColor = "#44DD88"; crown = "👑"; }
    else if (sb > sa) { winner = "Plan B wins"; winnerColor = "#44DD88"; crown = "👑"; }
  }

  const thStyle = {
    padding: "8px 12px",
    fontFamily: "monospace",
    fontSize: 9,
    fontWeight: 700,
    color: "#444",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    textAlign: "left",
    borderBottom: "1px solid #1A1A28",
    background: "#080814",
    position: "sticky",
    top: 0,
  };

  return (
    <div style={{ fontFamily: "monospace" }}>
      {/* Dropdowns */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Plan A", idx: idxA, setIdx: setIdxA, accentColor: "#4488FF" },
          { label: "Plan B", idx: idxB, setIdx: setIdxB, accentColor: "#CC66FF" },
        ].map(({ label, idx, setIdx, accentColor }) => (
          <div key={label} style={{ flex: 1 }}>
            <div style={{
              fontSize: 9,
              color: accentColor,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 5,
            }}>
              {label}
            </div>
            <select
              value={idx}
              onChange={e => setIdx(Number(e.target.value))}
              style={{ ...selectStyle, borderColor: accentColor + "55" }}
            >
              {savedPlans.map((p, i) => (
                <option key={p.id ?? i} value={i}>{planLabel(p)}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* SVG previews */}
      {(planA.svg_code || planB.svg_code) && (
        <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
          {[
            { plan: planA, color: "#4488FF", label: "Plan A" },
            { plan: planB, color: "#CC66FF", label: "Plan B" },
          ].map(({ plan, color, label }) => (
            <div key={label} style={{ flex: 1 }}>
              <div style={{
                fontSize: 9, color, fontWeight: 700,
                letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5,
              }}>
                {label} Preview
              </div>
              <div style={{
                height: 120,
                background: "#fff",
                border: `1px solid ${color}44`,
                borderRadius: 4,
                overflow: "hidden",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-start",
              }}>
                {plan.svg_code ? (
                  <div
                    style={{ transform: "scale(0.2)", transformOrigin: "top left" }}
                    dangerouslySetInnerHTML={{ __html: plan.svg_code }}
                  />
                ) : (
                  <div style={{
                    width: "100%", height: "100%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#999", fontSize: 9,
                  }}>
                    No preview
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comparison table */}
      <div style={{
        border: "1px solid #1A1A28",
        borderRadius: 6,
        overflow: "hidden",
        marginBottom: 20,
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: "36%" }}>Metric</th>
              <th style={{ ...thStyle, color: "#4488FF", width: "32%" }}>Plan A</th>
              <th style={{ ...thStyle, color: "#CC66FF", width: "32%" }}>Plan B</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} style={{ background: i % 2 === 0 ? "#0A0A14" : "#080814" }}>
                <td style={{
                  padding: "9px 12px",
                  color: "#444",
                  fontSize: 9,
                  fontFamily: "monospace",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  borderBottom: "1px solid #1A1A2800",
                }}>
                  {row.label}
                </td>
                <td style={{
                  padding: "9px 12px",
                  color: row.aColor,
                  fontSize: 10,
                  fontFamily: "monospace",
                  fontWeight: 600,
                  borderBottom: "1px solid #0E0E18",
                }}>
                  {row.a}
                </td>
                <td style={{
                  padding: "9px 12px",
                  color: row.bColor,
                  fontSize: 10,
                  fontFamily: "monospace",
                  fontWeight: 600,
                  borderBottom: "1px solid #0E0E18",
                }}>
                  {row.b}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Winner badge */}
      <div style={{
        textAlign: "center",
        padding: "18px 16px",
        background: "#0A0A14",
        border: `2px solid ${winnerColor}44`,
        borderRadius: 8,
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 28, marginBottom: 6 }}>{crown}</div>
        <div style={{
          fontSize: 18,
          fontWeight: 900,
          color: winnerColor,
          fontFamily: "monospace",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}>
          {winner}
        </div>
        {winner !== "Tied" && scoreA != null && scoreB != null && (
          <div style={{ marginTop: 6, fontSize: 9, color: "#888", fontFamily: "monospace" }}>
            Based on Vastu score: Plan A {scoreA}/100 vs Plan B {scoreB}/100
          </div>
        )}
      </div>

      {/* Footer note */}
      <div style={{
        fontSize: 9,
        color: "#444",
        fontFamily: "monospace",
        lineHeight: 1.6,
        padding: "8px 12px",
        borderTop: "1px solid #1A1A28",
      }}>
        Generated plans auto-save. Switch to the <span style={{ color: "#4488FF" }}>My Plans</span> tab to browse all saved plans.
      </div>
    </div>
  );
}
