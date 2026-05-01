"use client";
import { useRef, useState, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

// ─── Constants ────────────────────────────────────────────────────────────────
const WALL_H     = 9;      // ceiling height ft
const WALL_T     = 0.22;   // wall thickness ft
const FLOOR_T    = 0.08;
const WALK_SPEED = 10;
const EYE_H      = 5.5;

// ─── Furniture heights (ft) by item type ─────────────────────────────────────
const FURN_H_MAP = {
  "sofa": 3.0, "coffee table": 1.5, "tv unit": 1.5,
  "king bed": 2.2, "double bed": 2.0, "queen bed": 2.0,
  "side table": 2.0, "wardrobe": 6.5,
  "counter": 3.0, "refrigerator": 5.5,
  "dining table": 2.5,
  "wc": 2.5, "basin": 3.0,
  "altar": 3.0,
  "desk": 2.5, "chair": 3.0,
};
function getFurnH(name) {
  const lower = (name || "").toLowerCase();
  for (const [k, h] of Object.entries(FURN_H_MAP)) {
    if (lower.includes(k)) return h;
  }
  return 2.5;
}

// ─── Scene background setter ──────────────────────────────────────────────────
function SceneBackground({ color }) {
  const { scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color(color);
    return () => { scene.background = null; };
  }, [scene, color]);
  return null;
}

// ─── Ground plane ─────────────────────────────────────────────────────────────
function Ground({ size }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[size * 4, size * 4, 32, 32]} />
      <meshStandardMaterial color="#D4CFC8" roughness={1} />
    </mesh>
  );
}

// ─── Single room ─────────────────────────────────────────────────────────────
function Room({ room, cx, cz, selected, onSelect }) {
  const { ftW, ftH, color, name } = room;
  const rx = room.x / 10 - cx + ftW / 2;
  const rz = room.y / 10 - cz + ftH / 2;

  return (
    <group position={[rx, 0, rz]}>
      {/* Floor slab */}
      <mesh
        receiveShadow
        position={[0, FLOOR_T / 2, 0]}
        onClick={e => { e.stopPropagation(); onSelect(name); }}
      >
        <boxGeometry args={[ftW - WALL_T, FLOOR_T, ftH - WALL_T]} />
        <meshStandardMaterial color={color || "#B8C8B8"} roughness={0.85} />
      </mesh>

      {/* N wall */}
      <mesh castShadow position={[0, WALL_H / 2, -(ftH / 2 - WALL_T / 2)]}>
        <boxGeometry args={[ftW, WALL_H, WALL_T]} />
        <meshStandardMaterial color="#EDEAE4" roughness={0.9} />
      </mesh>
      {/* S wall */}
      <mesh castShadow position={[0, WALL_H / 2, ftH / 2 - WALL_T / 2]}>
        <boxGeometry args={[ftW, WALL_H, WALL_T]} />
        <meshStandardMaterial color="#E8E4DC" roughness={0.9} />
      </mesh>
      {/* W wall */}
      <mesh castShadow position={[-(ftW / 2 - WALL_T / 2), WALL_H / 2, 0]}>
        <boxGeometry args={[WALL_T, WALL_H, ftH]} />
        <meshStandardMaterial color="#EDEAE4" roughness={0.9} />
      </mesh>
      {/* E wall */}
      <mesh castShadow position={[ftW / 2 - WALL_T / 2, WALL_H / 2, 0]}>
        <boxGeometry args={[WALL_T, WALL_H, ftH]} />
        <meshStandardMaterial color="#E8E4DC" roughness={0.9} />
      </mesh>

      {/* Selection glow ring */}
      {selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.min(ftW, ftH) * 0.25, Math.min(ftW, ftH) * 0.32, 32]} />
          <meshBasicMaterial color="#4488FF" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* HTML label — no font loading needed */}
      <Html
        position={[0, WALL_H + 1.2, 0]}
        center
        distanceFactor={28}
        occlude={false}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div style={{
          background: "rgba(8,8,20,0.78)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 5, padding: "3px 8px",
          color: "#EEE", fontSize: 11, fontFamily: "monospace",
          fontWeight: 700, whiteSpace: "nowrap", letterSpacing: "0.03em",
        }}>
          {name}
          <span style={{ color:"#888", fontWeight:400, marginLeft:5 }}>
            {ftW}×{ftH}
          </span>
        </div>
      </Html>
    </group>
  );
}

// ─── North label ──────────────────────────────────────────────────────────────
function NorthLabel({ x, z }) {
  return (
    <Html position={[x, 1, z]} center distanceFactor={28} style={{ pointerEvents:"none" }}>
      <div style={{
        color:"#CC2222", fontWeight:900, fontSize:15,
        fontFamily:"monospace", textShadow:"0 0 6px rgba(0,0,0,0.5)",
      }}>N ↑</div>
    </Html>
  );
}

