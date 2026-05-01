"use client";

const BELIEF_CRITIC = {
  vastu:     { label:"Vastu Critic",    desc:"Auditing 14 Vastu Shastra rules" },
  islamic:   { label:"Islamic Critic",  desc:"Auditing Islāmī Mīmārī rules" },
  christian: { label:"Christian Critic",desc:"Auditing Sacred Christian rules" },
  universal: { label:"Design Critic",   desc:"Auditing Universal Design rules" },
};

function getAgents(belief) {
  const critic = BELIEF_CRITIC[belief] || BELIEF_CRITIC.vastu;
  return [
    { id:"input",     label:"Input Parser",    icon:"◈", color:"#4488FF", desc:"Validating constraints & regulations" },
    { id:"spatial",   label:"Spatial Planner", icon:"◈", color:"#44DD88", desc:"Computing room layout" },
    { id:"svg",       label:"SVG Renderer",    icon:"◈", color:"#FFAA22", desc:"Generating architectural drawing" },
    { id:"vastu",     label:critic.label,      icon:"◈", color:"#FF8833", desc:critic.desc },
    { id:"cost",      label:"Cost Estimator",  icon:"◈", color:"#CC66FF", desc:"Calculating BOM & cost breakdown" },
    { id:"furniture", label:"Furniture AI",    icon:"◈", color:"#22CCCC", desc:"Auto-placing furniture with clearances" },
  ];
}

export default function AgentPanel({ statuses, activeAgent, scores, belief }) {
  const AGENTS = getAgents(belief || "vastu");
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      {AGENTS.map(ag => {
        const status = statuses[ag.id] || "idle";
        const isActive = activeAgent === ag.id;
        const isDone = status === "done";
        const score = scores?.[ag.id];
        return (
          <div key={ag.id} style={{
            display:"flex", alignItems:"center", gap:10,
            padding:"7px 10px",
            background: isActive ? "#0E1A28" : isDone ? "#0A140A" : "transparent",
            borderTop: `1px solid ${isActive ? ag.color : isDone ? "#1A3A1A" : "#1E1E2E"}`,
            borderRight: `1px solid ${isActive ? ag.color : isDone ? "#1A3A1A" : "#1E1E2E"}`,
            borderBottom: `1px solid ${isActive ? ag.color : isDone ? "#1A3A1A" : "#1E1E2E"}`,
            borderLeft: `3px solid ${isActive || isDone ? ag.color : "#1E1E2E"}`,
            borderRadius:4,
            opacity: status === "idle" ? 0.38 : 1,
            transition:"all 0.25s ease",
          }}>
            <span style={{
              fontSize:14,
              color: ag.color,
              filter: isActive ? `drop-shadow(0 0 5px ${ag.color})` : "none",
              animation: isActive ? "agentPulse 1s ease-in-out infinite" : "none",
            }}>{ag.icon}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{
                fontSize:10, fontWeight:700, color: isDone ? "#BBEEBB" : "#C8C8D8",
                fontFamily:"'Space Grotesk', monospace", letterSpacing:"0.04em",
                textTransform:"uppercase",
              }}>{ag.label}</div>
              <div style={{ fontSize:9, color:"#666", marginTop:1, fontFamily:"monospace" }}>
                {isActive ? ag.desc : isDone ? "✓ complete" : "waiting"}
              </div>
            </div>
            {score !== undefined && (
              <span style={{
                fontSize:11, fontWeight:800,
                color: score >= 80 ? "#44DD88" : score >= 60 ? "#FFAA22" : "#FF6655",
                fontFamily:"monospace",
              }}>{score}%</span>
            )}
            {isActive && (
              <span style={{
                width:6, height:6, borderRadius:"50%",
                background:ag.color,
                animation:"agentBlink 0.7s ease-in-out infinite",
                flexShrink:0,
              }}/>
            )}
            {isDone && !isActive && (
              <span style={{ color:"#44DD88", fontSize:12, flexShrink:0 }}>✓</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
