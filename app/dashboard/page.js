"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const BELIEF_LABEL = { vastu:"Vastu", islamic:"Islamic", christian:"Christian", universal:"Universal" };

export default function Dashboard() {
  const [user, setUser]       = useState(null);
  const [plans, setPlans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) fetchPlans(data.user.id);
      else setLoading(false);
    });
  }, []);

  const fetchPlans = async (uid) => {
    setLoading(true);
    const { data } = await supabase
      .from("generated_plans")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    setPlans(data || []);
    setLoading(false);
  };

  const deletePlan = async (id) => {
    setDeleting(id);
    await supabase.from("generated_plans").delete().eq("id", id);
    setPlans(p => p.filter(pl => pl.id !== id));
    setDeleting(null);
  };

  const loadInStudio = (plan) => {
    const p = {
      plotW: plan.plot_width, plotH: plan.plot_height,
      bhk: plan.bhk, city: plan.city,
      facing: plan.facing, budget: plan.budget,
      floors: 1, belief: "vastu",
    };
    const hash = btoa(encodeURIComponent(JSON.stringify(p)));
    window.location.href = `/app#${hash}`;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const IS = { fontFamily:"monospace", color:"#D8D8EC", background:"#080814" };

  if (!user && !loading) {
    return (
      <div style={{ ...IS, minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
        <div style={{ fontSize:40, opacity:0.1 }}>⬡</div>
        <div style={{ fontSize:13, color:"#555" }}>Sign in to view your saved plans</div>
        <a href="/login" style={{
          padding:"10px 24px",
          background:"linear-gradient(135deg,#0E2040,#061830)",
          border:"2px solid #4488FF", borderRadius:6,
          color:"#4488FF", fontSize:11, fontWeight:700,
          textDecoration:"none", letterSpacing:"0.1em",
        }}>Sign In</a>
      </div>
    );
  }

  return (
    <div style={{ ...IS, minHeight:"100vh" }}>
      {/* Nav */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"14px 24px", borderBottom:"2px solid #1A1A28",
        background:"#060610", position:"sticky", top:0, zIndex:10,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <a href="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:7 }}>
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none"><rect x="0.75" y="0.75" width="26.5" height="26.5" rx="4" stroke="#4488FF" strokeWidth="1" fill="none" opacity="0.35"/><rect x="5" y="15" width="4" height="9" fill="#4488FF" rx="0.5"/><rect x="19" y="15" width="4" height="9" fill="#4488FF" rx="0.5"/><path d="M5 15.5 Q14 4 23 15.5" fill="none" stroke="#44DD88" strokeWidth="2.2" strokeLinecap="round"/><circle cx="14" cy="5.2" r="2.1" fill="#E8E8F0"/></svg>
            <span style={{ fontSize:15, fontWeight:900, color:"#E8E8F0", fontFamily:"monospace", letterSpacing:"0.06em" }}>ARCHI<span style={{ color:"#4488FF" }}>AI</span></span>
          </a>
          <span style={{ fontSize:8, color:"#333", letterSpacing:"0.14em" }}>DASHBOARD</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:9, color:"#444" }}>{user?.email}</span>
          <a href="/app" style={{
            padding:"5px 14px", background:"transparent",
            border:"1px solid #1A2A3A", borderRadius:4,
            color:"#4488FF", fontSize:9, textDecoration:"none",
            fontFamily:"monospace", letterSpacing:"0.05em",
          }}>+ New Plan</a>
          <button onClick={signOut} style={{
            padding:"5px 12px", background:"transparent",
            border:"1px solid #2A1A1A", borderRadius:4,
            color:"#664444", fontSize:9, cursor:"pointer",
            fontFamily:"monospace",
          }}>Sign Out</button>
        </div>
      </div>

      <div style={{ padding:"32px 24px", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:22, fontWeight:700, color:"#DDD", fontFamily:"Georgia,serif", marginBottom:6 }}>
            My Saved Plans
          </h1>
          <div style={{ fontSize:10, color:"#444" }}>
            {loading ? "Loading…" : `${plans.length} plan${plans.length !== 1 ? "s" : ""} saved`}
          </div>
        </div>

        {loading ? (
          <div style={{ color:"#333", fontSize:11, paddingTop:40, textAlign:"center" }}>
            Fetching from Supabase…
          </div>
        ) : plans.length === 0 ? (
          <div style={{ textAlign:"center", paddingTop:60 }}>
            <div style={{ fontSize:48, opacity:0.08, marginBottom:16 }}>⬡</div>
            <div style={{ fontSize:12, color:"#444", marginBottom:20 }}>No plans saved yet</div>
            <a href="/app" style={{
              padding:"10px 24px",
              background:"linear-gradient(135deg,#0E2040,#061830)",
              border:"2px solid #4488FF", borderRadius:6,
              color:"#4488FF", fontSize:11, fontWeight:700,
              textDecoration:"none", letterSpacing:"0.1em",
            }}>Generate Your First Plan</a>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:20 }}>
            {plans.map(plan => (
              <div key={plan.id} style={{
                background:"#0A0A14", border:"1px solid #1A1A28",
                borderRadius:8, overflow:"hidden",
                transition:"border-color 0.2s, transform 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#4488FF"; e.currentTarget.style.transform="translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="#1A1A28"; e.currentTarget.style.transform="translateY(0)"; }}
              >
                {/* SVG preview */}
                <div style={{
                  height:150, background:"#FFF", overflow:"hidden",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  padding:8, position:"relative",
                }}>
                  {plan.svg_code
                    ? <div style={{ zoom:0.22, pointerEvents:"none" }} dangerouslySetInnerHTML={{ __html: plan.svg_code }}/>
                    : <div style={{ color:"#CCC", fontSize:10 }}>No preview</div>
                  }
                  {plan.vastu_score && (
                    <div style={{
                      position:"absolute", top:8, right:8,
                      background: plan.vastu_score>=80?"#16A34A":plan.vastu_score>=60?"#D97706":"#DC2626",
                      color:"#FFF", fontSize:9, fontWeight:700,
                      padding:"2px 7px", borderRadius:10, fontFamily:"monospace",
                    }}>{plan.vastu_score}</div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding:"14px 16px" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#DDD", marginBottom:4 }}>
                    {plan.plot_width}×{plan.plot_height} ft · {plan.bhk} BHK
                  </div>
                  <div style={{ fontSize:9, color:"#555", marginBottom:10, lineHeight:1.7 }}>
                    {plan.city} · {plan.facing}-facing<br/>
                    {new Date(plan.created_at).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
                    {plan.total_cost ? ` · ₹${plan.total_cost}L` : ""}
                  </div>

                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={() => loadInStudio(plan)} style={{
                      flex:2, padding:"7px",
                      background:"#0E2040", border:"1px solid #4488FF55",
                      borderRadius:4, color:"#4488FF",
                      fontSize:9, fontWeight:700, cursor:"pointer",
                      fontFamily:"monospace", letterSpacing:"0.04em",
                    }}>Load in Studio</button>
                    <button
                      onClick={() => deletePlan(plan.id)}
                      disabled={deleting === plan.id}
                      style={{
                        flex:1, padding:"7px",
                        background:"transparent", border:"1px solid #2A1A1A",
                        borderRadius:4, color: deleting===plan.id ? "#444" : "#664444",
                        fontSize:9, cursor: deleting===plan.id ? "not-allowed" : "pointer",
                        fontFamily:"monospace",
                      }}>
                      {deleting === plan.id ? "…" : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
