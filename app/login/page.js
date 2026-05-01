"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSent(true);
  };

  return (
    <div style={{
      minHeight:"100vh", background:"#080814", display:"flex",
      alignItems:"center", justifyContent:"center",
      fontFamily:"monospace",
    }}>
      <div style={{
        width:360, padding:"32px 28px",
        background:"#0C0C18", border:"2px solid #1A1A28",
        borderRadius:10,
      }}>
        {/* Logo */}
        <div style={{ marginBottom:28 }}>
          <a href="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:8 }}>
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none"><rect x="0.75" y="0.75" width="26.5" height="26.5" rx="4" stroke="#4488FF" strokeWidth="1" fill="none" opacity="0.35"/><rect x="5" y="15" width="4" height="9" fill="#4488FF" rx="0.5"/><rect x="19" y="15" width="4" height="9" fill="#4488FF" rx="0.5"/><path d="M5 15.5 Q14 4 23 15.5" fill="none" stroke="#44DD88" strokeWidth="2.2" strokeLinecap="round"/><circle cx="14" cy="5.2" r="2.1" fill="#E8E8F0"/><line x1="3" y1="24" x2="25" y2="24" stroke="#4488FF" strokeWidth="1" opacity="0.4"/></svg>
            <div>
              <div style={{ fontSize:18, fontWeight:900, color:"#E8E8F0", fontFamily:"monospace", letterSpacing:"0.06em" }}>ARCHI<span style={{ color:"#4488FF" }}>AI</span></div>
              <div style={{ fontSize:8, color:"#333", letterSpacing:"0.18em" }}>ARCHITECTURAL DESIGN PLATFORM</div>
            </div>
          </a>
        </div>

        {sent ? (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:16 }}>✉️</div>
            <div style={{ fontSize:13, color:"#DDD", marginBottom:8 }}>Check your inbox</div>
            <div style={{ fontSize:10, color:"#555", lineHeight:1.7 }}>
              We sent a magic link to<br/>
              <span style={{ color:"#4488FF" }}>{email}</span>.<br/>
              Click it to sign in — no password needed.
            </div>
            <button onClick={() => { setSent(false); setEmail(""); }} style={{
              marginTop:20, padding:"7px 18px",
              background:"transparent", border:"1px solid #2A2A3A",
              borderRadius:5, color:"#555", fontSize:9,
              cursor:"pointer", fontFamily:"monospace",
            }}>← Use a different email</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ fontSize:13, color:"#DDD", fontWeight:700, marginBottom:6 }}>Sign in</div>
            <div style={{ fontSize:10, color:"#444", marginBottom:22, lineHeight:1.6 }}>
              We'll send a magic link to your email. No password required.
            </div>

            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:8, color:"#555", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:5 }}>Email address</div>
              <input
                type="email" required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width:"100%", padding:"10px 12px",
                  background:"#080810", border:"1px solid #2A2A3A",
                  borderRadius:5, color:"#D8D8EC",
                  fontFamily:"monospace", fontSize:11, outline:"none",
                }}
                onFocus={e => e.target.style.borderColor="#4488FF"}
                onBlur={e => e.target.style.borderColor="#2A2A3A"}
              />
            </div>

            {error && (
              <div style={{ fontSize:9, color:"#FF5544", marginBottom:12 }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width:"100%", padding:"11px",
              background: loading ? "#0A0A14" : "linear-gradient(135deg,#0E2040,#061830)",
              border:"2px solid #4488FF",
              borderRadius:6, color:"#4488FF",
              fontSize:11, fontWeight:900, cursor: loading ? "not-allowed" : "pointer",
              letterSpacing:"0.1em", textTransform:"uppercase",
              fontFamily:"monospace", transition:"all 0.2s",
            }}>
              {loading ? "Sending…" : "Send Magic Link"}
            </button>

            <div style={{ textAlign:"center", marginTop:18, fontSize:9, color:"#333" }}>
              <a href="/app" style={{ color:"#444", textDecoration:"none" }}>← Back to Studio</a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
