"use client";

const PHASES = [
  { name: "Site Prep & Excavation",  pct: 0.05, color: "#4488FF" },
  { name: "Foundation & Plinth",     pct: 0.10, color: "#44DD88" },
  { name: "Structural Frame (RCC)",  pct: 0.20, color: "#FFAA22" },
  { name: "Brickwork & Roofing",     pct: 0.15, color: "#CC66FF" },
  { name: "MEP Rough-in",            pct: 0.10, color: "#22CCCC" },
  { name: "Plastering & Flooring",   pct: 0.08, color: "#F0E040" },
  { name: "Finishing & Painting",    pct: 0.17, color: "#FF8844" },
  { name: "Handover & Snagging",     pct: 0.15, color: "#44DD88" },
];

function parseMonths(timeline) {
  if (!timeline) return 12;
  // Handles "10–14 months", "10-14 months", "12 months", "~10 months"
  const range = timeline.match(/(\d+)\s*[–\-–]\s*(\d+)/);
  if (range) return Math.round((parseInt(range[1]) + parseInt(range[2])) / 2);
  const single = timeline.match(/(\d+)/);
  if (single) return parseInt(single[1]);
  return 12;
}

function approxHandover(totalMonths) {
  const now = new Date(2026, 3, 1); // April 2026
  const handover = new Date(now.getFullYear(), now.getMonth() + totalMonths, 1);
  const q = Math.ceil((handover.getMonth() + 1) / 3);
  return `Q${q} ${handover.getFullYear()}`;
}

