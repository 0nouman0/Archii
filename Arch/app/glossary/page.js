"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { GLOSSARY_TERMS, GLOSSARY_CATEGORIES } from "../../lib/glossary";

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  bg:      "#080814",
  surface: "#0f0f1e",
  border:  "#1e1e3a",
  text:    "#D8D8EC",
  muted:   "#6b6b9a",
  blue:    "#4488FF",
  green:   "#44DD88",
  yellow:  "#F0E040",
  orange:  "#FFAA22",
  purple:  "#CC66FF",
  cyan:    "#22DDEE",
};

// ─── Category color map ────────────────────────────────────────────────────────
const CAT_COLOR = {
  zones:      C.blue,
  directions: C.green,
  rooms:      C.yellow,
  rituals:    C.orange,
  concepts:   C.purple,
  regulatory: C.cyan,
};

function catColor(cat) {
  return CAT_COLOR[cat] || C.muted;
}

function capFirst(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
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
    }}>
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

      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {[
          { label: "Studio",   href: "/app" },
          { label: "Presets",  href: "/presets" },
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

// ─── Category Badge ────────────────────────────────────────────────────────────
function CatBadge({ cat }) {
  const col = catColor(cat);
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 20,
      fontSize: 10,
      fontFamily: "monospace",
      fontWeight: 700,
      background: `${col}18`,
      color: col,
      border: `1px solid ${col}40`,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
    }}>
      {capFirst(cat)}
    </span>
  );
}

// ─── Related Term Chip ─────────────────────────────────────────────────────────
function RelatedChip({ id, label }) {
  return (
    <a
      href={`#${id}`}
      style={{
        display: "inline-block",
        padding: "2px 9px",
        borderRadius: 12,
        fontSize: 10,
        fontFamily: "monospace",
        color: C.muted,
        background: `${C.border}60`,
        border: `1px solid ${C.border}`,
        textDecoration: "none",
        transition: "color 0.13s, border-color 0.13s",
        cursor: "pointer",
      }}
      onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = C.muted; }}
      onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
    >
      {label}
    </a>
  );
}

