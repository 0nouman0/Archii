"use client";
import { useState } from "react";
import Link from "next/link";

const C = {
  bg:      "#080814",
  surface: "#0f0f1e",
  card:    "#12122a",
  border:  "#1e1e3a",
  text:    "#D8D8EC",
  muted:   "#6b6b9a",
  blue:    "#4488FF",
  green:   "#44DD88",
  yellow:  "#F0E040",
  orange:  "#FFAA22",
  purple:  "#CC66FF",
  cyan:    "#22DDEE",
  red:     "#FF5566",
};

const CITIES = [
  {
    id: "bbmp",
    name: "BBMP",
    fullName: "Bruhat Bengaluru Mahanagara Palike",
    city: "Bengaluru", state: "Karnataka",
    color: C.green,
    far: 2.5, maxHeight: 15, floors: "G+3",
    effectiveDate: "2020 (Revised BBMP Building Bye-laws 2020)",
    setbacks: { front: "3m", rear: "3m", sides: "1.5m" },
    plotMinSize: "50 sq.m",
    docs: [
      "Khata certificate & extract",
      "Encumbrance Certificate (EC) — last 15 years",
      "Title deed / sale deed",
      "RTC (Revenue / Pahani) extract",
      "Site plan prepared by licensed architect",
      "Structural stability certificate from licensed engineer",
      "No Objection Certificate (NOC) from BESCOM, BWSSB",
      "Aadhaar / PAN of owner",
      "Property tax paid receipt",
    ],
    sanctionSteps: [
      "Register on BBMP OBpas portal (obpas.bbmp.gov.in)",
      "Upload all documents and site plan (DXF/PDF)",
      "Pay scrutiny fee online (₹5–₹50/sqft depending on use)",
      "BBMP sends auto-DCR scrutiny within 7–15 working days",
      "Structural & fire NOC review for G+2 and above",
      "Approval issued digitally — download Building Permit",
      "Start construction within 1 year; completion certificate needed post-build",
    ],
    notes: [
      "Premium FSI up to 4.0 available on payment of betterment charges",
      "Corner plots get 10% FAR relaxation",
      "Heritage zones have additional restrictions",
      "Basement allowed up to 50% of ground floor area",
      "Solar panels mandatory for buildings >600 sqm",
    ],
  },
  {
    id: "bmc",
    name: "BMC",
    fullName: "Brihanmumbai Municipal Corporation",
    city: "Mumbai", state: "Maharashtra",
    color: C.blue,
    far: 1.33, maxHeight: 11, floors: "G+2",
    effectiveDate: "2034 Development Plan (enforced 2018, revised 2022)",
    setbacks: { front: "4.5m", rear: "3m", sides: "2.3m" },
    plotMinSize: "30 sq.m",
    docs: [
      "7/12 extract (Satbara Utara) or Property Card",
      "City Survey / CTS plan",
      "Architect's drawings (AutoCAD + PDF) by registered architect",
      "Structural engineer's certificate",
      "NOC from Collector / MHADA if applicable",
      "IOD (Intimation of Disapproval) application",
      "Fire NOC from Maharashtra Fire Services",
      "Aadhaar, PAN, photograph of owner",
      "Stamp duty & registration document of property",
    ],
    sanctionSteps: [
      "Apply via MCGM Portal (mcgm.gov.in) under building proposals",
      "Submit IOD application with plans — architect submits digitally",
      "BMC Building Proposal Dept reviews for Development Control Regulations (DCR)",
      "After IOD: apply for Commencement Certificate (CC) plinth-level",
      "Periodic CC issued at each floor level",
      "Occupation Certificate (OC) issued after full completion",
    ],
    notes: [
      "TDR (Transferable Development Rights) can boost FAR significantly",
      "FSI up to 3.0 in some zones with premium payment",
      "Coastal Regulation Zone (CRZ) restricts coastal plots within 500m",
      "Slum Rehabilitation Authority (SRA) zones have separate FSI rules",
      "Cess buildings (pre-1969) under separate MHADA jurisdiction",
    ],
  },
  {
    id: "mcd",
    name: "MCD / DDA",
    fullName: "Municipal Corporation of Delhi / Delhi Development Authority",
    city: "Delhi", state: "Delhi NCT",
    color: C.orange,
    far: 3.5, maxHeight: 15, floors: "G+4",
    effectiveDate: "Master Plan Delhi 2041 (notified 2021)",
    setbacks: { front: "3m", rear: "3m", sides: "1.5m" },
    plotMinSize: "32 sq.m",
    docs: [
      "Sale deed / conveyance deed",
      "Registry / mutation certificate",
      "Latest property tax receipt",
      "Architectural drawing by COA-registered architect",
      "Structural drawing by licensed structural engineer",
      "Geo-technical report for plots >500 sqm",
      "NOC from Delhi Fire Service for G+2 and above",
      "Aadhaar / identity proof of owner",
      "Layout plan approved by local body",
    ],
    sanctionSteps: [
      "Apply via eBuildingPlan portal MCD (mcdonline.nic.in)",
      "Architect submits auto-DCR checked drawings digitally",
      "Fee payment online: ₹10–₹30/sqft",
      "Auto-approval within 30 days if all docs in order",
      "Building permit (sanction letter) issued digitally",
      "Plinth level checking mandatory before raising superstructure",
      "Completion certificate from local body on project finish",
    ],
    notes: [
      "Mixed-use plots on 18m+ roads get additional FAR",
      "Transit Oriented Development (TOD) zones allow FAR 4.0+",
      "Unauthorized colonies regularised under PM-UDAY have modified norms",
      "Night bazaar / commercial use on ground floor adds no extra FAR",
      "Green building certification gets 5–10% FAR relaxation",
    ],
  },
  {
    id: "ghmc",
    name: "GHMC",
    fullName: "Greater Hyderabad Municipal Corporation",
    city: "Hyderabad", state: "Telangana",
    color: C.yellow,
    far: 2.0, maxHeight: 12, floors: "G+3",
    effectiveDate: "GO Ms No. 168 — Telangana Municipalities Act 2019",
    setbacks: { front: "3m", rear: "3m", sides: "1.5m" },
    plotMinSize: "50 sq.m",
    docs: [
      "Pattadar passbook / title deed",
      "Encumbrance Certificate",
      "Layout approval copy from DTCP/HMDA",
      "Site plan by registered architect",
      "Structural stability certificate",
      "NOC from HMWSSB (water & sewerage board)",
      "NOC from TSSPDCL (electricity board)",
      "Fire NOC for buildings above 9m",
      "Owner's Aadhaar + PAN",
    ],
    sanctionSteps: [
      "Apply on DPMS portal (dpms.tg.gov.in) or visit GHMC zonal office",
      "Self-certification for plots ≤300 sqm with G+2",
      "Zonal Commissioner approval for larger plots",
      "Scrutiny fee: ₹3–₹20/sqft based on plot area",
      "Approval within 21 working days (mandate under TS Act)",
      "Building permit issued; periodic inspections at plinth + lintel + slab",
      "Occupancy Certificate after final inspection",
    ],
    notes: [
      "HMDA periphery areas have separate rules (lower FAR in some zones)",
      "Additional FSI via TDR available in certain zones",
      "Buildings on NH/SH require NHAI/TGIIC NOC",
      "Green building incentives: 5% extra FAR for IGBC rated projects",
      "Special Economic Zones have relaxed height norms",
    ],
  },
  {
    id: "cmda",
    name: "CMDA",
    fullName: "Chennai Metropolitan Development Authority",
    city: "Chennai", state: "Tamil Nadu",
    color: C.cyan,
    far: 1.5, maxHeight: 10, floors: "G+2",
    effectiveDate: "Second Master Plan 2026 (operational since 2008, amended 2019)",
    setbacks: { front: "3m", rear: "3m", sides: "1.5m" },
    plotMinSize: "45 sq.m",
    docs: [
      "Patta (land ownership document from Tahsildar)",
      "A-register extract from Taluk office",
      "Encumbrance Certificate (EC)",
      "Approved layout plan from DTCP / CMDA",
      "Building plan from licensed architect (CMDA empanelled)",
      "Structural certificate from licensed engineer",
      "NOC from CMWSSB (water board)",
      "NOC from TANGEDCO (electricity board)",
      "Building permit fee challan",
    ],
    sanctionSteps: [
      "Apply on TNILAD portal (tnilad.gov.in) or CMDA office",
      "Submit building plans in prescribed format with all NOCs",
      "CMDA scrutinises against DCR 2019 norms",
      "Fee: ₹4–₹25/sqft; paid online",
      "Planning permission issued within 30 days",
      "Foundation-level & roof-level inspections by CMDA officer",
      "Completion Certificate (Form IV) issued; mandatory for water/power connection",
    ],
    notes: [
      "CRZ zones along Bay of Bengal restrict height to 9m",
      "High Road overlay allows additional FAR on arterial roads",
      "No construction allowed within 30m of water bodies",
      "Basement limited to 1 level; stilt parking encouraged",
      "Cyclone-resistant construction mandatory per IS codes",
    ],
  },
  {
    id: "pmc",
    name: "PMC / PMRDA",
    fullName: "Pune Municipal Corporation / Pune Metropolitan Region DA",
    city: "Pune", state: "Maharashtra",
    color: C.purple,
    far: 1.5, maxHeight: 12, floors: "G+2",
    effectiveDate: "Pune Development Plan 2041 (notified 2023)",
    setbacks: { front: "3m", rear: "3m", sides: "1.5m" },
    plotMinSize: "40 sq.m",
    docs: [
      "7/12 extract & 8A (annual crop extract)",
      "Property card (for city survey plots)",
      "Encumbrance Certificate",
      "NA (Non-Agricultural) order if applicable",
      "Architect's drawings — RERA registered architect",
      "Structural engineer's stability certificate",
      "PMC NOC for water & drainage",
      "MSEDCL power connection NOC",
      "Fire NOC for buildings >9m height",
    ],
    sanctionSteps: [
      "Register on PMC Online Building Permission System (OBPS)",
      "Architect uploads DCR-compliant drawings",
      "Auto-scrutiny (AutoDCR) for self-certification plots ≤2000 sqm",
      "Manual scrutiny by PMC Town Planning dept for larger plots",
      "Commencement certificate after fee payment",
      "Construction allowed in phases with periodic PMC inspection",
      "Completion & Occupancy Certificate mandatory before possession",
    ],
    notes: [
      "PMRDA (peripheral areas) follows separate Development Control Rules",
      "Premium FSI: 2.5 available on payment in certain zones",
      "Heritage precincts in Pune old city restrict modifications",
      "Rain water harvesting mandatory for plots >300 sqm",
      "RERA registration mandatory for projects with >8 units or >500 sqm",
    ],
  },
  {
    id: "nbc",
    name: "NBC",
    fullName: "National Building Code of India",
    city: "Generic / All India", state: "All States",
    color: C.muted,
    far: 1.5, maxHeight: 10, floors: "G+2",
    effectiveDate: "NBC 2016 (SP 7:2016) — Bureau of Indian Standards",
    setbacks: { front: "3m", rear: "3m", sides: "1.5m" },
    plotMinSize: "No national minimum",
    docs: [
      "Property ownership document",
      "Site plan by registered architect / engineer",
      "Structural drawings as per IS codes",
      "NOC from local utilities (water, electricity)",
      "Applicable local authority forms & fees",
    ],
    sanctionSteps: [
      "Apply to local municipal / panchayat authority",
      "NBC sets minimum standards; each state may be more restrictive",
      "Building permit issued by local body",
      "Inspections at key construction stages",
      "Completion Certificate from local authority",
    ],
    notes: [
      "NBC is a model code — state regulations take precedence",
      "Mandatory in areas without a local building bylaw",
      "Covers fire safety, structural design, plumbing, electrical norms",
      "Accessibility norms (Part 3) mandatory for public buildings",
      "Green building provisions added in NBC 2016",
    ],
  },
];

