"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import * as d3 from "d3";
import { ROOM_COLORS } from "../lib/layoutEngine";

const CITY_LAT = {
  'BBMP (Bengaluru)': 12.97,
  'BMC (Mumbai)': 18.98,
  'MCD (Delhi)': 28.61,
  'GHMC (Hyderabad)': 17.38,
  'CMDA (Chennai)': 13.08,
  'PMC (Pune)': 18.52,
  'NBC (Generic)': 20,
};

export default function FloorPlanViewer({
  svgCode, furniture, showFurniture, loading,
  showLabels = true, showSunPath = false, theme = 'dark', city = '',
  layout = null, params = {}
}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // ── D3 Rendering Logic ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!layout || !svgRef.current) return;

    const { rooms, W, H, bldX, bldY, bldW, bldH, OUTER, entrance } = layout;
    const PAD = 24;
    const totalW = W + PAD * 2;
    const totalH = H + PAD * 2;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${totalW} ${totalH}`)
      .attr("width", "100%")
      .attr("height", "100%");

    // Clear previous
    svg.selectAll("*").remove();

    // 1. Background
    svg.append("rect")
      .attr("width", totalW)
      .attr("height", totalH)
      .attr("fill", theme === 'dark' ? "#080814" : "#F8F8F4");

    // 2. Plot Area
    svg.append("rect")
      .attr("x", PAD)
      .attr("y", PAD)
      .attr("width", W)
      .attr("height", H)
      .attr("fill", theme === 'dark' ? "#101020" : "#F5F5F0")
      .attr("stroke", theme === 'dark' ? "#2A2A3E" : "#333")
      .attr("stroke-width", 2);

    // 3. Building Envelope
    svg.append("rect")
      .attr("x", bldX + PAD)
      .attr("y", bldY + PAD)
      .attr("width", bldW)
      .attr("height", bldH)
      .attr("fill", "none")
      .attr("stroke", theme === 'dark' ? "#4488FF44" : "#999")
      .attr("stroke-width", OUTER)
      .attr("stroke-dasharray", "4 2");

    // 4. Rooms
    const roomGroups = svg.selectAll(".room")
      .data(rooms)
      .join("g")
      .attr("class", "room");

    roomGroups.append("rect")
      .attr("x", d => d.x + PAD)
      .attr("y", d => d.y + PAD)
      .attr("width", d => d.w)
      .attr("height", d => d.h)
      .attr("fill", d => theme === 'dark' ? d3.color(ROOM_COLORS[d.name] || "#D0D0C8").darker(0.8) : (ROOM_COLORS[d.name] || "#D0D0C8"))
      .attr("stroke", theme === 'dark' ? "#1A1A2A" : "#FFF")
      .attr("stroke-width", 1.5)
      .attr("rx", 1);

    // 5. Room Labels
    if (showLabels) {
      roomGroups.each(function(d) {
        const g = d3.select(this);
        const fs = Math.max(6, Math.min(10, Math.min(d.w, d.h) / 5));
        if (d.w < 20 || d.h < 15) return;

        g.append("text")
          .attr("x", d.x + d.w / 2 + PAD)
          .attr("y", d.y + d.h / 2 + PAD - 2)
          .attr("text-anchor", "middle")
          .attr("font-size", fs)
          .attr("font-family", "monospace")
          .attr("font-weight", 700)
          .attr("fill", theme === 'dark' ? "#888" : "#1A1A1A")
          .text(d.name.toUpperCase());

        g.append("text")
          .attr("x", d.x + d.w / 2 + PAD)
          .attr("y", d.y + d.h / 2 + PAD + fs)
          .attr("text-anchor", "middle")
          .attr("font-size", fs * 0.8)
          .attr("font-family", "monospace")
          .attr("fill", theme === 'dark' ? "#444" : "#666")
          .text(`${d.ftW}×${d.ftH}ft`);
      });
    }

    // 6. Doors — shared wall detection, door arc at midpoint of each shared wall
    const DS = Math.max(12, Math.min(20, W / 18));
    const usedWalls = new Set();
    const TOL = 3;
    const BGFILL = theme === 'dark' ? "#080814" : "#F5F5F0";
    const DCOL   = theme === 'dark' ? "#4488FF88" : "#777";

    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        const a = rooms[i], b = rooms[j];
        let wall = null;

        if (Math.abs((a.x + a.w) - b.x) < TOL || Math.abs((b.x + b.w) - a.x) < TOL) {
          const wx  = Math.abs((a.x + a.w) - b.x) < TOL ? a.x + a.w : b.x + b.w;
          const top = Math.max(a.y, b.y), bot = Math.min(a.y + a.h, b.y + b.h);
          if (bot - top > DS + 4) wall = { type:"V", wx, top, bot };
        }
        if (!wall && (Math.abs((a.y + a.h) - b.y) < TOL || Math.abs((b.y + b.h) - a.y) < TOL)) {
          const wy  = Math.abs((a.y + a.h) - b.y) < TOL ? a.y + a.h : b.y + b.h;
          const lft = Math.max(a.x, b.x), rgt = Math.min(a.x + a.w, b.x + b.w);
          if (rgt - lft > DS + 4) wall = { type:"H", wy, lft, rgt };
        }
        if (!wall) continue;

        const wid = `${wall.type}-${(wall.wx ?? wall.wy).toFixed(0)}`;
        if (usedWalls.has(wid)) continue;
        usedWalls.add(wid);

        const dg = svg.append("g").attr("class", "door");
        if (wall.type === "V") {
          const mid = (wall.top + wall.bot) / 2;
          const x = wall.wx + PAD, y1 = mid - DS / 2 + PAD, y2 = mid + DS / 2 + PAD;
          dg.append("rect").attr("x", x - 2).attr("y", y1).attr("width", 5).attr("height", DS).attr("fill", BGFILL);
          dg.append("line").attr("x1", x).attr("y1", y1).attr("x2", x).attr("y2", y2).attr("stroke", DCOL).attr("stroke-width", 1.2);
          dg.append("path").attr("d", `M ${x} ${y2} A ${DS} ${DS} 0 0 1 ${x + DS} ${y1}`).attr("fill", "none").attr("stroke", DCOL).attr("stroke-width", 1).attr("stroke-dasharray", "3,2");
        } else {
          const mid = (wall.lft + wall.rgt) / 2;
          const x1 = mid - DS / 2 + PAD, x2 = mid + DS / 2 + PAD, y = wall.wy + PAD;
          dg.append("rect").attr("x", x1).attr("y", y - 2).attr("width", DS).attr("height", 5).attr("fill", BGFILL);
          dg.append("line").attr("x1", x1).attr("y1", y).attr("x2", x2).attr("y2", y).attr("stroke", DCOL).attr("stroke-width", 1.2);
          dg.append("path").attr("d", `M ${x2} ${y} A ${DS} ${DS} 0 0 0 ${x1} ${y + DS}`).attr("fill", "none").attr("stroke", DCOL).attr("stroke-width", 1).attr("stroke-dasharray", "3,2");
        }
      }
    }

    // 7. Windows — exterior walls (where rooms touch the building envelope boundary)
    const WIN = 10;
    const WC = theme === 'dark' ? "#4488FF55" : "#87CEEB88";
    const WS = theme === 'dark' ? "#4488FF" : "#5AACCC";
    rooms.forEach(r => {
      // top exterior
      if (bldY && Math.abs(r.y - (bldY + OUTER)) < TOL * 2 && r.w > WIN * 3) {
        svg.append("rect").attr("x", r.x + r.w / 2 - WIN + PAD).attr("y", r.y + PAD - 2)
          .attr("width", WIN * 2).attr("height", 4).attr("fill", WC).attr("stroke", WS).attr("stroke-width", 1.2).attr("rx", 1);
      }
      // bottom exterior
      if (bldY && bldH && Math.abs(r.y + r.h - (bldY + bldH - OUTER)) < TOL * 2 && r.w > WIN * 3) {
        svg.append("rect").attr("x", r.x + r.w / 2 - WIN + PAD).attr("y", r.y + r.h + PAD - 2)
          .attr("width", WIN * 2).attr("height", 4).attr("fill", WC).attr("stroke", WS).attr("stroke-width", 1.2).attr("rx", 1);
      }
      // left exterior
      if (bldX && Math.abs(r.x - (bldX + OUTER)) < TOL * 2 && r.h > WIN * 3) {
        svg.append("rect").attr("x", r.x + PAD - 2).attr("y", r.y + r.h / 2 - WIN + PAD)
          .attr("width", 4).attr("height", WIN * 2).attr("fill", WC).attr("stroke", WS).attr("stroke-width", 1.2).attr("rx", 1);
      }
      // right exterior
      if (bldX && bldW && Math.abs(r.x + r.w - (bldX + bldW - OUTER)) < TOL * 2 && r.h > WIN * 3) {
        svg.append("rect").attr("x", r.x + r.w + PAD - 2).attr("y", r.y + r.h / 2 - WIN + PAD)
          .attr("width", 4).attr("height", WIN * 2).attr("fill", WC).attr("stroke", WS).attr("stroke-width", 1.2).attr("rx", 1);
      }
    });

    // 8. Furniture (if data-driven)
    if (showFurniture && furniture?.placements) {
      const furn = svg.append("g").attr("class", "furniture-layer");
      furniture.placements.forEach(room => {
        (room.items || []).forEach(item => {
          const g = furn.append("g")
            .attr("transform", `rotate(${item.rotation || 0}, ${item.x + PAD + item.w / 2}, ${item.y + PAD + item.h / 2})`);
          
          g.append("rect")
            .attr("x", item.x + PAD)
            .attr("y", item.y + PAD)
            .attr("width", item.w)
            .attr("height", item.h)
            .attr("fill", item.color || "#C8B090")
            .attr("stroke", "#2A1A0A")
            .attr("stroke-width", 0.5)
            .attr("opacity", 0.8)
            .attr("rx", 1);

          if (item.w > 15) {
            g.append("text")
              .attr("x", item.x + PAD + item.w / 2)
              .attr("y", item.y + PAD + item.h / 2 + 2)
              .attr("font-size", 4)
              .attr("text-anchor", "middle")
              .attr("fill", "#1A1A1A")
              .attr("font-family", "monospace")
              .text(item.name);
          }
        });
      });
    }

    // 9. North Arrow
    const ax = totalW - 28, ay = 28;
    const arrow = svg.append("g").attr("class", "north-arrow");
    arrow.append("circle").attr("cx", ax).attr("cy", ay).attr("r", 18).attr("fill", "#00000066").attr("stroke", "#4488FF44");
    arrow.append("polygon").attr("points", `${ax},${ay - 14} ${ax + 5},${ay + 6} ${ax},${ay + 2} ${ax - 5},${ay + 6}`).attr("fill", "#4488FF");
    arrow.append("text").attr("x", ax).attr("y", ay + 16).attr("text-anchor", "middle").attr("font-size", 8).attr("fill", "#4488FF").attr("font-family", "monospace").text("N");

    // 10. Sun Path (if enabled)
    if (showSunPath) {
      const lat = CITY_LAT[city] || 20;
      const sunG = svg.append("g").attr("class", "sun-path-layer").attr("opacity", 0.4);
      
      // Sun arc (East to West)
      // East is Right (90 deg from North), West is Left (270 deg)
      const sunPath = d3.path();
      sunPath.arc(totalW / 2, totalH / 2, Math.min(totalW, totalH) / 2.5, Math.PI, 0); // Simplified arc
      
      sunG.append("path")
        .attr("d", sunPath.toString())
        .attr("fill", "none")
        .attr("stroke", "#FFCC44")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 4");

      // Sun positions
      const positions = [
        { label: "6AM (E)", angle: Math.PI },
        { label: "12PM", angle: Math.PI / 2 },
        { label: "6PM (W)", angle: 0 }
      ];

      positions.forEach(p => {
        const r = Math.min(totalW, totalH) / 2.5;
        const sx = totalW / 2 + r * Math.cos(p.angle);
        const sy = totalH / 2 - r * Math.sin(p.angle);
        
        sunG.append("circle")
          .attr("cx", sx)
          .attr("cy", sy)
          .attr("r", 3)
          .attr("fill", "#FFCC44");
          
        sunG.append("text")
          .attr("x", sx)
          .attr("y", sy - 6)
          .attr("text-anchor", "middle")
          .attr("font-size", 6)
          .attr("fill", "#FFCC44")
          .attr("font-family", "monospace")
          .text(p.label);
      });
    }

    // 11. Scale Bar
    const bFt = 5;
    const bPx = bFt * (W / (params.plotW || 30));
    const bx = PAD + 10, by = totalH - 15;
    const scaleBar = svg.append("g").attr("class", "scale-bar");
    scaleBar.append("line").attr("x1", bx).attr("y1", by).attr("x2", bx + bPx).attr("y2", by).attr("stroke", theme==='dark'?'#666':'#999').attr("stroke-width", 1.5);
    scaleBar.append("line").attr("x1", bx).attr("y1", by-3).attr("x2", bx).attr("y2", by+1).attr("stroke", theme==='dark'?'#666':'#999').attr("stroke-width", 1.5);
    scaleBar.append("line").attr("x1", bx + bPx).attr("y1", by-3).attr("x2", bx + bPx).attr("y2", by+1).attr("stroke", theme==='dark'?'#666':'#999').attr("stroke-width", 1.5);
    scaleBar.append("text").attr("x", bx + bPx / 2).attr("y", by - 5).attr("text-anchor", "middle").attr("font-size", 7).attr("fill", theme==='dark'?'#666':'#999').attr("font-family", "monospace").text("5 ft");

    // 12. Entrance marker
    if (entrance) {
      const EC = "#22AA66";
      const ex = entrance.x + PAD, ey = entrance.y + PAD;
      const DE = 16;
      const eg = svg.append("g").attr("class", "entrance");
      if (entrance.wall === "top") {
        eg.append("rect").attr("x", ex - DE/2).attr("y", ey - 3).attr("width", DE).attr("height", 6).attr("fill", EC).attr("opacity", 0.25);
        eg.append("line").attr("x1", ex - DE/2).attr("y1", ey).attr("x2", ex + DE/2).attr("y2", ey).attr("stroke", EC).attr("stroke-width", 2);
        eg.append("text").attr("x", ex).attr("y", ey - 7).attr("text-anchor", "middle").attr("font-size", 6).attr("fill", EC).attr("font-family", "monospace").attr("font-weight", "700").text("ENTRY");
      } else if (entrance.wall === "bottom") {
        eg.append("rect").attr("x", ex - DE/2).attr("y", ey - 3).attr("width", DE).attr("height", 6).attr("fill", EC).attr("opacity", 0.25);
        eg.append("line").attr("x1", ex - DE/2).attr("y1", ey).attr("x2", ex + DE/2).attr("y2", ey).attr("stroke", EC).attr("stroke-width", 2);
        eg.append("text").attr("x", ex).attr("y", ey + 13).attr("text-anchor", "middle").attr("font-size", 6).attr("fill", EC).attr("font-family", "monospace").attr("font-weight", "700").text("ENTRY");
      } else if (entrance.wall === "right") {
        eg.append("rect").attr("x", ex - 3).attr("y", ey - DE/2).attr("width", 6).attr("height", DE).attr("fill", EC).attr("opacity", 0.25);
        eg.append("line").attr("x1", ex).attr("y1", ey - DE/2).attr("x2", ex).attr("y2", ey + DE/2).attr("stroke", EC).attr("stroke-width", 2);
        eg.append("text").attr("x", ex + 10).attr("y", ey + 3).attr("text-anchor", "start").attr("font-size", 6).attr("fill", EC).attr("font-family", "monospace").attr("font-weight", "700").text("ENTRY");
      } else {
        eg.append("rect").attr("x", ex - 3).attr("y", ey - DE/2).attr("width", 6).attr("height", DE).attr("fill", EC).attr("opacity", 0.25);
        eg.append("line").attr("x1", ex).attr("y1", ey - DE/2).attr("x2", ex).attr("y2", ey + DE/2).attr("stroke", EC).attr("stroke-width", 2);
        eg.append("text").attr("x", ex - 8).attr("y", ey + 3).attr("text-anchor", "end").attr("font-size", 6).attr("fill", EC).attr("font-family", "monospace").attr("font-weight", "700").text("ENTRY");
      }
    }

  }, [layout, theme, showLabels, showFurniture, furniture, showSunPath, city, params.plotW]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const onMouseDown = useCallback(e => {
    if (e.button !== 0) return;
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }, []);

  const onMouseMove = useCallback(e => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
  }, []);

  const onMouseUp = useCallback(() => { dragging.current = false; }, []);

  const onWheel = useCallback(e => {
    e.preventDefault();
    setZoom(z => Math.min(4, Math.max(0.3, z - e.deltaY * 0.001)));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const blueprintFilter = theme === 'blueprint'
    ? 'invert(1) sepia(1) saturate(4) hue-rotate(195deg)'
    : 'none';

  if (!layout && !svgCode && !loading) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ fontSize: 64, opacity: 0.08, userSelect: "none" }}>⬡</div>
        <div style={{ fontSize: 13, color: "#444", fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          configure & generate
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
        <div style={{ fontSize: 48, animation: "spin 2s linear infinite", opacity: 0.5 }}>⬡</div>
        <div style={{ fontSize: 11, color: "#666", fontFamily: "monospace", letterSpacing: "0.1em" }}>D3 RENDERING…</div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      {/* Zoom controls */}
      <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10, display: "flex", flexDirection: "column", gap: 4 }}>
        {[
          { label: "+", action: () => setZoom(z => Math.min(4, z + 0.2)) },
          { label: "−", action: () => setZoom(z => Math.max(0.3, z - 0.2)) },
          { label: "⊙", action: resetView },
        ].map(btn => (
          <button key={btn.label} onClick={btn.action} style={{
            width: 28, height: 28,
            background: "#0E0E18", border: "2px solid #2A2A3E",
            borderRadius: 4, color: "#888", fontSize: 15,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "monospace", transition: "border-color 0.2s",
          }}
            onMouseEnter={e => e.target.style.borderColor = "#4488FF"}
            onMouseLeave={e => e.target.style.borderColor = "#2A2A3E"}
          >{btn.label}</button>
        ))}
      </div>

      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ width: "100%", height: "100%", cursor: dragging.current ? "grabbing" : "grab", userSelect: "none", touchAction: "none" }}
      >
        <div style={{
          width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
          transition: dragging.current ? "none" : "transform 0.1s ease",
        }}>
          {layout ? (
            <svg
              ref={svgRef}
              style={{
                maxWidth: "90%", maxHeight: "90%",
                boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
                filter: blueprintFilter,
                transition: "filter 0.4s ease",
                background: theme === 'dark' ? "#101020" : "#FFF"
              }}
            />
          ) : (
            <div
              style={{
                maxWidth: "90%", maxHeight: "90%",
                boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
                filter: blueprintFilter,
                transition: "filter 0.4s ease",
              }}
              dangerouslySetInnerHTML={{ __html: svgCode }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