// ─── Furniture piece ─────────────────────────────────────────────────────────
function FurnitureItem({ item, cx, cz }) {
  const ftW  = item.w / 10;
  const ftD  = item.h / 10; // depth (Z axis)
  const h    = getFurnH(item.name);
  const wx   = (item.x + item.w / 2) / 10 - cx;
  const wz   = (item.y + item.h / 2) / 10 - cz;
  return (
    <mesh position={[wx, h / 2 + FLOOR_T, wz]} castShadow receiveShadow>
      <boxGeometry args={[ftW, h, ftD]} />
      <meshStandardMaterial color={item.color || "#8B7355"} roughness={0.65} metalness={0.05} />
    </mesh>
  );
}

// ─── First-person walker ──────────────────────────────────────────────────────
function WalkController({ active }) {
  const { camera, gl } = useThree();
  const keys  = useRef({});
  const yaw   = useRef(0);
  const pitch = useRef(0);

  useEffect(() => {
    if (!active) return;
    camera.rotation.order = "YXZ";
    const down = e => { keys.current[e.code] = true; };
    const up   = e => { keys.current[e.code] = false; };
    const move = e => {
      if (document.pointerLockElement !== gl.domElement) return;
      yaw.current   -= e.movementX * 0.0022;
      pitch.current -= e.movementY * 0.0022;
      pitch.current  = Math.max(-1.1, Math.min(1.1, pitch.current));
    };
    const click = () => gl.domElement.requestPointerLock();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    document.addEventListener("mousemove", move);
    gl.domElement.addEventListener("click", click);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      document.removeEventListener("mousemove", move);
      gl.domElement.removeEventListener("click", click);
      if (document.pointerLockElement) document.exitPointerLock();
    };
  }, [active, camera, gl]);

  useFrame((_, dt) => {
    if (!active) return;
    camera.rotation.set(pitch.current, yaw.current, 0);
    const spd = WALK_SPEED * dt;
    const fwd = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    const rgt = new THREE.Vector3( Math.cos(yaw.current), 0, -Math.sin(yaw.current));
    if (keys.current.KeyW  || keys.current.ArrowUp)    camera.position.addScaledVector(fwd,  spd);
    if (keys.current.KeyS  || keys.current.ArrowDown)  camera.position.addScaledVector(fwd, -spd);
    if (keys.current.KeyA  || keys.current.ArrowLeft)  camera.position.addScaledVector(rgt, -spd);
    if (keys.current.KeyD  || keys.current.ArrowRight) camera.position.addScaledVector(rgt,  spd);
    camera.position.y = EYE_H;
  });

  return null;
}

