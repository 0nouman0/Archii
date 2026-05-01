"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { VASTU_PRESETS, ARCHETYPES, PLOT_SHAPES } from "../../lib/presets";
import { computeLayout, ROOM_COLORS } from "../../lib/layoutEngine";
import { supabase } from "../../lib/supabase";

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  bg:       "#080814",
  surface:  "#0f0f1e",
  border:   "#1e1e3a",
  text:     "#D8D8EC",
  muted:    "#6b6b9a",
  blue:     "#4488FF",
  green:    "#44DD88",
  yellow:   "#F0E040",
  orange:   "#FFAA22",
  purple:   "#CC66FF",
};

// ─── Mini Plan Preview ─────────────────────────────────────────────────────────
function MiniPlanPreview({ preset }) {
  let layout = null;
  let error  = false;
  try {
    layout = computeLayout({
      plotW:  preset.plotW,
      plotH:  preset.plotH,
      bhk:    preset.bhk,
      facing: preset.facing,
      city:   preset.city   || "NBC (Generic)",
      budget: preset.budget || "Economy (₹20-40L)",
      floors: preset.floors || 1,
    });
  } catch (e) {
    error = true;
  }

  const previewH = 160;

  if (error || !layout) {
    return (
      <div style={{
        height: previewH,
        background: "#1a1a2e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: C.muted,
        fontSize: 11,
        fontFamily: "monospace",
        borderRadius: "8px 8px 0 0",
      }}>
        Preview unavailable
      </div>
    );
  }

  const { rooms, W, H } = layout;
  const PAD = 4;
  const vbW = W + PAD * 2;
  const vbH = H + PAD * 2;
  const aspect = vbW / vbH;
  const svgW = previewH * aspect;

  function abbrev(name) {
    const words = name.split(" ");
    if (words.length === 1) return name.slice(0, 4);
    return words.map(w => w[0]).join("").slice(0, 4);
  }

  return (
    <div style={{
      background: "#ffffff",
      borderRadius: "8px 8px 0 0",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: previewH,
    }}>
      <svg
        viewBox={`${-PAD} ${-PAD} ${vbW} ${vbH}`}
        width={Math.min(svgW, 360)}
        height={previewH}
        style={{ display: "block" }}
      >
        {/* Plot boundary */}
        <rect x={0} y={0} width={W} height={H} fill="#f0f0f0" stroke="#ccc" strokeWidth={1} />
        {/* Rooms */}
        {rooms.map((r, i) => {
          const color = r.color || ROOM_COLORS[r.name] || "#D0D0C8";
          const label = abbrev(r.name);
          const fontSize = Math.max(5, Math.min(9, r.w / 4, r.h / 2));
          return (
            <g key={i}>
              <rect
                x={r.x} y={r.y} width={r.w} height={r.h}
                fill={color}
                stroke="#fff"
                strokeWidth={1}
              />
              {r.w > 14 && r.h > 10 && (
                <text
                  x={r.x + r.w / 2}
                  y={r.y + r.h / 2 + fontSize * 0.35}
                  textAnchor="middle"
                  fontSize={fontSize}
                  fontFamily="monospace"
                  fill="#222"
                  fontWeight="600"
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}
        {/* Compass N label */}
        <text x={W - 4} y={10} textAnchor="end" fontSize={7} fontFamily="monospace" fill="#555" fontWeight="700">N↑</text>
      </svg>
    </div>
  );
}

// ─── Score Badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ score }) {
  const color = score >= 90 ? C.green : score >= 80 ? C.yellow : C.orange;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      fontFamily: "monospace",
      fontSize: 12,
      color,
      fontWeight: 700,
    }}>
      <span style={{ fontSize: 9, opacity: 0.7 }}>VASTU</span>
      {score}
    </span>
  );
}

// ─── Tag Badge ─────────────────────────────────────────────────────────────────
function TagBadge({ tag }) {
  if (!tag) return null;
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 20,
      fontSize: 10,
      fontFamily: "monospace",
      fontWeight: 700,
      background: `${C.orange}20`,
      color: C.orange,
      border: `1px solid ${C.orange}50`,
      letterSpacing: "0.04em",
    }}>
      ★ {tag}
    </span>
  );
}

