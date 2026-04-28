"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** Hero headline: cycling prefix (Vastu, Mīmārī, Christian, municipal / codes). */
const HERO_PREFIX_WORDS = [
  { text: "Vastu", color: "#E8E8F4" },
  { text: "Mīmārī", color: "#44DD88" },
  { text: "Christian", color: "#88BBFF" },
  { text: "BBMP", color: "#F0E040" },
  { text: "GHMC", color: "#44DD88" },
  { text: "PCMC", color: "#66AAFF" },
  { text: "BDA", color: "#CC88FF" },
  { text: "Municipal", color: "#AAAACC" },
  { text: "NBC", color: "#FFAA66" },
];

const HERO_METER_HOLD_MS = 2600;
const HERO_METER_SLIDE_MS = 480;

function HeroMeterWord({ words }) {
  const [index, setIndex] = useState(0);
  const [sliding, setSliding] = useState(false);

  const longest = useMemo(
    () => words.reduce((a, b) => (a.text.length >= b.text.length ? a : b), words[0]),
    [words],
  );

  useEffect(() => {
    let cancelled = false;
    let tHold;
    let tSlide;

    const schedule = () => {
      tHold = setTimeout(() => {
        if (cancelled) return;
        setSliding(true);
        tSlide = setTimeout(() => {
          if (cancelled) return;
          setIndex((i) => (i + 1) % words.length);
          setSliding(false);
          schedule();
        }, HERO_METER_SLIDE_MS);
      }, HERO_METER_HOLD_MS);
    };

    schedule();
    return () => {
      cancelled = true;
      clearTimeout(tHold);
      clearTimeout(tSlide);
    };
  }, [words.length]);

  const cur = words[index];
  const next = words[(index + 1) % words.length];
  const glow = (c) => `0 0 36px ${c}40, 0 0 72px ${c}1a`;

  const layerColor = (c) => ({
    color: c.color,
    textShadow: glow(c.color),
  });

  return (
    <span
      className="hero-meter-slot"
      style={{
        position: "relative",
        display: "inline-block",
        verticalAlign: "baseline",
        overflow: "hidden",
        lineHeight: "inherit",
      }}
    >
      {/* In-flow strut: same line box as rest of h1; width = longest label so hyphen stays fixed */}
      <span
        aria-hidden
        style={{
          visibility: "hidden",
          pointerEvents: "none",
          userSelect: "none",
          fontWeight: 900,
        }}
      >
        {longest.text}
      </span>
      {!sliding && (
        <span
          className="hero-meter-layer hero-meter-rest"
          style={layerColor(cur)}
        >
          {cur.text}
        </span>
      )}
      {sliding && (
        <>
          <span className="hero-meter-layer hero-meter-out" style={layerColor(cur)}>
            {cur.text}
          </span>
          <span className="hero-meter-layer hero-meter-in" style={layerColor(next)}>
            {next.text}
          </span>
        </>
      )}
    </span>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const canvasRef = useRef(null);

  // Animated blueprint grid canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      t += 0.004;
      const { width: W, height: H } = canvas;
      ctx.clearRect(0, 0, W, H);

      // Blueprint grid lines
      const gridSize = 48;
      ctx.strokeStyle = "rgba(68,136,255,0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Animated room outline sketch
      const cx = W * 0.72, cy = H * 0.5;
      const scale = Math.min(W, H) * 0.28;
      const alpha = 0.06 + 0.02 * Math.sin(t);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = `rgba(68,136,255,${alpha})`;
      ctx.lineWidth = 1.5;

      // Outer plot boundary
      ctx.strokeRect(-scale * 0.5, -scale * 0.5, scale, scale);

      // Room partitions
      ctx.beginPath();
      ctx.moveTo(-scale * 0.5, 0);
      ctx.lineTo(scale * 0.2, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(scale * 0.2, -scale * 0.5);
      ctx.lineTo(scale * 0.2, scale * 0.5);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-scale * 0.5, -scale * 0.18);
      ctx.lineTo(scale * 0.2, -scale * 0.18);
      ctx.stroke();

      // Compass rose
      const cr = scale * 0.08;
      const ca = 0.12 + 0.04 * Math.sin(t * 1.5);
      ctx.strokeStyle = `rgba(240,224,64,${ca})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(scale * 0.38, -scale * 0.42);
      ctx.lineTo(scale * 0.38, -scale * 0.42 - cr);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(scale * 0.38, -scale * 0.42, cr * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // Floating dimension lines
      const dimAlpha = 0.05 + 0.02 * Math.sin(t * 0.7);
      ctx.strokeStyle = `rgba(68,221,136,${dimAlpha})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.moveTo(W * 0.05, H * 0.2);
      ctx.lineTo(W * 0.35, H * 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(W * 0.05, H * 0.8);
      ctx.lineTo(W * 0.35, H * 0.8);
      ctx.stroke();
      ctx.setLineDash([]);

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const features = [
    {
      icon: "⬡",
      color: "#4488FF",
      title: "6-Agent AI Pipeline",
      desc: "Input Parser · Spatial Planner · SVG Renderer · Vastu Critic · Cost Estimator · Furniture AI — all running in sequence.",
    },
    {
      icon: "ॐ",
      color: "#F0E040",
      title: "Vastu Shastra Compliant",
      desc: "14 Vastu rules audited per plan. Directional room placement, compass orientation, NE/SE/SW zone assignments.",
    },
    {
      icon: "⚖",
      color: "#44DD88",
      title: "Indian Municipal Codes",
      desc: "BBMP, GHMC, PCMC, BDA and more. FAR limits, setback rules, green coverage checked automatically.",
    },
    {
      icon: "₹",
      color: "#CC66FF",
      title: "Cost & BOM Estimation",
      desc: "Region-specific construction cost breakdown, bill of materials, and project timeline for every design.",
    },
    {
      icon: "🏛",
      color: "#44DD88",
      title: "Presets Library",
      desc: "20+ ready Vastu plans",
      href: "/presets",
    },
    {
      icon: "📖",
      color: "#FFAA22",
      title: "Design Beliefs",
      desc: "Vastu · Islamic · Christian glossaries",
      href: "/beliefs",
    },
    {
      icon: "✏️",
      color: "#CC66FF",
      title: "Canvas Check",
      desc: "Draw & validate your plan",
      href: "/canvas",
    },
    {
      icon: "📋",
      color: "#22DDEE",
      title: "Regulations",
      desc: "City-wise building bylaws & sanction process",
      href: "/regulations",
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080814",
      color: "#D8D8EC",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Nav */}
      <nav style={{
        position:'sticky', top:0, zIndex:100,
        display:'flex', alignItems:'center', gap:16,
        padding:'12px 32px',
        background:'rgba(8,8,20,0.92)', backdropFilter:'blur(12px)',
        borderBottom:'1px solid #1A1A28',
        flexWrap:'wrap',
      }}>
        <span style={{ fontSize:16, fontWeight:700, color:'#F0E040', fontFamily:'Georgia,serif', marginRight:8 }}>
          वास्तु AI
        </span>
        {[
          { href:'/app',         label:'Studio',       color:'#4488FF' },
          { href:'/presets',     label:'Presets',      color:'#44DD88' },
          { href:'/beliefs',     label:'Beliefs',      color:'#FFAA22' },
          { href:'/canvas',      label:'Canvas Check', color:'#CC66FF' },
          { href:'/regulations', label:'Regulations',  color:'#22DDEE' },
          { href:'/dashboard',   label:'Dashboard',    color:'#888899' },
        ].map(link => (
          <a key={link.href} href={link.href} style={{
            color: link.color, fontSize:11, fontWeight:600,
            textDecoration:'none', fontFamily:'monospace',
            letterSpacing:'0.05em', opacity:0.85,
            transition:'opacity 0.15s',
          }}
          onMouseEnter={e => e.target.style.opacity='1'}
          onMouseLeave={e => e.target.style.opacity='0.85'}
          >{link.label}</a>
        ))}
      </nav>

      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 32px #4488FF22, 0 0 80px #4488FF0A; }
          50%       { box-shadow: 0 0 48px #4488FF44, 0 0 120px #4488FF18; }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.5); }
        }
        .hero-meter-layer {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          white-space: nowrap;
          font-weight: 900;
          font-size: inherit;
          line-height: inherit;
        }
        .hero-meter-rest {
          transform: translateY(0);
          opacity: 1;
        }
        @keyframes heroMeterOut {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-115%); opacity: 0; }
        }
        @keyframes heroMeterIn {
          from { transform: translateY(115%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .hero-meter-out {
          animation: heroMeterOut 0.48s cubic-bezier(0.45, 0, 0.15, 1) forwards;
        }
        .hero-meter-in {
          animation: heroMeterIn 0.48s cubic-bezier(0.45, 0, 0.15, 1) forwards;
        }
        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 36px;
          background: linear-gradient(135deg, #0E2040, #0A1828);
          border: 2px solid #4488FF;
          border-radius: 10px;
          color: #4488FF;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.06em;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.25s ease;
          animation: pulseGlow 3s ease-in-out infinite;
          font-family: inherit;
        }
        .cta-btn:hover {
          background: linear-gradient(135deg, #162848, #0E2236);
          border-color: #66AAFF;
          color: #88BBFF;
          transform: translateY(-2px);
          box-shadow: 0 8px 40px #4488FF40;
        }
        .feature-card {
          padding: 24px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          backdrop-filter: blur(8px);
          transition: all 0.25s ease;
        }
        .feature-card:hover {
          background: rgba(255,255,255,0.045);
          border-color: rgba(68,136,255,0.25);
          transform: translateY(-3px);
        }
        .provider-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 20px;
          border: 1px solid;
          font-size: 11px;
          font-family: monospace;
          letter-spacing: 0.04em;
        }
        .dot {
          width: 6px; height: 6px;
          border-radius: 50%;
        }
      `}</style>

      {/* Animated canvas background */}
      <canvas ref={canvasRef} style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      }} />

      {/* Radial glow center-left */}
      <div style={{
        position: "fixed",
        top: "40%", left: "30%",
        width: 600, height: 600,
        background: "radial-gradient(circle, rgba(68,136,255,0.06) 0%, transparent 70%)",
        transform: "translate(-50%,-50%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 48px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(8,8,20,0.8)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 22, color: "#E8E8F4", fontFamily: "Georgia, serif" }}>वास्तु</span>
          <span style={{ fontSize: 22, color: "#F0E040", fontFamily: "Georgia, serif", fontWeight: 700 }}>AI</span>
          <span style={{
            marginLeft: 6, fontSize: 9, color: "#333",
            letterSpacing: "0.18em", textTransform: "uppercase",
            fontFamily: "monospace",
          }}>Architectural Design Platform</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* AI provider pills */}
          {[
            { label: "Claude", color: "#CC8855" },
            { label: "Gemini", color: "#4488FF" },
            { label: "Groq",   color: "#44DD88" },
            { label: "NIM",    color: "#CC66FF" },
          ].map((p, i) => (
            <div key={p.label} className="provider-pill" style={{
              borderColor: `${p.color}40`,
              color: p.color,
              animationDelay: `${i * 0.3}s`,
            }}>
              <div className="dot" style={{
                background: p.color,
                animation: `dotPulse 2s ease-in-out ${i * 0.5}s infinite`,
              }} />
              {p.label}
            </div>
          ))}
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <main style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 80px)",
        padding: "60px 24px 80px",
        textAlign: "center",
      }}>

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 16px",
          background: "rgba(68,136,255,0.08)",
          border: "1px solid rgba(68,136,255,0.2)",
          borderRadius: 20,
          fontSize: 11, color: "#4488FF",
          fontFamily: "monospace", letterSpacing: "0.1em",
          marginBottom: 32,
          animation: "fadeUp 0.6s ease both",
        }}>
          <span style={{ animation: "dotPulse 1.5s ease-in-out infinite", display:"inline-block", width:6, height:6, borderRadius:"50%", background:"#4488FF" }} />
          MULTI-AGENT AI · 4-PROVIDER FALLBACK · VASTU + MUNICIPAL CODE
        </div>

        {/* Main headline — meter slot: word rolls up, next rises from below */}
        <h1 style={{
          fontSize: "clamp(38px, 6vw, 72px)",
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          margin: "0 0 20px",
          animation: "fadeUp 0.7s ease 0.1s both",
          maxWidth: 900,
        }}>
          <HeroMeterWord words={HERO_PREFIX_WORDS} />
          <span style={{ color: "#E8E8F4" }}>-Compliant </span>
          <span style={{
            background: "linear-gradient(135deg, #4488FF, #44DD88)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>Floor Plans</span>
          <br />
          <span style={{ color: "#E8E8F4" }}>Designed by </span>
          <span style={{ color: "#F0E040", fontFamily: "Georgia, serif" }}>AI</span>
        </h1>

        {/* Subheadline */}
        <p style={{
          fontSize: "clamp(15px, 2vw, 19px)",
          color: "#6670A0",
          maxWidth: 560,
          lineHeight: 1.7,
          margin: "0 0 44px",
          animation: "fadeUp 0.7s ease 0.2s both",
          fontWeight: 400,
        }}>
          Enter your plot dimensions, BHK configuration and city — a 6-agent AI pipeline generates
          an architectural drawing, Vastu audit, cost estimate, and furniture layout in seconds.
        </p>

        {/* CTA */}
        <div style={{ animation: "fadeUp 0.7s ease 0.3s both" }}>
          <button
            className="cta-btn"
            onClick={() => router.push("/app")}
          >
            Launch Design Studio
            <span style={{ fontSize: 18 }}>→</span>
          </button>
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", gap: 40, marginTop: 56,
          animation: "fadeUp 0.7s ease 0.4s both",
          flexWrap: "wrap", justifyContent: "center",
        }}>
          {[
            { val: "6",  label: "AI Agents" },
            { val: "14", label: "Vastu Rules" },
            { val: "8+", label: "City Codes" },
            { val: "4",  label: "AI Providers" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#4488FF", lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "#3A3A5A", marginTop: 4, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Feature cards ─────────────────────────────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          maxWidth: 900,
          width: "100%",
          marginTop: 72,
          animation: "fadeUp 0.7s ease 0.5s both",
        }}>
          {features.map((f) => {
            const cardContent = (
              <>
                <div style={{ fontSize: 28, marginBottom: 10, color: f.color }}>{f.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#D8D8EC", marginBottom: 7 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: "#4A4A6A", lineHeight: 1.6 }}>{f.desc}</div>
              </>
            );
            return f.href ? (
              <a key={f.title} href={f.href} className="feature-card" style={{ textDecoration: "none", display: "block" }}>
                {cardContent}
              </a>
            ) : (
              <div key={f.title} className="feature-card">
                {cardContent}
              </div>
            );
          })}
        </div>

        {/* ── AI Fallback chain visual ──────────────────────────────────────── */}
        <div style={{
          marginTop: 64,
          padding: "24px 32px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14,
          maxWidth: 680,
          width: "100%",
          animation: "fadeUp 0.7s ease 0.6s both",
        }}>
          <div style={{ fontSize: 10, color: "#3A3A5A", letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 18 }}>
            AI Provider Fallback Chain
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { num: "①", name: "Claude Sonnet", provider: "Anthropic", color: "#CC8855" },
              { num: "②", name: "Gemini 2.0 Flash", provider: "Google",    color: "#4488FF" },
              { num: "③", name: "Llama 3.3 70B",   provider: "Groq",      color: "#44DD88" },
              { num: "④", name: "Llama 3.1 405B",  provider: "NVIDIA NIM",color: "#CC66FF" },
            ].map((p, i, arr) => (
              <div key={p.name} style={{ display: "flex", alignItems: "center" }}>
                <div style={{
                  padding: "10px 16px",
                  background: `${p.color}0D`,
                  border: `1px solid ${p.color}30`,
                  borderRadius: 8,
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 10, color: "#444", fontFamily: "monospace" }}>{p.num} {p.provider}</div>
                  <div style={{ fontSize: 12, color: p.color, fontWeight: 600, marginTop: 2 }}>{p.name}</div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ fontSize: 14, color: "#252535", margin: "0 6px", fontFamily: "monospace" }}>→</div>
                )}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: "#2A2A40", marginTop: 14, fontFamily: "monospace" }}>
            First provider with a configured .env key wins · Fails gracefully to next
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 56,
          fontSize: 11, color: "#252535",
          fontFamily: "monospace", letterSpacing: "0.06em",
          animation: "fadeUp 0.7s ease 0.7s both",
        }}>
          Built for Indian residential architecture · Vastu Shastra × Generative AI
        </div>
      </main>
    </div>
  );
}