// ─── Glossary Term Card ────────────────────────────────────────────────────────
function TermCard({ term }) {
  const [hovered, setHovered] = useState(false);
  const col = catColor(term.category);

  // Build a map id→term for related chips
  const relatedTerms = term.related
    ? term.related.map(rid => {
        const found = GLOSSARY_TERMS.find(t => t.id === rid);
        return found ? { id: rid, label: found.term } : { id: rid, label: rid };
      })
    : [];

  const isTip = !!term.tip;

  return (
    <div
      id={term.id}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#13132a" : C.surface,
        borderTop: `3px solid ${col}`,
        borderRight: `1px solid ${hovered ? col + "55" : C.border}`,
        borderBottom: `1px solid ${hovered ? col + "55" : C.border}`,
        borderLeft: `1px solid ${hovered ? col + "55" : C.border}`,
        borderRadius: 10,
        padding: "18px 18px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transition: "border-color 0.18s, background 0.18s, transform 0.15s, box-shadow 0.18s",
        transform: hovered ? "translateY(-1px)" : "none",
        boxShadow: hovered ? `0 6px 24px ${col}12` : "none",
        scrollMarginTop: 72,
      }}
    >
      {/* Term name row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{
            fontSize: 18,
            fontWeight: 700,
            color: col,
            lineHeight: 1.2,
            marginBottom: 3,
          }}>
            {term.term}
          </div>
          {term.devanagari && (
            <div style={{
              fontSize: 14,
              color: `${C.text}55`,
              fontFamily: "serif",
              lineHeight: 1.3,
            }}>
              {term.devanagari}
            </div>
          )}
          {term.pronunciation && (
            <div style={{
              fontSize: 10,
              color: C.muted,
              fontFamily: "monospace",
              fontStyle: "italic",
              letterSpacing: "0.04em",
              marginTop: 2,
            }}>
              /{term.pronunciation}/
            </div>
          )}
        </div>
        <CatBadge cat={term.category} />
      </div>

      {/* Definition */}
      <p style={{
        margin: 0,
        fontSize: 12,
        color: `${C.text}cc`,
        lineHeight: 1.65,
      }}>
        {term.definition}
      </p>

      {/* Tip box */}
      {isTip && (
        <div style={{
          padding: "8px 12px",
          background: `${C.green}0c`,
          borderLeft: `3px solid ${C.green}70`,
          borderRadius: "0 6px 6px 0",
          fontSize: 11,
          color: `${C.text}bb`,
          lineHeight: 1.55,
        }}>
          <span style={{ color: C.green, fontWeight: 700, marginRight: 4 }}>💡</span>
          {term.tip}
        </div>
      )}

      {/* Related terms */}
      {relatedTerms.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 10,
            fontFamily: "monospace",
            color: C.muted,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            Related:
          </span>
          {relatedTerms.map(({ id, label }) => (
            <RelatedChip key={id} id={id} label={label} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Filter Pill ───────────────────────────────────────────────────────────────
function Pill({ label, active, color, onClick }) {
  const col = active ? (color || C.blue) : C.muted;
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 14px",
        borderRadius: 20,
        border: `1px solid ${active ? col : C.border}`,
        background: active ? `${col}20` : "transparent",
        color: col,
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

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function GlossaryPage() {
  const [search, setSearch]     = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...GLOSSARY_CATEGORIES];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return GLOSSARY_TERMS.filter(t => {
      const matchCat = activeCategory === "All" || t.category === activeCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        (t.devanagari || "").toLowerCase().includes(q)
      );
    });
  }, [search, activeCategory]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "inherit" }}>
      <NavBar />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 60px" }}>

        {/* Page Title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            margin: 0,
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 800,
            color: C.text,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
          }}>
            Vastu Glossary
          </h1>
          <p style={{
            margin: "8px 0 0",
            fontSize: 14,
            color: C.muted,
            lineHeight: 1.5,
          }}>
            {GLOSSARY_TERMS.length} terms explained — from ancient Vedic concepts to modern regulatory definitions.
          </p>
        </div>

        {/* Search + Count row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 18,
          flexWrap: "wrap",
        }}>
          <div style={{ position: "relative", flex: "1 1 280px", maxWidth: 480 }}>
            <span style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: C.muted,
              fontSize: 14,
              pointerEvents: "none",
            }}>
              ⌕
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search terms, definitions…"
              style={{
                width: "100%",
                padding: "10px 14px 10px 34px",
                borderRadius: 10,
                border: `1px solid ${search ? C.blue + "60" : C.border}`,
                background: C.surface,
                color: C.text,
                fontFamily: "inherit",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={e => e.target.style.borderColor = `${C.blue}80`}
              onBlur={e => e.target.style.borderColor = search ? `${C.blue}60` : C.border}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: C.muted,
                  cursor: "pointer",
                  fontSize: 14,
                  padding: "2px 4px",
                }}
              >
                ✕
              </button>
            )}
          </div>
          <div style={{
            fontFamily: "monospace",
            fontSize: 12,
            color: C.muted,
            whiteSpace: "nowrap",
          }}>
            {filtered.length} of {GLOSSARY_TERMS.length} terms
          </div>
        </div>

        {/* Category Filter Pills */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 32,
        }}>
          {categories.map(cat => (
            <Pill
              key={cat}
              label={cat === "All" ? "All" : capFirst(cat)}
              active={activeCategory === cat}
              color={cat === "All" ? C.blue : catColor(cat)}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>

        {/* Terms Grid */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "80px 24px",
            color: C.muted,
            fontFamily: "monospace",
            fontSize: 14,
          }}>
            {search
              ? `No terms found for "${search}". Try a different search.`
              : "No terms in this category."}
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 18,
            alignItems: "start",
          }}>
            {filtered.map(term => (
              <TermCard key={term.id} term={term} />
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
        Archi AI Glossary — {GLOSSARY_TERMS.length} terms across {GLOSSARY_CATEGORIES.length} categories
      </footer>
    </div>
  );
}