// ─── Main scene ───────────────────────────────────────────────────────────────
function Scene({ rooms, totalFtW, totalFtH, walkMode, selected, onSelect, furniture, showFurniture }) {
  const cx = totalFtW / 2;
  const cz = totalFtH / 2;

  return (
    <>
      <SceneBackground color="#B8CCE0" />

      <ambientLight intensity={0.9} />
      <hemisphereLight args={["#DDEEFF", "#8899AA", 0.6]} />
      <directionalLight
        position={[totalFtW * 0.8, 60, totalFtH * 0.8]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-totalFtW}
        shadow-camera-right={totalFtW}
        shadow-camera-top={totalFtH}
        shadow-camera-bottom={-totalFtH}
      />

      <Ground size={Math.max(totalFtW, totalFtH)} />

      {rooms.map((room, i) => (
        <Room
          key={`${room.name}-${i}`}
          room={room}
          cx={cx} cz={cz}
          selected={selected === room.name}
          onSelect={onSelect}
        />
      ))}

      {showFurniture && furniture?.placements?.map((p, pi) =>
        p.items.map((item, ii) => (
          <FurnitureItem key={`f-${pi}-${ii}`} item={item} cx={cx} cz={cz} />
        ))
      )}

      <NorthLabel x={totalFtW / 2 - cx + 4} z={-(totalFtH / 2 - cz) - 5} />

      {walkMode
        ? <WalkController active />
        : <OrbitControls
            makeDefault
            target={[0, 2, 0]}
            minDistance={4}
            maxDistance={totalFtW * 4}
            maxPolarAngle={Math.PI / 2 - 0.02}
            enableDamping
            dampingFactor={0.07}
          />
      }
    </>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────
export default function ThreeViewer({ layout, params, furniture }) {
  const [walkMode,       setWalkMode]       = useState(false);
  const [showFurniture,  setShowFurniture]  = useState(true);
  const [selected,       setSelected]       = useState(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // Measure container so Canvas always gets explicit pixel dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  if (!layout?.rooms?.length) {
    return (
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        background: "#080814", color: "#333", fontFamily: "monospace", fontSize: 11,
      }}>
        Generate a plan first to view in 3D
      </div>
    );
  }

  const rooms    = layout.rooms;
  const totalFtW = (layout.W || 300) / 10;
  const totalFtH = (layout.H || 400) / 10;
  const selRoom  = rooms.find(r => r.name === selected);

  // Initial camera: angled overhead view
  const camY = totalFtH * 1.2;
  const camZ = totalFtH * 1.5;

  return (
    <div
      ref={containerRef}
      style={{ flex: 1, position: "relative", background: "#B8CCE0", overflow: "hidden" }}
    >
      {size.w > 0 && size.h > 0 && (
        <Canvas
          shadows
          camera={{ position: [0, camY, camZ], fov: 52, near: 0.3, far: 3000 }}
          style={{ position: "absolute", inset: 0 }}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
        >
          <Scene
            rooms={rooms}
            totalFtW={totalFtW}
            totalFtH={totalFtH}
            walkMode={walkMode}
            selected={selected}
            onSelect={n => setSelected(s => s === n ? null : n)}
            furniture={furniture}
            showFurniture={showFurniture}
          />
        </Canvas>
      )}

      {/* Top-left info */}
      <div style={{
        position: "absolute", top: 12, left: 12,
        display: "flex", flexDirection: "column", gap: 6,
        fontFamily: "monospace", pointerEvents: "none", zIndex: 10,
      }}>
        <div style={{
          background: "rgba(0,0,0,0.55)", borderRadius: 6,
          padding: "5px 10px", color: "#CCC", fontSize: 9, letterSpacing: "0.06em",
        }}>
          {params?.plotW}×{params?.plotH}ft · {params?.bhk}BHK · {params?.facing}-facing
        </div>
        {walkMode && (
          <div style={{
            background: "rgba(0,0,0,0.55)", borderRadius: 6,
            padding: "5px 10px", color: "#88FFCC", fontSize: 9,
          }}>
            Click canvas · WASD move · ESC exit
          </div>
        )}
      </div>

      {/* Top-right: controls */}
      <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10, display: "flex", gap: 6 }}>
        {furniture?.placements?.length > 0 && (
          <button
            onClick={() => setShowFurniture(v => !v)}
            style={{
              padding: "6px 14px",
              background: showFurniture ? "rgba(20,30,60,0.85)" : "rgba(0,0,0,0.6)",
              border: `1px solid ${showFurniture ? "#4488FF" : "#444"}`,
              borderRadius: 6,
              color: showFurniture ? "#88AAFF" : "#666",
              fontSize: 10, cursor: "pointer", fontFamily: "monospace",
              fontWeight: 700, letterSpacing: "0.05em",
            }}
          >
            {showFurniture ? "■ FURN" : "□ FURN"}
          </button>
        )}
        <button
          onClick={() => { setWalkMode(w => !w); setSelected(null); }}
          style={{
            padding: "6px 14px",
            background: walkMode ? "rgba(20,50,30,0.85)" : "rgba(0,0,0,0.6)",
            border: `1px solid ${walkMode ? "#44DD88" : "#444"}`,
            borderRadius: 6,
            color: walkMode ? "#44DD88" : "#AAA",
            fontSize: 10, cursor: "pointer", fontFamily: "monospace",
            fontWeight: 700, letterSpacing: "0.05em",
          }}
        >
          {walkMode ? "↩ ORBIT" : "⚑ WALK"}
        </button>
      </div>

      {/* Bottom: selected room info */}
      {selRoom && !walkMode && (
        <div style={{
          position: "absolute", bottom: 16,
          left: "50%", transform: "translateX(-50%)",
          background: "rgba(8,8,20,0.88)",
          border: "1px solid #1A1A2A",
          borderRadius: 8, padding: "9px 20px",
          fontFamily: "monospace",
          display: "flex", gap: 18, alignItems: "center",
          zIndex: 10,
        }}>
          <div style={{
            width: 11, height: 11, borderRadius: 2,
            background: selRoom.color, flexShrink: 0,
          }} />
          <span style={{ color: "#EEE", fontSize: 11, fontWeight: 700 }}>{selRoom.name}</span>
          <span style={{ color: "#666", fontSize: 10 }}>{selRoom.ftW} × {selRoom.ftH} ft</span>
          <span style={{ color: "#555", fontSize: 10 }}>{(selRoom.ftW * selRoom.ftH).toFixed(0)} sqft</span>
          <button
            onClick={() => setSelected(null)}
            style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 14 }}
          >×</button>
        </div>
      )}
    </div>
  );
}
