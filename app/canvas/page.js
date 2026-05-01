"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// ── Color palette for rooms ───────────────────────────────────────────────────
const ROOM_PALETTE = [
  "#4488FF22", "#44DD8822", "#F0E04022", "#CC66FF22",
  "#FF664422", "#44CCFF22", "#FF88CC22", "#88FF4422",
];
const ROOM_BORDER = [
  "#4488FF", "#44DD88", "#F0E040", "#CC66FF",
  "#FF6644", "#44CCFF", "#FF88CC", "#88FF44",
];

const GRID = 30; // px per grid cell

/** Selector + copy for canvas / analyser (methodology matches API `belief`). */
const BELIEF_OPTIONS = [
  {
    id: "vastu",
    label: "Vastu Shastra",
    color: "#F0E040",
    navTitle: "वास्तु",
    navAccent: "#F0E040",
    tagline: "Draw · Label · Analyse Vastu Shastra compliance",
    panelTitle: "Vastu Shastra analysis",
    scoreLabel: "VASTU SCORE",
    idleBlurb:
      "Draw rooms on the canvas, label them (e.g. Kitchen, Master Bedroom), then submit for Vastu Shastra compliance analysis.",
    stepSubmit: "Submit for an instant Vastu Shastra audit",
    loadingDetail: "Checking directional and zone rules · Mapping cardinal sectors",
    idleGlyph: "ॐ",
  },
  {
    id: "islamic",
    label: "Islāmī Mīmārī",
    color: "#44DD88",
    navTitle: "Islāmī",
    navAccent: "#44DD88",
    tagline: "Draw · Label · Analyse Islamic residential design compliance",
    panelTitle: "Islāmī Mīmārī analysis",
    scoreLabel: "ISLAMIC DESIGN SCORE",
    idleBlurb:
      "Draw rooms on the canvas, label them (e.g. Musalla, Majlis, Courtyard), then submit for Islamic residential design analysis (Qibla, privacy, courtyard logic).",
    stepSubmit: "Submit for an instant Islamic design audit",
    loadingDetail: "Applying Qibla and mahram privacy zones · Courtyard and circulation checks",
    idleGlyph: "☪",
  },
  {
    id: "christian",
    label: "Sacred Christian",
    color: "#4488FF",
    navTitle: "Sacred",
    navAccent: "#4488FF",
    tagline: "Draw · Label · Analyse sacred Christian spatial harmony",
    panelTitle: "Sacred Christian analysis",
    scoreLabel: "SACRED DESIGN SCORE",
    idleBlurb:
      "Draw rooms on the canvas, label them, then submit for analysis aligned with Christian domestic and sacred-space sensibilities.",
    stepSubmit: "Submit for an instant sacred Christian design audit",
    loadingDetail: "Reviewing hospitality, rest, and focal spaces · Light and axis symbolism",
    idleGlyph: "✝",
  },
  {
    id: "universal",
    label: "Universal",
    color: "#888899",
    navTitle: "Universal",
    navAccent: "#AAAAB8",
    tagline: "Draw · Label · Analyse inclusive universal design",
    panelTitle: "Universal design analysis",
    scoreLabel: "UNIVERSAL SCORE",
    idleBlurb:
      "Draw rooms on the canvas, label them, then submit for accessibility, safety, daylight, and circulation analysis.",
    stepSubmit: "Submit for an instant universal-design audit",
    loadingDetail: "Checking accessibility, safety, daylight, and circulation patterns",
    idleGlyph: "◇",
  },
];

function beliefMeta(id) {
  return BELIEF_OPTIONS.find(b => b.id === id) || BELIEF_OPTIONS[0];
}

// ── Score gauge (SVG circle) ──────────────────────────────────────────────────
function ScoreGauge({ score }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const dash = (pct / 100) * circ;
  const color = pct >= 70 ? "#44DD88" : pct >= 45 ? "#F0E040" : "#FF5544";
  const trackColor = pct >= 70 ? "#44DD8822" : pct >= 45 ? "#F0E04022" : "#FF554422";
  return (
    <div style={{ position: "relative", width: 112, height: 112, flexShrink: 0 }}>
      <svg width={112} height={112} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={56} cy={56} r={r} fill="none" stroke={trackColor} strokeWidth={10} />
        <circle
          cx={56} cy={56} r={r} fill="none"
          stroke={color} strokeWidth={10}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.7s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{pct}</div>
        <div style={{ fontSize: 9, color: "#55557A", fontFamily: "monospace", letterSpacing: "0.1em" }}>SCORE</div>
      </div>
    </div>
  );
}

