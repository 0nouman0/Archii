"use client";
import { useState, useRef, useEffect } from "react";

async function callClaude(sys, user) {
  const res = await fetch("/api/claude", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ systemPrompt:sys, userPrompt:user, maxTokens:1000 }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.text;
}

export default function ChatPanel({ svgCode, params, onApplyChange }) {
  const [messages, setMessages] = useState([{
    role:"assistant",
    text:"Ask me to modify the floor plan — e.g. 'Move the kitchen north', 'Make the living room bigger', 'Add a study room', 'Swap bedroom 2 and 3'.",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    if (!svgCode) { setMessages(m => [...m, { role:"assistant", text:"Please generate a floor plan first before requesting modifications." }]); return; }

    setInput("");
    setMessages(m => [...m, { role:"user", text:msg }]);
    setLoading(true);

    try {
      const sys = `You are an architectural AI assistant. The user has a ${params.bhk}BHK floor plan on a ${params.plotW}×${params.plotH}ft ${params.facing}-facing plot in ${params.city}.
Analyse their modification request. Respond ONLY as JSON (no markdown):
{
  "feasible": true/false,
  "vastuImpact": "positive|neutral|negative",
  "changes": ["<specific change 1>", "<specific change 2>"],
  "warnings": ["<concern if any>"],
  "refinementNote": "<single paragraph instruction for SVG regeneration>",
  "summary": "<friendly 1-2 sentence reply>"
}`;
      const raw = await callClaude(sys, `User request: "${msg}"`);
      let parsed;
      try { parsed = JSON.parse(raw.replace(/```json|```/g,"").trim()); }
      catch { parsed = { summary:raw, feasible:true, changes:[], warnings:[], refinementNote:msg, vastuImpact:"neutral" }; }

      setMessages(m => [...m, { role:"assistant", text:parsed.summary, meta:parsed }]);
      if (parsed.feasible && parsed.refinementNote) onApplyChange(parsed.refinementNote);
    } catch(e) {
      setMessages(m => [...m, { role:"assistant", text:`Error: ${e.message}` }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const impactColor = { positive:"#44DD88", neutral:"#888", negative:"#FF5544" };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", gap:10 }}>
      <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:8, paddingRight:4 }}>
        {messages.map((m,i) => (
          <div key={i} style={{ alignSelf:m.role==="user"?"flex-end":"flex-start", maxWidth:"88%" }}>
            <div style={{
              padding:"9px 13px",
              borderRadius: m.role==="user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
              background: m.role==="user" ? "#0E1F36" : "#0C0C1A",
              border:`1px solid ${m.role==="user" ? "#1A4A7A" : "#1A1A2E"}`,
              fontSize:11, color:"#D8D8E8", lineHeight:1.6,
              fontFamily:"system-ui, sans-serif",
            }}>
              {m.text}
              {m.meta?.changes?.length > 0 && (
                <div style={{ marginTop:8, paddingTop:8, borderTop:"1px solid #1A1A2A" }}>
                  {m.meta.changes.map((c,j) => (
                    <div key={j} style={{ fontSize:9, color:"#44DD88", marginBottom:2, fontFamily:"monospace" }}>→ {c}</div>
                  ))}
                  {m.meta.vastuImpact && (
                    <div style={{ marginTop:5, fontSize:9, fontFamily:"monospace" }}>
                      <span style={{ color:"#555" }}>Vastu impact: </span>
                      <span style={{ color:impactColor[m.meta.vastuImpact] }}>{m.meta.vastuImpact}</span>
                    </div>
                  )}
                  {m.meta.warnings?.map((w,j) => (
                    <div key={j} style={{ fontSize:9, color:"#FFAA22", marginTop:2, fontFamily:"monospace" }}>⚠ {w}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf:"flex-start", padding:"9px 13px", background:"#0C0C1A", borderRadius:"12px 12px 12px 3px", border:"1px solid #1A1A2E" }}>
            <span style={{ color:"#444", fontSize:11, fontFamily:"monospace" }}>Analysing</span>
            <span style={{ animation:"blink 1s ease-in-out infinite", color:"#4488FF" }}>…</span>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div style={{ display:"flex", gap:8 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==="Enter" && !e.shiftKey && (e.preventDefault(), send())}
          placeholder={svgCode ? "Modify the floor plan…" : "Generate a plan first"}
          disabled={loading || !svgCode}
          style={{
            flex:1, padding:"9px 13px",
            background:"#080812", border:"1px solid #1E1E2E",
            borderRadius:8, color:"#D8D8E8", fontSize:11,
            outline:"none", fontFamily:"system-ui, sans-serif",
            transition:"border-color 0.2s",
          }}
          onFocus={e=>e.target.style.borderColor="#4488FF"}
          onBlur={e=>e.target.style.borderColor="#1E1E2E"}
        />
        <button
          onClick={send}
          disabled={loading || !svgCode || !input.trim()}
          style={{
            padding:"9px 16px",
            background: (loading || !input.trim()) ? "#0A0A14" : "#0E2040",
            border:`1px solid ${loading ? "#1A1A2E" : "#2A4A7A"}`,
            borderRadius:8, color:"#4488FF",
            fontSize:14, cursor:"pointer", fontWeight:700,
            transition:"all 0.2s",
          }}
        >→</button>
      </div>

      <div style={{ fontSize:9, color:"#2A2A3E", fontFamily:"monospace", textAlign:"center" }}>
        Approved modifications regenerate the plan automatically
      </div>
    </div>
  );
}
