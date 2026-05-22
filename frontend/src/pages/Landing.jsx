// Landing.jsx
/* eslint-disable react/prop-types */
import { Music2, UserPlus, Crown, Wallet, Star } from "lucide-react";
import { C, card } from "../theme";
import { plans } from "../data/mockData";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { useLang } from "../context/LangContext";
import { LangSelector } from "../components/LangSelector";
import { Badge } from "../components/SharedComponents";

export default function Landing({ onNavigate }) {
  const { t } = useLang();
  const { isMobile, isTablet } = useBreakpoints();
  const l = t.landing;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "16px 20px" : "20px 48px", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: C.goldDim, border: `1px solid ${C.gold}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Music2 size={16} color={C.gold} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16 }}>{t.brand}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <LangSelector compact={isMobile} />
          <button onClick={() => onNavigate("login")} style={{ background: "transparent", border: `1px solid ${C.border2}`, color: C.text, borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontSize: 13 }}>{t.nav.login}</button>
          <button onClick={() => onNavigate("register")} style={{ background: C.gold, border: "none", color: "#000", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>{t.nav.register}</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ textAlign: "center", padding: isMobile ? "48px 20px 40px" : "80px 48px 60px", maxWidth: 760, margin: "0 auto" }}>
        <Badge color={C.gold} bg={C.goldDim}>{l.badge}</Badge>
        <h1 style={{ fontSize: isMobile ? 36 : isTablet ? 44 : 52, fontWeight: 900, margin: "18px 0 14px", lineHeight: 1.1, letterSpacing: -1.5 }}>
          {l.h1a}<br /><span style={{ color: C.gold }}>{l.h1b}</span>
        </h1>
        <p style={{ color: C.muted, fontSize: isMobile ? 15 : 17, lineHeight: 1.65, margin: "0 0 32px" }}>{l.sub}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => onNavigate("register")} style={{ background: C.gold, border: "none", color: "#000", borderRadius: 10, padding: isMobile ? "12px 24px" : "14px 32px", cursor: "pointer", fontSize: isMobile ? 14 : 16, fontWeight: 800 }}>{l.cta1}</button>
          <button onClick={() => onNavigate("dashboard")} style={{ background: C.surface, border: `1px solid ${C.border2}`, color: C.text, borderRadius: 10, padding: isMobile ? "12px 24px" : "14px 32px", cursor: "pointer", fontSize: isMobile ? 14 : 16 }}>{l.cta2}</button>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 0, maxWidth: 900, margin: "0 auto 60px", border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        {[
          { v: l.stat1v, l: l.stat1l }, { v: l.stat2v, l: l.stat2l },
          { v: l.stat3v, l: l.stat3l }, { v: l.stat4v, l: l.stat4l },
        ].map((s, i) => (
          <div key={i} style={{ background: C.surface, padding: "22px 16px", borderRight: !isMobile && i < 3 ? `1px solid ${C.border}` : "none", borderBottom: isMobile && i < 2 ? `1px solid ${C.border}` : "none", textAlign: "center" }}>
            <p style={{ color: C.gold, fontSize: isMobile ? 20 : 24, fontWeight: 800, margin: "0 0 4px" }}>{s.v}</p>
            <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* HOW IT WORKS */}
      <div style={{ maxWidth: 1000, margin: "0 auto 60px", padding: `0 ${isMobile ? 20 : 48}px` }}>
        <h2 style={{ textAlign: "center", fontSize: isMobile ? 26 : 32, fontWeight: 800, margin: "0 0 32px" }}>{l.howTitle}</h2>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 14 }}>
          {[
            { icon: UserPlus, n: "01", t: l.step1t, d: l.step1d },
            { icon: Crown,    n: "02", t: l.step2t, d: l.step2d },
            { icon: Music2,   n: "03", t: l.step3t, d: l.step3d },
            { icon: Wallet,   n: "04", t: l.step4t, d: l.step4d },
          ].map((s, i) => (
            <div key={i} style={{ ...card(), padding: "20px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ background: C.goldDim, borderRadius: 8, padding: 8 }}><s.icon size={16} color={C.gold} /></div>
                <span style={{ color: C.dim, fontSize: 11, fontWeight: 700 }}>{s.n}</span>
              </div>
              <p style={{ fontWeight: 700, margin: "0 0 6px", fontSize: 14 }}>{s.t}</p>
              <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.5, margin: 0 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PLANS */}
      <div style={{ maxWidth: 1000, margin: "0 auto 60px", padding: `0 ${isMobile ? 20 : 48}px` }}>
        <h2 style={{ textAlign: "center", fontSize: isMobile ? 26 : 32, fontWeight: 800, margin: "0 0 8px" }}>{l.plansTitle}</h2>
        <p style={{ textAlign: "center", color: C.muted, margin: "0 0 32px", fontSize: 14 }}>{l.plansSub}</p>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 14 }}>
          {plans.map(p => (
            <div key={p.id} style={{ ...card(), padding: "22px 16px", border: p.popular ? `1px solid ${C.gold}` : `1px solid ${C.border}`, position: "relative" }}>
              {p.popular && <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: C.gold, color: "#000", fontSize: 9, fontWeight: 800, padding: "2px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>{l.popular || "POPULAR"}</div>}
              <div style={{ width: 36, height: 36, borderRadius: 9, background: p.accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <Star size={16} color={p.color} />
              </div>
              <p style={{ fontWeight: 800, fontSize: 14, margin: "0 0 2px" }}>{p.name}</p>
              <p style={{ color: p.color, fontSize: 18, fontWeight: 800, margin: "4px 0 12px" }}>{p.priceUSD}</p>
              <p style={{ color: C.muted, fontSize: 11, margin: "0 0 3px" }}>{l.daily}: <span style={{ color: C.text, fontWeight: 600 }}>{p.daily}</span></p>
              <p style={{ color: C.muted, fontSize: 11, margin: 0 }}>{l.referral}: <span style={{ color: C.text, fontWeight: 600 }}>{p.referral}</span></p>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: isMobile ? "24px 20px" : "28px 48px", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Music2 size={14} color={C.gold} /><span style={{ fontWeight: 700, fontSize: 13 }}>{t.brand}</span></div>
        <p style={{ color: C.muted, fontSize: 11, margin: 0 }}>{l.footerCopy}</p>
        <div style={{ display: "flex", gap: 16 }}>
          {[l.terms, l.privacy, l.support].map(k => <span key={k} style={{ color: C.muted, fontSize: 12, cursor: "pointer" }}>{k}</span>)}
        </div>
      </div>
    </div>
  );
}