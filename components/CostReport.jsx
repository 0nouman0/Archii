"use client";
import { useState, useMemo } from "react";

function fmt(n) {
  if (!n && n !== 0) return "—";
  return Number(n).toLocaleString("en-IN");
}

const CAT_COLOR = {
  structure:"#4488FF", finishing:"#44DD88", electrical:"#FFAA22",
  plumbing:"#22CCCC", flooring:"#CC66FF", painting:"#FF8833", misc:"#AA88CC",
};

const MATERIAL_ALTERNATIVES = {
  "OPC 53 Cement":        [{ name:"OPC 53 Cement", adj:1.0 }, { name:"PPC Cement", adj:0.92 }, { name:"PSC Cement", adj:0.95 }],
  "TMT Steel Fe500":      [{ name:"TMT Steel Fe500", adj:1.0 }, { name:"TMT Steel Fe415", adj:0.95 }, { name:"MS Steel", adj:0.88 }],
  "Wire-cut Bricks":      [{ name:"Wire-cut Bricks", adj:1.0 }, { name:"AAC Blocks", adj:0.85 }, { name:"Fly Ash Bricks", adj:0.90 }, { name:"CLC Blocks", adj:0.92 }],
  "River Sand":           [{ name:"River Sand", adj:1.0 }, { name:"M-Sand", adj:0.80 }, { name:"Stone Dust", adj:0.75 }],
  "Vitrified Floor Tiles":[{ name:"Vitrified Tiles", adj:1.0 }, { name:"Ceramic Tiles", adj:0.70 }, { name:"Marble", adj:1.50 }, { name:"Granite", adj:1.40 }],
  "Main Teak Door":       [{ name:"Main Teak Door", adj:1.0 }, { name:"Solid Wood Door", adj:0.75 }, { name:"Flush Door (Hardwood)", adj:0.40 }],
  "UPVC Windows":         [{ name:"UPVC Windows", adj:1.0 }, { name:"Aluminum Windows", adj:0.75 }, { name:"Wooden Windows", adj:1.20 }],
  "Interior Painting":    [{ name:"Interior Painting", adj:1.0 }, { name:"Economy Emulsion", adj:0.65 }, { name:"Premium Texture", adj:1.40 }],
};

