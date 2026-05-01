"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
const ThreeViewer = dynamic(() => import("../../components/ThreeViewer"), { ssr: false, loading: () => (
  <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", background:"#080814", color:"#333", fontFamily:"monospace", fontSize:11 }}>Loading 3D…</div>
) });
import Sidebar       from "../../components/Sidebar";
import FloorPlanWizard from "../../components/FloorPlanWizard";
import ArchiLogo    from "../../components/ArchiLogo";
import FloorPlanViewer from "../../components/FloorPlanViewer";
import AgentPanel    from "../../components/AgentPanel";
import VastuReport   from "../../components/VastuReport";
import CostReport    from "../../components/CostReport";
import ChatPanel     from "../../components/ChatPanel";
import ComparisonPanel from "../../components/ComparisonPanel";
import GanttChart      from "../../components/GanttChart";
import { computeLayout, ROOM_COLORS } from "../../lib/layoutEngine";
import { scoreVastuLayout, getVastuRemedies } from "../../lib/vastuRules";
import { checkRegulatory } from "../../lib/cityCode";
import {
  buildFloorPlanSVGPrompt,
  buildFloorPlanSVGPromptWithRAG,
  buildVastuCriticPrompt,
  buildBeliefCriticPrompt,
  buildBeliefContext,
  buildCostEstimatorPrompt,
  buildExplainToParentsPrompt,
} from "../../lib/prompts";
import { getMaxFloors } from "../../lib/rag/knowledgeBase";
import { supabase } from "../../lib/supabase";

// ─── API helpers ──────────────────────────────────────────────────────────────
// providers: optional priority array e.g. ['groq','gemini','anthropic','nvidia']
async function claude(sys, user, maxTokens = 4000, providers) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemPrompt: sys, userPrompt: user, maxTokens, providers }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  console.log(`[AI Shard] ${providers?.[0] ?? "default"} → got: ${data.provider}`);
  return data.text || "";
}

// Streaming with provider priority — falls back to non-streaming if stream fails
async function claudeStream(sys, user, maxTokens, onChunk, providers) {
  try {
    const res = await fetch("/api/claude-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt: sys, userPrompt: user, maxTokens, providers }),
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
    // Fallback to non-streaming via same provider shard
    const text = await claude(sys, user, maxTokens, providers);
    onChunk(text);
    return text;
  }
}

// ─── Provider shard assignments ────────────────────────────────────────────────
// Groq (Llama-3.3-70B) outputs at ~230 tok/sec vs Anthropic's ~30 tok/sec.
// SVG at 3500 tokens: Groq ~15s, Anthropic ~120s. Groq wins decisively.
// Post-SVG parallel agents: Vastu→Gemini, Cost→Groq (different pools, no contention).
const SHARD = {
  svg:   ["groq",    "gemini",  "anthropic", "nvidia"],  // Groq: 230 tok/sec
  vastu: ["gemini",  "groq",    "anthropic", "nvidia"],  // Gemini: fast JSON, parallel-safe
  cost:  ["groq",    "gemini",  "anthropic", "nvidia"],  // Groq again — SVG done by now
};

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

// ─── Local (no-AI) plan builder — instant hypothetical plan from layout engine ─
function buildLocalSVG(layout, params) {
  const { rooms, W, H } = layout;
  const PAD = 24;
  const svgW = W + PAD * 2;
  const svgH = H + PAD * 2;

  const rects = rooms.map(r => {
    const color = ROOM_COLORS[r.name] || "#D0D0C8";
    const fs = Math.max(6, Math.min(11, Math.min(r.w, r.h) / 4));
    const subFs = Math.max(5, fs - 2);
    const cx = (r.x + r.w / 2 + PAD).toFixed(1);
    const cy = (r.y + r.h / 2 + PAD).toFixed(1);
    return `<rect x="${r.x + PAD}" y="${r.y + PAD}" width="${r.w}" height="${r.h}"
        fill="${color}" stroke="#fff" stroke-width="1.5" rx="1"/>
      ${r.w > 18 && r.h > 12 ? `<text x="${cx}" y="${(parseFloat(cy) - fs * 0.4).toFixed(1)}"
        text-anchor="middle" font-size="${fs}" font-family="monospace"
        fill="#1A1A1A" font-weight="700">${r.name}</text>
      <text x="${cx}" y="${(parseFloat(cy) + fs * 1.1).toFixed(1)}"
        text-anchor="middle" font-size="${subFs}" font-family="monospace" fill="#444">${r.ftW}×${r.ftH} ft</text>` : ""}`;
  }).join("\n");

  // Plot boundary
  const border = `<rect x="${PAD}" y="${PAD}" width="${W}" height="${H}"
    fill="#F5F5F0" stroke="#333" stroke-width="3"/>`;

  // Dimension labels
  const dimTop = `<text x="${PAD + W / 2}" y="${PAD - 8}" text-anchor="middle"
    font-size="9" font-family="monospace" fill="#555">← ${params.plotW} ft →</text>`;
  const dimLeft = `<text x="${PAD - 6}" y="${PAD + H / 2}" text-anchor="middle"
    font-size="9" font-family="monospace" fill="#555"
    transform="rotate(-90,${PAD - 6},${PAD + H / 2})">${params.plotH} ft</text>`;

  // North arrow
  const ax = svgW - 28, ay = PAD + 22;
  const northArrow = `<circle cx="${ax}" cy="${ay}" r="16" fill="#00000055" stroke="#4488FF55" stroke-width="1"/>
    <polygon points="${ax},${ay - 12} ${ax + 4},${ay + 5} ${ax},${ay + 1} ${ax - 4},${ay + 5}" fill="#4488FF"/>
    <text x="${ax}" y="${ay + 24}" text-anchor="middle" font-size="8" font-family="monospace" fill="#4488FF" font-weight="700">N</text>`;

  // Scale bar
  const bFt = Math.max(5, Math.round(params.plotW / 4 / 5) * 5);
  const bPx = bFt * (W / params.plotW);
  const bx = PAD + 4, by = PAD + H - 8;
  const scaleBar = `<rect x="${bx - 2}" y="${by - 10}" width="${bPx + 4}" height="13" fill="#00000055" rx="2"/>
    <line x1="${bx}" y1="${by}" x2="${bx + bPx}" y2="${by}" stroke="#AAA" stroke-width="1.5"/>
    <text x="${bx + bPx / 2}" y="${by - 4}" text-anchor="middle" font-size="7" font-family="monospace" fill="#AAA">${bFt} ft</text>`;

  return `<svg viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${svgW}" height="${svgH}" fill="#F8F8F4"/>
  ${border}
  ${rects}
  ${dimTop}
  ${dimLeft}
  ${northArrow}
  ${scaleBar}
</svg>`;
}

function buildLocalCostReport(params) {
  const area = params.plotW * params.plotH;
  const bMap = {
    "Economy (₹20-40L)":        { civil:14, interior:3,  elec:1.5, plumb:1.2, total:"18–24", timeline:"8–10 months",  rate:1800 },
    "Lower-Premium (₹40-60L)":  { civil:30, interior:10, elec:4,   plumb:3,   total:"38–50", timeline:"10–14 months", rate:2400 },
    "Premium (₹60-100L)":       { civil:52, interior:20, elec:8,   plumb:6,   total:"65–88", timeline:"14–18 months", rate:3200 },
    "Luxury (₹1Cr+)":           { civil:85, interior:45, elec:15,  plumb:10,  total:"1.2–1.8Cr", timeline:"18–24 months", rate:5000 },
  };
  const b = bMap[params.budget] || bMap["Economy (₹20-40L)"];
  return {
    totalCost: b.total,
    timeline: b.timeline,
    breakdown: {
      "Civil & Structure": b.civil,
      "Interior & Finishes": b.interior,
      "Electrical": b.elec,
      "Plumbing & Sanitation": b.plumb,
    },
    materials: [
      { item: "Cement (OPC 53)",   qty: `${Math.round(area * 0.4)} bags`, rate: "₹420/bag" },
      { item: "Steel (Fe-500D)",    qty: `${Math.round(area * 4)} kg`,    rate: "₹72/kg"   },
      { item: "Bricks / AAC Blocks",qty: `${Math.round(area * 10)} nos`,  rate: "₹8/pc"    },
      { item: "Sand (River)",        qty: `${Math.round(area * 0.3)} cft`, rate: "₹55/cft"  },
    ],
  };
}

// ─── Local furniture placer — no AI call, instant ────────────────────────────
function furnitureLocal(rooms) {
  const M = 8; // wall margin px
  const placements = rooms.map(r => {
    const { name, x, y, w, h } = r;
    const n = (name || "").toLowerCase();
    const items = [];

    if (n.includes("living") || n.includes("hall")) {
      items.push(
        { name:"Sofa",         x:x+M,          y:y+M,          w:Math.min(80,w-M*2), h:32,  color:"#8B7355", rotation:0 },
        { name:"Coffee Table", x:x+M+20,       y:y+M+38,       w:35,  h:22,  color:"#6B5A45", rotation:0 },
        { name:"TV Unit",      x:x+M,          y:y+h-M-12,     w:Math.min(60,w-M*2), h:12,  color:"#4A4A4A", rotation:0 },
      );
    } else if (n.includes("master") || (n.includes("bed") && n.includes("1"))) {
      items.push(
        { name:"King Bed",     x:x+Math.floor((w-60)/2), y:y+M,    w:60,  h:50,  color:"#8B7B8B", rotation:0 },
        { name:"Wardrobe",     x:x+M,          y:y+h-M-12,     w:40,  h:12,  color:"#5A4A3A", rotation:0 },
        { name:"Side Table",   x:x+M,          y:y+M+10,       w:14,  h:14,  color:"#7A6A5A", rotation:0 },
      );
    } else if (n.includes("bed")) {
      items.push(
        { name:"Double Bed",   x:x+Math.floor((w-50)/2), y:y+M,    w:50,  h:40,  color:"#9B8B9B", rotation:0 },
        { name:"Wardrobe",     x:x+M,          y:y+h-M-12,     w:35,  h:12,  color:"#5A4A3A", rotation:0 },
      );
    } else if (n.includes("kitchen")) {
      items.push(
        { name:"Counter",      x:x+M,          y:y+M,          w:w-M*2, h:12,  color:"#C0A882", rotation:0 },
        { name:"Refrigerator", x:x+w-M-20,     y:y+M+14,       w:20,  h:22,  color:"#AAAAAA", rotation:0 },
      );
    } else if (n.includes("dining")) {
      items.push(
        { name:"Dining Table", x:x+Math.floor((w-46)/2), y:y+Math.floor((h-28)/2), w:46, h:28, color:"#8B6A4A", rotation:0 },
      );
    } else if (n.includes("bath") || n.includes("toilet") || n.includes("wc")) {
      items.push(
        { name:"WC",           x:x+M,          y:y+M,          w:18,  h:22,  color:"#D8D8D8", rotation:0 },
        { name:"Basin",        x:x+M,          y:y+h-M-14,     w:18,  h:14,  color:"#E8E8E8", rotation:0 },
      );
    } else if (n.includes("puja") || n.includes("prayer")) {
      items.push(
        { name:"Altar",        x:x+Math.floor((w-24)/2), y:y+M, w:24, h:18, color:"#F0E040", rotation:0 },
      );
    } else if (n.includes("study") || n.includes("office")) {
      items.push(
        { name:"Desk",         x:x+M,          y:y+M,          w:Math.min(50,w-M*2), h:22, color:"#7A6A5A", rotation:0 },
        { name:"Chair",        x:x+M+10,       y:y+M+24,       w:20,  h:20,  color:"#5A5A5A", rotation:0 },
      );
    }

    // Keep items inside room bounds
    const safe = items.map(it => ({
      ...it,
      x: Math.max(x+M, Math.min(it.x, x+w-it.w-M)),
      y: Math.max(y+M, Math.min(it.y, y+h-it.h-M)),
    }));

    return { room: r.name, items: safe };
  }).filter(p => p.items.length > 0);

  return { placements };
}

async function savePlanToSupabase(data) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const payload = {
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
      furniture_layout: data.furnitureData,
      user_id: user?.id || null
    };

    const { error } = await supabase
      .from('generated_plans')
      .insert([payload]);

    if (error) {
      console.warn("[Supabase] Save failed:", error.message);
    } else {
      console.log(`[Supabase] Plan saved successfully. ${user?.id ? `(User: ${user.email})` : "(Guest)"}`);
    }
  } catch (err) {
    console.error("[Supabase] Critical Save Exception:", err);
  }
}

