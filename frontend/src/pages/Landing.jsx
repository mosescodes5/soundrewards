// Landing.jsx — Professional landing page
/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Music2, UserPlus, Crown, Wallet, Star, Shield,
  Users, TrendingUp, Play, ChevronDown, ChevronUp,
  Check, Zap, Lock, BarChart3, ArrowRight,
} from "lucide-react";
import { C, card } from "../theme";
import { plans } from "../data/mockData";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { useLang } from "../context/LangContext";
import { LangSelector } from "../components/LangSelector";
import { Badge } from "../components/SharedComponents";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
      <span style={{
        background: C.goldDim, color: C.gold, border: `1px solid ${C.gold}44`,
        borderRadius: 20, padding: "4px 16px", fontSize: 12, fontWeight: 700,
        letterSpacing: 0.8, textTransform: "uppercase",
      }}>{children}</span>
    </div>
  );
}

function TestimonialCard({ name, loc, text }) {
  return (
    <div style={{
      ...card(), padding: "24px",
      display: "flex", flexDirection: "column", gap: 14,
    }}>
      <div style={{ display: "flex", gap: 2 }}>
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} fill={C.gold} color={C.gold} />
        ))}
      </div>
      <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
        "{text}"
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "auto" }}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%", background: C.goldDim,
          border: `1px solid ${C.gold}44`, display: "flex", alignItems: "center",
          justifyContent: "center", fontWeight: 800, color: C.gold, fontSize: 15,
        }}>{name[0]}</div>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: C.text }}>{name}</p>
          <p style={{ margin: 0, fontSize: 12, color: C.muted }}>{loc}</p>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderBottom: `1px solid ${C.border}`,
      overflow: "hidden",
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "center", padding: "18px 0", background: "transparent",
          border: "none", cursor: "pointer", gap: 16, textAlign: "left",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 15, color: C.text }}>{q}</span>
        {open
          ? <ChevronUp size={18} color={C.gold} style={{ flexShrink: 0 }} />
          : <ChevronDown size={18} color={C.muted} style={{ flexShrink: 0 }} />}
      </button>
      {open && (
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, margin: "0 0 18px", paddingRight: 32 }}>
          {a}
        </p>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Landing({ onNavigate }) {
  const { t } = useLang();
  const { isMobile, isTablet } = useBreakpoints();
  const l = t.landing;

  const feats = [
    { icon: Zap,       title: l.feat1t, desc: l.feat1d, color: C.gold },
    { icon: Lock,      title: l.feat2t, desc: l.feat2d, color: C.teal },
    { icon: Users,     title: l.feat3t, desc: l.feat3d, color: C.purple },
    { icon: BarChart3, title: l.feat4t, desc: l.feat4d, color: "#FF6B6B" },
  ];

  const stats = [
    { v: l.stat1v, l: l.stat1l },
    { v: l.stat2v, l: l.stat2l },
    { v: l.stat3v, l: l.stat3l },
    { v: l.stat4v, l: l.stat4l },
  ];

  const steps = [
    { icon: UserPlus, n: "01", title: l.step1t, desc: l.step1d },
    { icon: Crown,    n: "02", title: l.step2t, desc: l.step2d },
    { icon: Music2,   n: "03", title: l.step3t, desc: l.step3d },
    { icon: Wallet,   n: "04", title: l.step4t, desc: l.step4d },
  ];

  const faqs = [
    { q: l.faq1q, a: l.faq1a },
    { q: l.faq2q, a: l.faq2a },
    { q: l.faq3q, a: l.faq3a },
    { q: l.faq4q, a: l.faq4a },
  ];

  const px = isMobile ? "20px" : isTablet ? "32px" : "64px";

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, overflowX: "hidden" }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: `16px ${px}`, borderBottom: `1px solid ${C.border}`,
        position: "sticky", top: 0, zIndex: 100,
        background: C.bg + "F0", backdropFilter: "blur(12px)",
        flexWrap: "wrap", gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: C.goldDim,
            border: `1px solid ${C.gold}55`, display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            <Music2 size={17} color={C.gold} />
          </div>
          <span style={{ fontWeight: 900, fontSize: 17, letterSpacing: -0.5 }}>{t.brand}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <LangSelector compact={isMobile} />
          <button
            onClick={() => onNavigate("login")}
            style={{
              background: "transparent", border: `1px solid ${C.border2}`,
              color: C.text, borderRadius: 8, padding: "7px 18px",
              cursor: "pointer", fontSize: 13, fontWeight: 500,
            }}
          >{t.nav.login}</button>
          <button
            onClick={() => onNavigate("register")}
            style={{
              background: C.gold, border: "none", color: "#000",
              borderRadius: 8, padding: "8px 18px",
              cursor: "pointer", fontSize: 13, fontWeight: 800,
            }}
          >{t.nav.register}</button>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section style={{
        padding: isMobile ? "60px 20px 48px" : "100px 64px 80px",
        maxWidth: 1100, margin: "0 auto",
        display: "flex", flexDirection: isTablet ? "column" : "row",
        alignItems: "center", gap: 48,
      }}>
        {/* LEFT */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 18 }}>
            <Badge color={C.gold} bg={C.goldDim}>{l.badge}</Badge>
          </div>
          <h1 style={{
            fontSize: isMobile ? 38 : isTablet ? 50 : 58,
            fontWeight: 900, margin: "0 0 10px",
            lineHeight: 1.05, letterSpacing: -2,
          }}>
            {l.h1a}<br />
            <span style={{
              background: `linear-gradient(90deg, ${C.gold}, #FFD580)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>{l.h1b}</span>
          </h1>
          <p style={{
            color: C.muted, fontSize: isMobile ? 15 : 17,
            lineHeight: 1.7, margin: "0 0 36px", maxWidth: 480,
          }}>{l.sub}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => onNavigate("register")}
              style={{
                background: C.gold, border: "none", color: "#000",
                borderRadius: 10, padding: "14px 28px", cursor: "pointer",
                fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 8,
              }}
            >
              {l.cta1} <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onNavigate("dashboard")}
              style={{
                background: "transparent", border: `1px solid ${C.border2}`,
                color: C.text, borderRadius: 10, padding: "14px 28px",
                cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <Play size={15} fill={C.muted} color={C.muted} /> {l.cta2}
            </button>
          </div>
          {/* Trust row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
            <div style={{ display: "flex" }}>
              {["C","S","M","A","P"].map((letter, i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: [C.goldDim, C.tealDim, C.purpleDim, "rgba(255,107,107,0.15)", C.goldDim][i],
                  border: `2px solid ${C.bg}`,
                  marginLeft: i > 0 ? -8 : 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: [C.gold, C.teal, C.purple, "#FF6B6B", C.gold][i],
                }}>
                  {letter}
                </div>
              ))}
            </div>
            <span style={{ color: C.muted, fontSize: 13 }}>
              {l.trustedBy} <span style={{ color: C.text, fontWeight: 600 }}>USA · MX · HN</span>
            </span>
          </div>
        </div>

        {/* RIGHT — mock earnings card */}
        {!isTablet && (
          <div style={{ flexShrink: 0, width: 340 }}>
            <div style={{
              ...card(), padding: "28px",
              boxShadow: `0 0 60px ${C.gold}15, 0 20px 60px rgba(0,0,0,0.4)`,
              border: `1px solid ${C.gold}22`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <p style={{ color: C.muted, fontSize: 12, margin: "0 0 4px" }}>SALDO TOTAL</p>
                  <p style={{ color: C.text, fontSize: 28, fontWeight: 900, margin: 0 }}>$142.50</p>
                </div>
                <div style={{ background: C.goldDim, borderRadius: 10, padding: 10 }}>
                  <TrendingUp size={20} color={C.gold} />
                </div>
              </div>
              {/* mini bars */}
              <div style={{ display: "flex", gap: 5, alignItems: "flex-end", height: 60, marginBottom: 16 }}>
                {[2.4, 3.1, 2.8, 4.2, 3.9, 5.1, 4.6].map((v, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                    <div style={{
                      height: `${(v / 5.1) * 52}px`,
                      background: i === 5 ? C.gold : `${C.gold}44`,
                      borderRadius: 4,
                    }} />
                  </div>
                ))}
              </div>
              {/* live feed */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { track: "Midnight Frequencies", amt: "+$0.45" },
                  { track: "Neon Pulse", amt: "+$0.52" },
                  { track: "Solar Wind", amt: "+$0.38" },
                ].map((row, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: C.surface2, borderRadius: 8, padding: "10px 12px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: C.goldDim, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Music2 size={13} color={C.gold} />
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: C.text }}>{row.track}</p>
                    </div>
                    <span style={{ color: "#22C55E", fontWeight: 700, fontSize: 13 }}>{row.amt}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, background: C.goldDim, borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: C.gold, fontSize: 13, fontWeight: 600 }}>💰 Ganado hoy</span>
                <span style={{ color: C.gold, fontWeight: 800, fontSize: 16 }}>$8.40</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────────────────── */}
      <div style={{ padding: `0 ${px} 80px`, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)",
          border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden",
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: C.surface, padding: "24px 20px", textAlign: "center",
              borderRight: !isMobile && i < 3 ? `1px solid ${C.border}` : "none",
              borderBottom: isMobile && i < 2 ? `1px solid ${C.border}` : "none",
            }}>
              <p style={{ color: C.gold, fontSize: isMobile ? 22 : 26, fontWeight: 900, margin: "0 0 4px", letterSpacing: -0.5 }}>{s.v}</p>
              <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section style={{ padding: `0 ${px} 90px`, maxWidth: 1100, margin: "0 auto" }}>
        <SectionLabel>{l.howTitle}</SectionLabel>
        <h2 style={{ textAlign: "center", fontSize: isMobile ? 28 : 36, fontWeight: 900, margin: "0 0 48px", letterSpacing: -0.5 }}>{l.howTitle}</h2>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 16 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ ...card(), padding: "28px 22px", position: "relative", overflow: "hidden" }}>
              {/* step number watermark */}
              <span style={{
                position: "absolute", top: 12, right: 16,
                fontSize: 40, fontWeight: 900, color: C.gold, opacity: 0.06, lineHeight: 1,
              }}>{s.n}</span>
              <div style={{ background: C.goldDim, borderRadius: 12, padding: 12, width: "fit-content", marginBottom: 16 }}>
                <s.icon size={22} color={C.gold} />
              </div>
              <p style={{ fontWeight: 800, fontSize: 16, margin: "0 0 8px", color: C.text }}>{s.title}</p>
              <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              {i < 3 && !isMobile && (
                <div style={{ position: "absolute", right: -12, top: "50%", transform: "translateY(-50%)", zIndex: 2, background: C.surface2, borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.border}` }}>
                  <ArrowRight size={12} color={C.gold} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      <section style={{ padding: `0 ${px} 90px`, maxWidth: 1100, margin: "0 auto" }}>
        <SectionLabel>{l.featTitle}</SectionLabel>
        <h2 style={{ textAlign: "center", fontSize: isMobile ? 28 : 36, fontWeight: 900, margin: "0 0 48px", letterSpacing: -0.5 }}>{l.featTitle}</h2>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(4,1fr)", gap: 16 }}>
          {feats.map((f, i) => (
            <div key={i} style={{ ...card(), padding: "28px 22px" }}>
              <div style={{
                background: f.color + "18", borderRadius: 12, padding: 12,
                width: "fit-content", marginBottom: 18,
                border: `1px solid ${f.color}30`,
              }}>
                <f.icon size={22} color={f.color} />
              </div>
              <p style={{ fontWeight: 800, fontSize: 15, margin: "0 0 8px", color: C.text }}>{f.title}</p>
              <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────────── */}
      <section style={{ padding: `0 ${px} 90px`, maxWidth: 1100, margin: "0 auto" }}>
        <SectionLabel>{l.testimonialsTitle}</SectionLabel>
        <h2 style={{ textAlign: "center", fontSize: isMobile ? 28 : 36, fontWeight: 900, margin: "0 0 48px", letterSpacing: -0.5 }}>{l.testimonialsTitle}</h2>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 16 }}>
          <TestimonialCard name={l.t1name} loc={l.t1loc} text={l.t1text} />
          <TestimonialCard name={l.t2name} loc={l.t2loc} text={l.t2text} />
          <TestimonialCard name={l.t3name} loc={l.t3loc} text={l.t3text} />
        </div>
      </section>

      {/* ── PLANS ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: `0 ${px} 90px`, maxWidth: 1100, margin: "0 auto" }}>
        <SectionLabel>{l.plansTitle}</SectionLabel>
        <h2 style={{ textAlign: "center", fontSize: isMobile ? 28 : 36, fontWeight: 900, margin: "0 0 10px", letterSpacing: -0.5 }}>{l.plansTitle}</h2>
        <p style={{ textAlign: "center", color: C.muted, margin: "0 0 48px", fontSize: 15 }}>{l.plansSub}</p>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 16 }}>
          {plans.map(p => (
            <div key={p.id} style={{
              ...card(), padding: "28px 20px",
              position: "relative",
              border: p.popular ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
              transform: p.popular ? "scale(1.03)" : "none",
              boxShadow: p.popular ? `0 0 40px ${C.gold}18` : "none",
            }}>
              {p.popular && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: C.gold, color: "#000", fontSize: 9, fontWeight: 900,
                  padding: "3px 14px", borderRadius: 20, whiteSpace: "nowrap", letterSpacing: 0.5,
                }}>{l.popular}</div>
              )}
              <div style={{ width: 40, height: 40, borderRadius: 10, background: p.accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Crown size={18} color={p.color} />
              </div>
              <p style={{ fontWeight: 900, fontSize: 17, margin: "0 0 2px", color: C.text }}>{p.name}</p>
              <p style={{ color: p.color, fontSize: isMobile ? 18 : 22, fontWeight: 900, margin: "6px 0 18px", letterSpacing: -0.5 }}>{p.priceUSD}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {[
                  `${l.daily}: ${p.daily}`,
                  `${l.referral}: ${p.referral}`,
                  `${p.tracks === 999 ? "∞" : p.tracks} canciones/día`,
                ].map((feat, fi) => (
                  <div key={fi} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <Check size={13} color={p.color} />
                    <span style={{ fontSize: 12, color: C.muted }}>{feat}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate("register")}
                style={{
                  width: "100%", background: p.popular ? C.gold : p.accent,
                  border: p.popular ? "none" : `1px solid ${p.color}55`,
                  color: p.popular ? "#000" : p.color,
                  borderRadius: 9, padding: "11px 0",
                  cursor: "pointer", fontSize: 13, fontWeight: 800,
                }}
              >
                {p.price === 0 ? l.cta1 : `${p.priceUSD}`}
              </button>
            </div>
          ))}
        </div>
        <div style={{ ...card(), marginTop: 20, padding: "16px 22px", display: "flex", alignItems: "center", gap: 14 }}>
          <Shield size={20} color={C.gold} style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, color: C.muted, fontSize: 13 }}>
            <span style={{ color: C.text, fontWeight: 600 }}>{t.plans.secureNote}</span>{" — "}{t.plans.secureDesc}
          </p>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section style={{ padding: `0 ${px} 90px`, maxWidth: 760, margin: "0 auto" }}>
        <SectionLabel>FAQ</SectionLabel>
        <h2 style={{ textAlign: "center", fontSize: isMobile ? 28 : 36, fontWeight: 900, margin: "0 0 40px", letterSpacing: -0.5 }}>{l.faqTitle}</h2>
        <div style={{ ...card(), padding: "0 28px" }}>
          {faqs.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA BANNER ──────────────────────────────────────────────── */}
      <section style={{ padding: `0 ${px} 80px`, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{
          background: `linear-gradient(135deg, ${C.gold}18 0%, ${C.surface} 60%, ${C.purple}15 100%)`,
          border: `1px solid ${C.gold}33`,
          borderRadius: 20, padding: isMobile ? "40px 24px" : "56px 48px",
          textAlign: "center",
        }}>
          <div style={{ background: C.goldDim, borderRadius: 14, padding: 14, width: "fit-content", margin: "0 auto 20px", border: `1px solid ${C.gold}44` }}>
            <Music2 size={28} color={C.gold} />
          </div>
          <h2 style={{ fontSize: isMobile ? 28 : 38, fontWeight: 900, margin: "0 0 12px", letterSpacing: -0.5 }}>{l.ctaBannerTitle}</h2>
          <p style={{ color: C.muted, fontSize: 16, margin: "0 0 32px", lineHeight: 1.6 }}>{l.ctaBannerSub}</p>
          <button
            onClick={() => onNavigate("register")}
            style={{
              background: C.gold, border: "none", color: "#000",
              borderRadius: 12, padding: "16px 40px", cursor: "pointer",
              fontSize: 16, fontWeight: 900, display: "inline-flex", alignItems: "center", gap: 10,
            }}
          >
            {l.ctaBannerBtn} <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: `1px solid ${C.border}`,
        padding: `28px ${px}`,
        display: "flex", flexWrap: "wrap", gap: 16,
        justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: C.goldDim, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Music2 size={13} color={C.gold} />
          </div>
          <span style={{ fontWeight: 900, fontSize: 14 }}>{t.brand}</span>
        </div>
        <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>{l.footerCopy}</p>
        <div style={{ display: "flex", gap: 20 }}>
          {[l.terms, l.privacy, l.support].map(k => (
            <span key={k} style={{ color: C.muted, fontSize: 13, cursor: "pointer", transition: "color 0.15s" }}
              onMouseEnter={e => e.target.style.color = C.text}
              onMouseLeave={e => e.target.style.color = C.muted}
            >{k}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}