// ─── Category Badge ────────────────────────────────────────────────────────────
function CatBadge({ cat }) {
  const map = { standard: [C.blue, "Vastu"], archetype: [C.purple, "Archetype"], shape: [C.green, "Plot Shape"] };
  const [col, label] = map[cat] || [C.muted, cat];
  return (
    <span style={{
      display: "inline-block",
      padding: "1px 7px",
      borderRadius: 20,
      fontSize: 9,
      fontFamily: "monospace",
      fontWeight: 700,
      background: `${col}18`,
      color: col,
      border: `1px solid ${col}40`,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
    }}>
      {label}
    </span>
  );
}

// ─── Plan Overlay ──────────────────────────────────────────────────────────────
function PlanOverlay({ item, onClose }) {
  let layout = null;
  try {
    layout = computeLayout({
      plotW: item.plotW, plotH: item.plotH, bhk: item.bhk,
      facing: item.facing, city: item.city || "NBC (Generic)",
      budget: item.budget || "Economy (₹20-40L)", floors: item.floors || 1,
    });
  } catch (_) {}

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const { rooms, W, H } = layout || { rooms: [], W: 300, H: 400 };
  const PAD = 16;
  const vbW = W + PAD * 2;
  const vbH = H + PAD * 2;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(4,4,12,0.88)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 16, overflow: "hidden",
          maxWidth: 820, width: "100%", maxHeight: "90vh",
          display: "flex", flexDirection: "column",
          boxShadow: `0 32px 80px rgba(0,0,0,0.7)`,
        }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#0a0a18", flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 3 }}>
              {item.icon && <span style={{ marginRight: 8 }}>{item.icon}</span>}
              {item.name}
            </div>
            <div style={{ display: "flex", gap: 14, fontFamily: "monospace", fontSize: 11, color: C.muted }}>
              {item.bhk && <span style={{ color: C.blue }}>{item.bhk} BHK</span>}
              {item.plotW && <span>{item.plotW}×{item.plotH} ft</span>}
              {item.facing && <span>{item.facing}-facing</span>}
              {item.area && <span>{item.area.toLocaleString()} sqft</span>}
              {item.vastuScore && <span style={{ color: C.green }}>Vastu {item.vastuScore}</span>}
              {item.estCost && <span style={{ color: C.yellow }}>{item.estCost}</span>}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "transparent", border: `1px solid ${C.border}`,
            borderRadius: 8, color: C.muted, fontSize: 18,
            width: 34, height: 34, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "border-color 0.15s, color 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.text; e.currentTarget.style.color = C.text; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
          >✕</button>
        </div>

        {/* Large plan */}
        <div style={{
          flex: 1, overflow: "auto", background: "#ffffff",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, minHeight: 300,
        }}>
          {layout ? (
            <svg
              viewBox={`${-PAD} ${-PAD} ${vbW} ${vbH}`}
              style={{ width: "100%", maxWidth: 700, height: "auto", display: "block" }}
            >
              <rect x={0} y={0} width={W} height={H} fill="#f5f5f0" stroke="#999" strokeWidth={2} />
              {rooms.map((r, i) => {
                const color = r.color || ROOM_COLORS[r.name] || "#D0D0C8";
                const fs = Math.max(7, Math.min(14, Math.min(r.w, r.h) / 5));
                const cx = r.x + r.w / 2;
                const cy = r.y + r.h / 2;
                return (
                  <g key={i}>
                    <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={color} stroke="#fff" strokeWidth={1.5} />
                    {r.w > 20 && r.h > 14 && (
                      <>
                        <text x={cx} y={cy - fs * 0.3} textAnchor="middle" fontSize={fs}
                          fontFamily="monospace" fill="#111" fontWeight="700">{r.name}</text>
                        <text x={cx} y={cy + fs * 1.1} textAnchor="middle" fontSize={fs * 0.75}
                          fontFamily="monospace" fill="#555">{r.ftW}×{r.ftH}ft</text>
                      </>
                    )}
                  </g>
                );
              })}
              {/* North arrow */}
              <text x={W - 4} y={14} textAnchor="end" fontSize={10} fontFamily="monospace" fill="#333" fontWeight="700">N↑</text>
              {/* Dimension labels */}
              <text x={W / 2} y={-4} textAnchor="middle" fontSize={9} fontFamily="monospace" fill="#666">← {item.plotW} ft →</text>
              <text x={-4} y={H / 2} textAnchor="middle" fontSize={9} fontFamily="monospace" fill="#666"
                transform={`rotate(-90,${-4},${H / 2})`}>{item.plotH} ft</text>
            </svg>
          ) : (
            <div style={{ color: C.muted, fontFamily: "monospace", fontSize: 13 }}>Preview unavailable</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Preset Card ───────────────────────────────────────────────────────────────
function PresetCard({ item, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const isArchetype = item.category === "archetype";
  const isShape     = item.category === "shape";

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#13132a" : C.surface,
        border: `1px solid ${hovered ? C.blue + "60" : C.border}`,
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.18s, background 0.18s, transform 0.15s, box-shadow 0.18s",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered ? `0 8px 32px ${C.blue}22` : "none",
        cursor: "pointer",
      }}
    >
      {/* Mini floor plan */}
      <MiniPlanPreview preset={item} />

      {/* Card body */}
      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
              {isArchetype && (
                <span style={{ fontSize: 16 }}>{item.icon}</span>
              )}
              <span style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>
                {item.name}
              </span>
            </div>
            <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{item.subtitle}</div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <CatBadge cat={item.category} />
          </div>
        </div>

        {/* Tag */}
        {item.tag && <div><TagBadge tag={item.tag} /></div>}

        {/* Metrics */}
        <div style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          fontFamily: "monospace",
          fontSize: 11,
          color: C.muted,
          paddingBottom: 8,
          borderBottom: `1px solid ${C.border}`,
        }}>
          {item.bhk && (
            <span style={{ color: C.blue }}>{item.bhk} BHK</span>
          )}
          {item.area && (
            <span>{item.area.toLocaleString()} sqft</span>
          )}
          {item.city && (
            <span style={{ color: C.purple, fontSize: 10 }}>{item.city.split(" ")[0]}</span>
          )}
        </div>

        {/* Cultural note (archetypes) */}
        {isArchetype && item.culturalNote && (
          <div style={{
            fontSize: 11,
            color: `${C.text}99`,
            lineHeight: 1.55,
            padding: "8px 10px",
            background: `${C.purple}0a`,
            borderLeft: `2px solid ${C.purple}60`,
            borderRadius: "0 6px 6px 0",
          }}>
            {item.culturalNote.slice(0, 220)}
            {item.culturalNote.length > 220 && "…"}
          </div>
        )}

        {/* Vastu note (shapes) */}
        {isShape && item.vastuNote && (
          <div style={{
            fontSize: 11,
            color: `${C.text}99`,
            lineHeight: 1.55,
            padding: "8px 10px",
            background: `${C.green}0a`,
            borderLeft: `2px solid ${C.green}60`,
            borderRadius: "0 6px 6px 0",
          }}>
            {item.vastuNote.slice(0, 200)}
            {item.vastuNote.length > 200 && "…"}
          </div>
        )}

        {/* Highlights / features */}
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
          {(item.highlights || item.features || item.adjustments || []).slice(0, 3).map((h, i) => (
            <li key={i} style={{
              fontSize: 11,
              color: `${C.text}cc`,
              lineHeight: 1.45,
              paddingLeft: 14,
              position: "relative",
            }}>
              <span style={{
                position: "absolute",
                left: 0,
                top: 1,
                color: C.green,
                fontSize: 9,
              }}>✓</span>
              {h.length > 90 ? h.slice(0, 90) + "…" : h}
            </li>
          ))}
        </ul>

        {/* Footer: cost + vastu score */}
        {(item.estCost || item.vastuScore) && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            marginTop: "auto", paddingTop: 8,
            borderTop: `1px solid ${C.border}`,
          }}>
            {item.estCost && (
              <span style={{ fontFamily: "monospace", fontSize: 12, color: C.yellow, fontWeight: 700 }}>
                {item.estCost}
              </span>
            )}
            {item.vastuScore && <ScoreBadge score={item.vastuScore} />}
            <span style={{ marginLeft: "auto", fontSize: 10, color: C.muted, fontFamily: "monospace" }}>
              click to expand ↗
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Filter Pill ───────────────────────────────────────────────────────────────
function Pill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 14px",
        borderRadius: 20,
        border: `1px solid ${active ? C.blue : C.border}`,
        background: active ? `${C.blue}22` : "transparent",
        color: active ? C.blue : C.muted,
        fontSize: 12,
        fontFamily: "monospace",
        fontWeight: active ? 700 : 400,
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