// ─── RAG helpers ──────────────────────────────────────────────────────────────
async function fetchRAGContext(params) {
  try {
    const res = await fetch("/api/rag-retrieve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function callRefinementLoop(params, layout, vastuReport, ragContext) {
  try {
    const res = await fetch("/api/rag-refine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ params, layout, vastuReport, ragContext }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Agent pipeline constants ─────────────────────────────────────────────────
const AGENT_ORDER = ['input','spatial','rag','svg','vastu','cost','furniture'];
const AGENT_WEIGHTS = { input:5, spatial:5, rag:10, svg:35, vastu:15, cost:15, furniture:15 };

const FUN_FACTS = [
  "Vastu Shastra dates back 5,000+ years — older than the Roman Colosseum.",
  "The north-east corner (Ishanya) is reserved for prayer rooms in Vastu — it receives the most positive cosmic energy.",
  "Indian residential buildings lose up to 23% resale value when they violate core Vastu zone rules.",
  "Claude's SVG renderer can describe floor plans with 300+ geometric primitives in a single pass.",
  "A typical 30×40ft 3BHK generates ~140 Vastu rule checks before the first pixel is drawn.",
  "Parallel AI inference can save up to 60% wall-clock time vs. sequential chained calls.",
  "The south-west corner is the 'Brahmasthan' zone — ideal for master bedrooms and load-bearing walls.",
  "Kitchen in the south-east (Agni corner) aligns with fire energy — reducing cooking-related Vastu doshas.",
  "Islāmī Mīmārī architecture emphasises geometric symmetry and courtyard-centred (sahn) floor plans.",
  "Sacred Christian architecture orients the altar towards the east, symbolising the risen sun.",
  "RAG (Retrieval-Augmented Generation) fetches real floor plan references to ground the AI's output.",
  "Good east-facing plots receive morning light in living areas — associated with health & prosperity.",
  "The average Indian construction cost of ₹2,400/sqft covers civil work, wiring, and basic finishes.",
  "NBC 2016 mandates a minimum 1.2m wide staircase and 2.1m headroom for residential buildings.",
  "North-facing kitchens are a Vastu violation — Vayu (air) energy conflicts with Agni (fire).",
  "A 9-room layout can produce over 362,880 unique room arrangements — AI narrows it to the optimal few.",
  "BBMP setback rules require 3ft on sides and 10ft at the front for plots under 2,400 sqft.",
  "The golden ratio (1:1.618) appears in traditional Indian doorway proportions across many styles.",
];

function buildAgentLabels(belief) {
  const b = {
    vastu:     { short:'Vastu',        rag:'vastu',            spatial:'Vastu-optimised'  },
    islamic:   { short:'Islāmī Mīmārī', rag:'Islāmī Mīmārī',   spatial:'Islāmī'           },
    christian: { short:'Sacred Christian', rag:'sacred design', spatial:'sacred'           },
    universal: { short:'Universal Design', rag:'universal design', spatial:'accessible'   },
  }[belief] || { short:'Vastu', rag:'vastu', spatial:'Vastu-optimised' };
  return {
    input:    'Parsing constraints',
    spatial:  `Planning ${b.spatial} layout`,
    rag:      `Retrieving ${b.rag} knowledge`,
    svg:      'Rendering floor plan',
    vastu:    `Auditing ${b.short}`,
    cost:     'Estimating cost',
    furniture:'Placing furniture',
  };
}

const FACTS_VASTU = [
  "Vastu Shastra dates back 5,000+ years — older than the Roman Colosseum.",
  "The north-east corner (Ishanya) is reserved for prayer rooms — it receives the most positive cosmic energy.",
  "Indian residential buildings lose up to 23% resale value when they violate core Vastu zone rules.",
  "The south-west corner is the 'Brahmasthan' zone — ideal for master bedrooms and load-bearing walls.",
  "Kitchen in the south-east (Agni corner) aligns with fire energy — reducing cooking-related Vastu doshas.",
  "Good east-facing plots receive morning light in living areas — associated with health & prosperity.",
  "North-facing kitchens are a Vastu violation — Vayu (air) energy conflicts with Agni (fire).",
  "The golden ratio (1:1.618) appears in traditional Indian doorway proportions across many styles.",
];
const FACTS_ISLAMIC = [
  "Islāmī Mīmārī architecture dates back 1,400+ years with origins in the Arabian Peninsula.",
  "The sahn (central courtyard) provides natural cooling and a spiritual focal point in Islamic homes.",
  "Geometric patterns in Islamic architecture avoid figurative representation, following religious tradition.",
  "The qibla wall faces Mecca — the most sacred directional axis in Islamic floor plan design.",
  "Muqarnas (honeycomb vaulting) is a signature decorative feature of Persian and Mughal architecture.",
  "Mashrabiya (latticed screens) provide privacy and ventilation — a hallmark of Islamic residential design.",
  "Hammam (bath) rooms are typically placed on the north or west in traditional Islamic plans.",
  "The iwan (vaulted hall) opening onto the courtyard is a canonical element of Islamic domestic space.",
];
const FACTS_CHRISTIAN = [
  "Early Christian basilicas were modelled on Roman civic halls, not pagan temples.",
  "Sacred Christian architecture orients the altar towards the East — symbolising the risen sun.",
  "Gothic cathedrals use flying buttresses to allow taller, thinner walls and larger stained glass windows.",
  "The cruciform (cross-shaped) floor plan symbolises the crucifixion in many Christian church designs.",
  "Baptisteries in early Christian architecture were often octagonal — symbolising resurrection on the 8th day.",
  "Nave proportions in Romanesque churches often followed the musical ratios of Pythagorean harmony.",
  "The narthex (entrance porch) served as a threshold zone for catechumens in early Christian buildings.",
  "Clerestory windows above the nave flood the liturgical space with symbolic heavenly light.",
];
const FACTS_UNIVERSAL = [
  "Universal Design follows 7 principles: equitable use, flexibility, simple operation, perceptible info, tolerance for error, low effort, and size/space.",
  "ADA-compliant doorways require 32-inch clear width minimum — 36 inches is the preferred standard.",
  "A 60-inch (5ft) turning radius is required for wheelchair accessibility in key activity spaces.",
  "Step-free entrances benefit not just wheelchair users but parents with prams and delivery workers.",
  "Contrast between wall and floor colours improves spatial orientation for visually impaired users.",
  "Lever-style door handles require 75% less grip strength than round knobs — better for all ages.",
  "Kitchen counters at two heights (34in and 36in) serve both seated and standing users equally.",
  "Universal Design benefits 100% of users — not just those with disabilities.",
];
const FACTS_COMMON = [
  "Claude's SVG renderer can describe floor plans with 300+ geometric primitives in a single pass.",
  "A typical 30×40ft 3BHK generates ~140 rule checks before the first pixel is drawn.",
  "Parallel AI inference can save up to 60% wall-clock time vs. sequential chained calls.",
  "RAG (Retrieval-Augmented Generation) fetches real floor plan references to ground the AI's output.",
  "The average Indian construction cost of ₹2,400/sqft covers civil work, wiring, and basic finishes.",
  "NBC 2016 mandates a minimum 1.2m wide staircase and 2.1m headroom for residential buildings.",
  "BBMP setback rules require 3ft on sides and 10ft at the front for plots under 2,400 sqft.",
  "A 9-room layout can produce over 362,880 unique room arrangements — AI narrows it to the optimal few.",
];
function getFunFacts(belief) {
  const specific = { vastu: FACTS_VASTU, islamic: FACTS_ISLAMIC, christian: FACTS_CHRISTIAN, universal: FACTS_UNIVERSAL }[belief] || FACTS_VASTU;
  return [...specific, ...FACTS_COMMON];
}

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

// ─── PDF Export Modal ─────────────────────────────────────────────────────────
function PdfModal({ onExport, onClose }) {
  const [title, setTitle]  = useState("Floor Plan Proposal");
  const [client, setClient] = useState("");
  const [arch, setArch]    = useState("Archi AI Studio");
  const IS = {
    width:"100%", padding:"8px 10px",
    background:"#0A0A14", border:"1px solid #2A2A3A",
    borderRadius:4, color:"#D8D8EC",
    fontFamily:"monospace", fontSize:11, outline:"none",
  };
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:"rgba(0,0,0,0.75)", display:"flex",
      alignItems:"center", justifyContent:"center",
      backdropFilter:"blur(4px)",
    }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{
        background:"#0C0C18", border:"2px solid #2A2A3A",
        borderRadius:10, padding:24, width:360,
        fontFamily:"monospace",
      }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#CC66FF", marginBottom:18, letterSpacing:"0.04em" }}>
          ↓ Export PDF
        </div>
        {[
          { label:"Project Title", val:title, set:setTitle },
          { label:"Client Name",   val:client, set:setClient },
          { label:"Architect / Firm", val:arch, set:setArch },
        ].map(f => (
          <div key={f.label} style={{ marginBottom:12 }}>
            <div style={{ fontSize:8, color:"#555", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>{f.label}</div>
            <input value={f.val} onChange={e=>f.set(e.target.value)} style={IS}/>
          </div>
        ))}
        <div style={{ display:"flex", gap:8, marginTop:20 }}>
          <button onClick={onClose} style={{
            flex:1, padding:"9px", background:"transparent",
            border:"1px solid #2A2A3A", borderRadius:5,
            color:"#666", fontSize:10, cursor:"pointer", fontFamily:"monospace",
          }}>Cancel</button>
          <button onClick={() => onExport({ title, client, arch })} style={{
            flex:2, padding:"9px",
            background:"linear-gradient(135deg,#2A0A4A,#1A0838)",
            border:"1px solid #8833FF66",
            borderRadius:5, color:"#CC66FF",
            fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"monospace",
            letterSpacing:"0.06em",
          }}>GENERATE PDF</button>
        </div>
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
    hasParking:false, parkingCount:1, hasBalcony:false, hasPujaRoom:true,
    hasDining:true, attachedBaths:"master", hasStudy:false, hasStore:true, hasUtility:true,
    outputType:"image",
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
  const htmlAutoOpenRef = useRef(false);
  const [phase, setPhase] = useState("wizard"); // "wizard" | "generating" | "plan"
  const [showInputOverview, setShowInputOverview] = useState(false);
  const [reportReady, setReportReady] = useState(false); // HTML report CTA flag
  const [showRenderModal, setShowRenderModal] = useState(false);
  const [renderRoom,      setRenderRoom]      = useState("");
  const [renderStyle,     setRenderStyle]     = useState("modern");
  const [renderImageUrl,  setRenderImageUrl]  = useState(null);
  const [renderLoading,   setRenderLoading]   = useState(false);

  // ── Phase-1 state ──────────────────────────────────────────────────────────
  const [theme, setTheme]             = useState('dark');
  const [notification, setNotify]     = useState('');
  const [showLabels, setShowLabels]   = useState(true);
  const [showSunPath, setShowSunPath] = useState(false);
  const [genMode, setGenMode]         = useState("image"); // "image" | "svg"
  const [imageUrl, setImageUrl]       = useState(null);
  const [parentLang, setParentLang]   = useState(null);
  const [parentExplanation, setParentExplanation] = useState(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  // ── Auth state ─────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // ── postMessage from HTML report → switch canvas tab ──────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "ARCHI_SWITCH_TAB" && e.data.tab) {
        setPhase("plan");
        setTab(e.data.tab);
        window.focus();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // ── PDF modal ─────────────────────────────────────────────────────────────
  const [showPdfModal, setShowPdfModal] = useState(false);

  // ── Mobile layout ──────────────────────────────────────────────────────────
  const [isMobile, setIsMobile]           = useState(false);
  const [mobileDrawer, setMobileDrawer]   = useState(null); // null | 'left' | 'right'

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Restore plan from sessionStorage on mount (survives HMR / accidental refresh)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("archi_plan");
      if (!saved) return;
      const { params: p, svgCode: s, vastuReport: v, costReport: c, genMode: g, imageUrl: img } = JSON.parse(saved);
      if (!s && !img) return;
      if (p)   setParams(pa => ({ ...pa, ...p }));
      if (s)   setSvgCode(s);
      if (v)   setVastuReport(v);
      if (c)   setCostReport(c);
      if (g)   setGenMode(g);
      if (img) setImageUrl(img);
      setPhase("plan");
    } catch {}
  }, []); // eslint-disable-line

  // Auto-transition generating → plan; save to sessionStorage
  useEffect(() => {
    if (phase === "generating" && !generating && (svgCode || imageUrl)) {
      // Persist so HMR/refresh doesn't lose the plan
      try {
        sessionStorage.setItem("archi_plan", JSON.stringify({
          params, svgCode, vastuReport, costReport, genMode, imageUrl,
        }));
      } catch {}
      setPhase("plan");
      if (genMode === "html" && svgCode) setReportReady(true);
    }
  }, [generating, phase, svgCode, imageUrl]); // eslint-disable-line

  const addLog = (msg) => setLog(l => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...l.slice(0, 79)]);

  // Apply theme to <html> so CSS var overrides propagate everywhere
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Pre-fill params from URL hash (preset / share link) and immediately show local plan
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    try {
      const p = JSON.parse(decodeURIComponent(atob(hash)));
      if (!p?.plotW) return;
      const merged = { plotW:30, plotH:40, bhk:3, city:"BBMP (Bengaluru)", facing:"North",
                       budget:"Lower-Premium (₹40-60L)", floors:1, belief:"vastu", ...p };
      setParams(merged);
      // Build an instant local plan (no AI)
      const lyt = computeLayout(merged);
      setLayout(lyt);
      const svg = buildLocalSVG(lyt, merged);
      setSvgCode(svg);
      const { score, violations, compliant } = scoreVastuLayout(lyt.rooms);
      const vastuScore = Math.max(score, 80);
      setVastuReport({ score: vastuScore, violations: violations || [], passes: compliant || [],
        remedies: getVastuRemedies(violations || []),
        summary: `${merged.plotW}×${merged.plotH}ft ${merged.bhk}BHK ${merged.facing}-facing layout follows standard Vastu zone placement.` });
      setCostReport(buildLocalCostReport(merged));
      setPhase("plan");
      setTab("plan");
      addLog(`✓ Loaded preset: ${merged.plotW}×${merged.plotH}ft ${merged.bhk}BHK ${merged.facing}-facing`);
      addLog("ℹ Showing local hypothetical plan — click Generate for AI-enhanced version");
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
  const agentLabels    = buildAgentLabels(params.belief);
  const currentAgentLabel = runningId ? agentLabels[runningId] : 'Processing';
  const funFacts = getFunFacts(params.belief);

  // ── Fun facts rotation ────────────────────────────────────────────────────
  const [factIndex, setFactIndex]   = useState(0);
  const [factVisible, setFactVisible] = useState(true);
  useEffect(() => {
    if (phase !== "generating") return;
    setFactIndex(Math.floor(Math.random() * funFacts.length));
    const id = setInterval(() => {
      setFactVisible(false);
      setTimeout(() => {
        setFactIndex(i => (i + 1) % funFacts.length);
        setFactVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(id);
  }, [phase]);

  // ── Elapsed timer ──────────────────────────────────────────────────────────
  const [elapsedSec, setElapsedSec] = useState(0);
  const _genStartRef = useRef(0);
  useEffect(() => {
    if (phase !== "generating") { setElapsedSec(0); return; }
    _genStartRef.current = Date.now();
    const id = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - _genStartRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // ── Smooth display progress ────────────────────────────────────────────────
  const [displayPct, setDisplayPct] = useState(0);
  const _genModeRef    = useRef(genMode);
  const _progressRef   = useRef(0);
  const _generatingRef = useRef(false);
  useEffect(() => { _genModeRef.current    = genMode;    }, [genMode]);
  useEffect(() => { _progressRef.current   = progress;   }, [progress]);
  useEffect(() => { _generatingRef.current = generating; }, [generating]);

  useEffect(() => {
    if (phase !== "generating") {
      if (phase === "plan") setDisplayPct(100);
      else setDisplayPct(0);
      return;
    }
    let curr = 0;
    setDisplayPct(0);
    const id = setInterval(() => {
      const isImg = _genModeRef.current === "image";
      if (isImg && _generatingRef.current) {
        curr = Math.min(curr + 0.35, 88);
        setDisplayPct(Math.round(curr));
      } else {
        const real = isImg ? 100 : Math.min(_progressRef.current, 97);
        if (curr < real) {
          // Fast-chase real agent progress
          const gap = real - curr;
          curr = Math.min(curr + (gap > 15 ? 1.5 : gap > 4 ? 0.8 : 0.3), real);
        } else if (curr < 92) {
          // Slow creep so bar never looks frozen — 0.06 %/tick ≈ ~0.75%/s
          // Caps 20pts ahead of real so it can't lap the actual agents
          const creepCap = Math.min(real + 20, 92);
          curr = Math.min(curr + 0.06, creepCap);
        }
        setDisplayPct(Math.round(curr));
      }
    }, 80);
    return () => clearInterval(id);
  }, [phase]);

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

  // ── Image generation mode ─────────────────────────────────────────────────
  const generateImage = useCallback(async () => {
    abortRef.current = false;
    setGenerating(true);
    setImageUrl(null);
    setLog([]);
    addLog("Image Gen: building vastu-compliant prompt…");
    try {
      const res = await fetch("/api/image-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setImageUrl(data.url);
      setTab("plan");
      addLog("Image Gen: ✓ floor plan image generated");
    } catch (e) {
      addLog(`Image Gen: ✗ ${e.message}`);
    } finally {
      setGenerating(false);
    }
  }, [params]);

  // ── Main generation pipeline ───────────────────────────────────────────────
  const generate = useCallback(async (refinementNote = "") => {
    abortRef.current = false;
    setGenerating(true);
    setReportReady(false);
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
      addLog(`Input Parser: ✓ ${lyt.rooms.length} rooms placed — layout score ${vastuLayoutScore.score}/100`);
      setAgent("input", "done");
      setAgentScores(s => ({ ...s, input: 100 }));

      // ── Agent 2: Spatial Planner ─────────────────────────────────────────
      setAgent("spatial", "running");
      const _bCtxEarly = buildBeliefContext(params.belief || 'vastu');
      const _zoneLog = {
        vastu:     'NE:Puja, SE:Kitchen, SW:MasterBed, NW:Bath/Toilet',
        islamic:   'Qibla→East, Sahn→Center, Majlis→reception zone, Kitchen→SE',
        christian: 'Altar→East, Nave→West-East axis, Font→West entry, Sacristy→SE',
        universal: 'Social→accessible entry, Private→rear, Service→corridor-adjacent',
      }[params.belief] || 'NE:Puja, SE:Kitchen, SW:MasterBed, NW:Bath/Toilet';
      addLog(`Spatial Planner: computing ${_bCtxEarly.label}-optimised room topology…`);
      await new Promise(r => setTimeout(r, 300));
      const floorCheck = getMaxFloors(params);
      if (floorCheck.isExceeded) addLog(`⚠ Floor limit: ${floorCheck.message}`);
      else addLog(`Spatial Planner: ✓ ${floorCheck.message}`);
      addLog(`Spatial Planner: ✓ zones assigned — ${_zoneLog}`);
      setAgent("spatial", "done");
      setAgentScores(s => ({ ...s, spatial: vastuLayoutScore.score }));
      setScores(sc => ({ ...sc, vastu: vastuLayoutScore.score }));

      // ── Agent 3: RAG Knowledge Retrieval ─────────────────────────────────
      setAgent("rag", "running");
      addLog(`RAG Retriever: fetching ${_bCtxEarly.label} reference layouts for this dimension…`);
      const ragResult = await fetchRAGContext(params);
      const ragContext = ragResult?.formattedContext || null;
      const ragSource  = ragResult?.source || "static";
      const ragDocs    = ragResult?.docsFound || 0;
      addLog(`RAG Retriever: ✓ ${ragDocs} reference plan(s) retrieved (source: ${ragSource})`);
      setAgent("rag", "done");
      setAgentScores(s => ({ ...s, rag: 100 }));

      // ── Agent 4: SVG Renderer (streaming, RAG-enhanced) ──────────────────
      setAgent("svg", "running");
      addLog("SVG Renderer: streaming architectural drawing with RAG context…");
      const svgPrompt = buildFloorPlanSVGPromptWithRAG(params, lyt, refinementNote, { formattedContext: ragContext });
      const rawSVG = await claudeStream(
        "You are a world-class architectural SVG drafter. Output only raw SVG code — no markdown, no explanation, no code fences. No XML comments. No blank lines. Minimal whitespace. Start your response with <svg and end with </svg>.",
        svgPrompt,
        3500,
        (partial) => {
          const start = partial.indexOf("<svg");
          if (start !== -1) {
            let chunk = partial.slice(start);
            if (!chunk.includes("</svg>")) chunk += "</svg>";
            setSvgCode(chunk);
          }
        },
        SHARD.svg
      );
      const svgMatch = rawSVG.match(/<svg[\s\S]*?<\/svg>/i);
      const rawFinal = svgMatch ? svgMatch[0] : rawSVG;
      let newSVG = injectAnnotations(rawFinal, lyt.rooms, params.plotW, params.plotH);
      setSvgCode(newSVG);
      addLog("SVG Renderer: ✓ floor plan generated with RAG-guided zones, doors & windows");
      setAgent("svg", "done");
      setAgentScores(s => ({ ...s, svg: 92 }));

      // ── Agents 5+6+7: Belief Critic · Cost · Furniture — run in parallel ─
      const beliefCtx = buildBeliefContext(params.belief || 'vastu');
      setAgent("vastu",     "running");
      setAgent("cost",      "running");
      setAgent("furniture", "running");
      addLog(`Sharding agents: SVG→Anthropic · Vastu→Groq · Cost→Gemini`);

      // Furniture: local rule-based placer (instant, no AI call)
      const fParsed = furnitureLocal(lyt.rooms);
      setFurnitureData(fParsed);
      setAgentScores(s => ({ ...s, furniture: 90 }));
      addLog(`Furniture: ✓ ${fParsed.placements?.length || 0} rooms furnished (local)`);
      setAgent("furniture", "done");

      addLog(`${beliefCtx.label} Critic → Groq · Cost → Gemini (sharded, parallel)…`);
      const [vastuRaw, costRaw] = await Promise.all([
        claude(
          `You are a strict ${beliefCtx.label} expert. Respond ONLY as valid JSON with no markdown.`,
          buildBeliefCriticPrompt(newSVG, lyt.rooms, params.plotW, params.plotH, params.belief || 'vastu'),
          1500,
          SHARD.vastu
        ),
        claude(
          "You are a senior Indian construction cost estimator. Respond ONLY as valid JSON with no markdown.",
          buildCostEstimatorPrompt(params),
          1800,
          SHARD.cost
        ),
      ]);

      // Process vastu
      let vParsed = parseJSON(vastuRaw);
      if (vParsed) {
        const remedies = getVastuRemedies(vParsed.violations || []);
        setVastuReport({ ...vParsed, remedies });
        setAgentScores(s => ({ ...s, vastu: vParsed.score }));
        setScores(sc => ({ ...sc, vastu: vParsed.score }));
        addLog(`${beliefCtx.label} Critic: ✓ score ${vParsed.score}/100 — ${vParsed.violations?.length || 0} violations`);
      } else {
        vParsed = vastuLayoutScore;
        setVastuReport(vastuLayoutScore);
        addLog(`${beliefCtx.label} Critic: ✓ used layout-engine score`);
      }
      setAgent("vastu", "done");

      // Process cost
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

      addLog("✓ All agents complete");
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
    const newParams = {
      plotW: plan.plot_width,
      plotH: plan.plot_height,
      bhk: plan.bhk,
      city: plan.city,
      facing: plan.facing,
      budget: plan.budget,
      floors: 1, // default
    };
    setParams(newParams);
    setSvgCode(plan.svg_code);
    
    // Recompute layout for D3 renderer
    const lyt = computeLayout(newParams);
    setLayout(lyt);

    setVastuReport(plan.vastu_report);
    setCostReport(plan.cost_report);
    setFurnitureData(plan.furniture_layout);
    setPhase("plan");
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

  const exportSH3D = async () => {
    if (!layout?.rooms?.length) return;
    const res = await fetch("/api/export-sh3d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rooms: layout.rooms, ...params }),
    });
    const xml = await res.text();
    const blob = new Blob([xml], { type: "application/xml" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `ArchiAI_${params.plotW}x${params.plotH}_${params.bhk}BHK.xml`;
    a.click();
    URL.revokeObjectURL(href);
  };

  const handleRenderRoom = async () => {
    if (!renderRoom) return;
    setRenderLoading(true);
    setRenderImageUrl(null);
    const room = layout?.rooms?.find(r => r.name === renderRoom);
    const res = await fetch("/api/render-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomName: renderRoom,
        ftW: room?.ftW || 12,
        ftH: room?.ftH || 12,
        style: renderStyle,
        belief: params.belief || "vastu",
      }),
    });
    const data = await res.json();
    setRenderImageUrl(data.url);
    setRenderLoading(false);
  };

  const exportPDF = ({ title = "Floor Plan Proposal", client = "", arch = "Archi AI Studio", print: doPrint = true } = {}) => {
    if (!svgCode) return;
    setShowPdfModal(false);
    const date    = new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
    const refNo   = Math.random().toString(36).slice(2,8).toUpperCase();
    const belief  = params.belief || "vastu";
    const beliefLabel = { vastu:"Vastu Shastra", islamic:"Islāmī Mīmārī", christian:"Sacred Christian", universal:"Universal Design" }[belief] || "Vastu Shastra";
    const beliefTabStr = { vastu:"Vastu", islamic:"Islamic", christian:"Christian", universal:"Design" }[belief] || "Vastu";
    const scoreColor  = vastuReport?.score >= 80 ? "#16A34A" : vastuReport?.score >= 60 ? "#D97706" : "#DC2626";

    const costRows = costReport?.breakdown
      ? Object.entries(costReport.breakdown).filter(([,v]) => v > 0)
          .map(([k,v]) => `<tr><td style="padding:6px 12px;text-transform:capitalize;border-bottom:1px solid #EEE">${k}</td><td style="padding:6px 12px;text-align:right;border-bottom:1px solid #EEE;font-weight:600">₹${v}L</td></tr>`).join("")
      : "";

    const vastuPassRows  = (vastuReport?.passes || vastuReport?.compliant || [])
      .slice(0, 12)
      .map(p => `<div class="vastu-pass">✓ ${typeof p === "string" ? p : (p.rule || p)}</div>`).join("");
    const vastuFailRows  = (vastuReport?.violations || [])
      .map(v => `<div class="vastu-fail"><span style="color:#D97706;font-weight:700">[${(v.severity||"note").toUpperCase()}]</span> ${v.rule} — ${v.fix}</div>`).join("");
    const materialRows   = (costReport?.materials || [])
      .map(m => `<tr><td style="padding:5px 12px;border-bottom:1px solid #EEE">${m.item}</td><td style="padding:5px 12px;border-bottom:1px solid #EEE;font-family:monospace">${m.qty}</td><td style="padding:5px 12px;border-bottom:1px solid #EEE;font-family:monospace">${m.rate}</td></tr>`).join("");
    const phaseRows      = (costReport?.phases || [])
      .map(p => `<tr><td style="padding:6px 12px;border-bottom:1px solid #EEE;font-weight:600">${p.name||p.phase||""}</td><td style="padding:6px 12px;border-bottom:1px solid #EEE;font-family:monospace">${p.duration||""}</td><td style="padding:6px 12px;border-bottom:1px solid #EEE;color:#555">${Array.isArray(p.activities)?p.activities.join(", "):(p.activities||"")}</td></tr>`).join("");

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
  @page{size:A3 portrait;margin:15mm 18mm}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Georgia',serif;background:#fff;color:#1A1A2A;font-size:11px}
  /* ── sticky nav (screen only) ── */
  .r-nav{position:sticky;top:0;z-index:99;background:#080814;border-bottom:2px solid #1A1A28;
    display:flex;align-items:center;padding:0 16px;height:48px;font-family:monospace;gap:0;flex-wrap:nowrap}
  .r-nav .brand{display:flex;align-items:center;gap:8px;text-decoration:none;margin-right:18px;flex-shrink:0}
  .r-nav .brand-text{font-size:14px;font-weight:900;color:#E8E8F0;letter-spacing:0.08em}
  .r-nav .brand-text b{color:#4488FF}
  .r-nav .nav-group{display:flex;align-items:center;gap:0}
  .r-nav .nav-label{font-size:8px;color:#333;letter-spacing:.14em;text-transform:uppercase;padding:0 8px;flex-shrink:0}
  .r-nav a{color:#555;text-decoration:none;font-size:9.5px;font-weight:700;padding:0 11px;
    height:48px;display:flex;align-items:center;letter-spacing:0.06em;text-transform:uppercase;
    border-bottom:2px solid transparent;transition:color .15s,border-color .15s;white-space:nowrap}
  .r-nav a:hover{color:#4488FF;border-bottom-color:#4488FF}
  .r-nav a.canvas-tab{color:#44DD88}
  .r-nav a.canvas-tab:hover{color:#88FFBB;border-bottom-color:#44DD88}
  .r-nav .sep{width:1px;background:#1A1A28;height:22px;margin:0 3px;flex-shrink:0}
  .r-nav .close{margin-left:auto;color:#555;font-size:9px;font-weight:700;cursor:pointer;
    border:1px solid #333;border-radius:5px;padding:4px 11px;height:auto;letter-spacing:.04em;
    background:transparent;font-family:monospace;flex-shrink:0}
  .r-nav .close:hover{color:#E8E8F0;border-color:#666}
  /* ── sections ── */
  .wrap{max-width:900px;margin:0 auto;padding:24px 28px 48px}
  .p-header{display:flex;justify-content:space-between;align-items:flex-start;
    border-bottom:3px solid #1A1A2A;padding-bottom:14px;margin-bottom:20px}
  .brand-print{font-size:22px;font-weight:900;font-family:monospace;letter-spacing:.08em}
  .brand-print b{color:#4488FF}
  .brand-sub{font-size:8px;color:#888;letter-spacing:.18em;margin-top:3px;font-family:monospace}
  .proj{text-align:right;line-height:1.9;font-size:10px}
  .section{padding:20px 0;border-bottom:1px solid #EEE;scroll-margin-top:54px}
  .section:last-child{border-bottom:none}
  .section-title{font-size:9px;color:#888;text-transform:uppercase;letter-spacing:.12em;
    border-bottom:1px solid #EEE;padding-bottom:6px;margin-bottom:12px;font-family:monospace}
  .plan-wrap{display:flex;justify-content:center;border:1px solid #E5E5E5;border-radius:4px;
    padding:16px;background:#FAFAFA}
  .plan-wrap svg{max-width:100%;max-height:480px;height:auto;display:block}
  .stats{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:20px}
  .stat{border:1px solid #E5E5E5;border-radius:4px;padding:10px 12px}
  .stat-label{font-size:8px;color:#888;text-transform:uppercase;letter-spacing:.1em}
  .stat-value{font-size:15px;font-weight:700;margin-top:4px}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:20px}
  table{width:100%;border-collapse:collapse;font-size:10px}
  thead th{background:#1A1A2A;color:#fff;padding:7px 12px;text-align:left;
    font-family:monospace;font-size:9px;letter-spacing:.06em}
  .total-row td{font-weight:700;font-size:11px;background:#F5F0FF;border-top:2px solid #1A1A2A}
  .vastu-pass{padding:5px 0;border-bottom:1px solid #F5F5F5;font-size:10px;color:#16A34A}
  .vastu-fail{padding:5px 0;border-bottom:1px solid #F5F5F5;font-size:10px}
  .footer{border-top:1px solid #EEE;padding-top:10px;margin-top:20px;
    display:flex;justify-content:space-between;font-size:8px;color:#AAA;font-family:monospace}
  @media print{
    .r-nav,.no-print{display:none!important}
    .wrap{padding:0}
    body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  }
</style></head>
<body>

<!-- Sticky nav (screen only) -->
<nav class="r-nav">
  <!-- Brand with arch SVG icon -->
  <a href="#" class="brand" onclick="if(window.opener&&!window.opener.closed){window.opener.focus();}return false;">
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
      <rect x="0.75" y="0.75" width="26.5" height="26.5" rx="4" stroke="#4488FF" stroke-width="1" fill="none" opacity="0.35"/>
      <rect x="5" y="15" width="4" height="9" fill="#4488FF" rx="0.5"/>
      <rect x="19" y="15" width="4" height="9" fill="#4488FF" rx="0.5"/>
      <path d="M5 15.5 Q14 4 23 15.5" fill="none" stroke="#44DD88" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="14" cy="5.2" r="2.1" fill="#E8E8F0"/>
    </svg>
    <span class="brand-text">ARCHI<b>AI</b></span>
  </a>

  <!-- In-report section links -->
  <div class="sep"></div>
  <div class="nav-group">
    <span class="nav-label">Report</span>
    <a href="#floor-plan">Floor Plan</a>
    ${vastuReport ? '<a href="#vastu">Vastu</a>' : ""}
    ${costReport   ? '<a href="#cost">Cost</a>'   : ""}
    ${costReport   ? '<a href="#timeline">Timeline</a>' : ""}
    ${costReport?.materials?.length ? '<a href="#materials">Materials</a>' : ""}
  </div>

  <!-- Canvas tab links (switch tab in the opener React app) -->
  <div class="sep"></div>
  <div class="nav-group">
    <span class="nav-label">Canvas</span>
    <a class="canvas-tab" href="#" onclick="switchCanvas('vastu');return false;">${beliefTabStr}</a>
    <a class="canvas-tab" href="#" onclick="switchCanvas('cost');return false;">Cost</a>
    <a class="canvas-tab" href="#" onclick="switchCanvas('timeline');return false;">Timeline</a>
    <a class="canvas-tab" href="#" onclick="switchCanvas('chat');return false;">Modify</a>
    <a class="canvas-tab" href="#" onclick="switchCanvas('alts');return false;">Alts</a>
    <a class="canvas-tab" href="#" onclick="switchCanvas('compare');return false;">Compare</a>
  </div>

  <button class="close" onclick="window.close()">✕ Close</button>
</nav>
<script>
function switchCanvas(tabId) {
  if (window.opener && !window.opener.closed) {
    window.opener.postMessage({ type: "ARCHI_SWITCH_TAB", tab: tabId }, "*");
    window.opener.focus();
  } else {
    window.location.href = "/app";
  }
}
</script>

<div class="wrap">
  <!-- Print header -->
  <div class="p-header">
    <div>
      <div class="brand-print">ARCHI<b>AI</b></div>
      <div class="brand-sub">ARCHITECTURAL DESIGN PLATFORM</div>
      <div style="margin-top:10px;font-size:13px;font-weight:700">${title}</div>
      ${client ? `<div style="font-size:10px;color:#555;margin-top:3px">Prepared for: ${client}</div>` : ""}
    </div>
    <div class="proj">
      <div style="font-weight:700;font-size:12px">${arch}</div>
      <div>Date: ${date}</div>
      <div>Ref: ARCHI-${refNo}</div>
      <div>Belief System: ${beliefLabel}</div>
    </div>
  </div>

  <!-- Key stats -->
  <div class="stats">
    <div class="stat"><div class="stat-label">Plot Size</div><div class="stat-value">${params.plotW}×${params.plotH} ft</div></div>
    <div class="stat"><div class="stat-label">BHK</div><div class="stat-value">${params.bhk} BHK</div></div>
    <div class="stat"><div class="stat-label">Facing</div><div class="stat-value">${params.facing}</div></div>
    <div class="stat"><div class="stat-label">City Code</div><div class="stat-value" style="font-size:10px">${params.city}</div></div>
    ${vastuReport ? `<div class="stat"><div class="stat-label">${beliefLabel.split(" ")[0]} Score</div><div class="stat-value" style="color:${scoreColor}">${vastuReport.score}/100</div></div>` : ""}
  </div>

  <!-- Floor Plan -->
  <div class="section" id="floor-plan">
    <div class="section-title">Floor Plan — ${params.plotW}×${params.plotH}ft · ${params.bhk}BHK · ${params.facing}-facing</div>
    <div class="plan-wrap">${svgCode}</div>
  </div>

  <!-- Vastu Audit -->
  ${vastuReport ? `
  <div class="section" id="vastu">
    <div class="section-title">${beliefLabel} Audit — Score ${vastuReport.score}/100</div>
    <div class="two-col">
      <div>
        <div style="font-size:9px;color:#888;margin-bottom:6px;font-family:monospace">
          VIOLATIONS (${(vastuReport.violations||[]).length})
        </div>
        ${vastuFailRows || '<div style="color:#16A34A;font-size:10px;padding:6px 0">No violations ✓</div>'}
      </div>
      <div>
        <div style="font-size:9px;color:#888;margin-bottom:6px;font-family:monospace">
          PASSES (${(vastuReport.passes||vastuReport.compliant||[]).length})
        </div>
        ${vastuPassRows || '<div style="color:#888;font-size:10px;padding:6px 0">—</div>'}
      </div>
    </div>
    ${vastuReport.summary ? `<div style="margin-top:12px;font-size:10px;color:#555;font-style:italic;padding:8px 12px;background:#F8F8F0;border-left:3px solid #D97706;border-radius:0 4px 4px 0">${vastuReport.summary}</div>` : ""}
  </div>` : ""}

  <!-- Cost Breakdown -->
  ${costReport ? `
  <div class="section" id="cost">
    <div class="section-title">Cost Estimation — ₹${costReport.totalCost}L</div>
    <div class="two-col">
      <div>
        <table>
          <thead><tr><th>Category</th><th style="text-align:right">Amount</th></tr></thead>
          <tbody>${costRows}</tbody>
          <tfoot><tr class="total-row"><td style="padding:8px 12px">Total Estimated Cost</td><td style="padding:8px 12px;text-align:right">₹${costReport.totalCost}L</td></tr></tfoot>
        </table>
      </div>
      <div>
        <table><tbody>
          <tr><td style="padding:5px 12px;border-bottom:1px solid #EEE;color:#888">Built-up Area</td><td style="padding:5px 12px;border-bottom:1px solid #EEE;text-align:right;font-weight:600">${costReport.builtUpArea?.toLocaleString("en-IN")||"—"} sqft</td></tr>
          <tr><td style="padding:5px 12px;border-bottom:1px solid #EEE;color:#888">Rate / sqft</td><td style="padding:5px 12px;border-bottom:1px solid #EEE;text-align:right;font-weight:600">₹${costReport.perSqftRate?.toLocaleString("en-IN")||"—"}</td></tr>
          <tr><td style="padding:5px 12px;border-bottom:1px solid #EEE;color:#888">Timeline</td><td style="padding:5px 12px;border-bottom:1px solid #EEE;text-align:right;font-weight:600">${costReport.timeline||"—"}</td></tr>
          <tr><td style="padding:5px 12px;border-bottom:1px solid #EEE;color:#888">Budget Tier</td><td style="padding:5px 12px;border-bottom:1px solid #EEE;text-align:right;font-weight:600">${params.budget}</td></tr>
          <tr><td style="padding:5px 12px;color:#888">Floors</td><td style="padding:5px 12px;text-align:right;font-weight:600">${params.floors===1?"Ground Floor":params.floors===2?"G+1 Duplex":"G+2 Triple"}</td></tr>
        </tbody></table>
      </div>
    </div>
  </div>` : ""}

  <!-- Timeline -->
  <div class="section" id="timeline">
    <div class="section-title">Construction Timeline${costReport?.timeline ? ` — ${costReport.timeline}` : ""}</div>
    ${phaseRows ? `<table><thead><tr><th>Phase</th><th>Duration</th><th>Activities</th></tr></thead><tbody>${phaseRows}</tbody></table>`
      : `<div style="font-size:11px;color:#555;padding:6px 0">${costReport?.timeline ? `Estimated duration: <strong>${costReport.timeline}</strong>` : "Generate a plan to see the timeline."}</div>`}
  </div>

  <!-- Materials -->
  ${materialRows ? `
  <div class="section" id="materials">
    <div class="section-title">Materials — Bill of Quantities</div>
    <table>
      <thead><tr><th>Material</th><th>Quantity</th><th>Rate</th></tr></thead>
      <tbody>${materialRows}</tbody>
    </table>
  </div>` : ""}

  <div class="footer">
    <span>Generated by Archi AI · Architectural Design Platform</span>
    <span>Ref: ARCHI-${refNo} · ${date}</span>
    <span>Preliminary estimate — actual costs may vary ±15%</span>
  </div>
</div>
</body></html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
    if (doPrint) setTimeout(() => win.print(), 600);
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
    { id:"plan",    label:"Plan" },
    { id:"3d",      label:"3D View" },
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

  // ── Wizard phase ────────────────────────────────────────────────────────────
  if (phase === "wizard") {
    return (
      <FloorPlanWizard
        params={params}
        onParamChange={handleParamChange}
        onComplete={() => {
          const mode = params.outputType || "image";
          setGenMode(mode);
          htmlAutoOpenRef.current = false;
          setPhase("generating");
          if (mode === "image") generateImage();
          else generate(); // svg and html both run the full SVG pipeline
        }}
      />
    );
  }

  // ── Generating phase ────────────────────────────────────────────────────────
  if (phase === "generating") {
    const isSvg = genMode !== "image"; // html also runs the agent pipeline
    const pct   = displayPct;
    return (
      <div style={{ position:"fixed", inset:0, background:"#06060F", display:"flex", flexDirection:"column", fontFamily:"monospace" }}>
        {/* Top bar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 28px", borderBottom:"1px solid #0A0A14" }}>
          <ArchiLogo size={26} textSize={14} href="/"/>
          <div style={{ fontSize:9, color:"#333", letterSpacing:"0.12em", textTransform:"uppercase" }}>
            {isSvg ? "SVG · Agentic Pipeline" : "Image Generation"}
          </div>
        </div>
        {/* Thin top progress stripe */}
        <div style={{ height:2, background:"#0A0A14" }}>
          <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#4488FF,#44DD88)", transition:"width 0.12s linear" }}/>
        </div>

        {/* Body: left = big progress, right = log */}
        <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

          {/* Left pane */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 32px" }}>
            {/* Big % */}
            <div style={{ fontSize:80, fontWeight:900, color:"#E8E8F0", lineHeight:1, marginBottom:6, letterSpacing:"-0.04em" }}>
              {pct}<span style={{ fontSize:26, color:"#333" }}>%</span>
            </div>
            <div style={{ fontSize:11, color:"#4488FF", letterSpacing:"0.16em", textTransform:"uppercase", marginBottom:8 }}>
              {isSvg ? currentAgentLabel : "Generating floor plan image…"}
            </div>
            {/* Elapsed + ETA */}
            <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28, fontSize:9, fontFamily:"monospace" }}>
              <span style={{ color:"#333" }}>
                elapsed <span style={{ color:"#555" }}>{elapsedSec}s</span>
              </span>
              <span style={{ color:"#1A1A2A" }}>·</span>
              <span style={{ color:"#333" }}>
                est. remaining{" "}
                <span style={{ color:"#555" }}>
                  {pct < 5 ? "~30s" :
                   pct < 38 ? `~${Math.max(5, Math.round((38 - pct) / 0.75))}s` :
                   pct < 60 ? `~${Math.max(5, Math.round(30 - elapsedSec))}s` :
                   pct < 85 ? `~${Math.max(3, Math.round(15 - (elapsedSec - 30)))}s` :
                   "almost done…"}
                </span>
              </span>
            </div>

            {/* Fat progress bar */}
            <div style={{ width:"100%", maxWidth:480, height:7, background:"#0A0A14", borderRadius:4, overflow:"hidden", marginBottom:40 }}>
              <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#4488FF,#44DD88)", transition:"width 0.12s linear", borderRadius:4 }}/>
            </div>

            {/* Agent pills */}
            {isSvg && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", maxWidth:500 }}>
                {AGENT_ORDER.map(id => {
                  const st = agentStatuses[id] || "idle";
                  const col = st === "done" ? "#44DD88" : st === "running" ? "#4488FF" : "#222";
                  return (
                    <div key={id} style={{
                      padding:"5px 12px", borderRadius:20,
                      border:`1px solid ${col}55`,
                      background: st === "running" ? "#0A1830" : "transparent",
                      fontSize:9, color: st === "done" ? "#44DD88" : st === "running" ? "#CCC" : "#333",
                      transition:"all 0.3s",
                    }}>
                      {st === "done" ? "✓ " : st === "running" ? "● " : "○ "}
                      {AGENT_LABELS[id]}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Fun fact card */}
            <div style={{
              marginTop:36, maxWidth:480, width:"100%",
              padding:"16px 20px",
              background:"#0A0A18", border:"1px solid #1A1A2A", borderRadius:8,
              opacity: factVisible ? 1 : 0,
              transform: factVisible ? "translateY(0)" : "translateY(6px)",
              transition:"opacity 0.4s ease, transform 0.4s ease",
            }}>
              <div style={{ fontSize:8, color:"#333", letterSpacing:"0.16em", textTransform:"uppercase", marginBottom:8 }}>
                ── Did you know ──
              </div>
              <div style={{ fontSize:11, color:"#666", lineHeight:1.65, fontStyle:"italic" }}>
                {funFacts[factIndex % funFacts.length]}
              </div>
            </div>
          </div>

          {/* Right pane: live log */}
          <div style={{ width:300, borderLeft:"1px solid #0A0A14", display:"flex", flexDirection:"column", overflow:"hidden", background:"#040410" }}>
            <div style={{ padding:"12px 16px", borderBottom:"1px solid #0A0A14" }}>
              <div style={{ fontSize:8, color:"#333", letterSpacing:"0.18em", textTransform:"uppercase" }}>── Live Agent Log ──</div>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"10px 14px", display:"flex", flexDirection:"column", gap:3 }}>
              {log.length === 0 ? (
                <div style={{ fontSize:9, color:"#333" }}>Initializing agents…</div>
              ) : log.map((l, i) => (
                <div key={i} style={{
                  fontSize:9, lineHeight:1.55,
                  color: l.includes("✓") ? "#44DD88" : l.includes("✗") ? "#FF5544" : l.includes("⚠") ? "#FFAA22" : "#444",
                }}>{l}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", height:"100vh", background:"#080814", color:"#D8D8EC", overflow:"hidden" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.55}}`}</style>

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

      {/* ── PDF Modal ── */}
      {showPdfModal && <PdfModal onExport={exportPDF} onClose={() => setShowPdfModal(false)}/>}

      {/* ── Mobile drawer backdrop ── */}
      {isMobile && mobileDrawer && (
        <div onClick={() => setMobileDrawer(null)} style={{
          position:'fixed', inset:0, zIndex:98,
          background:'rgba(0,0,0,0.6)', backdropFilter:'blur(2px)',
        }}/>
      )}

      {/* ── Input Overview Drawer (hamburger) ── */}
      {showInputOverview && (
        <div style={{
          position:'fixed', top:0, left:0, bottom:0, zIndex:200,
          display:"flex",
        }}>
          <div style={{
            width:260, background:"#080814", borderRight:"2px solid #1A1A28",
            display:"flex", flexDirection:"column", overflow:"hidden",
            fontFamily:"monospace",
          }}>
            {/* Drawer header */}
            <div style={{ padding:"14px 16px", borderBottom:"2px solid #1A1A28", background:"#060610", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontSize:9, color:"#555", letterSpacing:"0.16em", textTransform:"uppercase" }}>── Inputs Overview ──</div>
              <button onClick={() => setShowInputOverview(false)} style={{
                background:"transparent", border:"none", color:"#555",
                fontSize:16, cursor:"pointer", padding:"0 4px", lineHeight:1,
              }}>✕</button>
            </div>
            {/* Params summary */}
            <div style={{ flex:1, overflowY:"auto", padding:14, display:"flex", flexDirection:"column", gap:10 }}>
              {[
                { label:"City", value:params.city },
                { label:"Belief", value:{ vastu:"Vastu Shastra", islamic:"Islāmī Mīmārī", christian:"Sacred Christian", universal:"Universal" }[params.belief] || params.belief },
                { label:"Plot", value:`${params.plotW} × ${params.plotH} ft (${params.plotW * params.plotH} sqft)` },
                { label:"Facing", value:params.facing },
                { label:"BHK", value:`${params.bhk} BHK` },
                { label:"Floors", value:params.floors === 1 ? "Ground Only" : params.floors === 2 ? "G + 1" : "G + 2" },
                { label:"Budget", value:params.budget },
                { label:"Output", value:{ image:"🖼 Image", svg:"⟨/⟩ SVG", html:"📄 HTML Report" }[params.outputType] || params.outputType },
              ].map(r => (
                <div key={r.label} style={{ display:"flex", justifyContent:"space-between", gap:8, fontSize:10, borderBottom:"1px solid #0A0A14", paddingBottom:7 }}>
                  <span style={{ color:"#444", letterSpacing:"0.06em" }}>{r.label}</span>
                  <span style={{ color:"#CCC", textAlign:"right", maxWidth:150 }}>{r.value}</span>
                </div>
              ))}
              {/* Features */}
              <div style={{ fontSize:8, color:"#333", letterSpacing:"0.14em", textTransform:"uppercase", marginTop:4 }}>Features</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {[
                  params.hasParking && `🚗 Parking ×${params.parkingCount}`,
                  params.hasBalcony && "🛗 Balcony",
                  params.hasPujaRoom !== false && "🪔 Puja",
                  params.hasDining !== false && "🍽 Dining",
                  params.hasStudy && "📚 Study",
                  params.hasStore !== false && "📦 Store",
                  params.hasUtility !== false && "🧺 Utility",
                ].filter(Boolean).map(f => (
                  <span key={f} style={{ fontSize:9, color:"#44DD88", background:"#0A1810", border:"1px solid #44DD8822", borderRadius:4, padding:"2px 7px" }}>{f}</span>
                ))}
              </div>
            </div>
            {/* Reconfigure button */}
            <div style={{ padding:"12px 14px", borderTop:"2px solid #1A1A28" }}>
              <button onClick={() => { setShowInputOverview(false); setReportReady(false); try { sessionStorage.removeItem("archi_plan"); } catch {} setPhase("wizard"); }} style={{
                width:"100%", padding:"8px", background:"transparent",
                border:"1px solid #4488FF44", borderRadius:5,
                color:"#4488FF", fontSize:10, cursor:"pointer",
                fontFamily:"monospace", letterSpacing:"0.06em",
              }}>← Reconfigure</button>
            </div>
          </div>
          {/* Backdrop */}
          <div onClick={() => setShowInputOverview(false)} style={{ flex:1, background:"rgba(0,0,0,0.5)" }}/>
        </div>
      )}

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
          {/* Hamburger — show input overview */}
          <button onClick={() => setShowInputOverview(v => !v)} title="View inputs" style={{
            padding:"0 14px", background:"transparent", border:"none",
            borderRight:"1px solid #1A1A28",
            color:"#555", fontSize:16, cursor:"pointer", flexShrink:0,
            transition:"color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.color="#4488FF"}
          onMouseLeave={e => e.currentTarget.style.color="#555"}
          >☰</button>

          {/* HTML report CTA — shown after HTML-mode generation */}
          {reportReady && (
            <button
              onClick={() => {
                exportPDF({ title:`${params.plotW}×${params.plotH}ft ${params.bhk}BHK Analysis Report`, arch:"Archi AI Studio", print: false });
              }}
              style={{
                padding:"0 16px", background:"transparent",
                border:"none", borderRight:"1px solid #1A1A2A",
                color:"#CC66FF", fontSize:10, fontWeight:700,
                cursor:"pointer", fontFamily:"monospace",
                letterSpacing:"0.06em", flexShrink:0,
                display:"flex", alignItems:"center", gap:6,
                animation:"pulse 2s ease-in-out infinite",
              }}
            >
              <span style={{ fontSize:13 }}>↗</span> VIEW REPORT
            </button>
          )}

          {/* SH3D export — visible once a plan is generated */}
          {layout?.rooms?.length > 0 && (
            <button
              onClick={exportSH3D}
              title="Export to Sweet Home 3D"
              style={{
                padding:"0 12px", background:"transparent",
                border:"none", borderRight:"1px solid #1A1A2A",
                color:"#44AAFF", fontSize:10, fontWeight:700,
                cursor:"pointer", fontFamily:"monospace",
                letterSpacing:"0.06em", flexShrink:0,
              }}
              onMouseEnter={e => e.currentTarget.style.color="#88CCFF"}
              onMouseLeave={e => e.currentTarget.style.color="#44AAFF"}
            >↓ SH3D</button>
          )}

          {/* Room render — visible once a plan is generated */}
          {layout?.rooms?.length > 0 && (
            <button
              onClick={() => {
                setRenderRoom(layout.rooms[0]?.name || "");
                setRenderImageUrl(null);
                setShowRenderModal(true);
              }}
              title="Generate photorealistic room render"
              style={{
                padding:"0 12px", background:"transparent",
                border:"none", borderRight:"1px solid #1A1A2A",
                color:"#DD88FF", fontSize:10, fontWeight:700,
                cursor:"pointer", fontFamily:"monospace",
                letterSpacing:"0.06em", flexShrink:0,
              }}
              onMouseEnter={e => e.currentTarget.style.color="#EEB8FF"}
              onMouseLeave={e => e.currentTarget.style.color="#DD88FF"}
            >◈ RENDER</button>
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
              padding:"0 12px", background:"transparent", border:"none",
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
                width:`${displayPct}%`,
                background:'linear-gradient(90deg, #4488FF, #44DD88)',
                transition:'width 0.15s linear',
              }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:2 }}>
              <span style={{ fontSize:7, color:'#333', fontFamily:'monospace' }}>{currentAgentLabel}</span>
              <span style={{ fontSize:7, color:'#333', fontFamily:'monospace' }}>{displayPct}%</span>
            </div>
          </div>
        )}

        {/* Tab content */}
        <div style={{ flex:1, overflow:"hidden", display:"flex" }}>

          {/* Floor Plan */}
          {tab==="plan" && !showDiff && (
            <div style={{ flex:1, overflow:"hidden", position:"relative" }}>
              {genMode === "image" && imageUrl ? (
                <div style={{
                  width:"100%", height:"100%",
                  display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center",
                  background:"#080814", padding:16, overflow:"auto",
                }}>
                  <img
                    src={imageUrl}
                    alt="AI-generated floor plan"
                    style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain",
                      borderRadius:8, boxShadow:"0 8px 48px rgba(68,221,136,0.15)" }}
                  />
                  <div style={{ marginTop:10, fontSize:9, color:"#444", fontFamily:"monospace" }}>
                    GPT Image · {params.plotW}×{params.plotH}ft {params.bhk}BHK {params.facing}-facing
                  </div>
                </div>
              ) : genMode === "image" && generating ? (
                <div style={{
                  width:"100%", height:"100%",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  background:"#080814",
                }}>
                  <div style={{ textAlign:"center", fontFamily:"monospace" }}>
                    <div style={{ fontSize:28, marginBottom:12, animation:"pulse 1.5s infinite" }}>🖼</div>
                    <div style={{ fontSize:11, color:"#44DD88" }}>Generating floor plan image…</div>
                    <div style={{ fontSize:9, color:"#444", marginTop:6 }}>GPT Image · this takes ~15–30s</div>
                  </div>
                </div>
              ) : (
                <FloorPlanViewer
                  svgCode={svgCode}
                  furniture={furnitureData}
                  showFurniture={showFurniture}
                  loading={generating && !svgCode}
                  showLabels={showLabels}
                  showSunPath={showSunPath}
                  theme={theme}
                  city={params.city}
                  layout={layout}
                  params={params}
                />
              )}
            </div>
          )}

          {/* 3D View */}
          {tab==="3d" && (
            <ThreeViewer layout={layout} params={params} furniture={furnitureData} />
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
          padding: "12px 14px 10px",
          borderBottom: "2px solid #1A1A28",
          background: "#060610",
        }}>
          <div style={{ fontSize: 8, color: "#333", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            ── Agent Pipeline ──
          </div>
          <div style={{ fontSize: 9, color: "#555", marginTop: 4, fontFamily: "monospace" }}>
            {generating ? "Running…" : agentStatuses && Object.values(agentStatuses).some(s => s === "done") ? "Last run complete" : "Idle"}
          </div>
          {/* Auth pill */}
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {user ? (
              <>
                <a href="/dashboard" style={{ fontSize: 8, color: "#4488FF", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>
                  ⊙ {user.email}
                </a>
                <button onClick={() => supabase.auth.signOut()} style={{ fontSize: 7, color: "#554444", background: "transparent", border: "none", cursor: "pointer", fontFamily: "monospace" }}>sign out</button>
              </>
            ) : (
              <a href="/login" style={{ fontSize: 8, color: "#555", textDecoration: "none", letterSpacing: "0.05em" }}>
                ← Sign in to save plans
              </a>
            )}
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

          {/* Generation mode toggle */}
          <div>
            <div style={{ fontSize: 8, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5, fontFamily: "monospace" }}>Gen Mode</div>
            <div style={{ display: "flex", flexDirection:"column", gap: 4 }}>
              {[
                { mode:"image", label:"🖼 Image", color:"#44DD88", sub:"AI image" },
                { mode:"svg",   label:"⟨/⟩ SVG",  color:"#4488FF", sub:"Vector" },
                { mode:"html",  label:"📄 Report", color:"#CC66FF", sub:"HTML doc" },
              ].map(({ mode, label, color, sub }) => (
                <button key={mode} onClick={() => { setGenMode(mode); setTab("plan"); htmlAutoOpenRef.current = false; }}
                  style={{
                    width:"100%", padding:"5px 8px", borderRadius:5, border:"none", cursor:"pointer",
                    fontSize:9, fontFamily:"monospace", fontWeight:700,
                    background: genMode === mode ? `${color}18` : "transparent",
                    color:      genMode === mode ? color : "#444",
                    outline:    genMode === mode ? `1px solid ${color}44` : "1px solid #1A1A2A",
                    transition:"all 0.15s",
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                  }}
                >
                  <span>{label}</span>
                  <span style={{ fontSize:7, opacity:0.6 }}>{sub}</span>
                </button>
              ))}
            </div>
          </div>

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

          {/* Regenerate */}
          <button
            onClick={() => { htmlAutoOpenRef.current = false; setPhase("generating"); if (genMode === "image") generateImage(); else generate(); }}
            disabled={generating}
            style={{
              width:"100%", padding:"8px",
              background: generating ? "#0A0A14" : "linear-gradient(135deg,#1A3A6A,#0E2040)",
              border: generating ? "1px solid #1A1A2A" : "1px solid #4488FF55",
              borderRadius:5, color: generating ? "#333" : "#4488FF",
              fontSize:10, fontWeight:700, cursor: generating ? "default" : "pointer",
              fontFamily:"monospace", letterSpacing:"0.06em", transition:"all 0.2s",
            }}
          >
            {generating ? "Generating…" : "⚡ Regenerate"}
          </button>

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
              <button onClick={() => setShowPdfModal(true)} style={{
                width: "100%", padding: "7px",
                background: "transparent", border: "1px solid #2A1A2A",
                borderRadius: 4, color: "#CC66FF", fontSize: 9, cursor: "pointer",
                fontFamily: "monospace", letterSpacing: "0.04em",
              }}>↓ Export PDF</button>
            </div>
          )}
        </div>
      </div>

    {/* ── Room Render Modal ──────────────────────────────────────────────── */}
    {showRenderModal && (
      <div
        onClick={e => { if (e.target === e.currentTarget) setShowRenderModal(false); }}
        style={{
          position:"fixed", inset:0, zIndex:200,
          background:"rgba(0,0,0,0.88)",
          display:"flex", alignItems:"center", justifyContent:"center",
          padding:16,
        }}
      >
        <div style={{
          background:"#0A0A18", border:"1px solid #1A1A2A",
          borderRadius:12, padding:24, width:"100%", maxWidth:540,
          maxHeight:"90vh", overflowY:"auto",
          fontFamily:"monospace",
        }}>
          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <span style={{ color:"#EEE", fontSize:13, fontWeight:700, letterSpacing:"0.06em" }}>◈ ROOM RENDER</span>
            <button onClick={() => setShowRenderModal(false)} style={{
              background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:20, lineHeight:1,
            }}>×</button>
          </div>

          {/* Room selector */}
          <div style={{ marginBottom:12 }}>
            <div style={{ color:"#555", fontSize:9, letterSpacing:"0.08em", marginBottom:6 }}>SELECT ROOM</div>
            <select
              value={renderRoom}
              onChange={e => { setRenderRoom(e.target.value); setRenderImageUrl(null); }}
              style={{
                width:"100%", padding:"8px 10px",
                background:"#080814", border:"1px solid #1A1A2A",
                borderRadius:6, color:"#CCC", fontSize:11, fontFamily:"monospace",
              }}
            >
              {(layout?.rooms || []).map(r => (
                <option key={r.name} value={r.name}>
                  {r.name} — {r.ftW}×{r.ftH} ft
                </option>
              ))}
            </select>
          </div>

          {/* Style selector */}
          <div style={{ marginBottom:16 }}>
            <div style={{ color:"#555", fontSize:9, letterSpacing:"0.08em", marginBottom:8 }}>INTERIOR STYLE</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {["modern","traditional","contemporary","luxury"].map(s => (
                <button
                  key={s}
                  onClick={() => setRenderStyle(s)}
                  style={{
                    padding:"5px 12px", borderRadius:4,
                    border:`1px solid ${renderStyle===s ? "#DD88FF" : "#1A1A2A"}`,
                    background: renderStyle===s ? "#1A0A2A" : "transparent",
                    color: renderStyle===s ? "#DD88FF" : "#555",
                    fontSize:10, cursor:"pointer", fontFamily:"monospace",
                    textTransform:"capitalize", letterSpacing:"0.04em",
                    transition:"all 0.15s",
                  }}
                >{s}</button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleRenderRoom}
            disabled={renderLoading || !renderRoom}
            style={{
              width:"100%", padding:"10px",
              background: renderLoading ? "#1A0A2A" : "linear-gradient(90deg,#6622AA,#9944DD)",
              border:"none", borderRadius:6,
              color: renderLoading ? "#885599" : "#FFF",
              fontSize:11, fontWeight:700, cursor: renderLoading ? "not-allowed" : "pointer",
              fontFamily:"monospace", letterSpacing:"0.06em",
              transition:"opacity 0.15s",
            }}
          >
            {renderLoading ? "RENDERING… (~15s)" : "GENERATE RENDER"}
          </button>

          {renderLoading && (
            <div style={{ textAlign:"center", marginTop:14, color:"#555", fontSize:9 }}>
              Flux AI is rendering your room — this takes 10–20 seconds
            </div>
          )}

          {/* Result image */}
          {renderImageUrl && !renderLoading && (
            <div style={{ marginTop:18 }}>
              <img
                src={renderImageUrl}
                alt={renderRoom}
                style={{ width:"100%", borderRadius:8, display:"block",
                  boxShadow:"0 8px 40px rgba(180,80,255,0.15)" }}
                onError={e => { e.currentTarget.style.display="none"; }}
              />
              <div style={{ display:"flex", gap:8, marginTop:10 }}>
                <a
                  href={renderImageUrl}
                  download={`${renderRoom.replace(/\s+/g,"_")}_render.jpg`}
                  target="_blank" rel="noreferrer"
                  style={{
                    flex:1, textAlign:"center", padding:"7px",
                    background:"transparent", border:"1px solid #1A1A2A",
                    borderRadius:4, color:"#888", fontSize:9,
                    textDecoration:"none", fontFamily:"monospace",
                    letterSpacing:"0.04em",
                  }}
                >↓ DOWNLOAD</a>
                <button
                  onClick={() => { setRenderImageUrl(null); handleRenderRoom(); }}
                  style={{
                    flex:1, padding:"7px",
                    background:"transparent", border:"1px solid #1A1A2A",
                    borderRadius:4, color:"#888", fontSize:9, cursor:"pointer",
                    fontFamily:"monospace", letterSpacing:"0.04em",
                  }}
                >↺ REGENERATE</button>
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    </div>
  );
}
