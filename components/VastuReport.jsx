"use client";
import { VASTU_RULES_LIST } from "../lib/vastuRules";

const SEV_COLOR = { critical:"#FF5544", major:"#FFAA22", minor:"#66AAFF" };
const SEV_BG    = { critical:"#200A08", major:"#1E1400", minor:"#080E20" };

const BELIEF_SCORE_LABEL = {
  vastu:     "Vastu Score",
  islamic:   "Islāmī Score",
  christian: "Christian Score",
  universal: "Design Score",
};

export default function VastuReport({ report, belief }) {
  if (!report) return (
    <div>
      <p style={{ color:"#555", fontSize:11, fontFamily:"monospace", marginBottom:20 }}>
        Generate a floor plan to see the Vastu audit. The following 14 rules are checked:
      </p>
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        {VASTU_RULES_LIST.map((rule,i) => (
          <div key={i} style={{
            padding:"6px 10px", border:"1px solid #1A1A2A",
            borderLeft:"3px solid #2A2A3A", borderRadius:3,
            fontSize:10, color:"#555", fontFamily:"monospace",
            display:"flex", gap:10, alignItems:"flex-start",
          }}>
            <span style={{ color:"#333", minWidth:16 }}>{i+1}.</span>
            <span>{rule}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const scoreColor = report.score >= 80 ? "#44DD88" : report.score >= 60 ? "#FFAA22" : "#FF5544";
  const arc = report.score / 100;
  const r = 36, cx = 44, cy = 44;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - arc);

  return (
    <div style={{ fontFamily:"monospace" }}>
      {/* Score gauge */}
      <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:20, padding:"14px 16px", background:"#0C0C16", border:"2px solid #1A1A2A", borderRadius:6 }}>
        <svg width="88" height="88">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1A1A2A" strokeWidth="6"/>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={scoreColor} strokeWidth="6"
            strokeDasharray={circumference} strokeDashoffset={dashOffset}
            strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition:"stroke-dashoffset 1s ease" }}/>
          <text x={cx} y={cy-4} textAnchor="middle" fontSize="18" fontWeight="900" fill={scoreColor} fontFamily="monospace">{report.score}</text>
          <text x={cx} y={cy+12} textAnchor="middle" fontSize="8" fill="#666" fontFamily="monospace">/ 100</text>
        </svg>
        <div>
          <div style={{ fontSize:11, color:"#FFAA22", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:4 }}>
            {BELIEF_SCORE_LABEL[belief] || "Vastu Score"}
          </div>
          <div style={{ fontSize:10, color:"#AAA", lineHeight:1.5, maxWidth:220 }}>{report.summary}</div>
          <div style={{ marginTop:8, display:"flex", gap:12 }}>
            <span style={{ fontSize:9, color:"#44DD88" }}>✓ {report.compliant?.length || 0} rules</span>
            <span style={{ fontSize:9, color:"#FF5544" }}>⚠ {report.violations?.length || 0} violations</span>
          </div>
        </div>
      </div>

      {/* Violations */}
      {report.violations?.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:9, color:"#FF5544", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>
            ⚠ VIOLATIONS ({report.violations.length})
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {report.violations.map((v,i) => (
              <div key={i} style={{
                padding:"8px 10px",
                background: SEV_BG[v.severity] || "#0C0C16",
                border:`1px solid ${SEV_COLOR[v.severity] || "#444"}40`,
                borderLeft:`3px solid ${SEV_COLOR[v.severity] || "#444"}`,
                borderRadius:4,
              }}>
                <div style={{ fontSize:9, fontWeight:700, color:SEV_COLOR[v.severity], marginBottom:3, letterSpacing:"0.06em", textTransform:"uppercase" }}>
                  {v.severity} · {v.rule}
                </div>
                <div style={{ fontSize:9, color:"#888" }}>Fix: {v.fix}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remedies */}
      {report.remedies?.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:9, color:"#FFAA22", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>
            💡 REMEDIES
          </div>
          {report.remedies.map((rem,i) => (
            <div key={i} style={{ padding:"7px 10px", background:"#120E00", border:"1px solid #332200", borderRadius:4, marginBottom:5 }}>
              <div style={{ fontSize:9, color:"#FFAA22", marginBottom:2 }}>{rem.violation}</div>
              <div style={{ fontSize:9, color:"#888" }}>{rem.remedy}</div>
            </div>
          ))}
        </div>
      )}

      {/* Compliant */}
      {report.compliant?.length > 0 && (
        <div>
          <div style={{ fontSize:9, color:"#44DD88", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>
            ✓ COMPLIANT ({report.compliant.length})
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
            {report.compliant.map((r,i) => (
              <div key={i} style={{ fontSize:9, color:"#446655", padding:"3px 0", fontFamily:"monospace" }}>
                ✓ {r}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
