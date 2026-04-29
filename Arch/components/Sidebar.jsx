"use client";
import { CITY_CODES } from "../lib/cityCode";

const IS = {
  background:"#060610", border:"1px solid #1E1E2E", borderRadius:5,
  color:"#D8D8E8", padding:"7px 10px", fontSize:11, outline:"none",
  fontFamily:"monospace", width:"100%", cursor:"pointer",
  transition:"border-color 0.2s",
};

function FieldLabel({ children }) {
  return <div style={{ fontSize:8, color:"#555", fontFamily:"monospace", letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:4 }}>{children}</div>;
}

export default function Sidebar({
  params, onParamChange, onGenerate, onGenerateAlts, onExportSVG, onExportPNG,
  generating, hasPlan, regErrors,
}) {
  const P = (k,v) => onParamChange(k,v);

  return (
    <div style={{
      width:256, minWidth:256,
      background:"#080814",
      borderRight:"2px solid #1A1A28",
      display:"flex", flexDirection:"column",
      overflow:"hidden",
      fontFamily:"monospace",
    }}>
      {/* Logo */}
      <div style={{
        padding:"14px 16px 12px",
        borderBottom:"2px solid #1A1A28",
        background:"#060610",
      }}>
        <a href="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:8 }}>
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none"><rect x="0.75" y="0.75" width="26.5" height="26.5" rx="4" stroke="#4488FF" strokeWidth="1" fill="none" opacity="0.35"/><rect x="5" y="15" width="4" height="9" fill="#4488FF" rx="0.5"/><rect x="19" y="15" width="4" height="9" fill="#4488FF" rx="0.5"/><path d="M5 15.5 Q14 4 23 15.5" fill="none" stroke="#44DD88" strokeWidth="2.2" strokeLinecap="round"/><circle cx="14" cy="5.2" r="2.1" fill="#E8E8F0"/></svg>
          <div>
            <div style={{ fontSize:14, fontWeight:900, color:"#E8E8F0", fontFamily:"monospace", letterSpacing:"0.08em", lineHeight:1.1 }}>ARCHI<span style={{ color:"#4488FF" }}>AI</span></div>
            <div style={{ fontSize:7, color:"#333", letterSpacing:"0.16em", textTransform:"uppercase" }}>Design Platform</div>
          </div>
        </a>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:14, display:"flex", flexDirection:"column", gap:12 }}>


        {/* Section: Design Philosophy */}
        <div style={{ fontSize:8, color:"#333", letterSpacing:"0.18em", textTransform:"uppercase" }}>
          ── Design Philosophy ──
        </div>
        <div>
          <FieldLabel>Belief System</FieldLabel>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {[
              { id:"vastu",     label:"Vastu Shastra",    icon:"⬡", color:"#F0E040" },
              { id:"islamic",   label:"Islāmī Mīmārī",   icon:"☪", color:"#44DD88" },
              { id:"christian", label:"Sacred Christian", icon:"✝", color:"#4488FF" },
              { id:"universal", label:"Universal",        icon:"◎", color:"#888899" },
            ].map(b => (
              <button key={b.id} onClick={()=>P("belief", b.id)} style={{
                width:"100%", padding:"7px 10px",
                background: params.belief===b.id ? `${b.color}12` : "#060610",
                border:`1px solid ${params.belief===b.id ? b.color+"60" : "#1A1A2A"}`,
                borderRadius:5, color: params.belief===b.id ? b.color : "#444",
                fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"monospace",
                textAlign:"left", display:"flex", alignItems:"center", gap:7,
                transition:"all 0.15s",
              }}>
                <span style={{ fontSize:12 }}>{b.icon}</span>
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section: Plot Config */}
        <div style={{ fontSize:8, color:"#333", letterSpacing:"0.18em", textTransform:"uppercase" }}>
          ── Plot Configuration ──
        </div>

        <div style={{ display:"flex", gap:8 }}>
          <div style={{ flex:1 }}>
            <FieldLabel>Width (ft)</FieldLabel>
            <input type="number" value={params.plotW} min={15} max={120}
              onChange={e=>P("plotW",+e.target.value)} style={IS}
              onFocus={e=>e.target.style.borderColor="#4488FF"}
              onBlur={e=>e.target.style.borderColor="#1E1E2E"}/>
          </div>
          <div style={{ flex:1 }}>
            <FieldLabel>Depth (ft)</FieldLabel>
            <input type="number" value={params.plotH} min={15} max={150}
              onChange={e=>P("plotH",+e.target.value)} style={IS}
              onFocus={e=>e.target.style.borderColor="#4488FF"}
              onBlur={e=>e.target.style.borderColor="#1E1E2E"}/>
          </div>
        </div>

        <div>
          <FieldLabel>BHK Configuration</FieldLabel>
          <div style={{ display:"flex", gap:4 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={()=>P("bhk",n)} style={{
                flex:1, padding:"7px 0",
                background: params.bhk===n ? "#0E2040" : "#060610",
                border:`1px solid ${params.bhk===n ? "#4488FF" : "#1A1A2A"}`,
                borderRadius:4, color: params.bhk===n ? "#4488FF" : "#555",
                fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"monospace",
                transition:"all 0.15s",
              }}>{n}</button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Municipal Code</FieldLabel>
          <select value={params.city} onChange={e=>P("city",e.target.value)}
            style={IS}
            onFocus={e=>e.target.style.borderColor="#4488FF"}
            onBlur={e=>e.target.style.borderColor="#1E1E2E"}>
            {Object.keys(CITY_CODES).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <FieldLabel>Plot Facing</FieldLabel>
          <div style={{ display:"flex", gap:4 }}>
            {["North","East","South","West"].map(f => (
              <button key={f} onClick={()=>P("facing",f)} style={{
                flex:1, padding:"7px 0",
                background: params.facing===f ? "#0E2818" : "#060610",
                border:`1px solid ${params.facing===f ? "#44DD88" : "#1A1A2A"}`,
                borderRadius:4, color: params.facing===f ? "#44DD88" : "#555",
                fontSize:9, fontWeight:700, cursor:"pointer", fontFamily:"monospace",
                transition:"all 0.15s",
              }}>{f[0]}</button>
            ))}
          </div>
          <div style={{ fontSize:8, color:"#444", marginTop:4 }}>N=North E=East S=South W=West</div>
        </div>

        <div>
          <FieldLabel>Budget Tier</FieldLabel>
          <select value={params.budget} onChange={e=>P("budget",e.target.value)}
            style={IS}
            onFocus={e=>e.target.style.borderColor="#4488FF"}
            onBlur={e=>e.target.style.borderColor="#1E1E2E"}>
            <option>Economy (₹20-40L)</option>
            <option>Lower-Premium (₹40-60L)</option>
            <option>Premium (₹60-100L)</option>
            <option>Luxury (₹1Cr+)</option>
          </select>
        </div>

        <div>
          <FieldLabel>Floors</FieldLabel>
          <select value={params.floors} onChange={e=>P("floors",+e.target.value)}
            style={IS}
            onFocus={e=>e.target.style.borderColor="#4488FF"}
            onBlur={e=>e.target.style.borderColor="#1E1E2E"}>
            <option value={1}>Ground Floor Only</option>
            <option value={2}>G+1 Duplex</option>
            <option value={3}>G+2 Triple Storey</option>
          </select>
        </div>

        {/* Regulatory warnings */}
        {(regErrors.errors?.length > 0 || regErrors.warnings?.length > 0) && (
          <div style={{ padding:10, background:"#0E0808", border:"1px solid #2A1010", borderRadius:5 }}>
            {regErrors.errors?.map((e,i) => <div key={i} style={{ fontSize:9, color:"#FF5544", marginBottom:2 }}>✗ {e}</div>)}
            {regErrors.warnings?.map((w,i) => <div key={i} style={{ fontSize:9, color:"#FFAA22", marginBottom:2 }}>⚠ {w}</div>)}
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={onGenerate}
          disabled={generating}
          style={{
            width:"100%", padding:"12px",
            background: generating ? "#080812" : "linear-gradient(135deg,#0E2040,#061830)",
            border:`2px solid ${generating ? "#1A1A2A" : "#4488FF"}`,
            borderRadius:6, color:"#4488FF",
            fontSize:11, fontWeight:900, cursor: generating ? "not-allowed" : "pointer",
            letterSpacing:"0.12em", textTransform:"uppercase",
            fontFamily:"monospace",
            transition:"all 0.2s",
            boxShadow: !generating ? "0 0 20px #4488FF18" : "none",
          }}
          onMouseEnter={e=>{ if(!generating) e.target.style.boxShadow="0 0 28px #4488FF30"; }}
          onMouseLeave={e=>{ e.target.style.boxShadow=!generating?"0 0 20px #4488FF18":"none"; }}
        >
          {generating ? "⬡  GENERATING…" : "⬡  GENERATE PLAN"}
        </button>

        <button
          onClick={onGenerateAlts}
          disabled={generating}
          style={{
            width:"100%", padding:"9px",
            background:"transparent",
            border:"1px solid #1E2E1E",
            borderRadius:5, color:"#44DD88",
            fontSize:10, cursor: generating ? "not-allowed" : "pointer",
            fontFamily:"monospace",
          }}
        >Generate 3 Alternatives</button>

        {hasPlan && (
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={onExportSVG} style={{
              flex:1, padding:"7px",
              background:"transparent", border:"1px solid #1A1A28",
              borderRadius:5, color:"#666", fontSize:9, cursor:"pointer",
              fontFamily:"monospace",
            }}>↓ SVG</button>
            <button onClick={onExportPNG} style={{
              flex:1, padding:"7px",
              background:"transparent", border:"1px solid #1A1A28",
              borderRadius:5, color:"#666", fontSize:9, cursor:"pointer",
              fontFamily:"monospace",
            }}>↓ PNG</button>
          </div>
        )}

        {/* Plot info */}
        <div style={{ padding:"8px 10px", background:"#060610", border:"1px solid #0E0E1A", borderRadius:4 }}>
          <div style={{ fontSize:8, color:"#333", marginBottom:4 }}>PLOT SUMMARY</div>
          <div style={{ fontSize:9, color:"#555" }}>
            Area: <span style={{ color:"#888" }}>{params.plotW * params.plotH} sqft</span>
            &nbsp;·&nbsp;
            BUA: <span style={{ color:"#888" }}>{Math.round(params.plotW * params.plotH * 0.65 * params.floors)} sqft</span>
          </div>
        </div>
      </div>

    </div>
  );
}
