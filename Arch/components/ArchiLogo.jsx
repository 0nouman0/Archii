"use client";

export default function ArchiLogo({ size = 28, textSize = 16, href = "/" }) {
  return (
    <a href={href} style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:9, cursor:"pointer" }}>
      {/* Arch icon — two pillars + semi-circular arch + keystone */}
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.75" y="0.75" width="26.5" height="26.5" rx="4" stroke="#4488FF" strokeWidth="1" fill="none" opacity="0.35"/>
        {/* Left pillar */}
        <rect x="5" y="15" width="4" height="9" fill="#4488FF" rx="0.5"/>
        {/* Right pillar */}
        <rect x="19" y="15" width="4" height="9" fill="#4488FF" rx="0.5"/>
        {/* Arch (semi-ellipse) */}
        <path d="M5 15.5 Q14 4 23 15.5" fill="none" stroke="#44DD88" strokeWidth="2.2" strokeLinecap="round"/>
        {/* Keystone */}
        <circle cx="14" cy="5.2" r="2.1" fill="#E8E8F0"/>
        {/* Floor */}
        <line x1="3" y1="24" x2="25" y2="24" stroke="#4488FF" strokeWidth="1" opacity="0.4"/>
      </svg>

      <div style={{ display:"flex", alignItems:"baseline", gap:2, lineHeight:1 }}>
        <span style={{
          fontSize: textSize, fontWeight:900, color:"#E8E8F0",
          fontFamily:"monospace", letterSpacing:"0.08em",
        }}>ARCHI</span>
        <span style={{
          fontSize: textSize, fontWeight:900, color:"#4488FF",
          fontFamily:"monospace", letterSpacing:"0.06em",
        }}>AI</span>
      </div>
    </a>
  );
}