const SECTION_TABS = ["Overview", "Documents", "Sanction Process", "Key Notes"];

export default function RegulationsPage() {
  const [activeCity, setActiveCity] = useState("bbmp");
  const [activeTab, setActiveTab]   = useState("Overview");
  const [search, setSearch]         = useState("");

  const filtered = CITIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase()) ||
    c.state.toLowerCase().includes(search.toLowerCase())
  );

  const city = CITIES.find(c => c.id === activeCity) || CITIES[0];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "monospace" }}>

      {/* ── Header ── */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/" style={{ color: C.muted, textDecoration: "none", fontSize: 13 }}>← Home</Link>
        <span style={{ color: C.border }}>|</span>
        <span style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>Building Regulations</span>
        <span style={{ marginLeft: "auto", background: "#1a1a2e", border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, color: C.muted }}>
          India · Residential
        </span>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>

        {/* ── Title ── */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: C.text }}>
            City-wise Building Regulations
          </h1>
          <p style={{ margin: "6px 0 0", color: C.muted, fontSize: 13 }}>
            FAR limits, floor restrictions, required documents & sanction process for major Indian cities.
          </p>
        </div>

        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

          {/* ── City Sidebar ── */}
          <div style={{ width: 200, flexShrink: 0 }}>
            <input
              placeholder="Search city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box", marginBottom: 10,
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6,
                padding: "7px 10px", color: C.text, fontSize: 12, outline: "none",
              }}
            />
            {filtered.map(c => (
              <button
                key={c.id}
                onClick={() => { setActiveCity(c.id); setActiveTab("Overview"); }}
                style={{
                  width: "100%", textAlign: "left", padding: "10px 12px", marginBottom: 4,
                  background: activeCity === c.id ? `${c.color}18` : "transparent",
                  border: `1px solid ${activeCity === c.id ? c.color : C.border}`,
                  borderRadius: 8, cursor: "pointer", color: C.text,
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: activeCity === c.id ? c.color : C.text }}>{c.name}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{c.city}</div>
              </button>
            ))}
          </div>

          {/* ── Main Panel ── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* City header */}
            <div style={{
              background: C.card, border: `1px solid ${city.color}44`,
              borderRadius: 12, padding: "20px 24px", marginBottom: 16,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: city.color }}>{city.name}</span>
                    <span style={{ background: `${city.color}22`, color: city.color, fontSize: 11, padding: "2px 8px", borderRadius: 20, border: `1px solid ${city.color}44` }}>
                      {city.state}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: C.muted }}>{city.fullName}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Effective: {city.effectiveDate}</div>
                </div>
                {/* Quick stats */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {[
                    { label: "Max FAR/FSI", value: city.far, color: C.green },
                    { label: "Max Height", value: `${city.maxHeight}m`, color: C.yellow },
                    { label: "Max Floors", value: city.floors, color: C.blue },
                    { label: "Min Plot", value: city.plotMinSize, color: C.purple },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: C.surface, border: `1px solid ${C.border}`,
                      borderRadius: 8, padding: "10px 14px", textAlign: "center", minWidth: 80,
                    }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Setbacks */}
              <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: C.muted }}>Setbacks:</span>
                {Object.entries(city.setbacks).map(([side, val]) => (
                  <span key={side} style={{
                    background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 4, padding: "2px 8px", fontSize: 11, color: C.text,
                  }}>
                    {side}: <strong style={{ color: city.color }}>{val}</strong>
                  </span>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
              {SECTION_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "7px 16px", borderRadius: 6, border: `1px solid ${activeTab === tab ? city.color : C.border}`,
                    background: activeTab === tab ? `${city.color}18` : "transparent",
                    color: activeTab === tab ? city.color : C.muted,
                    fontSize: 12, fontWeight: activeTab === tab ? 700 : 400, cursor: "pointer",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px" }}>

              {activeTab === "Overview" && (
                <div>
                  <h3 style={{ margin: "0 0 16px", fontSize: 14, color: C.text }}>Regulation Summary</h3>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <tbody>
                      {[
                        ["Authority", city.fullName],
                        ["City / Region", `${city.city}, ${city.state}`],
                        ["Governing Law / Plan", city.effectiveDate],
                        ["Max FAR / FSI", city.far],
                        ["Maximum Height", `${city.maxHeight} metres`],
                        ["Maximum Floors", city.floors],
                        ["Minimum Plot Size", city.plotMinSize],
                        ["Front Setback", city.setbacks.front],
                        ["Rear Setback", city.setbacks.rear],
                        ["Side Setbacks", city.setbacks.sides],
                      ].map(([label, val]) => (
                        <tr key={label} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: "10px 0", color: C.muted, width: "40%" }}>{label}</td>
                          <td style={{ padding: "10px 0", color: C.text, fontWeight: 600 }}>{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "Documents" && (
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: 14, color: C.text }}>Required Documents</h3>
                  <p style={{ margin: "0 0 16px", fontSize: 12, color: C.muted }}>For building plan sanction / building permit application</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {city.docs.map((doc, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "flex-start", gap: 10,
                        background: C.surface, border: `1px solid ${C.border}`,
                        borderRadius: 8, padding: "10px 14px",
                      }}>
                        <span style={{ color: city.color, fontWeight: 700, fontSize: 12, minWidth: 22 }}>{String(i + 1).padStart(2, "0")}</span>
                        <span style={{ fontSize: 13, color: C.text }}>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "Sanction Process" && (
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: 14, color: C.text }}>Building Plan Sanction Steps</h3>
                  <p style={{ margin: "0 0 16px", fontSize: 12, color: C.muted }}>How to obtain a building permit in {city.city}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {city.sanctionSteps.map((step, i) => (
                      <div key={i} style={{ display: "flex", gap: 0 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                            background: `${city.color}22`, border: `2px solid ${city.color}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 700, color: city.color,
                          }}>{i + 1}</div>
                          {i < city.sanctionSteps.length - 1 && (
                            <div style={{ width: 2, flex: 1, minHeight: 20, background: `${city.color}33`, margin: "2px 0" }} />
                          )}
                        </div>
                        <div style={{ paddingLeft: 14, paddingBottom: 20, paddingTop: 4 }}>
                          <p style={{ margin: 0, fontSize: 13, color: C.text }}>{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "Key Notes" && (
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: 14, color: C.text }}>Key Notes & Special Rules</h3>
                  <p style={{ margin: "0 0 16px", fontSize: 12, color: C.muted }}>Important caveats and additional allowances for {city.city}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {city.notes.map((note, i) => (
                      <div key={i} style={{
                        display: "flex", gap: 10, alignItems: "flex-start",
                        background: C.surface, border: `1px solid ${C.border}`,
                        borderRadius: 8, padding: "12px 14px",
                      }}>
                        <span style={{ color: C.yellow, fontSize: 14, marginTop: 1 }}>⚠</span>
                        <span style={{ fontSize: 13, color: C.text }}>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div style={{ marginTop: 16, padding: "12px 16px", background: `${C.orange}11`, border: `1px solid ${C.orange}33`, borderRadius: 8, fontSize: 11, color: C.muted }}>
              <strong style={{ color: C.orange }}>Disclaimer:</strong> This information is for reference only. Regulations are subject to change. Always verify with the respective municipal authority before commencing construction. Consult a licensed architect for project-specific guidance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
