"use client";
import { useRef, useState, useCallback, useEffect } from "react";

export default function FloorPlanViewer({ svgCode, furniture, showFurniture, loading }) {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x:0, y:0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x:0, y:0 });

  // Inject furniture overlay
  let displaySVG = svgCode;
  if (showFurniture && furniture?.placements && svgCode) {
    const furnitureSVG = furniture.placements.flatMap(room =>
      (room.items || []).map(item => `
        <g class="furn" opacity="0.82">
          <rect x="${item.x}" y="${item.y}" width="${item.w}" height="${item.h}"
                fill="${item.color || "#C8B090"}" rx="2"
                stroke="#2A1A0A" stroke-width="0.8"
                transform="rotate(${item.rotation||0},${item.x+item.w/2},${item.y+item.h/2})"/>
          <text x="${item.x + item.w/2}" y="${item.y + item.h/2 + 3.5}"
                font-size="5" text-anchor="middle" fill="#1A1A1A"
                font-family="monospace">${item.name}</text>
        </g>`)
    ).join("\n");
    displaySVG = svgCode.replace("</svg>", `${furnitureSVG}\n</svg>`);
  }

  const onMouseDown = useCallback(e => {
    if (e.button !== 0) return;
    dragging.current = true;
    lastPos.current = { x:e.clientX, y:e.clientY };
    e.preventDefault();
  }, []);

  const onMouseMove = useCallback(e => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x:e.clientX, y:e.clientY };
    setPan(p => ({ x:p.x+dx, y:p.y+dy }));
  }, []);

  const onMouseUp = useCallback(() => { dragging.current = false; }, []);

  const onWheel = useCallback(e => {
    e.preventDefault();
    setZoom(z => Math.min(4, Math.max(0.3, z - e.deltaY * 0.001)));
  }, []);

  // Attach non-passive wheel listener for zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  const resetView = () => { setZoom(1); setPan({x:0,y:0}); };

  if (!svgCode && !loading) {
    return (
      <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
        <div style={{ fontSize:64, opacity:0.08, userSelect:"none" }}>⬡</div>
        <div style={{ fontSize:13, color:"#444", fontFamily:"monospace", letterSpacing:"0.12em", textTransform:"uppercase" }}>
          configure & generate
        </div>
        <div style={{ fontSize:10, color:"#333", fontFamily:"monospace" }}>
          set plot dimensions → click ⬡ GENERATE
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
        <div style={{ fontSize:48, animation:"spin 2s linear infinite", opacity:0.5 }}>⬡</div>
        <div style={{ fontSize:11, color:"#666", fontFamily:"monospace", letterSpacing:"0.1em" }}>AGENTS WORKING…</div>
      </div>
    );
  }

  return (
    <div style={{ position:"relative", width:"100%", height:"100%", overflow:"hidden" }}>
      {/* Controls */}
      <div style={{
        position:"absolute", top:12, right:12, zIndex:10,
        display:"flex", flexDirection:"column", gap:4,
      }}>
        {[
          { label:"+", action:() => setZoom(z=>Math.min(4,z+0.2)) },
          { label:"−", action:() => setZoom(z=>Math.max(0.3,z-0.2)) },
          { label:"⊙", action:resetView },
        ].map(btn => (
          <button key={btn.label} onClick={btn.action} style={{
            width:28, height:28,
            background:"#0E0E18", border:"2px solid #2A2A3E",
            borderRadius:4, color:"#888", fontSize:15,
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"monospace",
            transition:"border-color 0.2s",
          }}
          onMouseEnter={e=>e.target.style.borderColor="#4488FF"}
          onMouseLeave={e=>e.target.style.borderColor="#2A2A3E"}
          >{btn.label}</button>
        ))}
      </div>

      {/* Zoom indicator */}
      <div style={{
        position:"absolute", bottom:12, right:12, zIndex:10,
        fontSize:9, color:"#444", fontFamily:"monospace",
        background:"#0A0A12", padding:"3px 7px", borderRadius:3,
        border:"1px solid #1A1A2A",
      }}>{Math.round(zoom*100)}%</div>

      {/* SVG canvas */}
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ width:"100%", height:"100%", cursor:dragging.current?"grabbing":"grab", userSelect:"none" }}
      >
        <div style={{
          width:"100%", height:"100%",
          display:"flex", alignItems:"center", justifyContent:"center",
          transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
          transformOrigin:"center center",
          transition: dragging.current ? "none" : "transform 0.1s ease",
        }}>
          <div
            style={{ maxWidth:"90%", maxHeight:"90%", boxShadow:"0 8px 40px rgba(0,0,0,0.6)" }}
            dangerouslySetInnerHTML={{ __html: displaySVG }}
          />
        </div>
      </div>
    </div>
  );
}
