"use client";
import { useState } from "react";
import ArchiLogo from "./ArchiLogo";

const CITIES = [
  "BBMP (Bengaluru)", "BMC (Mumbai)", "MCD/DDA (Delhi)",
  "GHMC (Hyderabad)", "CMDA (Chennai)", "PMC (Pune)",
];
const BELIEFS = [
  { value:"vastu",     label:"Vastu Shastra",   icon:"☀" },
  { value:"islamic",   label:"Islāmī Mīmārī",   icon:"☽" },
  { value:"christian", label:"Sacred Christian", icon:"✝" },
  { value:"universal", label:"Universal Design", icon:"◎" },
];
const BUDGETS = [
  "Economy (₹20-40L)", "Lower-Premium (₹40-60L)",
  "Premium (₹60-100L)", "Luxury (₹1Cr+)",
];
const BATH_OPTIONS = [
  { value:"all",    label:"All bedrooms" },
  { value:"master", label:"Master only" },
  { value:"none",   label:"Common only" },
];
const PARKING_OPTIONS = [
  { value:0, label:"None"   },
  { value:1, label:"1 car"  },
  { value:2, label:"2 cars" },
];

const PILL_BASE = {
  padding:"10px 18px", borderRadius:8, border:"2px solid",
  fontSize:12, cursor:"pointer", fontFamily:"monospace",
  fontWeight:700, transition:"all 0.15s", outline:"none",
};

function Pill({ active, onClick, children, color = "#4488FF" }) {
  return (
    <button onClick={onClick} style={{
      ...PILL_BASE,
      borderColor: active ? color : "#1A1A2A",
      background:  active ? `${color}18` : "transparent",
      color:       active ? color : "#555",
    }}>{children}</button>
  );
}

function SliderNum({ label, value, min, max, unit, onChange }) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:9, color:"#555", letterSpacing:"0.12em", textTransform:"uppercase", fontFamily:"monospace", marginBottom:10 }}>{label}</div>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <input type="range" min={min} max={max} value={value}
          onChange={e => onChange(parseInt(e.target.value))}
          style={{ flex:1, accentColor:"#4488FF", height:4 }}
        />
        <input type="number" min={min} max={max} value={value}
          onChange={e => { const v = parseInt(e.target.value); if (v >= min && v <= max) onChange(v); }}
          style={{
            width:66, padding:"8px 10px", background:"#0A0A14",
            border:"1px solid #2A2A3A", borderRadius:6,
            color:"#E8E8F0", fontSize:16, fontFamily:"monospace",
            textAlign:"center", outline:"none",
          }}
        />
        <span style={{ color:"#444", fontSize:11, fontFamily:"monospace", minWidth:14 }}>{unit}</span>
      </div>
    </div>
  );
}

function FeatureCard({ icon, label, active, onClick, children }) {
  return (
    <div onClick={onClick} style={{
      padding:"12px 14px", borderRadius:8, cursor:"pointer",
      border:`1px solid ${active ? "#4488FF55" : "#1A1A2A"}`,
      background: active ? "#0A1830" : "#0A0A14",
      transition:"all 0.15s",
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: children ? 10 : 0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:16 }}>{icon}</span>
          <span style={{ fontSize:11, color: active ? "#CCC" : "#555", fontFamily:"monospace", fontWeight:700 }}>{label}</span>
        </div>
        <div style={{ width:26, height:14, borderRadius:7, background: active ? "#4488FF" : "#1A1A2A", position:"relative", flexShrink:0, transition:"background 0.2s" }}>
          <div style={{ width:10, height:10, borderRadius:"50%", background:"#FFF", position:"absolute", top:2, left: active ? 14 : 2, transition:"left 0.2s" }}/>
        </div>
      </div>
      {children && active && (
        <div onClick={e => e.stopPropagation()} style={{ marginTop:8 }}>
          {children}
        </div>
      )}
    </div>
  );
}

const TOTAL_STEPS = 5;