// ── Donut Chart ────────────────────────────────────────────────────────────────
function DonutChart({ entries, total }) {
  const [hovered, setHovered] = useState(null);
  const CX = 110, CY = 110, OR = 90, IR = 56;

  const slices = useMemo(() => {
    let angle = -Math.PI / 2;
    return entries.map(([key, val]) => {
      const frac = val / total;
      const sweep = frac * 2 * Math.PI;
      const end = angle + sweep;
      const large = sweep > Math.PI ? 1 : 0;
      const c1 = [Math.cos(angle), Math.sin(angle)];
      const c2 = [Math.cos(end),   Math.sin(end)];
      const path = [
        `M ${CX + OR*c1[0]} ${CY + OR*c1[1]}`,
        `A ${OR} ${OR} 0 ${large} 1 ${CX + OR*c2[0]} ${CY + OR*c2[1]}`,
        `L ${CX + IR*c2[0]} ${CY + IR*c2[1]}`,
        `A ${IR} ${IR} 0 ${large} 0 ${CX + IR*c1[0]} ${CY + IR*c1[1]}`,
        "Z",
      ].join(" ");
      const mid = angle + sweep / 2;
      const result = { key, val, frac, path, mid, color: CAT_COLOR[key] || "#CC66FF" };
      angle = end;
      return result;
    });
  }, [entries, total]);

  return (
    <div style={{ display:"flex", alignItems:"center", gap:28, flexWrap:"wrap" }}>
      <svg width={220} height={220} style={{ flexShrink:0 }}>
        {slices.map((s, i) => {
          const isHov = hovered === i;
          const dx = isHov ? Math.cos(s.mid) * 6 : 0;
          const dy = isHov ? Math.sin(s.mid) * 6 : 0;
          return (
            <path key={s.key} d={s.path}
              fill={s.color}
              opacity={hovered===null ? 0.88 : isHov ? 1 : 0.3}
              stroke="#080814" strokeWidth={3}
              transform={`translate(${dx},${dy})`}
              style={{ cursor:"pointer", transition:"all 0.2s" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
        {/* Center label — show hovered slice or total */}
        {hovered !== null ? (
          <>
            <text x={CX} y={CY-10} textAnchor="middle" fontSize={8} fill="#888" fontFamily="monospace" letterSpacing="0.08em" textTransform="uppercase">
              {slices[hovered]?.key?.toUpperCase()}
            </text>
            <text x={CX} y={CY+10} textAnchor="middle" fontSize={19} fontWeight={900} fill={slices[hovered]?.color} fontFamily="monospace">
              ₹{slices[hovered]?.val}L
            </text>
            <text x={CX} y={CY+26} textAnchor="middle" fontSize={9} fill="#666" fontFamily="monospace">
              {Math.round((slices[hovered]?.frac||0)*100)}%
            </text>
          </>
        ) : (
          <>
            <text x={CX} y={CY-8} textAnchor="middle" fontSize={8} fill="#666" fontFamily="monospace" letterSpacing="0.12em">TOTAL</text>
            <text x={CX} y={CY+14} textAnchor="middle" fontSize={22} fontWeight={900} fill="#CC66FF" fontFamily="monospace">₹{total}L</text>
          </>
        )}
      </svg>

      {/* Legend */}
      <div style={{ display:"flex", flexDirection:"column", gap:8, flex:1, minWidth:180 }}>
        {slices.map((s, i) => (
          <div key={s.key}
            style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"8px 12px",
              background: hovered===i ? `${s.color}14` : "transparent",
              borderLeft:`3px solid ${hovered===i ? s.color : s.color+"44"}`,
              borderRadius:4,
              opacity: hovered===null ? 1 : hovered===i ? 1 : 0.45,
              transition:"all 0.15s", cursor:"pointer",
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:10, color:"#CCC", textTransform:"capitalize", fontFamily:"monospace" }}>{s.key}</div>
              <div style={{ fontSize:8, color:"#555", marginTop:1 }}>{Math.round(s.frac*100)}% of total</div>
            </div>
            <span style={{ fontSize:13, fontWeight:800, color:s.color, fontFamily:"monospace", flexShrink:0 }}>₹{s.val}L</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────
function BarChart({ entries, total, maxVal }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {entries.map(([key, val], i) => {
        const color = CAT_COLOR[key] || "#CC66FF";
        const pct = (val / maxVal) * 100;
        const totalPct = Math.round((val / total) * 100);
        const isHov = hovered === i;
        return (
          <div key={key}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:10, height:10, borderRadius:3, background:color, flexShrink:0 }}/>
                <span style={{ fontSize:11, color:isHov?"#DDD":"#888", textTransform:"capitalize", fontFamily:"monospace", transition:"color 0.15s" }}>{key}</span>
              </div>
              <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                <span style={{ fontSize:14, fontWeight:800, color, fontFamily:"monospace" }}>₹{val}L</span>
                <span style={{ fontSize:9, color:"#555" }}>{totalPct}%</span>
              </div>
            </div>
            <div style={{ height:10, background:"#0E0E1A", borderRadius:5, overflow:"hidden" }}>
              <div style={{
                height:"100%", width:`${pct}%`,
                background:`linear-gradient(90deg, ${color}55, ${color})`,
                borderRadius:5,
                transition:"width 0.9s ease",
                boxShadow: isHov ? `0 0 10px ${color}55` : "none",
              }}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Sub-tab pill ──────────────────────────────────────────────────────────────
function SubTab({ id, label, active, onClick }) {
  return (
    <button onClick={() => onClick(id)} style={{
      padding:"5px 16px",
      background: active ? "#CC66FF18" : "transparent",
      border:`1px solid ${active ? "#CC66FF66" : "#1A1A28"}`,
      borderRadius:20, color: active ? "#CC66FF" : "#555",
      fontSize:9, fontWeight:700, cursor:"pointer",
      fontFamily:"monospace", letterSpacing:"0.07em",
      textTransform:"uppercase", transition:"all 0.15s",
    }}>{label}</button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CostReport({ cost }) {
  const [subTab, setSubTab] = useState("overview");
  const [chartMode, setChartMode] = useState("pie");
  const [materialSelections, setMaterialSelections] = useState(() => {
    if (!cost?.bom) return {};
    const obj = {};
    cost.bom.forEach(row => { obj[row.item] = { material: row.item, qty: row.qty, rate: row.rate }; });
    return obj;
  });

  const resetMaterials = () => {
    if (!cost?.bom) return;
    const obj = {};
    cost.bom.forEach(row => { obj[row.item] = { material: row.item, qty: row.qty, rate: row.rate }; });
    setMaterialSelections(obj);
  };

  if (!cost) return (
    <div style={{ padding:24, color:"#444", fontSize:11, fontFamily:"monospace", textAlign:"center", paddingTop:60 }}>
      Generate a floor plan to see cost estimation & bill of materials.
    </div>
  );

  const bd = cost.breakdown || {};
  const entries = Object.entries(bd).filter(([,v]) => v > 0);
  const maxVal = Math.max(...entries.map(([,v]) => v), 1);
  const total = cost.totalCost;

  const customTotal = cost.bom ? cost.bom.reduce((sum, row) => {
    const sel = materialSelections[row.item];
    if (!sel) return sum + (row.amount || 0);
    const alts = MATERIAL_ALTERNATIVES[row.item];
    const chosen = alts ? alts.find(a => a.name === sel.material) : null;
    const adj = chosen ? chosen.adj : 1.0;
    const qty = sel.qty ?? row.qty;
    const rate = (row.rate || 0) * adj;
    return sum + qty * rate;
  }, 0) : 0;
  const customLakhs = customTotal / 100000;
  const diff = customLakhs - total;
  const diffColor = diff <= 0 ? "#44DD88" : "#FF5555";

  const SUBTABS = [
    { id:"overview",  label:"Overview"  },
    { id:"breakdown", label:"Breakdown" },
    { id:"bom",       label:"BOM"       },
    { id:"materials", label:"Materials" },
  ];

  return (
    <div style={{ fontFamily:"monospace" }}>
      {/* Sub-tab bar */}
      <div style={{ display:"flex", gap:6, marginBottom:22, flexWrap:"wrap" }}>
        {SUBTABS.map(t => <SubTab key={t.id} id={t.id} label={t.label} active={subTab===t.id} onClick={setSubTab}/>)}
      </div>

      {/* ── Overview ───────────────────────────────────────────────────────────── */}
      {subTab === "overview" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* Hero */}
          <div style={{
            padding:"22px 24px",
            background:"linear-gradient(135deg, #120828 0%, #0A0618 100%)",
            border:"2px solid #2A1A4A", borderRadius:10, position:"relative", overflow:"hidden",
          }}>
            <div style={{ position:"absolute", top:-30, right:-30, width:140, height:140, borderRadius:"50%", background:"#CC66FF07", pointerEvents:"none" }}/>
            <div style={{ position:"absolute", bottom:-20, right:60, width:80, height:80, borderRadius:"50%", background:"#8833FF06", pointerEvents:"none" }}/>
            <div style={{ fontSize:8, color:"#6A4A8A", letterSpacing:"0.16em", textTransform:"uppercase", marginBottom:10 }}>Total Estimated Cost</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:12 }}>
              <span style={{ fontSize:42, fontWeight:900, color:"#CC66FF", lineHeight:1, letterSpacing:"-0.02em" }}>₹{total}L</span>
              <span style={{ fontSize:12, color:"#7A5A9A" }}>≈ ₹{fmt(cost.perSqftRate)}/sqft</span>
            </div>
            <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
              <div>
                <div style={{ fontSize:8, color:"#5A3A7A", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:3 }}>Built-up Area</div>
                <div style={{ fontSize:13, color:"#DDD", fontWeight:700 }}>{fmt(cost.builtUpArea)} sqft</div>
              </div>
              <div>
                <div style={{ fontSize:8, color:"#5A3A7A", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:3 }}>Timeline</div>
                <div style={{ fontSize:13, color:"#DDD", fontWeight:700 }}>{cost.timeline}</div>
              </div>
            </div>
          </div>

          {/* Category stat cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(140px,1fr))", gap:8 }}>
            {entries.map(([key, val]) => {
              const color = CAT_COLOR[key] || "#CC66FF";
              const pct = Math.round((val / total) * 100);
              return (
                <div key={key} style={{
                  padding:"12px 14px",
                  background:"#08080F",
                  border:`1px solid ${color}1A`,
                  borderLeft:`3px solid ${color}`,
                  borderRadius:7,
                  transition:"border-color 0.2s",
                }}>
                  <div style={{ fontSize:8, color:"#555", textTransform:"capitalize", letterSpacing:"0.06em", marginBottom:6 }}>{key}</div>
                  <div style={{ fontSize:16, fontWeight:900, color, fontFamily:"monospace", marginBottom:2 }}>₹{val}L</div>
                  <div style={{ fontSize:8, color:"#3A3A4A" }}>{pct}% of total</div>
                </div>
              );
            })}
          </div>

          {/* Notes */}
          {cost.notes && (
            <div style={{ padding:"12px 16px", background:"#08080E", border:"1px solid #161622", borderRadius:7 }}>
              <div style={{ fontSize:8, color:"#3A3A5A", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:7 }}>Notes</div>
              <div style={{ fontSize:9, color:"#505068", lineHeight:1.8 }}>{cost.notes}</div>
            </div>
          )}
        </div>
      )}

      {/* ── Breakdown ──────────────────────────────────────────────────────────── */}
      {subTab === "breakdown" && (
        <div>
          <div style={{ display:"flex", gap:6, marginBottom:22, alignItems:"center" }}>
            <span style={{ fontSize:9, color:"#444", marginRight:4, letterSpacing:"0.06em" }}>CHART TYPE</span>
            {[
              { id:"pie", icon:"◉", label:"Pie" },
              { id:"bar", icon:"▬", label:"Bar" },
            ].map(m => (
              <button key={m.id} onClick={() => setChartMode(m.id)} style={{
                padding:"5px 14px",
                background: chartMode===m.id ? "#CC66FF18" : "transparent",
                border:`1px solid ${chartMode===m.id ? "#CC66FF66" : "#1A1A28"}`,
                borderRadius:16, color: chartMode===m.id ? "#CC66FF" : "#555",
                fontSize:9, fontWeight:700, cursor:"pointer",
                fontFamily:"monospace", textTransform:"uppercase",
                letterSpacing:"0.06em", transition:"all 0.15s",
              }}>{m.icon} {m.label}</button>
            ))}
          </div>

          {chartMode === "pie"
            ? <DonutChart entries={entries} total={total} />
            : <BarChart entries={entries} total={total} maxVal={maxVal} />
          }
        </div>
      )}

      {/* ── BOM ────────────────────────────────────────────────────────────────── */}
      {subTab === "bom" && (
        <>
          {!cost.bom?.length
            ? <div style={{ color:"#444", fontSize:10 }}>No bill of materials available.</div>
            : (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
                  <thead>
                    <tr>
                      {["Item","Qty","Unit","Rate (₹)","Amount (₹)"].map(h => (
                        <th key={h} style={{
                          textAlign: h.includes("₹") ? "right" : "left",
                          padding:"9px 12px",
                          borderBottom:"2px solid #1A1A28",
                          color:"#444", fontWeight:700, letterSpacing:"0.05em",
                          position:"sticky", top:0, background:"#080814",
                          whiteSpace:"nowrap",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cost.bom.map((row, i) => (
                      <tr key={i}
                        style={{ background: i%2===0?"transparent":"#0A0A12", transition:"background 0.1s" }}
                        onMouseEnter={e => e.currentTarget.style.background="#0E0E1C"}
                        onMouseLeave={e => e.currentTarget.style.background=i%2===0?"transparent":"#0A0A12"}
                      >
                        <td style={{ padding:"8px 12px", color:"#CCC", borderBottom:"1px solid #0C0C1A" }}>{row.item}</td>
                        <td style={{ padding:"8px 12px", color:"#AAA", borderBottom:"1px solid #0C0C1A" }}>{fmt(row.qty)}</td>
                        <td style={{ padding:"8px 12px", color:"#666", borderBottom:"1px solid #0C0C1A" }}>{row.unit}</td>
                        <td style={{ padding:"8px 12px", color:"#888", borderBottom:"1px solid #0C0C1A", textAlign:"right" }}>{fmt(row.rate)}</td>
                        <td style={{ padding:"8px 12px", color:"#CC66FF", borderBottom:"1px solid #0C0C1A", fontWeight:700, textAlign:"right" }}>{fmt(row.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} style={{ padding:"11px 12px", color:"#888", fontWeight:700, borderTop:"2px solid #2A1A3A", fontSize:11 }}>TOTAL</td>
                      <td style={{ padding:"11px 12px", color:"#CC66FF", fontWeight:900, borderTop:"2px solid #2A1A3A", textAlign:"right", fontSize:13 }}>
                        ₹{fmt(cost.bom.reduce((s,r) => s+(r.amount||0), 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )
          }
        </>
      )}

      {/* ── Materials ──────────────────────────────────────────────────────────── */}
      {subTab === "materials" && (
        <>
          {!cost.bom?.length
            ? <div style={{ color:"#444", fontSize:10 }}>No materials data available.</div>
            : (
              <>
                {/* Delta summary bar */}
                <div style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12,
                  padding:"14px 18px", marginBottom:18,
                  background:"#0A0814", border:"1px solid #1E1A2E", borderRadius:8,
                }}>
                  <div>
                    <div style={{ fontSize:8, color:"#555", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>Custom Estimate</div>
                    <div style={{ fontSize:20, fontWeight:900, color:"#CC66FF", fontFamily:"monospace" }}>₹{customLakhs.toFixed(1)}L</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:8, color:"#444", marginBottom:4, letterSpacing:"0.08em" }}>vs AI Estimate ₹{total}L</div>
                    <div style={{ fontSize:14, fontWeight:800, color:diffColor, fontFamily:"monospace" }}>
                      {diff > 0 ? "+" : ""}{diff.toFixed(1)}L
                    </div>
                  </div>
                  <button onClick={resetMaterials} style={{
                    background:"transparent", border:"1px solid #2A2A3A", color:"#666",
                    borderRadius:6, padding:"7px 14px", fontSize:9, cursor:"pointer",
                    fontFamily:"monospace", letterSpacing:"0.05em",
                    transition:"all 0.15s",
                  }}>↺ Reset</button>
                </div>

                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:9 }}>
                    <thead>
                      <tr>
                        {["Item","Alternative","Qty","Unit","Rate","Amount"].map(h => (
                          <th key={h} style={{
                            textAlign: h==="Rate"||h==="Amount" ? "right" : "left",
                            padding:"8px 10px",
                            borderBottom:"2px solid #1A1A28",
                            color:"#444", fontWeight:700, letterSpacing:"0.05em",
                            position:"sticky", top:0, background:"#080814",
                            whiteSpace:"nowrap",
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cost.bom.map((row, i) => {
                        const alts = MATERIAL_ALTERNATIVES[row.item];
                        const sel = materialSelections[row.item] || { material:row.item, qty:row.qty, rate:row.rate };
                        const chosen = alts ? alts.find(a => a.name === sel.material) : null;
                        const adj = chosen ? chosen.adj : 1.0;
                        const qty = sel.qty ?? row.qty;
                        const rate = (row.rate || 0) * adj;
                        const amount = qty * rate;
                        const isChanged = adj !== 1.0 || (sel.qty && sel.qty !== row.qty);
                        return (
                          <tr key={i} style={{ background: i%2===0?"transparent":"#0A0A12" }}>
                            <td style={{ padding:"6px 10px", color: isChanged ? "#DDD" : "#AAA", borderBottom:"1px solid #0C0C1A", whiteSpace:"nowrap" }}>{row.item}</td>
                            <td style={{ padding:"6px 10px", borderBottom:"1px solid #0C0C1A" }}>
                              {alts ? (
                                <select
                                  style={{ background:"#0C0C18", border:"1px solid #2A2A3A", color:"#CCC", borderRadius:4, padding:"3px 6px", fontFamily:"monospace", fontSize:9, outline:"none" }}
                                  value={sel.material}
                                  onChange={e => setMaterialSelections(prev => ({
                                    ...prev,
                                    [row.item]: { ...(prev[row.item]||{ qty:row.qty, rate:row.rate }), material:e.target.value },
                                  }))}
                                >
                                  {alts.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                                </select>
                              ) : <span style={{ color:"#3A3A4A" }}>—</span>}
                            </td>
                            <td style={{ padding:"6px 10px", borderBottom:"1px solid #0C0C1A" }}>
                              <input type="number" min={0}
                                style={{ background:"#0C0C18", border:"1px solid #2A2A3A", color:"#CCC", borderRadius:4, padding:"3px 6px", width:58, fontFamily:"monospace", fontSize:9, outline:"none" }}
                                value={qty}
                                onChange={e => setMaterialSelections(prev => ({
                                  ...prev,
                                  [row.item]: { ...(prev[row.item]||{ material:row.item, rate:row.rate }), qty:Number(e.target.value) },
                                }))}
                              />
                            </td>
                            <td style={{ padding:"6px 10px", color:"#666", borderBottom:"1px solid #0C0C1A" }}>{row.unit}</td>
                            <td style={{ padding:"6px 10px", color:"#888", borderBottom:"1px solid #0C0C1A", textAlign:"right" }}>{rate.toLocaleString("en-IN",{maximumFractionDigits:0})}</td>
                            <td style={{ padding:"6px 10px", color: isChanged ? "#CC88FF" : "#CC66FF", borderBottom:"1px solid #0C0C1A", fontWeight:700, textAlign:"right" }}>
                              {amount.toLocaleString("en-IN",{maximumFractionDigits:0})}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={5} style={{ padding:"10px 10px", color:"#888", fontWeight:700, borderTop:"2px solid #2A1A3A", fontSize:10 }}>Custom Total</td>
                        <td style={{ padding:"10px 10px", color:"#CC66FF", fontWeight:900, borderTop:"2px solid #2A1A3A", textAlign:"right", fontSize:12 }}>
                          ₹{customLakhs.toFixed(1)}L
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )
          }
        </>
      )}
    </div>
  );
}
