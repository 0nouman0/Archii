"use client";
import { useState, useMemo } from "react";

function fmt(n) {
  if (!n && n !== 0) return "—";
  return Number(n).toLocaleString("en-IN");
}

export default function CostReport({ cost }) {
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

  const buildInitialSelections = (bom) => {
    if (!bom) return {};
    const obj = {};
    bom.forEach(row => {
      obj[row.item] = { material: row.item, qty: row.qty, rate: row.rate };
    });
    return obj;
  };

  const [materialSelections, setMaterialSelections] = useState(() => buildInitialSelections(cost?.bom));

  if (!cost) return (
    <div style={{ color:"#444", fontSize:11, fontFamily:"monospace" }}>
      Generate a plan to see cost estimation & Bill of Materials.
    </div>
  );

  const bd = cost.breakdown || {};
  const entries = Object.entries(bd).filter(([,v]) => v > 0);
  const maxVal = Math.max(...entries.map(([,v]) => v), 1);

  const catColor = {
    structure:"#4488FF", finishing:"#44DD88", electrical:"#FFAA22",
    plumbing:"#22CCCC", flooring:"#CC66FF", painting:"#FF8833", misc:"#AA88AA",
  };

  return (
    <div style={{ fontFamily:"monospace" }}>
      {/* Hero total */}
      <div style={{ padding:"16px 18px", background:"#0C0816", border:"2px solid #2A1A3A", borderRadius:6, marginBottom:18 }}>
        <div style={{ fontSize:9, color:"#8866AA", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:6 }}>
          Total Estimated Cost
        </div>
        <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
          <span style={{ fontSize:30, fontWeight:900, color:"#CC66FF" }}>₹{cost.totalCost}L</span>
          <span style={{ fontSize:10, color:"#666" }}>≈ ₹{fmt(cost.perSqftRate)}/sqft</span>
        </div>
        <div style={{ marginTop:6, display:"flex", gap:16 }}>
          <span style={{ fontSize:9, color:"#888" }}>Built-up: {fmt(cost.builtUpArea)} sqft</span>
          <span style={{ fontSize:9, color:"#888" }}>Timeline: {cost.timeline}</span>
        </div>
        {cost.notes && (
          <div style={{ marginTop:8, fontSize:9, color:"#666", lineHeight:1.6, borderTop:"1px solid #2A1A3A", paddingTop:8 }}>
            {cost.notes}
          </div>
        )}
      </div>

      {/* Breakdown bars */}
      <div style={{ marginBottom:18 }}>
        <div style={{ fontSize:9, color:"#888", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>
          Cost Breakdown
        </div>
        {entries.map(([key, val]) => (
          <div key={key} style={{ marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
              <span style={{ fontSize:9, color:"#AAA", textTransform:"capitalize" }}>{key}</span>
              <span style={{ fontSize:9, color: catColor[key] || "#CC66FF" }}>₹{val}L</span>
            </div>
            <div style={{ height:5, background:"#0E0E1A", borderRadius:2, overflow:"hidden" }}>
              <div style={{
                height:"100%",
                width:`${(val/maxVal)*100}%`,
                background: `linear-gradient(90deg, ${catColor[key] || "#CC66FF"}88, ${catColor[key] || "#CC66FF"})`,
                borderRadius:2,
                transition:"width 0.8s ease",
              }}/>
            </div>
          </div>
        ))}
      </div>

      {/* BOM table */}
      {cost.bom?.length > 0 && (
        <div>
          <div style={{ fontSize:9, color:"#888", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>
            Bill of Materials
          </div>
          <div style={{ overflowX:"auto", maxHeight:260, overflowY:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:9 }}>
              <thead>
                <tr>
                  {["Item","Qty","Unit","Rate (₹)","Amount (₹)"].map(h => (
                    <th key={h} style={{
                      textAlign:"left", padding:"5px 6px",
                      borderBottom:"1px solid #1E1E2E", color:"#555",
                      fontWeight:700, letterSpacing:"0.05em",
                      position:"sticky", top:0, background:"#0A0A14",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cost.bom.map((row,i) => (
                  <tr key={i} style={{ background: i%2===0 ? "transparent" : "#0C0C14" }}>
                    <td style={{ padding:"4px 6px", color:"#CCC", borderBottom:"1px solid #0E0E1A" }}>{row.item}</td>
                    <td style={{ padding:"4px 6px", color:"#AAA", borderBottom:"1px solid #0E0E1A" }}>{fmt(row.qty)}</td>
                    <td style={{ padding:"4px 6px", color:"#888", borderBottom:"1px solid #0E0E1A" }}>{row.unit}</td>
                    <td style={{ padding:"4px 6px", color:"#888", borderBottom:"1px solid #0E0E1A" }}>{fmt(row.rate)}</td>
                    <td style={{ padding:"4px 6px", color:"#CC66FF", borderBottom:"1px solid #0E0E1A", fontWeight:700 }}>{fmt(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} style={{ padding:"6px 6px", color:"#888", fontWeight:700, borderTop:"1px solid #2A1A3A" }}>TOTAL</td>
                  <td style={{ padding:"6px 6px", color:"#CC66FF", fontWeight:900, borderTop:"1px solid #2A1A3A" }}>
                    ₹{fmt(cost.bom.reduce((s,r) => s + (r.amount||0), 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Material Pricing Explorer */}
      {cost.bom?.length > 0 && (() => {
        const customTotal = cost.bom.reduce((sum, row) => {
          const sel = materialSelections[row.item];
          if (!sel) return sum + (row.amount || 0);
          const alts = MATERIAL_ALTERNATIVES[row.item];
          const chosen = alts ? alts.find(a => a.name === sel.material) : null;
          const adj = chosen ? chosen.adj : 1.0;
          const qty = sel.qty ?? row.qty;
          const rate = (row.rate || 0) * adj;
          return sum + qty * rate;
        }, 0);

        const aiTotal = cost.totalCost; // already in lakhs
        const customLakhs = customTotal / 100000;
        const diff = customLakhs - aiTotal;
        const diffColor = diff <= 0 ? "#44DD88" : "#FF5555";
        const diffSign = diff > 0 ? "+" : "";

        const inputStyle = {
          background:"#0A0A14", border:"1px solid #2A2A3A", color:"#D8D8EC",
          borderRadius:3, padding:"2px 6px", width:70, fontFamily:"monospace",
          fontSize:9,
        };
        const selectStyle = {
          background:"#0A0A14", border:"1px solid #2A2A3A", color:"#D8D8EC",
          borderRadius:3, padding:"2px 4px", fontFamily:"monospace", fontSize:9,
        };

        return (
          <div style={{ marginTop:24 }}>
            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <div>
                <div style={{ fontSize:9, color:"#888", letterSpacing:"0.1em", textTransform:"uppercase" }}>
                  Material Pricing Explorer
                </div>
                <div style={{ fontSize:8, color:"#4A4A6A", marginTop:2 }}>
                  Swap materials to compare costs
                </div>
              </div>
              <button
                onClick={() => setMaterialSelections(buildInitialSelections(cost.bom))}
                style={{
                  background:"#0E0E1A", border:"1px solid #2A2A3A", color:"#888",
                  borderRadius:4, padding:"3px 10px", fontSize:8, cursor:"pointer",
                  fontFamily:"monospace", letterSpacing:"0.05em",
                }}
              >
                Reset to AI Estimate
              </button>
            </div>

            {/* Table */}
            <div style={{ overflowX:"auto", maxHeight:300, overflowY:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:9 }}>
                <thead>
                  <tr>
                    {["Item","Alternative","Qty","Unit","Rate (₹)","Amount (₹)"].map(h => (
                      <th key={h} style={{
                        textAlign: h === "Rate (₹)" || h === "Amount (₹)" ? "right" : "left",
                        padding:"5px 6px",
                        borderBottom:"1px solid #1E1E2E", color:"#555",
                        fontWeight:700, letterSpacing:"0.05em",
                        position:"sticky", top:0, background:"#0A0A14",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cost.bom.map((row, i) => {
                    const alts = MATERIAL_ALTERNATIVES[row.item];
                    const sel = materialSelections[row.item] || { material: row.item, qty: row.qty, rate: row.rate };
                    const chosen = alts ? alts.find(a => a.name === sel.material) : null;
                    const adj = chosen ? chosen.adj : 1.0;
                    const qty = sel.qty ?? row.qty;
                    const rate = (row.rate || 0) * adj;
                    const amount = qty * rate;

                    return (
                      <tr key={i} style={{ background: i%2===0 ? "transparent" : "#0C0C14" }}>
                        {/* Item */}
                        <td style={{ padding:"4px 6px", color:"#CCC", borderBottom:"1px solid #0E0E1A", whiteSpace:"nowrap" }}>
                          {row.item}
                        </td>
                        {/* Alternative dropdown or plain text */}
                        <td style={{ padding:"4px 6px", borderBottom:"1px solid #0E0E1A" }}>
                          {alts ? (
                            <select
                              style={selectStyle}
                              value={sel.material}
                              onChange={e => setMaterialSelections(prev => ({
                                ...prev,
                                [row.item]: { ...( prev[row.item] || { qty: row.qty, rate: row.rate }), material: e.target.value },
                              }))}
                            >
                              {alts.map(a => (
                                <option key={a.name} value={a.name}>{a.name}</option>
                              ))}
                            </select>
                          ) : (
                            <span style={{ color:"#666" }}>{row.item}</span>
                          )}
                        </td>
                        {/* Qty input */}
                        <td style={{ padding:"4px 6px", borderBottom:"1px solid #0E0E1A" }}>
                          <input
                            type="number"
                            min={0}
                            style={inputStyle}
                            value={qty}
                            onChange={e => setMaterialSelections(prev => ({
                              ...prev,
                              [row.item]: { ...(prev[row.item] || { material: row.item, rate: row.rate }), qty: Number(e.target.value) },
                            }))}
                          />
                        </td>
                        {/* Unit */}
                        <td style={{ padding:"4px 6px", color:"#888", borderBottom:"1px solid #0E0E1A" }}>
                          {row.unit}
                        </td>
                        {/* Rate */}
                        <td style={{ padding:"4px 6px", color:"#AAA", borderBottom:"1px solid #0E0E1A", textAlign:"right" }}>
                          {rate.toLocaleString("en-IN", { maximumFractionDigits:0 })}
                        </td>
                        {/* Amount */}
                        <td style={{ padding:"4px 6px", color:"#CC66FF", borderBottom:"1px solid #0E0E1A", fontWeight:700, textAlign:"right" }}>
                          {amount.toLocaleString("en-IN", { maximumFractionDigits:0 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5} style={{ padding:"6px 6px", color:"#888", fontWeight:700, borderTop:"1px solid #2A1A3A" }}>
                      Custom Total
                    </td>
                    <td style={{ padding:"6px 6px", color:"#CC66FF", fontWeight:900, borderTop:"1px solid #2A1A3A", textAlign:"right" }}>
                      ₹{customLakhs.toFixed(1)} L
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={5} style={{ padding:"3px 6px", color:"#555", fontSize:8 }}>
                      AI Estimate
                    </td>
                    <td style={{ padding:"3px 6px", color:"#555", fontSize:8, textAlign:"right" }}>
                      ₹{aiTotal} L
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={5} style={{ padding:"3px 6px", color:"#555", fontSize:8 }}>
                      Difference vs AI Estimate
                    </td>
                    <td style={{ padding:"3px 6px", color: diffColor, fontSize:8, fontWeight:700, textAlign:"right" }}>
                      {diffSign}{diff.toFixed(1)} L
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
