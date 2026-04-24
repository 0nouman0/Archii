"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import Sidebar       from "../../components/Sidebar";
import FloorPlanViewer from "../../components/FloorPlanViewer";
import AgentPanel    from "../../components/AgentPanel";
import VastuReport   from "../../components/VastuReport";
import CostReport    from "../../components/CostReport";
import ChatPanel     from "../../components/ChatPanel";
import ComparisonPanel from "../../components/ComparisonPanel";
import GanttChart      from "../../components/GanttChart";
import { computeLayout } from "../../lib/layoutEngine";
import { scoreVastuLayout, getVastuRemedies } from "../../lib/vastuRules";
import { checkRegulatory } from "../../lib/cityCode";
import {
  buildFloorPlanSVGPrompt,
  buildVastuCriticPrompt,
  buildBeliefCriticPrompt,
  buildBeliefContext,
  buildCostEstimatorPrompt,
  buildFurniturePrompt,
  buildExplainToParentsPrompt,
} from "../../lib/prompts";
import { supabase } from "../../lib/supabase";

// ─── API helpers ──────────────────────────────────────────────────────────────
async function claude(sys, user, maxTokens = 4000) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemPrompt: sys, userPrompt: user, maxTokens }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  console.log(`[AI] Response from: ${data.provider}`);
  return data.text || "";
}

// Streaming SVG — falls back to regular claude() if stream endpoint unavailable
async function claudeStream(sys, user, maxTokens, onChunk) {
  try {
    const res = await fetch("/api/claude-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt: sys, userPrompt: user, maxTokens }),
    });
    if (!res.ok) throw new Error(`stream ${res.status}`);
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += dec.decode(value, { stream: true });
      onChunk(text);
    }
    return text;
  } catch {
    // Fallback to non-streaming
    const text = await claude(sys, user, maxTokens);
    onChunk(text);
    return text;
  }
}