export default function FloorPlanWizard({ params, onParamChange, onComplete }) {
  const [step, setStep] = useState(0);

  const set = (field, val) => onParamChange(field, val);
  const p = params;

  const canAdvance = [
    () => !!p.city && !!p.belief,
    () => p.plotW >= 20 && p.plotH >= 20 && !!p.facing,
    () => p.bhk >= 1 && p.floors >= 1 && !!p.budget,
    () => true,
    () => !!p.outputType,
  ][step]?.() ?? true;

  const steps = [
    // ── Step 0: Project Setup ──────────────────────────────────────────────────
    {
      title:    "Where is this project?",
      subtitle: "City & design philosophy",
      content: (
        <>
          <div style={{ fontSize:9, color:"#555", letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"monospace", marginBottom:10 }}>Municipal authority</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:28 }}>
            {CITIES.map(c => (
              <Pill key={c} active={p.city === c} onClick={() => set("city", c)}>
                {c.split(" ")[0]}
              </Pill>
            ))}
          </div>
          <div style={{ fontSize:9, color:"#555", letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"monospace", marginBottom:10 }}>Design philosophy</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
            {BELIEFS.map(b => (
              <Pill key={b.value} active={p.belief === b.value} onClick={() => set("belief", b.value)} color="#CC66FF">
                {b.icon} {b.label}
              </Pill>
            ))}
          </div>
        </>
      ),
    },

    // ── Step 1: Plot ───────────────────────────────────────────────────────────
    {
      title:    "Tell us about the plot",
      subtitle: "Dimensions & orientation",
      content: (
        <>
          <SliderNum label="Width (front)" value={p.plotW} min={20} max={100} unit="ft" onChange={v => set("plotW", v)} />
          <SliderNum label="Depth (side)"  value={p.plotH} min={20} max={100} unit="ft" onChange={v => set("plotH", v)} />
          <div style={{ fontSize:9, color:"#555", letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"monospace", marginBottom:10 }}>Plot facing</div>
          <div style={{ display:"flex", gap:10 }}>
            {["North","East","South","West"].map(f => (
              <Pill key={f} active={p.facing === f} onClick={() => set("facing", f)} color="#44DD88">
                {f[0]}
              </Pill>
            ))}
          </div>
          <div style={{ fontSize:9, color:"#333", fontFamily:"monospace", marginTop:8 }}>
            Plot area: {p.plotW * p.plotH} sqft · {(p.plotW * p.plotH / 9).toFixed(0)} sq.yd
          </div>
        </>
      ),
    },

    // ── Step 2: Building ───────────────────────────────────────────────────────
    {
      title:    "Building configuration",
      subtitle: "Bedrooms, floors & budget",
      content: (
        <>
          <div style={{ fontSize:9, color:"#555", letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"monospace", marginBottom:10 }}>Bedrooms</div>
          <div style={{ display:"flex", gap:10, marginBottom:24 }}>
            {[1,2,3,4,5].map(n => (
              <Pill key={n} active={p.bhk === n} onClick={() => set("bhk", n)} color="#FFAA22">
                {n} BHK
              </Pill>
            ))}
          </div>
          <div style={{ fontSize:9, color:"#555", letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"monospace", marginBottom:10 }}>Floors</div>
          <div style={{ display:"flex", gap:10, marginBottom:24 }}>
            {[{v:1,l:"Ground Floor"},{v:2,l:"G + 1"},{v:3,l:"G + 2"}].map(f => (
              <Pill key={f.v} active={p.floors === f.v} onClick={() => set("floors", f.v)} color="#FFAA22">
                {f.l}
              </Pill>
            ))}
          </div>
          <div style={{ fontSize:9, color:"#555", letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"monospace", marginBottom:10 }}>Budget tier</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
            {BUDGETS.map(b => (
              <Pill key={b} active={p.budget === b} onClick={() => set("budget", b)} color="#FFAA22">
                {b.split("(")[0].trim()}
              </Pill>
            ))}
          </div>
        </>
      ),
    },

    // ── Step 3: Features ───────────────────────────────────────────────────────
    {
      title:    "What do you need?",
      subtitle: "Rooms & special requirements",
      content: (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <FeatureCard icon="🚗" label="Car parking" active={p.hasParking} onClick={() => { set("hasParking", !p.hasParking); if (!p.parkingCount) set("parkingCount", 1); }}>
            <div style={{ display:"flex", gap:6 }}>
              {PARKING_OPTIONS.filter(o => o.value > 0).map(o => (
                <button key={o.value} onClick={() => set("parkingCount", o.value)} style={{
                  padding:"3px 10px", borderRadius:4,
                  background: p.parkingCount === o.value ? "#4488FF" : "#1A1A2A",
                  border:"none", color: p.parkingCount === o.value ? "#FFF" : "#555",
                  fontSize:9, cursor:"pointer", fontFamily:"monospace",
                }}>{o.label}</button>
              ))}
            </div>
          </FeatureCard>

          <FeatureCard icon="🛗" label="Balcony" active={p.hasBalcony}
            onClick={() => set("hasBalcony", !p.hasBalcony)}
          />

          <FeatureCard icon="🪔" label="Puja room" active={p.hasPujaRoom !== false}
            onClick={() => set("hasPujaRoom", p.hasPujaRoom === false ? true : false)}
          />

          <FeatureCard icon="🍽" label="Separate dining" active={p.hasDining !== false}
            onClick={() => set("hasDining", p.hasDining === false ? true : false)}
          />

          <FeatureCard icon="🛁" label="Attached bathrooms" active={!!p.attachedBaths && p.attachedBaths !== "none"} onClick={() => {}}>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }} onClick={e => e.stopPropagation()}>
              {BATH_OPTIONS.map(o => (
                <button key={o.value} onClick={() => set("attachedBaths", o.value)} style={{
                  padding:"3px 10px", borderRadius:4,
                  background: (p.attachedBaths || "master") === o.value ? "#4488FF" : "#1A1A2A",
                  border:"none", color: (p.attachedBaths || "master") === o.value ? "#FFF" : "#555",
                  fontSize:9, cursor:"pointer", fontFamily:"monospace",
                }}>{o.label}</button>
              ))}
            </div>
          </FeatureCard>

          <FeatureCard icon="🧺" label="Utility / wash area" active={p.hasUtility !== false}
            onClick={() => set("hasUtility", p.hasUtility === false ? true : false)}
          />

          <FeatureCard icon="📚" label="Study / home office" active={!!p.hasStudy}
            onClick={() => set("hasStudy", !p.hasStudy)}
          />

          <FeatureCard icon="📦" label="Store room" active={p.hasStore !== false}
            onClick={() => set("hasStore", p.hasStore === false ? true : false)}
          />
        </div>
      ),
    },

    // ── Step 4: Output Type ────────────────────────────────────────────────────
    {
      title:    "How do you want your plan?",
      subtitle: "Output format",
      content: (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            {
              value:"image", icon:"🖼", label:"Floor Plan Image",
              badge:"PRIMARY", badgeColor:"#44DD88",
              sub:"AI-generated, photorealistic quality — non-editable",
            },
            {
              value:"svg", icon:"⟨/⟩", label:"SVG Technical Drawing",
              badge:"BETA", badgeColor:"#FFAA22",
              sub:"Scalable vector — annotate, download & modify freely",
            },
            {
              value:"html", icon:"📄", label:"HTML Analysis Report",
              badge:"NEW", badgeColor:"#CC66FF",
              sub:"Full document: floor plan + Vastu audit + cost breakdown",
            },
          ].map(o => (
            <div key={o.value} onClick={() => set("outputType", o.value)} style={{
              padding:"14px 16px", borderRadius:8, cursor:"pointer",
              border:`2px solid ${p.outputType === o.value ? "#4488FF" : "#1A1A2A"}`,
              background: p.outputType === o.value ? "#0A1830" : "#0A0A14",
              transition:"all 0.15s",
              display:"flex", alignItems:"flex-start", gap:12,
            }}>
              <span style={{ fontSize:22, lineHeight:1.3, flexShrink:0 }}>{o.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:12, fontWeight:700, fontFamily:"monospace",
                    color: p.outputType === o.value ? "#E8E8F0" : "#666" }}>
                    {o.label}
                  </span>
                  <span style={{
                    fontSize:8, color:o.badgeColor,
                    border:`1px solid ${o.badgeColor}55`,
                    borderRadius:3, padding:"1px 5px", fontFamily:"monospace",
                  }}>{o.badge}</span>
                </div>
                <div style={{ fontSize:10, color:"#444", fontFamily:"monospace", lineHeight:1.5 }}>{o.sub}</div>
              </div>
              <div style={{ flexShrink:0, marginTop:3 }}>
                <div style={{
                  width:16, height:16, borderRadius:"50%",
                  border:`2px solid ${p.outputType === o.value ? "#4488FF" : "#333"}`,
                  background: p.outputType === o.value ? "#4488FF" : "transparent",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  {p.outputType === o.value && <div style={{ width:5, height:5, borderRadius:"50%", background:"#FFF" }}/>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const current = steps[step];

  return (
    <div style={{
      position:"fixed", inset:0, background:"#06060F",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      fontFamily:"monospace",
    }}>
      {/* Header */}
      <div style={{ position:"absolute", top:0, left:0, right:0, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 28px" }}>
        <ArchiLogo size={26} textSize={15} href="/"/>
        <div style={{ fontSize:10, color:"#333", letterSpacing:"0.1em" }}>
          {step + 1} / {TOTAL_STEPS}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"#0A0A14" }}>
        <div style={{
          height:"100%",
          width:`${((step + 1) / TOTAL_STEPS) * 100}%`,
          background:"linear-gradient(90deg, #4488FF, #44DD88)",
          transition:"width 0.4s ease",
        }}/>
      </div>

      {/* Step dots */}
      <div style={{ position:"absolute", top:52, left:0, right:0, display:"flex", justifyContent:"center", gap:8 }}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 6, height:6, borderRadius:3,
            background: i < step ? "#44DD88" : i === step ? "#4488FF" : "#1A1A2A",
            transition:"all 0.3s ease",
          }}/>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth:560, width:"100%", padding:"0 24px" }}>
        <div style={{ fontSize:9, color:"#4488FF", letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:8 }}>
          Step {step + 1} — {current.subtitle}
        </div>
        <h2 style={{ fontSize:26, fontWeight:700, color:"#E8E8F0", marginBottom:24, lineHeight:1.3, fontFamily:"Georgia,serif" }}>
          {current.title}
        </h2>

        {current.content}

        {/* Navigation */}
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:32, alignItems:"center" }}>
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)} style={{
              padding:"10px 20px", background:"transparent",
              border:"1px solid #1A1A2A", borderRadius:6,
              color:"#555", fontSize:11, cursor:"pointer",
            }}>← Back</button>
          ) : <div/>}

          <button
            onClick={() => {
              if (step < TOTAL_STEPS - 1) setStep(s => s + 1);
              else onComplete();
            }}
            disabled={!canAdvance}
            style={{
              padding:"12px 32px",
              background: canAdvance ? "linear-gradient(135deg,#1A3A6A,#0E2040)" : "#0A0A14",
              border: canAdvance ? "1px solid #4488FF55" : "1px solid #1A1A2A",
              borderRadius:6, color: canAdvance ? "#4488FF" : "#333",
              fontSize:12, fontWeight:700, cursor: canAdvance ? "pointer" : "default",
              fontFamily:"monospace", letterSpacing:"0.06em",
              transition:"all 0.2s",
            }}
          >
            {step === TOTAL_STEPS - 1
              ? `⚡ Generate ${p.outputType === "html" ? "Report" : p.outputType === "svg" ? "SVG" : "Image"} →`
              : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