// ─── Nav Bar ───────────────────────────────────────────────────────────────────
function NavBar() {
  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: `${C.bg}ee`,
      backdropFilter: "blur(12px)",
      borderBottom: `1px solid ${C.border}`,
      padding: "0 24px",
      display: "flex",
      alignItems: "center",
      height: 56,
      gap: 0,
    }}>
      {/* Back */}
      <Link href="/" style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        color: C.muted,
        textDecoration: "none",
        fontFamily: "monospace",
        fontSize: 12,
        marginRight: 20,
        transition: "color 0.15s",
      }}
        onMouseEnter={e => e.currentTarget.style.color = C.text}
        onMouseLeave={e => e.currentTarget.style.color = C.muted}
      >
        ← Back
      </Link>

      {/* Logo */}
      <div style={{
        fontFamily: "monospace",
        fontSize: 16,
        fontWeight: 700,
        color: C.blue,
        marginRight: "auto",
        letterSpacing: "0.02em",
      }}>
        Archi AI
      </div>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {[
          { label: "Studio",       href: "/app" },
          { label: "Beliefs",     href: "/beliefs" },
          { label: "Canvas Check", href: "/canvas" },
        ].map(({ label, href }) => (
          <Link key={href} href={href} style={{
            padding: "6px 12px",
            borderRadius: 8,
            color: C.muted,
            textDecoration: "none",
            fontSize: 13,
            fontFamily: "inherit",
            transition: "color 0.15s, background 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.background = `${C.border}80`; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = "transparent"; }}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

// ─── BUDGETS ──────────────────────────────────────────────────────────────────
const BUDGETS = [
  "All",
  "Economy (₹20-40L)",
  "Lower-Premium (₹40-60L)",
  "Premium (₹60-100L)",
  "Luxury (₹1Cr+)",
];

// ─── DB row → preset shape ─────────────────────────────────────────────────────
function rowToPreset(r) {
  return {
    id:           r.id,
    name:         r.name,
    subtitle:     r.subtitle,
    tag:          r.tag,
    plotW:        r.plot_w,
    plotH:        r.plot_h,
    bhk:          r.bhk,
    facing:       r.facing,
    city:         r.city,
    budget:       r.budget,
    floors:       r.floors,
    area:         r.area,
    vastuScore:   r.vastu_score,
    estCost:      r.est_cost,
    highlights:   r.highlights   || [],
    category:     r.category,
    culturalNote: r.cultural_note,
    vastuNote:    r.vastu_note,
    icon:         r.icon,
    origin:       r.origin,
    adjustments:  r.adjustments  || [],
    features:     r.features     || [],
  };
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function PresetsPage() {
  const [activeTab, setActiveTab]       = useState(0);
  const [bhkFilter, setBhkFilter]       = useState("All");
  const [budgetFilter, setBudgetFilter] = useState("All");
  const [facingFilter, setFacingFilter] = useState("All");
  const [selectedPreset, setSelectedPreset] = useState(null);

  // Live data from Supabase; fall back to static while loading
  const [dbStandard,   setDbStandard]   = useState(VASTU_PRESETS);
  const [dbArchetypes, setDbArchetypes] = useState(ARCHETYPES);
  const [dbShapes,     setDbShapes]     = useState(PLOT_SHAPES);

  useEffect(() => {
    supabase
      .from("vastu_presets")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error || !data?.length) return;
        const all = data.map(rowToPreset);
        const standard   = all.filter(p => p.category === "standard");
        const archetypes = all.filter(p => p.category === "archetype");
        const shapes     = all.filter(p => p.category === "shape");
        if (standard.length)   setDbStandard(standard);
        if (archetypes.length) setDbArchetypes(archetypes);
        if (shapes.length)     setDbShapes(shapes);
      });
  }, []);

  const tabs = [
    { label: `Vastu Presets (${dbStandard.length})`,      data: dbStandard   },
    { label: `Cultural Archetypes (${dbArchetypes.length})`, data: dbArchetypes },
    { label: `Plot Shapes (${dbShapes.length})`,          data: dbShapes     },
  ];

  const filtered = useMemo(() => {
    const data = tabs[activeTab].data;
    if (activeTab !== 0) return data;
    return data.filter(p => {
      if (bhkFilter !== "All" && String(p.bhk) !== bhkFilter) return false;
      if (budgetFilter !== "All" && p.budget !== budgetFilter) return false;
      if (facingFilter !== "All" && p.facing !== facingFilter) return false;
      return true;
    });
  }, [activeTab, bhkFilter, budgetFilter, facingFilter, dbStandard, dbArchetypes, dbShapes]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "inherit" }}>
      {selectedPreset && (
        <PlanOverlay item={selectedPreset} onClose={() => setSelectedPreset(null)} />
      )}
      <NavBar />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 60px" }}>

        {/* Page Title */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            margin: 0,
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 800,
            color: C.text,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
          }}>
            Preset Floor Plans
          </h1>
          <p style={{
            margin: "8px 0 0",
            fontSize: 14,
            color: C.muted,
            lineHeight: 1.5,
          }}>
            Production-ready Vastu-compliant layouts for every plot size, tradition, and budget.
            Click any card to preview the floor plan in detail.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: "flex",
          gap: 0,
          borderBottom: `1px solid ${C.border}`,
          marginBottom: 24,
          overflowX: "auto",
        }}>
          {tabs.map((t, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              style={{
                padding: "10px 20px",
                background: "transparent",
                border: "none",
                borderBottom: activeTab === i ? `2px solid ${C.blue}` : "2px solid transparent",
                color: activeTab === i ? C.blue : C.muted,
                fontFamily: "monospace",
                fontSize: 13,
                fontWeight: activeTab === i ? 700 : 400,
                cursor: "pointer",
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
                transition: "color 0.15s",
                marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filter Bar (only for Presets tab) */}
        {activeTab === 0 && (
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 28,
            padding: "14px 16px",
            background: `${C.surface}`,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            alignItems: "center",
          }}>
            {/* BHK Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>BHK</span>
              {["All", "1", "2", "3", "4", "5"].map(b => (
                <Pill key={b} label={b} active={bhkFilter === b} onClick={() => setBhkFilter(b)} />
              ))}
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 24, background: C.border, flexShrink: 0 }} />

            {/* Budget Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>Budget</span>
              <select
                value={budgetFilter}
                onChange={e => setBudgetFilter(e.target.value)}
                style={{
                  padding: "5px 10px",
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  background: C.bg,
                  color: C.text,
                  fontFamily: "monospace",
                  fontSize: 12,
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 24, background: C.border, flexShrink: 0 }} />

            {/* Facing Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>Facing</span>
              {["All", "N", "E", "S", "W"].map(f => {
                const facingMap = { All: "All", N: "North", E: "East", S: "South", W: "West" };
                return (
                  <Pill
                    key={f}
                    label={f}
                    active={facingFilter === facingMap[f]}
                    onClick={() => setFacingFilter(facingMap[f])}
                  />
                );
              })}
            </div>

            {/* Result count */}
            <div style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 11, color: C.muted }}>
              {filtered.length} plan{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "80px 24px",
            color: C.muted,
            fontFamily: "monospace",
            fontSize: 14,
          }}>
            No presets match the selected filters. Try clearing a filter.
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}>
            {filtered.map(item => (
              <PresetCard key={item.id} item={item} onSelect={() => setSelectedPreset(item)} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${C.border}`,
        padding: "20px 24px",
        textAlign: "center",
        fontFamily: "monospace",
        fontSize: 11,
        color: C.muted,
      }}>
        Archi AI — {VASTU_PRESETS.length + ARCHETYPES.length + PLOT_SHAPES.length} curated Vastu-compliant floor plans
      </footer>
    </div>
  );
}