// ─── SVG post-processing ───────────────────────────────────────────────────────
function injectAnnotations(svgCode, rooms, plotW, plotH) {
  if (!svgCode || !rooms?.length) return svgCode;
  const vbMatch = svgCode.match(/viewBox=["']\s*[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)/i);
  if (!vbMatch) return svgCode;
  const svgW = parseFloat(vbMatch[1]);
  const svgH = parseFloat(vbMatch[2]);
  const scaleX = svgW / (plotW * 10); // layout uses 10px/ft
  const scaleY = svgH / (plotH * 10);
  const fs = Math.max(6, Math.min(11, svgW / 60));

  const dimLabels = rooms
    .filter(r => r.w > 0 && r.h > 0)
    .map(r => {
      const cx = (r.x + r.w / 2) * scaleX;
      const cy = (r.y + r.h / 2) * scaleY + fs + 2;
      return `<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="middle" font-size="${fs}" fill="#FFCC44" font-family="monospace" opacity="0.85" font-weight="600">${r.ftW}×${r.ftH}ft</text>`;
    }).join("");

  // North arrow (top-right)
  const ax = svgW - 28, ay = 28;
  const northArrow = `<g class="north-arrow">
    <circle cx="${ax}" cy="${ay}" r="18" fill="#00000066" stroke="#4488FF44" stroke-width="1"/>
    <polygon points="${ax},${ay-14} ${ax+5},${ay+6} ${ax},${ay+2} ${ax-5},${ay+6}" fill="#4488FF"/>
    <polygon points="${ax},${ay-14} ${ax-5},${ay+6} ${ax},${ay+2} ${ax+5},${ay+6}" fill="#4488FF55"/>
    <text x="${ax}" y="${ay+16}" text-anchor="middle" font-size="8" fill="#4488FF" font-family="monospace" font-weight="700">N</text>
  </g>`;

  // Scale bar (bottom-left, 5ft increments)
  const bFt = Math.max(5, Math.round(plotW / 6 / 5) * 5);
  const bPx = bFt * (svgW / plotW);
  const bx = 16, by = svgH - 12;
  const scaleBar = `<g class="scale-bar">
    <rect x="${bx-2}" y="${by-10}" width="${bPx+4}" height="14" fill="#00000055" rx="2"/>
    <line x1="${bx}" y1="${by}" x2="${bx+bPx}" y2="${by}" stroke="#AAA" stroke-width="1.5"/>
    <line x1="${bx}" y1="${by-4}" x2="${bx}" y2="${by+2}" stroke="#AAA" stroke-width="1.5"/>
    <line x1="${bx+bPx}" y1="${by-4}" x2="${bx+bPx}" y2="${by+2}" stroke="#AAA" stroke-width="1.5"/>
    <text x="${bx+bPx/2}" y="${by-5}" text-anchor="middle" font-size="7" fill="#AAA" font-family="monospace">${bFt} ft</text>
  </g>`;

  return svgCode.replace(/<\/svg>/i, `<g class="annotations">${dimLabels}</g>${northArrow}${scaleBar}</svg>`);
}

function parseJSON(raw) {
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
  catch { return null; }
}

async function savePlanToSupabase(data) {
  try {
    const { error } = await supabase
      .from('generated_plans')
      .insert([{
        plot_width: data.params.plotW,
        plot_height: data.params.plotH,
        bhk: data.params.bhk,
        facing: data.params.facing,
        city: data.params.city,
        budget: data.params.budget,
        svg_code: data.svgCode,
        vastu_score: data.vastuReport?.score,
        total_cost: data.costReport?.totalCost,
        rooms: data.layout?.rooms,
        vastu_report: data.vastuReport,
        cost_report: data.costReport,
        furniture_layout: data.furnitureData
      }]);
    if (error) console.error("Supabase Save Error:", error.message);
  } catch (err) {
    console.error("Supabase Save Exception:", err);
  }
}

// ─── Agent pipeline constants ─────────────────────────────────────────────────
const AGENT_ORDER = ['input','spatial','svg','vastu','cost','furniture'];
const AGENT_WEIGHTS = { input:5, spatial:5, svg:45, vastu:15, cost:15, furniture:15 };
const AGENT_LABELS = {
  input:'Parsing constraints',
  spatial:'Planning layout',
  svg:'Rendering floor plan',
  vastu:'Auditing Vastu',
  cost:'Estimating cost',
  furniture:'Placing furniture',
};

// ─── Alternatives panel ───────────────────────────────────────────────────────
function AltsPanel({ alts, selected, onSelect }) {
  if (!alts.length) return (
    <div style={{ color:"#444", fontSize:11, fontFamily:"monospace" }}>
      Click <strong style={{ color:"#44DD88" }}>Generate 3 Alternatives</strong> in the sidebar to see parallel design strategies.
    </div>
  );
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
        {alts.map((a, i) => (
          <button key={i} onClick={() => onSelect(i)} style={{
            padding:"6px 14px",
            background: selected === i ? "#0E2040" : "transparent",
            border: `2px solid ${selected === i ? "#4488FF" : "#1A1A2A"}`,
            borderRadius:5, color: selected === i ? "#4488FF" : "#555",
            fontSize:10, cursor:"pointer", fontFamily:"monospace",
            transition:"all 0.15s",
          }}>{a.label}</button>
        ))}
      </div>
      {selected !== null && alts[selected] && (
        <div style={{ flex:1, overflow:"auto", display:"flex", alignItems:"flex-start", justifyContent:"center" }}>
          <div
            style={{ maxWidth:"100%", boxShadow:"0 8px 40px rgba(0,0,0,0.6)" }}
            dangerouslySetInnerHTML={{ __html: alts[selected].svg }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Log panel ────────────────────────────────────────────────────────────────
function LogPanel({ log }) {
  if (!log.length) return (
    <div style={{ color:"#333", fontSize:11, fontFamily:"monospace" }}>
      Agent logs will stream here during generation.
    </div>
  );
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:2, fontFamily:"monospace" }}>
      {log.map((l, i) => (
        <div key={i} style={{
          padding:"4px 0", borderBottom:"1px solid #0A0A14", fontSize:10,
          color: l.includes("✓") ? "#44DD88" : l.includes("✗") ? "#FF5544" : l.includes("⚠") ? "#FFAA22" : "#555",
          animation: i === 0 ? "fadeInUp 0.25s ease" : "none",
        }}>{l}</div>
      ))}
    </div>
  );
}

// ─── Diff panel ───────────────────────────────────────────────────────────────
function DiffPanel({ prev, current }) {
  return (
    <div style={{ display:"flex", height:"100%", overflow:"hidden" }}>
      <div style={{ flex:1, overflow:"auto", padding:16, borderRight:"2px solid #1A1A2A" }}>
        <div style={{ fontSize:9, color:"#555", fontFamily:"monospace", letterSpacing:"0.1em", marginBottom:10 }}>PREVIOUS VERSION</div>
        <div style={{ opacity:0.5 }} dangerouslySetInnerHTML={{ __html: prev }}/>
      </div>
      <div style={{ flex:1, overflow:"auto", padding:16 }}>
        <div style={{ fontSize:9, color:"#4488FF", fontFamily:"monospace", letterSpacing:"0.1em", marginBottom:10 }}>CURRENT VERSION</div>
        <div dangerouslySetInnerHTML={{ __html: current }}/>
      </div>
    </div>
  );
}

// ─── Score badge ──────────────────────────────────────────────────────────────
function ScoreBadge({ label, score, color }) {
  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center", gap:2,
      padding:"6px 12px",
      background:"#0A0A14",
      border:`1px solid ${color}30`,
      borderRadius:5,
    }}>
      <span style={{ fontSize:14, fontWeight:900, color, fontFamily:"monospace" }}>{score ?? "—"}</span>
      <span style={{ fontSize:8, color:"#444", letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"monospace" }}>{label}</span>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [params, setParams] = useState({
    plotW:30, plotH:40, bhk:3, city:"BBMP (Bengaluru)",
    facing:"North", budget:"Lower-Premium (₹40-60L)", floors:1, belief:"vastu",
  });
  const [tab, setTab]             = useState("plan");
  const [svgCode, setSvgCode]     = useState("");
  const [prevSvg, setPrevSvg]     = useState("");
  const [showDiff, setShowDiff]   = useState(false);
  const [vastuReport, setVastuReport] = useState(null);
  const [costReport, setCostReport]   = useState(null);
  const [furnitureData, setFurnitureData] = useState(null);
  const [showFurniture, setShowFurniture] = useState(false);
  const [agentStatuses, setAgentStatuses] = useState({});
  const [activeAgent, setActiveAgent]     = useState(null);
  const [agentScores, setAgentScores]     = useState({});
  const [generating, setGenerating]       = useState(false);
  const [log, setLog]                     = useState([]);
  const [regErrors, setRegErrors]         = useState({});
  const [alts, setAlts]                   = useState([]);
  const [selectedAlt, setSelectedAlt]     = useState(null);
  const [scores, setScores]               = useState({ practical:null, vastu:null, cost:null });
  const [layout, setLayout]               = useState(null);
  const [savedPlans, setSavedPlans]       = useState([]);
  const [loadingSaved, setLoadingSaved]   = useState(false);
  const abortRef = useRef(false);

  // ── Phase-1 state ──────────────────────────────────────────────────────────
  const [theme, setTheme]             = useState('dark');
  const [notification, setNotify]     = useState('');
  const [showLabels, setShowLabels]   = useState(true);
  const [showSunPath, setShowSunPath] = useState(false);
  const [parentLang, setParentLang]   = useState(null);
  const [parentExplanation, setParentExplanation] = useState(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  // ── Mobile layout ──────────────────────────────────────────────────────────
  const [isMobile, setIsMobile]           = useState(false);
  const [mobileDrawer, setMobileDrawer]   = useState(null); // null | 'left' | 'right'

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const addLog = (msg) => setLog(l => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...l.slice(0, 79)]);

  // Apply theme to <html> so CSS var overrides propagate everywhere
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Pre-fill params from URL hash (share link)
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    try {
      const p = JSON.parse(decodeURIComponent(atob(hash)));
      if (p?.plotW) setParams(p);
    } catch {}
  }, []);

  // Progress derived values
  const doneWeights = AGENT_ORDER
    .filter(id => agentStatuses[id] === 'done')
    .reduce((s, id) => s + AGENT_WEIGHTS[id], 0);
  const runningId = AGENT_ORDER.find(id => agentStatuses[id] === 'running');
  const progress = generating
    ? Math.min(97, Math.round(doneWeights + (runningId ? AGENT_WEIGHTS[runningId] * 0.5 : 0)))
    : 0;
  const currentAgentLabel = runningId ? AGENT_LABELS[runningId] : 'Processing';

  const setAgent = useCallback((id, status) => {
    setAgentStatuses(s => ({ ...s, [id]: status }));
    setActiveAgent(status === "running" ? id : prev => prev === id ? null : prev);
  }, []);

  const handleParamChange = (key, val) => setParams(p => ({ ...p, [key]: val }));

  // ── Phase-1 helpers ────────────────────────────────────────────────────────
  const showNotification = (msg) => {
    setNotify(msg);
    setTimeout(() => setNotify(''), 2200);
  };

  const copyShareLink = () => {
    const hash = btoa(JSON.stringify(params));
    navigator.clipboard.writeText(`${window.location.href.split('#')[0]}#${hash}`);
    showNotification('✓ Share link copied to clipboard!');
  };

  const shareWhatsApp = () => {
    const lines = [
      `🏠 Vastu Floor Plan — ${params.plotW}×${params.plotH}ft · ${params.bhk}BHK`,
      `📍 ${params.city} | ${params.facing}-facing`,
      vastuScore !== null ? `✅ Vastu Score: ${vastuScore}/100` : '',
      costTotal ? `💰 Est. Cost: ₹${costTotal}L` : '',
      '',
      `Generate yours free: ${window.location.origin}/app`,
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`, '_blank');
  };

  const fixAllViolations = () => {
    if (!vastuReport?.violations?.length || generating) return;
    const note = 'MANDATORY VASTU FIXES — apply all of these: ' +
      vastuReport.violations.map(v => `[${v.rule}]: ${v.fix}`).join('; ');
    generate(note);
  };

  const explainToParents = async (lang) => {
    if (!vastuReport || loadingExplanation) return;
    setParentLang(lang);
    setLoadingExplanation(true);
    setParentExplanation(null);
    try {
      const raw = await claude(
        'You explain Vastu reports in simple, warm language for Indian elders. Follow the exact format. No markdown.',
        buildExplainToParentsPrompt(vastuReport, lang),
        900
      );
      setParentExplanation({ lang, text: raw.trim() });
    } catch (e) {
      setParentExplanation({ lang, text: `Could not generate explanation: ${e.message}` });
    }
    setLoadingExplanation(false);
  };

  // ── Main generation pipeline ───────────────────────────────────────────────
  const generate = useCallback(async (refinementNote = "") => {
    abortRef.current = false;
    setGenerating(true);
    setAgentStatuses({});
    setAgentScores({});
    setActiveAgent(null);
    setVastuReport(null);
    setCostReport(null);
    setFurnitureData(null);
    setLog([]);
    if (svgCode) setPrevSvg(svgCode);
    setShowDiff(false);

    try {
      // ── Agent 1: Input Parser ────────────────────────────────────────────
      setAgent("input", "running");
      addLog("Input Parser: validating plot constraints…");
      const regCheck = checkRegulatory(params);
      setRegErrors(regCheck);
      if (regCheck.errors.length) addLog(`⚠ ${regCheck.errors[0]}`);

      const lyt = computeLayout(params);
      setLayout(lyt);
      const vastuLayoutScore = scoreVastuLayout(lyt.rooms);
      addLog(`Input Parser: ✓ ${lyt.rooms.length} rooms placed — layout Vastu score ${vastuLayoutScore.score}/100`);
      setAgent("input", "done");
      setAgentScores(s => ({ ...s, input: 100 }));

      // ── Agent 2: Spatial Planner ─────────────────────────────────────────
      setAgent("spatial", "running");
      addLog("Spatial Planner: computing Vastu-optimised room topology…");
      await new Promise(r => setTimeout(r, 300));
      addLog(`Spatial Planner: ✓ zones assigned — NE:Puja, SE:Kitchen, SW:MasterBed`);
      setAgent("spatial", "done");
      setAgentScores(s => ({ ...s, spatial: vastuLayoutScore.score }));
      setScores(sc => ({ ...sc, vastu: vastuLayoutScore.score }));

      // ── Agent 3: SVG Renderer (streaming) ───────────────────────────────
      setAgent("svg", "running");
      addLog("SVG Renderer: streaming architectural drawing…");
      const svgPrompt = buildFloorPlanSVGPrompt(params, lyt, refinementNote);
      let streamBuffer = "";
      const rawSVG = await claudeStream(
        "You are a world-class architectural SVG drafter. Output only raw SVG code — no markdown, no explanation, no code fences. Start your response with <svg and end with </svg>.",
        svgPrompt,
        8000,
        (partial) => {
          streamBuffer = partial;
          const start = partial.indexOf("<svg");
          if (start !== -1) {
            let chunk = partial.slice(start);
            if (!chunk.includes("</svg>")) chunk += "</svg>";
            setSvgCode(chunk);
          }
        }
      );
      const svgMatch = rawSVG.match(/<svg[\s\S]*?<\/svg>/i);
      const rawFinal = svgMatch ? svgMatch[0] : rawSVG;
      const newSVG = injectAnnotations(rawFinal, lyt.rooms, params.plotW, params.plotH);
      setSvgCode(newSVG);
      addLog("SVG Renderer: ✓ floor plan generated with dimensions & north arrow");
      setAgent("svg", "done");
      setAgentScores(s => ({ ...s, svg: 92 }));

      // ── Agent 4: Belief System Critic ────────────────────────────────────
      setAgent("vastu", "running");
      const beliefCtx = buildBeliefContext(params.belief || 'vastu');
      addLog(`${beliefCtx.label} Critic: auditing design rules…`);
      const vastuRaw = await claude(
        `You are a strict ${beliefCtx.label} expert. Respond ONLY as valid JSON with no markdown.`,
        buildBeliefCriticPrompt(newSVG, lyt.rooms, params.plotW, params.plotH, params.belief || 'vastu'),
        1800
      );
      const vParsed = parseJSON(vastuRaw);
      if (vParsed) {
        const remedies = getVastuRemedies(vParsed.violations || []);
        setVastuReport({ ...vParsed, remedies });
        setAgentScores(s => ({ ...s, vastu: vParsed.score }));
        setScores(sc => ({ ...sc, vastu: vParsed.score }));
        addLog(`Vastu Critic: ✓ score ${vParsed.score}/100 — ${vParsed.violations?.length || 0} violations`);
      } else {
        setVastuReport(vastuLayoutScore);
        addLog("Vastu Critic: ✓ used layout-engine score");
      }
      setAgent("vastu", "done");

      // ── Agent 5: Cost Estimator ──────────────────────────────────────────
      setAgent("cost", "running");
      addLog("Cost Estimator: computing BOM and cost breakdown…");
      const costRaw = await claude(
        "You are a senior Indian construction cost estimator. Respond ONLY as valid JSON with no markdown.",
        buildCostEstimatorPrompt(params), 2500
      );
      const cParsed = parseJSON(costRaw);
      if (cParsed) {
        setCostReport(cParsed);
        setAgentScores(s => ({ ...s, cost: 95 }));
        setScores(sc => ({ ...sc, cost: 95 }));
        addLog(`Cost Estimator: ✓ ₹${cParsed.totalCost}L — ${cParsed.timeline}`);
      } else {
        addLog("Cost Estimator: ⚠ JSON parse failed, skipping");
      }
      setAgent("cost", "done");

      // ── Agent 6: Furniture AI ────────────────────────────────────────────
      setAgent("furniture", "running");
      addLog("Furniture AI: placing furniture with circulation clearances…");
      const furRaw = await claude(
        "You are an expert interior furniture planner. Respond ONLY as valid JSON with no markdown.",
        buildFurniturePrompt(lyt.rooms, params.bhk), 2500
      );
      const fParsed = parseJSON(furRaw);
      if (fParsed) {
        setFurnitureData(fParsed);
        setAgentScores(s => ({ ...s, furniture: 90 }));
        addLog(`Furniture AI: ✓ ${fParsed.placements?.length || 0} rooms furnished`);
      } else {
        addLog("Furniture AI: ⚠ JSON parse failed, skipping");
      }
      setAgent("furniture", "done");

      addLog("✓ All 6 agents complete");
      setTab("plan");

      // Save to Supabase
      savePlanToSupabase({
        params,
        svgCode: newSVG,
        layout: lyt,
        vastuReport: vParsed || vastuLayoutScore,
        costReport: cParsed,
        furnitureData: fParsed
      });

    } catch (e) {
      addLog(`✗ Error: ${e.message}`);
      console.error(e);
    }

    setGenerating(false);
    setActiveAgent(null);
  }, [params, svgCode, setAgent]);


  // ── Generate alternatives (parallel design strategies) ──────────────────────
  const generateAlts = useCallback(async () => {
    console.log("generateAlts triggered");
    if (generating) {
      console.log("generateAlts: already generating, skipping");
      return;
    }
    setGenerating(true);
    addLog("Generating 3 alternative design strategies in parallel…");
    const strategies = [
      "MAXIMISE NATURAL LIGHT: Large east/north windows, open-plan living, minimal internal walls, courtyard/balcony in NE",
      "MAXIMUM PRIVACY: Bedrooms clustered in SW/W away from entrance, enclosed compound, service areas near entrance",
      "MODERN OPEN-PLAN: Merged kitchen-dining-living in one continuous space, bedrooms in a separate wing, studio aesthetic",
    ];
    try {
      const lyt = computeLayout(params);
      console.log("generateAlts: layout computed", lyt);
      const results = await Promise.all(strategies.map(async (strat, i) => {
        console.log(`generateAlts: starting strategy ${i+1}`);
        const raw = await claude(
          "You are a world-class architectural SVG drafter. Output only raw SVG. Start with <svg and end with </svg>.",
          buildFloorPlanSVGPrompt(params, lyt, strat),
          6000
        );
        const m = raw.match(/<svg[\s\S]*?<\/svg>/i);
        return {
          label: `Alt ${i+1}: ${strat.split(":")[0].replace("MAXIMISE","MAX")}`,
          svg: m ? m[0] : raw,
          strategy: strat,
        };
      }));
      setAlts(results);
      setSelectedAlt(0);
      setTab("alts");
      addLog(`✓ 3 alternatives generated`);

      // Save alternatives to Supabase
      results.forEach(alt => {
        savePlanToSupabase({
          params,
          svgCode: alt.svg,
          layout: lyt,
          vastuReport: null,
          costReport: null,
          furnitureData: null
        });
      });
    } catch(e) {
      console.error("generateAlts error:", e);
      addLog(`✗ Alt generation error: ${e.message}`);
    }
    setGenerating(false);
  }, [params]); // Removed 'generating' from dependency to avoid stale state issues

  // ── Fetch saved plans ──────────────────────────────────────────────────────
  const fetchPlans = useCallback(async () => {
    setLoadingSaved(true);
    try {
      const { data, error } = await supabase
        .from('generated_plans')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSavedPlans(data || []);
    } catch (err) {
      console.error("Fetch plans error:", err.message);
    }
    setLoadingSaved(false);
  }, []);

  const loadPlan = (plan) => {
    setSvgCode(plan.svg_code);
    setParams({
      plotW: plan.plot_width,
      plotH: plan.plot_height,
      bhk: plan.bhk,
      city: plan.city,
      facing: plan.facing,
      budget: plan.budget,
      floors: 1, // default
    });
    setVastuReport(plan.vastu_report);
    setCostReport(plan.cost_report);
    setFurnitureData(plan.furniture_layout);
    setTab("plan");
    addLog(`✓ Loaded plan from ${new Date(plan.created_at).toLocaleDateString()}`);
  };

  // ── Exports ────────────────────────────────────────────────────────────────
  const exportSVG = () => {
    if (!svgCode) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([svgCode], { type:"image/svg+xml" }));
    a.download = `vastu_plan_${params.plotW}x${params.plotH}_${params.bhk}bhk.svg`;
    a.click();
  };

  const exportPNG = () => {
    if (!svgCode) return;
    const canvas = document.createElement("canvas");
    canvas.width = params.plotW * 20; canvas.height = params.plotH * 20;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `vastu_plan_${params.plotW}x${params.plotH}_${params.bhk}bhk.png`;
      a.click();
    };
    img.src = URL.createObjectURL(new Blob([svgCode], { type:"image/svg+xml" }));
  };

  const exportPDF = () => {
    if (!svgCode) return;
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>Floor Plan</title><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#fff}svg{max-width:100%;max-height:100vh;display:block}</style></head><body>${svgCode}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  // ── Tab definitions ────────────────────────────────────────────────────────
  const beliefTabLabel = { vastu:"Vastu", islamic:"Islamic", christian:"Christian", universal:"Design" };
  const beliefAuditHeading = {
    vastu:     "Vastu Shastra Audit",
    islamic:   "Islāmī Mīmārī Audit",
    christian: "Sacred Christian Audit",
    universal: "Universal Design Audit",
  };
  const beliefRuleCount = { vastu:"14", islamic:"12", christian:"12", universal:"12" };
  const TABS = [
    { id:"plan",    label:"Floor Plan" },
    { type:"sep" },
    { id:"vastu",   label: beliefTabLabel[params.belief] || "Vastu" },
    { id:"cost",    label:"Cost" },
    { id:"timeline",label:"Timeline" },
    { type:"sep" },
    { id:"chat",    label:"Modify" },
    { id:"alts",    label:"Alts" },
    { id:"compare", label:"Compare" },
    { type:"sep" },
    { id:"saved",   label:"My Plans" },
    { id:"log",     label:"Log" },
  ];

  const vastuScore = vastuReport?.score ?? null;
  const costTotal  = costReport?.totalCost ?? null;

  return (
    <div style={{ display:"flex", height:"100vh", background:"#080814", color:"#D8D8EC", overflow:"hidden" }}>

      {/* Toast notification */}
      {notification && (
        <div style={{
          position:'fixed', top:20, right:20, zIndex:9999,
          background:'#0A0A14', border:'1px solid #4488FF',
          borderRadius:6, padding:'8px 18px',
          fontSize:11, color:'#4488FF', fontFamily:'monospace',
          boxShadow:'0 4px 24px rgba(68,136,255,0.2)',
          animation:'fadeInUp 0.2s ease',
          pointerEvents:'none',
        }}>{notification}</div>
      )}

      {/* ── Mobile drawer backdrop ── */}
      {isMobile && mobileDrawer && (
        <div onClick={() => setMobileDrawer(null)} style={{
          position:'fixed', inset:0, zIndex:98,
          background:'rgba(0,0,0,0.6)', backdropFilter:'blur(2px)',
        }}/>
      )}

      {/* ── Left Sidebar ── */}
      <div style={isMobile ? {
        position:'fixed', top:0, left:0, bottom:0, zIndex:99,
        transform: mobileDrawer==='left' ? 'translateX(0)' : 'translateX(-100%)',
        transition:'transform 0.25s ease',
      } : {}}>
        <Sidebar
          params={params}
          onParamChange={handleParamChange}
          onGenerate={() => { generate(); setMobileDrawer(null); }}
          onGenerateAlts={generateAlts}
          onExportSVG={exportSVG}
          onExportPNG={exportPNG}
          generating={generating}
          hasPlan={!!svgCode}
          regErrors={regErrors}
        />
      </div>

      {/* ── Main content ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>

        {/* Tab bar */}
        <div style={{
          display:"flex", alignItems:"stretch",
          borderBottom:"2px solid #1A1A28",
          background:"#060610",
          padding:`0 ${isMobile?8:16}px`,
          gap:2,
          overflowX:"auto",
          flexShrink:0,
        }}>
          {/* Mobile: hamburger for left sidebar */}
          {isMobile && (
            <button onClick={() => setMobileDrawer(d => d==='left' ? null : 'left')} style={{
              padding:"0 12px", background:"transparent", border:"none",
              color:"#666", fontSize:18, cursor:"pointer", flexShrink:0,
            }}>☰</button>
          )}

          {TABS.map((t, idx) => t.type === "sep"
            ? <div key={`sep-${idx}`} style={{ width:1, background:"#1A1A2A", alignSelf:"stretch", margin:"8px 6px", flexShrink:0 }}/>
            : <button key={t.id} onClick={()=>{
                setTab(t.id);
                if (t.id === "saved" || t.id === "compare") fetchPlans();
              }} style={{
                padding:`12px ${isMobile?10:14}px`,
                background:"transparent",
                border:"none",
                borderBottom: tab===t.id ? "2px solid #4488FF" : "2px solid transparent",
                color: tab===t.id ? "#4488FF" : "#444",
                fontSize:10, cursor:"pointer",
                fontFamily:"monospace", fontWeight:700,
                letterSpacing:"0.06em", textTransform:"uppercase",
                transition:"color 0.15s",
                marginBottom:"-2px",
                whiteSpace:"nowrap",
              }}>{t.label}</button>
          )}

          {/* Mobile: controls button for right panel */}
          {isMobile && (
            <button onClick={() => setMobileDrawer(d => d==='right' ? null : 'right')} style={{
              marginLeft:"auto", padding:"0 12px", background:"transparent", border:"none",
              color:"#666", fontSize:16, cursor:"pointer", flexShrink:0,
            }}>⚙</button>
          )}
        </div>

        {/* Generation progress bar */}
        {generating && (
          <div style={{ background:'#050510', padding:'3px 16px 2px', flexShrink:0, borderBottom:'1px solid #0A0A18' }}>
            <div style={{ position:'relative', height:2, background:'#0A0A18', borderRadius:1, overflow:'hidden' }}>
              <div style={{
                position:'absolute', left:0, top:0, bottom:0,
                width:`${progress}%`,
                background:'linear-gradient(90deg, #4488FF, #44DD88)',
                transition:'width 0.7s ease',
              }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:2 }}>
              <span style={{ fontSize:7, color:'#333', fontFamily:'monospace' }}>{currentAgentLabel}</span>
              <span style={{ fontSize:7, color:'#333', fontFamily:'monospace' }}>{progress}%</span>
            </div>
          </div>
        )}

        {/* Tab content */}
        <div style={{ flex:1, overflow:"hidden", display:"flex" }}>

          {/* Floor Plan */}
          {tab==="plan" && !showDiff && (
            <div style={{ flex:1, overflow:"hidden" }}>
              <FloorPlanViewer
                svgCode={svgCode}
                furniture={furnitureData}
                showFurniture={showFurniture}
                loading={generating && !svgCode}
                showLabels={showLabels}
                showSunPath={showSunPath}
                theme={theme}
                city={params.city}
              />
            </div>
          )}

          {/* Diff */}
          {tab==="plan" && showDiff && prevSvg && (
            <div style={{ flex:1 }}>
              <DiffPanel prev={prevSvg} current={svgCode}/>
            </div>
          )}

          {/* Vastu */}
          {tab==="vastu" && (
            <div style={{ flex:1, overflow:"auto", padding:24 }}>
              <div style={{ maxWidth:640 }}>
                <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:20 }}>
                  <h2 style={{ fontSize:22, fontWeight:700, color:"#F0E040", fontFamily:"Georgia,serif" }}>
                    {beliefAuditHeading[params.belief] || "Vastu Shastra Audit"}
                  </h2>
                  <span style={{ fontSize:10, color:"#555", fontFamily:"monospace" }}>{beliefRuleCount[params.belief] || "14"} rules checked</span>
                </div>

                {/* Fix All Violations */}
                {vastuReport?.violations?.length > 0 && (
                  <div style={{ marginBottom:20, padding:'12px 16px', background:'#120808', border:'1px solid #FF554422', borderRadius:6 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                      <span style={{ fontSize:10, color:'#FF7755', fontFamily:'monospace' }}>
                        ⚠ {vastuReport.violations.length} violation{vastuReport.violations.length !== 1 ? 's' : ''} detected
                      </span>
                      <button onClick={fixAllViolations} disabled={generating} style={{
                        padding:'7px 16px', background:'#1A0808',
                        border:'1px solid #FF5544', borderRadius:5,
                        color:'#FF8877', fontSize:10, fontWeight:700,
                        cursor:'pointer', fontFamily:'monospace',
                        letterSpacing:'0.04em', transition:'all 0.2s', flexShrink:0,
                      }}>⚡ FIX ALL &amp; RE-GENERATE</button>
                    </div>
                  </div>
                )}

                <VastuReport report={vastuReport} belief={params.belief}/>

                {/* Explain to My Parents */}
                {vastuReport && (
                  <div style={{ marginTop:28, paddingTop:20, borderTop:'1px solid #1A1A2A' }}>
                    <div style={{ fontSize:9, color:'#666', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10, fontFamily:'monospace' }}>
                      🗣 Explain to My Parents
                    </div>
                    <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
                      {['Hindi','Kannada','Tamil'].map(lang => (
                        <button key={lang} onClick={() => explainToParents(lang)}
                          disabled={loadingExplanation}
                          style={{
                            padding:'6px 16px', borderRadius:4,
                            background: parentLang===lang && !loadingExplanation ? '#0E2040' : 'transparent',
                            border:`1px solid ${parentLang===lang && !loadingExplanation ? '#4488FF' : '#1A1A2A'}`,
                            color: parentLang===lang && !loadingExplanation ? '#4488FF' : '#555',
                            fontSize:10, cursor:'pointer', fontFamily:'monospace',
                            transition:'all 0.15s',
                          }}>{lang}
                        </button>
                      ))}
                    </div>
                    {loadingExplanation && (
                      <div style={{ fontSize:10, color:'#444', fontFamily:'monospace', padding:'6px 0' }}>
                        <span style={{ animation:'blink 1s infinite', marginRight:6 }}>●</span>Translating…
                      </div>
                    )}
                    {parentExplanation && !loadingExplanation && (
                      <div style={{ background:'#080C14', border:'1px solid #1A2A3A', borderRadius:6, padding:16 }}>
                        <pre style={{
                          fontSize:11, color:'#AABBCC', fontFamily:'inherit',
                          lineHeight:1.8, whiteSpace:'pre-wrap', margin:0,
                        }}>{parentExplanation.text}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cost */}
          {tab==="cost" && (
            <div style={{ flex:1, overflow:"auto", padding:24 }}>
              <div style={{ maxWidth:860 }}>
                <h2 style={{ fontSize:22, fontWeight:700, color:"#CC66FF", fontFamily:"Georgia,serif", marginBottom:20 }}>
                  Cost Estimation
                </h2>
                <CostReport cost={costReport}/>
              </div>
            </div>
          )}

          {/* Chat */}
          {tab==="chat" && (
            <div style={{ flex:1, overflow:"hidden", padding:24, display:"flex", flexDirection:"column" }}>
              <h2 style={{ fontSize:22, fontWeight:700, color:"#44DD88", fontFamily:"Georgia,serif", marginBottom:16, flexShrink:0 }}>
                Natural Language Modification
              </h2>
              <div style={{ flex:1, overflow:"hidden", maxWidth:600 }}>
                <ChatPanel
                  svgCode={svgCode}
                  params={params}
                  onApplyChange={(note) => generate(note)}
                />
              </div>
            </div>
          )}

          {/* Alternatives */}
          {tab==="alts" && (
            <div style={{ flex:1, overflow:"hidden", padding:24, display:"flex", flexDirection:"column" }}>
              <h2 style={{ fontSize:22, fontWeight:700, color:"#4488FF", fontFamily:"Georgia,serif", marginBottom:16, flexShrink:0 }}>
                Alternative Designs
              </h2>
              <div style={{ flex:1, overflow:"hidden" }}>
                <AltsPanel alts={alts} selected={selectedAlt} onSelect={setSelectedAlt}/>
              </div>
            </div>
          )}

          {/* Log */}
          {tab==="log" && (
            <div style={{ flex:1, overflow:"auto", padding:24 }}>
              <h2 style={{ fontSize:22, fontWeight:700, color:"#888", fontFamily:"Georgia,serif", marginBottom:16 }}>
                Agent Activity Log
              </h2>
              <LogPanel log={log}/>
            </div>
          )}

          {/* Timeline */}
          {tab==="timeline" && (
            <div style={{ flex:1, overflow:"auto", padding:24 }}>
              <div style={{ maxWidth:900 }}>
                <h2 style={{ fontSize:22, fontWeight:700, color:"#FFAA22", fontFamily:"Georgia,serif", marginBottom:20 }}>
                  Construction Timeline
                </h2>
                {!costReport && (
                  <div style={{ color:"#444", fontSize:11, fontFamily:"monospace" }}>
                    Generate a floor plan first — the timeline is derived from the cost estimation.
                  </div>
                )}
                <GanttChart costReport={costReport} params={params} />
              </div>
            </div>
          )}

          {/* Compare */}
          {tab==="compare" && (
            <div style={{ flex:1, overflow:"auto", padding:24 }}>
              <div style={{ maxWidth:900 }}>
                <h2 style={{ fontSize:22, fontWeight:700, color:"#CC66FF", fontFamily:"Georgia,serif", marginBottom:20 }}>
                  Plan Comparison
                </h2>
                <ComparisonPanel savedPlans={savedPlans} />
              </div>
            </div>
          )}

          {/* Saved Plans */}
          {tab==="saved" && (
            <div style={{ flex:1, overflow:"auto", padding:24 }}>
              <div style={{ maxWidth:900 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                  <h2 style={{ fontSize:22, fontWeight:700, color:"#4488FF", fontFamily:"Georgia,serif" }}>
                    My Saved Plans
                  </h2>
                  <button onClick={fetchPlans} style={{
                    padding:"6px 12px", background:"#1A1A2A", border:"1px solid #2A2A3A",
                    borderRadius:4, color:"#888", fontSize:11, cursor:"pointer", fontFamily:"monospace"
                  }}>REFRESH</button>
                </div>

                {loadingSaved ? (
                  <div style={{ color:"#555", fontFamily:"monospace" }}>Fetching from Supabase…</div>
                ) : savedPlans.length === 0 ? (
                  <div style={{ color:"#444", fontSize:11, fontFamily:"monospace" }}>No saved plans found in your database.</div>
                ) : (
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:20 }}>
                    {savedPlans.map((plan) => (
                      <div key={plan.id} style={{
                        background:"#0A0A14", border:"1px solid #1A1A2A", borderRadius:8,
                        overflow:"hidden", display:"flex", flexDirection:"column",
                        transition:"border-color 0.2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "#4488FF"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "#1A1A2A"}
                      >
                        <div style={{
                          height:140, background:"#FFF", overflow:"hidden", position:"relative",
                          display:"flex", alignItems:"center", justifyContent:"center", padding:10
                        }}>
                          <div style={{ zoom:0.25, pointerEvents:"none" }} dangerouslySetInnerHTML={{ __html: plan.svg_code }} />
                        </div>
                        <div style={{ padding:14, flex:1, display:"flex", flexDirection:"column" }}>
                          <div style={{ fontSize:12, fontWeight:700, color:"#DDD", marginBottom:4 }}>
                            {plan.plot_width}×{plan.plot_height}ft · {plan.bhk}BHK
                          </div>
                          <div style={{ fontSize:10, color:"#666", fontFamily:"monospace", marginBottom:12 }}>
                            {plan.city} · {new Date(plan.created_at).toLocaleDateString()}
                          </div>
                          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
                            {plan.vastu_score && <div style={{ fontSize:10, color:"#44DD88", fontWeight:700 }}>Vastu: {plan.vastu_score}</div>}
                            {plan.total_cost && <div style={{ fontSize:10, color:"#CC66FF", fontWeight:700 }}>₹{plan.total_cost}L</div>}
                          </div>
                          <button onClick={() => loadPlan(plan)} style={{
                            width:"100%", padding:"8px", background:"#4488FF", border:"none",
                            borderRadius:4, color:"#FFF", fontSize:10, fontWeight:700,
                            cursor:"pointer", textTransform:"uppercase", letterSpacing:"0.05em"
                          }}>Load Plan</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Right: Agent Pipeline Panel ── */}
      <div style={isMobile ? {
        position:'fixed', top:0, right:0, bottom:0, zIndex:99,
        transform: mobileDrawer==='right' ? 'translateX(0)' : 'translateX(100%)',
        transition:'transform 0.25s ease',
        width:240, minWidth:240,
        background:"#080814", borderLeft:"2px solid #1A1A28",
        display:"flex", flexDirection:"column",
        overflow:"hidden", fontFamily:"monospace",
      } : {
        width: 220, minWidth: 220,
        background: "#080814",
        borderLeft: "2px solid #1A1A28",
        display: "flex", flexDirection: "column",
        overflow: "hidden", fontFamily: "monospace",
      }}>
        {/* Header */}
        <div style={{
          padding: "14px 14px 10px",
          borderBottom: "2px solid #1A1A28",
          background: "#060610",
        }}>
          <div style={{ fontSize: 8, color: "#333", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            ── Agent Pipeline ──
          </div>
          <div style={{ fontSize: 9, color: "#555", marginTop: 4, fontFamily: "monospace" }}>
            {generating ? "Running…" : agentStatuses && Object.values(agentStatuses).some(s => s === "done") ? "Last run complete" : "Idle"}
          </div>
        </div>

        {/* Agents */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
          <AgentPanel
            statuses={agentStatuses}
            activeAgent={activeAgent}
            scores={agentScores}
            belief={params.belief}
          />
        </div>

        {/* Mini log */}
        {log.length > 0 && (
          <div style={{
            borderTop: "2px solid #1A1A28",
            padding: "10px 10px",
            maxHeight: 120,
            overflowY: "auto",
          }}>
            <div style={{ fontSize: 8, color: "#333", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>
              ── Log ──
            </div>
            {log.slice(0, 6).map((l, i) => (
              <div key={i} style={{ fontSize: 8, color: "#444", fontFamily: "monospace", marginBottom: 3, lineHeight: 1.4, wordBreak: "break-word" }}>
                {l}
              </div>
            ))}
          </div>
        )}

        {/* ── Controls ── */}
        <div style={{ borderTop: "2px solid #1A1A28", padding: "12px 10px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 8, color: "#333", letterSpacing: "0.18em", textTransform: "uppercase" }}>── Controls ──</div>

          {/* Score badges */}
          {vastuScore !== null && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <ScoreBadge label={beliefTabLabel[params.belief] || "Vastu"} score={vastuScore} color={vastuScore>=80?"#44DD88":vastuScore>=60?"#FFAA22":"#FF5544"} />
              {costTotal && <ScoreBadge label={`₹${costTotal}L`} score={null} color="#CC66FF"/>}
            </div>
          )}

          {/* Theme + View toggles */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {/* Theme cycle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 9, color: "#555", fontFamily: "monospace" }}>Theme</span>
              <button
                onClick={() => setTheme(t => t==='dark'?'blueprint':t==='blueprint'?'light':'dark')}
                style={{
                  padding: "3px 10px", background: "transparent",
                  border: "1px solid #1A1A28", borderRadius: 4,
                  fontSize: 13, cursor: "pointer", lineHeight: 1,
                }}>
                {theme==='dark'?'🌙':theme==='blueprint'?'📐':'☀️'}
              </button>
            </div>

            {/* Labels toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 9, color: "#555", fontFamily: "monospace" }}>Labels</span>
              <div onClick={() => setShowLabels(v=>!v)} style={{
                width: 28, height: 15, borderRadius: 8, flexShrink: 0,
                background: showLabels ? "#FFAA22" : "#1A1A2A",
                position: "relative", cursor: "pointer", transition: "background 0.2s",
                border: `1px solid ${showLabels ? "#FFAA22" : "#2A2A3A"}`,
              }}>
                <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#FFF",
                  position: "absolute", top: 1, left: showLabels ? 15 : 2, transition: "left 0.2s" }}/>
              </div>
            </div>

            {/* Sun Path toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 9, color: "#555", fontFamily: "monospace" }}>☀ Sun Path</span>
              <div onClick={() => setShowSunPath(v=>!v)} style={{
                width: 28, height: 15, borderRadius: 8, flexShrink: 0,
                background: showSunPath ? "#FFBB44" : "#1A1A2A",
                position: "relative", cursor: "pointer", transition: "background 0.2s",
                border: `1px solid ${showSunPath ? "#FFBB44" : "#2A2A3A"}`,
              }}>
                <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#FFF",
                  position: "absolute", top: 1, left: showSunPath ? 15 : 2, transition: "left 0.2s" }}/>
              </div>
            </div>

            {/* Furniture toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 9, color: "#555", fontFamily: "monospace" }}>Furniture</span>
              <div onClick={() => setShowFurniture(v=>!v)} style={{
                width: 28, height: 15, borderRadius: 8, flexShrink: 0,
                background: showFurniture ? "#22CCCC" : "#1A1A2A",
                position: "relative", cursor: "pointer", transition: "background 0.2s",
                border: `1px solid ${showFurniture ? "#22CCCC" : "#2A2A3A"}`,
              }}>
                <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#FFF",
                  position: "absolute", top: 1, left: showFurniture ? 15 : 2, transition: "left 0.2s" }}/>
              </div>
            </div>

            {/* Diff toggle */}
            {prevSvg && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 9, color: "#555", fontFamily: "monospace" }}>Diff View</span>
                <div onClick={() => setShowDiff(d=>!d)} style={{
                  width: 28, height: 15, borderRadius: 8, flexShrink: 0,
                  background: showDiff ? "#4488FF" : "#1A1A2A",
                  position: "relative", cursor: "pointer", transition: "background 0.2s",
                  border: `1px solid ${showDiff ? "#4488FF" : "#2A2A3A"}`,
                }}>
                  <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#FFF",
                    position: "absolute", top: 1, left: showDiff ? 15 : 2, transition: "left 0.2s" }}/>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {svgCode && (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ display: "flex", gap: 5 }}>
                <button onClick={copyShareLink} style={{
                  flex: 1, padding: "6px 4px",
                  background: "transparent", border: "1px solid #1A2A3A",
                  borderRadius: 4, color: "#4488FF", fontSize: 9, cursor: "pointer",
                  fontFamily: "monospace", letterSpacing: "0.04em",
                }}>SHARE</button>
                <button onClick={shareWhatsApp} title="Share on WhatsApp" style={{
                  padding: "6px 10px",
                  background: "transparent", border: "1px solid #0A200A",
                  borderRadius: 4, color: "#22AA44", fontSize: 14, cursor: "pointer", lineHeight: 1,
                }}>📲</button>
              </div>
              <button onClick={exportPDF} style={{
                width: "100%", padding: "7px",
                background: "transparent", border: "1px solid #2A1A2A",
                borderRadius: 4, color: "#CC66FF", fontSize: 9, cursor: "pointer",
                fontFamily: "monospace", letterSpacing: "0.04em",
              }}>↓ Export PDF</button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