export default function GanttChart({ costReport, params }) {
  if (!costReport) {
    return (
      <div style={{
        padding: "32px 24px",
        background: "#0A0A14",
        border: "1px solid #1A1A28",
        borderRadius: 8,
        fontFamily: "monospace",
        color: "#888",
        fontSize: 12,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>🏗️</div>
        <div style={{ color: "#D8D8EC", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
          No timeline data yet
        </div>
        Generate a floor plan to see the construction Gantt chart.
      </div>
    );
  }

  const totalMonths = parseMonths(costReport.timeline);

  // Build phases with cumulative start months
  let cursor = 0;
  const phases = PHASES.map(ph => {
    const duration = Math.max(0.5, ph.pct * totalMonths);
    const start = cursor;
    const end = cursor + duration;
    cursor = end;
    return { ...ph, start, end, duration };
  });

  // SVG dimensions
  const VIEW_W = 800;
  const LABEL_W = 140;
  const AXIS_H = 24;
  const HEADER_H = 24;
  const ROW_H = 30;
  const CHART_H = ROW_H * PHASES.length;
  const VIEW_H = HEADER_H + CHART_H + AXIS_H + 10;

  const gridX = VIEW_W - LABEL_W;
  const toX = (month) => LABEL_W + (month / totalMonths) * gridX;

  // X-axis month markers — pick sensible intervals
  const step = totalMonths <= 12 ? 1 : totalMonths <= 24 ? 2 : 3;
  const xTicks = [];
  for (let m = 0; m <= totalMonths; m += step) xTicks.push(m);
  if (xTicks[xTicks.length - 1] !== totalMonths) xTicks.push(totalMonths);

  const handover = approxHandover(totalMonths);

  return (
    <div style={{ fontFamily: "monospace" }}>
      {/* Title row */}
      <div style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        marginBottom: 12,
      }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 900, color: "#D8D8EC", letterSpacing: "0.06em" }}>
            CONSTRUCTION TIMELINE
          </span>
          <span style={{
            marginLeft: 10, fontSize: 9, color: "#FFAA22",
            fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            {totalMonths} months total
          </span>
        </div>
        {params && (
          <div style={{ fontSize: 9, color: "#444" }}>
            {params.plotW}×{params.plotH}ft · {params.bhk}BHK
          </div>
        )}
      </div>

      {/* SVG Gantt */}
      <div style={{
        background: "#0A0A14",
        border: "1px solid #1A1A28",
        borderRadius: 6,
        overflow: "hidden",
        marginBottom: 16,
      }}>
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          style={{ width: "100%", display: "block" }}
          aria-label="Construction Gantt Chart"
        >
          {/* Background */}
          <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="#080814" />

          {/* Header row */}
          <rect x={0} y={0} width={VIEW_W} height={HEADER_H} fill="#0C0C1A" />
          <text x={8} y={16} fontSize={9} fill="#444" fontFamily="monospace" fontWeight="700"
            letterSpacing="0.1em" textTransform="uppercase">
            PHASE
          </text>

          {/* Header month markers */}
          {xTicks.filter(m => m % (totalMonths <= 12 ? 2 : 4) === 0 || m === totalMonths).map(m => (
            <text key={`hdr-${m}`}
              x={toX(m)} y={16}
              fontSize={8} fill="#444" fontFamily="monospace" textAnchor="middle">
              {m === 0 ? "Start" : `Mo ${m}`}
            </text>
          ))}

          {/* Vertical grid lines */}
          {xTicks.map(m => (
            <line
              key={`vg-${m}`}
              x1={toX(m)} y1={HEADER_H}
              x2={toX(m)} y2={HEADER_H + CHART_H}
              stroke="#1A1A28" strokeWidth={m === 0 || m === totalMonths ? 1.5 : 0.5}
            />
          ))}

          {/* Phase rows */}
          {phases.map((ph, i) => {
            const y = HEADER_H + i * ROW_H;
            const barX1 = toX(ph.start);
            const barX2 = toX(ph.end);
            const barW = barX2 - barX1;
            const rowBg = i % 2 === 0 ? "#0A0A14" : "#080814";

            return (
              <g key={ph.name}>
                {/* Row bg */}
                <rect x={0} y={y} width={VIEW_W} height={ROW_H} fill={rowBg} />

                {/* Left label */}
                <text
                  x={LABEL_W - 6} y={y + ROW_H / 2 + 4}
                  fontSize={10} fill="#888" fontFamily="monospace"
                  textAnchor="end"
                >
                  {ph.name.length > 18 ? ph.name.slice(0, 17) + "…" : ph.name}
                </text>

                {/* Phase bar */}
                <rect
                  x={barX1 + 2} y={y + 5}
                  width={Math.max(barW - 4, 2)} height={ROW_H - 10}
                  fill={ph.color}
                  rx={3}
                  opacity={0.9}
                />

                {/* Phase name inside bar (if room) */}
                {barW > 60 && (
                  <text
                    x={barX1 + 7} y={y + ROW_H / 2 + 4}
                    fontSize={9} fill="#fff" fontFamily="monospace"
                    fontWeight="700"
                  >
                    {ph.name.length > 14 ? ph.name.slice(0, 13) + "…" : ph.name}
                  </text>
                )}

                {/* Pct label at right end */}
                <text
                  x={barX2 + 4} y={y + ROW_H / 2 + 4}
                  fontSize={8} fill={ph.color} fontFamily="monospace"
                  fontWeight="700"
                >
                  {Math.round(ph.pct * 100)}%
                </text>
              </g>
            );
          })}

          {/* Start marker (dashed vertical) */}
          <line
            x1={toX(0)} y1={HEADER_H}
            x2={toX(0)} y2={HEADER_H + CHART_H}
            stroke="#4488FF" strokeWidth={1.5}
            strokeDasharray="4 3"
            opacity={0.7}
          />

          {/* X-axis */}
          <rect x={0} y={HEADER_H + CHART_H} width={VIEW_W} height={AXIS_H} fill="#0C0C1A" />
          <line x1={LABEL_W} y1={HEADER_H + CHART_H} x2={VIEW_W} y2={HEADER_H + CHART_H}
            stroke="#1A1A28" strokeWidth={1} />

          {xTicks.map(m => (
            <g key={`tick-${m}`}>
              <line
                x1={toX(m)} y1={HEADER_H + CHART_H}
                x2={toX(m)} y2={HEADER_H + CHART_H + 4}
                stroke="#444" strokeWidth={1}
              />
              <text
                x={toX(m)} y={HEADER_H + CHART_H + 16}
                fontSize={9} fill="#444" fontFamily="monospace" textAnchor="middle"
              >
                {m}
              </text>
            </g>
          ))}

          {/* Axis label */}
          <text
            x={LABEL_W + gridX / 2} y={VIEW_H - 2}
            fontSize={8} fill="#333" fontFamily="monospace" textAnchor="middle"
          >
            months from start
          </text>
        </svg>
      </div>

      {/* Stats row */}
      <div style={{
        display: "flex",
        gap: 0,
        background: "#0A0A14",
        border: "1px solid #1A1A28",
        borderRadius: 6,
        overflow: "hidden",
        marginBottom: 14,
      }}>
        {[
          {
            label: "Total Duration",
            value: `${totalMonths} months`,
            color: "#4488FF",
          },
          {
            label: "Peak Activity",
            value: `Month ${Math.round(totalMonths * 0.4)}–${Math.round(totalMonths * 0.6)}`,
            color: "#FFAA22",
          },
          {
            label: "Est. Handover",
            value: handover,
            color: "#44DD88",
          },
          {
            label: "Total Cost",
            value: costReport.totalCost ? `₹${costReport.totalCost}L` : "—",
            color: "#CC66FF",
          },
        ].map((stat, i, arr) => (
          <div key={stat.label} style={{
            flex: 1,
            padding: "12px 14px",
            borderRight: i < arr.length - 1 ? "1px solid #1A1A28" : "none",
            textAlign: "center",
          }}>
            <div style={{
              fontSize: 8,
              color: "#444",
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 5,
            }}>
              {stat.label}
            </div>
            <div style={{
              fontSize: 13,
              color: stat.color,
              fontFamily: "monospace",
              fontWeight: 900,
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Phase legend */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px 14px",
        padding: "10px 12px",
        background: "#0A0A14",
        border: "1px solid #1A1A28",
        borderRadius: 6,
      }}>
        {phases.map(ph => (
          <div key={ph.name} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{
              width: 8, height: 8,
              background: ph.color,
              borderRadius: 2,
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 8, color: "#888", fontFamily: "monospace" }}>
              {ph.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
