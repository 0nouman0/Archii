"use client";

function fmt(n) {
  if (!n && n !== 0) return "—";
  return Number(n).toLocaleString("en-IN");
}

export default function CostReport({ cost }) {
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
    </div>
  );
}