// ── Inline room-name prompt ───────────────────────────────────────────────────
function InlinePrompt({ x, y, onConfirm, onCancel, defaultValue = "" }) {
  const [val, setVal] = useState(defaultValue);
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select(); }, []);

  const confirm = () => {
    const trimmed = val.trim();
    if (trimmed) onConfirm(trimmed);
    else onCancel();
  };

  return (
    <div style={{
      position: "absolute",
      left: Math.min(x, window.innerWidth - 260),
      top: Math.min(y, window.innerHeight - 90),
      zIndex: 50,
      background: "#13132A",
      border: "1px solid #4488FF",
      borderRadius: 8,
      padding: "10px 12px",
      boxShadow: "0 4px 24px #00000080",
      display: "flex", gap: 8, alignItems: "center",
    }}>
      <input
        ref={inputRef}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") confirm();
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Room name…"
        style={{
          background: "#0A0A1C", border: "1px solid #2A2A4A", borderRadius: 5,
          color: "#D8D8EC", padding: "6px 10px", fontSize: 13, width: 140,
          outline: "none", fontFamily: "inherit",
        }}
      />
      <button
        onClick={confirm}
        style={{
          background: "#4488FF", border: "none", borderRadius: 5,
          color: "#fff", padding: "6px 12px", fontSize: 12,
          cursor: "pointer", fontWeight: 600, fontFamily: "inherit",
        }}
      >OK</button>
      <button
        onClick={onCancel}
        style={{
          background: "transparent", border: "1px solid #33335A", borderRadius: 5,
          color: "#66668A", padding: "6px 10px", fontSize: 12,
          cursor: "pointer", fontFamily: "inherit",
        }}
      >✕</button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CanvasPage() {
  const router = useRouter();
  const canvasRef = useRef(null);
  const wrapRef = useRef(null); // wraps canvas, used for InlinePrompt positioning

  // ── State ──────────────────────────────────────────────────────────────────
  const [rooms, setRooms] = useState([]);
  const [activeTool, setActiveTool] = useState("draw");
  const [plotW, setPlotW] = useState(30);
  const [plotH, setPlotH] = useState(40);
  const [colorIdx, setColorIdx] = useState(0);

  // Drawing interaction state (refs to avoid stale closures)
  const isDrawingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const currentRectRef = useRef(null);

  // Inline prompt state
  const [prompt, setPrompt] = useState(null);
  // { canvasX, canvasY, pageX, pageY, mode: "new"|"rename", pendingRect, roomId }

  // Belief system
  const [belief, setBelief] = useState("vastu");

  // Analysis state
  const [analysisState, setAnalysisState] = useState("idle"); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const selectedBelief = beliefMeta(belief);
  const panelBelief =
    analysisState === "done" && result?.belief != null
      ? beliefMeta(result.belief)
      : selectedBelief;

  // Canvas dimensions
  const CW = 600, CH = 450;

  // ── Canvas render ──────────────────────────────────────────────────────────
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, CW, CH);

    // White background
    ctx.fillStyle = "#FAFAF8";
    ctx.fillRect(0, 0, CW, CH);

    // Grid
    ctx.strokeStyle = "#DDDDD0";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= CW; x += GRID) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke();
    }
    for (let y = 0; y <= CH; y += GRID) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke();
    }

    // Plot boundary (dashed border)
    ctx.strokeStyle = "#2255AA";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 5]);
    ctx.strokeRect(3, 3, CW - 6, CH - 6);
    ctx.setLineDash([]);

    // Scale label bottom-right
    ctx.fillStyle = "#AAAAAA";
    ctx.font = "10px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`${plotW}ft × ${plotH}ft  (1 cell = ${(plotW / (CW / GRID)).toFixed(1)}ft)`, CW - 8, CH - 6);
    ctx.textAlign = "left";

    // Compass rose top-right
    const cxr = CW - 28, cyr = 28, cr2 = 14;
    ctx.font = "bold 11px monospace";
    ctx.fillStyle = "#3366CC";
    ctx.textAlign = "center";
    ctx.fillText("N", cxr, cyr - cr2 - 3);
    ctx.fillText("S", cxr, cyr + cr2 + 11);
    ctx.fillText("E", cxr + cr2 + 8, cyr + 4);
    ctx.fillText("W", cxr - cr2 - 8, cyr + 4);
    ctx.strokeStyle = "#3366CC55";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cxr, cyr, cr2, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#3366CC99";
    ctx.beginPath(); ctx.moveTo(cxr, cyr - cr2); ctx.lineTo(cxr, cyr + cr2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cxr - cr2, cyr); ctx.lineTo(cxr + cr2, cyr); ctx.stroke();
    ctx.textAlign = "left";

    // Draw rooms
    rooms.forEach((room, i) => {
      const fill = room.color || ROOM_PALETTE[i % ROOM_PALETTE.length];
      const border = room.borderColor || ROOM_BORDER[i % ROOM_BORDER.length];

      ctx.fillStyle = fill;
      ctx.fillRect(room.x, room.y, room.w, room.h);

      ctx.strokeStyle = border;
      ctx.lineWidth = 2;
      ctx.strokeRect(room.x, room.y, room.w, room.h);

      // Label centered
      ctx.fillStyle = "#111111";
      ctx.font = "bold 12px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lx = room.x + room.w / 2;
      const ly = room.y + room.h / 2;
      // Clip label if room is tiny
      if (room.w > 40 && room.h > 20) {
        ctx.save();
        ctx.rect(room.x + 4, room.y + 4, room.w - 8, room.h - 8);
        ctx.clip();
        ctx.fillText(room.label, lx, ly);
        ctx.restore();
      }
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
    });

    // Preview rect while drawing (dashed blue)
    const cr = currentRectRef.current;
    if (cr && isDrawingRef.current) {
      ctx.strokeStyle = "#4488FF";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.fillStyle = "#4488FF18";
      ctx.fillRect(cr.x, cr.y, cr.w, cr.h);
      ctx.strokeRect(cr.x, cr.y, cr.w, cr.h);
      ctx.setLineDash([]);
    }
  }, [rooms, plotW, plotH]);

  // Re-render on state change
  useEffect(() => { renderCanvas(); }, [renderCanvas]);

  // ── Pointer helpers ────────────────────────────────────────────────────────
  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.round((e.clientX - rect.left)),
      y: Math.round((e.clientY - rect.top)),
    };
  };

  const rectFromPoints = (ax, ay, bx, by) => ({
    x: Math.min(ax, bx),
    y: Math.min(ay, by),
    w: Math.abs(bx - ax),
    h: Math.abs(by - ay),
  });

  const findRoomAt = (px, py) =>
    rooms.find(r =>
      px >= r.x && px <= r.x + r.w &&
      py >= r.y && py <= r.y + r.h
    );

  // ── Mouse event handlers ───────────────────────────────────────────────────
  const handleMouseDown = (e) => {
    if (prompt) return; // wait for prompt to close
    const { x, y } = getCanvasPos(e);

    if (activeTool === "draw") {
      isDrawingRef.current = true;
      startRef.current = { x, y };
      currentRectRef.current = { x, y, w: 0, h: 0 };
    } else if (activeTool === "erase") {
      const room = findRoomAt(x, y);
      if (room) setRooms(prev => prev.filter(r => r.id !== room.id));
    } else if (activeTool === "label") {
      const room = findRoomAt(x, y);
      if (room) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const wrap = wrapRef.current?.getBoundingClientRect();
        setPrompt({
          pageX: e.clientX - (wrap?.left ?? 0) + 4,
          pageY: e.clientY - (wrap?.top ?? 0) + 4,
          mode: "rename",
          roomId: room.id,
          defaultValue: room.label,
        });
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawingRef.current || activeTool !== "draw") return;
    const { x, y } = getCanvasPos(e);
    const { x: sx, y: sy } = startRef.current;
    currentRectRef.current = rectFromPoints(sx, sy, x, y);
    renderCanvas();
  };

  const handleMouseUp = (e) => {
    if (!isDrawingRef.current || activeTool !== "draw") return;
    isDrawingRef.current = false;
    const { x, y } = getCanvasPos(e);
    const { x: sx, y: sy } = startRef.current;
    const rect = rectFromPoints(sx, sy, x, y);

    // Discard tiny rects
    if (rect.w < 15 || rect.h < 15) {
      currentRectRef.current = null;
      renderCanvas();
      return;
    }

    // Show inline prompt near the rect
    const canvas = canvasRef.current;
    const cRect = canvas.getBoundingClientRect();
    const wrap = wrapRef.current?.getBoundingClientRect();
    setPrompt({
      pageX: (rect.x + cRect.left - (wrap?.left ?? 0)) + rect.w / 2 - 100,
      pageY: (rect.y + cRect.top - (wrap?.top ?? 0)) + rect.h / 2 - 20,
      mode: "new",
      pendingRect: rect,
      defaultValue: "",
    });
  };

  // ── Prompt handlers ────────────────────────────────────────────────────────
  const handlePromptConfirm = (name) => {
    if (prompt.mode === "new") {
      const rect = prompt.pendingRect;
      const newRoom = {
        id: Date.now() + Math.random(),
        x: rect.x, y: rect.y, w: rect.w, h: rect.h,
        label: name,
        color: ROOM_PALETTE[colorIdx % ROOM_PALETTE.length],
        borderColor: ROOM_BORDER[colorIdx % ROOM_BORDER.length],
      };
      setColorIdx(ci => ci + 1);
      setRooms(prev => [...prev, newRoom]);
    } else if (prompt.mode === "rename") {
      setRooms(prev => prev.map(r => r.id === prompt.roomId ? { ...r, label: name } : r));
    }
    currentRectRef.current = null;
    setPrompt(null);
  };

  const handlePromptCancel = () => {
    currentRectRef.current = null;
    setPrompt(null);
    renderCanvas();
  };

  const handleClear = () => {
    if (rooms.length === 0) return;
    if (confirm("Clear all rooms?")) {
      setRooms([]);
      currentRectRef.current = null;
      setColorIdx(0);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (rooms.length === 0) return;
    setAnalysisState("loading");
    setResult(null);
    setErrorMsg("");

    try {
      const canvas = canvasRef.current;
      const imageBase64 = canvas.toDataURL("image/png").split(",")[1];
      const res = await fetch("/api/analyze-canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, plotW: Number(plotW), plotH: Number(plotH), rooms, belief }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Analysis failed");
      setResult(data);
      setAnalysisState("done");
    } catch (err) {
      setErrorMsg(err.message);
      setAnalysisState("error");
    }
  };

  // ── Generate full plan ─────────────────────────────────────────────────────
  const handleGeneratePlan = () => {
    const bhkGuess = rooms.length <= 2 ? "1BHK" : rooms.length <= 5 ? "2BHK" : "3BHK";
    router.push(`/app#plot=${plotW}x${plotH}&bhk=${bhkGuess}`);
  };

  // ── Tool definitions ───────────────────────────────────────────────────────
  const tools = [
    { id: "draw",  label: "Draw Room", icon: "▭" },
    { id: "label", label: "Label",     icon: "✏" },
    { id: "erase", label: "Erase",     icon: "⌫" },
    { id: "clear", label: "Clear",     icon: "✕", action: handleClear },
  ];

  // ── Cursor per tool ────────────────────────────────────────────────────────
  const cursorMap = { draw: "crosshair", label: "text", erase: "not-allowed", clear: "default" };

  // ── Severity colors ────────────────────────────────────────────────────────
  const severityColor = { critical: "#FF4444", major: "#F0A020", minor: "#F0E040" };
  const assessmentColor = { good: "#44DD88", acceptable: "#F0E040", violation: "#FF5544" };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080814",
      color: "#D8D8EC",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap');

        * { box-sizing: border-box; }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }

        .tool-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 20px;
          border: 1px solid #2A2A4A; background: transparent;
          color: #6668A0; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.18s ease;
          font-family: inherit; letter-spacing: 0.02em;
          user-select: none;
        }
        .tool-pill:hover { border-color: #4455AA; color: #9999CC; background: rgba(68,136,255,0.06); }
        .tool-pill.active {
          background: #4488FF; border-color: #4488FF;
          color: #fff; box-shadow: 0 0 12px #4488FF44;
        }
        .tool-pill.clear-pill { border-color: #3A2233; color: #664444; }
        .tool-pill.clear-pill:hover { border-color: #AA4444; color: #FF6644; background: rgba(255,80,60,0.06); }

        .submit-btn {
          width: 100%; padding: 14px 20px;
          background: linear-gradient(135deg, #1A4A28, #0E3018);
          border: 2px solid #44DD88; border-radius: 10px;
          color: #44DD88; font-size: 15px; font-weight: 700;
          cursor: pointer; transition: all 0.2s ease; font-family: inherit;
          letter-spacing: 0.04em;
        }
        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #1F5A32, #143820);
          box-shadow: 0 4px 24px #44DD8840;
          transform: translateY(-1px);
        }
        .submit-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

        .gen-btn {
          width: 100%; padding: 11px 16px; margin-top: 16px;
          background: linear-gradient(135deg, #1A2A50, #0E1A38);
          border: 1.5px solid #4488FF; border-radius: 8px;
          color: #88BBFF; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s ease; font-family: inherit;
        }
        .gen-btn:hover {
          background: linear-gradient(135deg, #223260, #162040);
          box-shadow: 0 3px 16px #4488FF30;
        }

        .result-section { animation: fadeIn 0.4s ease both; }

        .dim-input {
          background: #0C0C20; border: 1px solid #2A2A4A; border-radius: 6px;
          color: #D8D8EC; padding: 7px 10px; font-size: 13px;
          width: 80px; outline: none; font-family: inherit;
          transition: border-color 0.18s;
        }
        .dim-input:focus { border-color: #4488FF; }

        .room-tag {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 10px; border-radius: 12px;
          font-size: 11px; font-weight: 600;
          border: 1px solid; font-family: monospace; letter-spacing: 0.04em;
        }

        @media (max-width: 900px) {
          .two-panel { flex-direction: column !important; }
          .canvas-panel, .result-panel { width: 100% !important; min-width: 0 !important; }
        }
      `}</style>

      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 36px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(8,8,20,0.92)",
        backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 30,
      }}>
        {/* Left: back + logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button
            onClick={() => router.push("/")}
            style={{
              background: "transparent", border: "1px solid #2A2A4A",
              borderRadius: 8, color: "#6668A0", padding: "6px 12px",
              fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.18s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#4455AA"; e.currentTarget.style.color = "#9999CC"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#2A2A4A"; e.currentTarget.style.color = "#6668A0"; }}
          >
            ← Back
          </button>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 20, color: "#E8E8F4", fontFamily: "Georgia, serif" }}>{selectedBelief.navTitle}</span>
            <span style={{ fontSize: 20, color: selectedBelief.navAccent, fontFamily: "Georgia, serif", fontWeight: 700 }}>AI</span>
          </div>
        </div>

        {/* Right: nav links */}
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { label: "Studio",   href: "/app" },
            { label: "Presets",  href: "/presets" },
            { label: "Beliefs", href: "/beliefs" },
          ].map(link => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              style={{
                background: "transparent", border: "none",
                color: "#55557A", fontSize: 13, cursor: "pointer",
                padding: "6px 12px", borderRadius: 6, fontFamily: "inherit",
                transition: "all 0.18s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "#9999CC"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#55557A"; e.currentTarget.style.background = "transparent"; }}
            >
              {link.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div style={{ padding: "28px 36px 0", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: "rgba(68,136,255,0.12)", border: "1px solid #4488FF40",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>▭</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#E8E8F4", letterSpacing: "-0.01em" }}>
              Floor Plan Canvas
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: "#44446A", fontFamily: "monospace" }}>
              {selectedBelief.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* ── Two-panel layout ──────────────────────────────────────────────────── */}
      <div className="two-panel" style={{
        display: "flex", gap: 24, padding: "20px 36px 40px",
        maxWidth: 1280, margin: "0 auto", alignItems: "flex-start",
      }}>

        {/* ── LEFT: Drawing panel ─────────────────────────────────────────────── */}
        <div className="canvas-panel" style={{ flex: "0 0 640px", minWidth: 0 }}>
          <div style={{
            background: "rgba(255,255,255,0.018)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14, overflow: "hidden",
          }}>
            {/* Panel header */}
            <div style={{
              padding: "16px 20px 12px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#C0C0DC", marginBottom: 4 }}>
                Draw Your Floor Plan
              </div>
              <div style={{ fontSize: 11, color: "#44446A", lineHeight: 1.6, fontFamily: "monospace" }}>
                Select <strong style={{ color: "#5566AA" }}>Draw Room</strong> → drag to create a rectangle →
                enter room name. Use <strong style={{ color: "#5566AA" }}>Label</strong> to rename,{" "}
                <strong style={{ color: "#5566AA" }}>Erase</strong> to remove a room.
              </div>
            </div>

            {/* Toolbar */}
            <div style={{
              padding: "12px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
            }}>
              {tools.map(tool => (
                <button
                  key={tool.id}
                  className={`tool-pill${activeTool === tool.id && tool.id !== "clear" ? " active" : ""}${tool.id === "clear" ? " clear-pill" : ""}`}
                  onClick={() => {
                    if (tool.action) { tool.action(); }
                    else setActiveTool(tool.id);
                  }}
                >
                  <span style={{ fontSize: 13 }}>{tool.icon}</span>
                  {tool.label}
                </button>
              ))}

              {/* Room count badge */}
              {rooms.length > 0 && (
                <div style={{
                  marginLeft: "auto", fontSize: 11, color: "#4488FF",
                  fontFamily: "monospace", background: "rgba(68,136,255,0.08)",
                  border: "1px solid #4488FF30", borderRadius: 12, padding: "4px 10px",
                }}>
                  {rooms.length} room{rooms.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            {/* Canvas wrapper (relative for InlinePrompt) */}
            <div
              ref={wrapRef}
              style={{ position: "relative", lineHeight: 0, background: "#F5F5F0" }}
            >
              <canvas
                ref={canvasRef}
                width={CW}
                height={CH}
                style={{
                  display: "block",
                  width: "100%",
                  cursor: cursorMap[activeTool] || "default",
                  maxWidth: CW,
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                  if (isDrawingRef.current) {
                    isDrawingRef.current = false;
                    currentRectRef.current = null;
                    renderCanvas();
                  }
                }}
              />

              {/* Inline name prompt */}
              {prompt && (
                <InlinePrompt
                  x={prompt.pageX}
                  y={prompt.pageY}
                  defaultValue={prompt.defaultValue}
                  onConfirm={handlePromptConfirm}
                  onCancel={handlePromptCancel}
                />
              )}

              {/* Empty state overlay */}
              {rooms.length === 0 && !isDrawingRef.current && (
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: 8,
                }}>
                  <div style={{ fontSize: 40, opacity: 0.12 }}>▭</div>
                  <div style={{ fontSize: 12, color: "#AAAAAA", fontFamily: "monospace", opacity: 0.5, textAlign: "center" }}>
                    Select &ldquo;Draw Room&rdquo; above<br />then drag to draw your first room
                  </div>
                </div>
              )}
            </div>

            {/* Plot dimensions + submit */}
            <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {/* Belief system selector */}
              <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                {BELIEF_OPTIONS.map(b => (
                  <button key={b.id} onClick={() => setBelief(b.id)} style={{
                    padding: "5px 12px", borderRadius: 16,
                    border: `1px solid ${belief === b.id ? b.color+"80" : "#2A2A4A"}`,
                    background: belief === b.id ? `${b.color}14` : "transparent",
                    color: belief === b.id ? b.color : "#55557A",
                    fontSize: 11, fontFamily: "monospace", fontWeight: 600,
                    cursor: "pointer", transition: "all 0.15s",
                  }}>{b.label}</button>
                ))}
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 16, marginBottom: 14,
                flexWrap: "wrap",
              }}>
                <div style={{ fontSize: 11, color: "#44446A", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                  Plot dimensions:
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6668A0" }}>
                  Width
                  <input
                    type="number" min={10} max={200}
                    className="dim-input"
                    value={plotW}
                    onChange={e => setPlotW(Math.max(10, Number(e.target.value)))}
                  />
                  ft
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6668A0" }}>
                  Height
                  <input
                    type="number" min={10} max={200}
                    className="dim-input"
                    value={plotH}
                    onChange={e => setPlotH(Math.max(10, Number(e.target.value)))}
                  />
                  ft
                </label>
              </div>

              <button
                className="submit-btn"
                disabled={rooms.length === 0 || analysisState === "loading"}
                onClick={handleSubmit}
              >
                {analysisState === "loading"
                  ? "Analysing…"
                  : `Submit for ${selectedBelief.label} analysis${rooms.length > 0 ? ` (${rooms.length} room${rooms.length !== 1 ? "s" : ""})` : ""}`}
              </button>

              {rooms.length === 0 && (
                <div style={{
                  textAlign: "center", fontSize: 11,
                  color: "#33335A", marginTop: 8, fontFamily: "monospace",
                }}>
                  Draw at least one room to enable analysis
                </div>
              )}
            </div>
          </div>

          {/* Room list below canvas */}
          {rooms.length > 0 && (
            <div style={{
              marginTop: 12,
              background: "rgba(255,255,255,0.015)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10, padding: "12px 16px",
            }}>
              <div style={{ fontSize: 10, color: "#33335A", fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 10 }}>
                ROOMS ON CANVAS
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {rooms.map((r, i) => {
                  const borderCol = r.borderColor || ROOM_BORDER[i % ROOM_BORDER.length];
                  return (
                    <div key={r.id} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "5px 10px", borderRadius: 8,
                      background: r.color || ROOM_PALETTE[i % ROOM_PALETTE.length],
                      border: `1px solid ${borderCol}`,
                      fontSize: 12, color: borderCol,
                    }}>
                      <span style={{ fontSize: 9, opacity: 0.6 }}>▭</span>
                      {r.label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Results panel ───────────────────────────────────────────── */}
        <div className="result-panel" style={{ flex: "1 1 380px", minWidth: 0 }}>
          <div style={{
            background: "rgba(255,255,255,0.018)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14, overflow: "hidden",
            minHeight: 520,
          }}>
            {/* Panel header */}
            <div style={{
              padding: "16px 20px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: analysisState === "done" ? "#44DD88"
                  : analysisState === "loading" ? "#F0E040"
                  : analysisState === "error" ? "#FF5544"
                  : "#2A2A4A",
                animation: analysisState === "loading" ? "pulse 1s ease-in-out infinite" : "none",
              }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#C0C0DC" }}>
                {panelBelief.panelTitle}
              </span>
              {result?.provider && (
                <span style={{
                  marginLeft: "auto", fontSize: 9, fontFamily: "monospace",
                  color: "#33335A", letterSpacing: "0.1em",
                }}>
                  via {result.provider.toUpperCase()}
                </span>
              )}
            </div>

            <div style={{ padding: "20px" }}>

              {/* ── Idle state ─────────────────────────────────────────────── */}
              {analysisState === "idle" && (
                <div style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  minHeight: 360, gap: 16, textAlign: "center",
                }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: "50%",
                    background: "rgba(68,136,255,0.06)",
                    border: "1px solid rgba(68,136,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 32, marginBottom: 4,
                  }}>
                    {selectedBelief.idleGlyph}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#6668A0" }}>
                    Awaiting your floor plan
                  </div>
                  <div style={{ fontSize: 12, color: "#33335A", lineHeight: 1.7, maxWidth: 280, fontFamily: "monospace" }}>
                    {selectedBelief.idleBlurb}
                  </div>
                  <div style={{
                    marginTop: 12, display: "flex", flexDirection: "column", gap: 8,
                    width: "100%", maxWidth: 260,
                  }}>
                    {[
                      { icon: "①", text: "Draw room rectangles on the canvas" },
                      { icon: "②", text: "Label each room with its purpose" },
                      { icon: "③", text: "Set your plot dimensions" },
                      { icon: "④", text: selectedBelief.stepSubmit },
                    ].map(step => (
                      <div key={step.icon} style={{
                        display: "flex", gap: 10, alignItems: "flex-start",
                        padding: "8px 12px", borderRadius: 8,
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.04)",
                        textAlign: "left",
                      }}>
                        <span style={{ fontSize: 13, color: "#4488FF", flexShrink: 0 }}>{step.icon}</span>
                        <span style={{ fontSize: 11, color: "#44446A", lineHeight: 1.5, fontFamily: "monospace" }}>{step.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Loading state ──────────────────────────────────────────── */}
              {analysisState === "loading" && (
                <div style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  minHeight: 360, gap: 20,
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    border: "3px solid #2A2A4A",
                    borderTopColor: "#4488FF",
                    animation: "spin 0.9s linear infinite",
                  }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#8888AA", marginBottom: 6 }}>
                      Analysing your floor plan…
                    </div>
                    <div style={{ fontSize: 11, color: "#33335A", fontFamily: "monospace" }}>
                      {selectedBelief.loadingDetail}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Error state ────────────────────────────────────────────── */}
              {analysisState === "error" && (
                <div style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  minHeight: 360, gap: 16, textAlign: "center",
                }}>
                  <div style={{ fontSize: 36, color: "#FF5544" }}>⚠</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#FF5544" }}>Analysis failed</div>
                  <div style={{
                    fontSize: 11, color: "#664444", fontFamily: "monospace",
                    background: "rgba(255,80,60,0.06)", border: "1px solid #FF554430",
                    borderRadius: 8, padding: "10px 14px", maxWidth: 280,
                  }}>
                    {errorMsg}
                  </div>
                  <button
                    onClick={handleSubmit}
                    style={{
                      marginTop: 8, background: "transparent",
                      border: "1px solid #33335A", borderRadius: 8,
                      color: "#6668A0", padding: "8px 20px", fontSize: 13,
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* ── Done state ─────────────────────────────────────────────── */}
              {analysisState === "done" && result && (
                <div className="result-section" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                  {/* Score + summary */}
                  <div style={{
                    display: "flex", gap: 16, alignItems: "center",
                    padding: "16px", borderRadius: 10,
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    <ScoreGauge score={result.score ?? 0} />
                    <div>
                      <div style={{ fontSize: 11, color: "#44446A", fontFamily: "monospace", marginBottom: 6, letterSpacing: "0.08em" }}>
                        {panelBelief.scoreLabel}
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: "#8888AA", lineHeight: 1.6 }}>
                        {result.summary}
                      </p>
                    </div>
                  </div>

                  {/* Rooms detected */}
                  {result.rooms_detected?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, color: "#33335A", fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 10 }}>
                        ROOMS DETECTED
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {result.rooms_detected.map((rm, i) => {
                          const ac = assessmentColor[rm.assessment] || "#6668A0";
                          return (
                            <div key={i} style={{
                              display: "flex", alignItems: "center", gap: 10,
                              padding: "8px 12px", borderRadius: 8,
                              background: "rgba(255,255,255,0.02)",
                              border: `1px solid ${ac}22`,
                            }}>
                              <div style={{
                                width: 8, height: 8, borderRadius: "50%",
                                background: ac, flexShrink: 0,
                              }} />
                              <div style={{ flex: 1, fontSize: 12, color: "#AAAAC0", fontWeight: 600 }}>
                                {rm.name}
                              </div>
                              <span style={{
                                fontSize: 10, fontFamily: "monospace",
                                color: "#4488FF", background: "rgba(68,136,255,0.08)",
                                border: "1px solid #4488FF30", borderRadius: 6,
                                padding: "2px 7px",
                              }}>
                                {rm.zone}
                              </span>
                              <span style={{
                                fontSize: 10, color: ac, fontFamily: "monospace",
                                textTransform: "uppercase", letterSpacing: "0.06em",
                              }}>
                                {rm.assessment}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Violations */}
                  {result.violations?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, color: "#33335A", fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 10 }}>
                        VIOLATIONS ({result.violations.length})
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {result.violations.map((v, i) => {
                          const sc = severityColor[v.severity] || "#F0E040";
                          return (
                            <div key={i} style={{
                              padding: "10px 14px", borderRadius: 9,
                              background: `${sc}08`,
                              border: `1px solid ${sc}30`,
                              borderLeft: `3px solid ${sc}`,
                            }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: sc }}>
                                  {v.room}
                                </span>
                                <span style={{
                                  fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em",
                                  textTransform: "uppercase", color: sc,
                                  background: `${sc}18`, border: `1px solid ${sc}40`,
                                  borderRadius: 4, padding: "2px 6px",
                                }}>
                                  {v.severity}
                                </span>
                              </div>
                              <div style={{ fontSize: 11, color: "#8888AA", marginBottom: 5, lineHeight: 1.5 }}>
                                {v.issue}
                              </div>
                              {v.fix && (
                                <div style={{
                                  fontSize: 10, color: "#44DD88",
                                  fontFamily: "monospace", lineHeight: 1.5,
                                  paddingTop: 5, borderTop: `1px solid ${sc}18`,
                                }}>
                                  Fix → {v.fix}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Positives */}
                  {result.positives?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, color: "#33335A", fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: 10 }}>
                        POSITIVES
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {result.positives.map((p, i) => (
                          <div key={i} style={{
                            display: "flex", gap: 10, alignItems: "flex-start",
                            padding: "8px 12px", borderRadius: 8,
                            background: "rgba(68,221,136,0.04)",
                            border: "1px solid rgba(68,221,136,0.15)",
                          }}>
                            <span style={{ color: "#44DD88", fontSize: 13, flexShrink: 0 }}>✓</span>
                            <span style={{ fontSize: 11, color: "#6680A0", lineHeight: 1.5 }}>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Overall advice */}
                  {result.overall_advice && (
                    <div style={{
                      padding: "14px 16px", borderRadius: 10,
                      background: "rgba(240,224,64,0.04)",
                      border: "1px solid rgba(240,224,64,0.18)",
                    }}>
                      <div style={{ fontSize: 10, color: "#888855", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 6 }}>
                        OVERALL ADVICE
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: "#AAAA80", lineHeight: 1.65 }}>
                        {result.overall_advice}
                      </p>
                    </div>
                  )}

                  {/* Generate full plan */}
                  <button className="gen-btn" onClick={handleGeneratePlan}>
                    Generate Full Plan in Studio →
                  </button>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
