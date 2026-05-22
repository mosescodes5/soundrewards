// PlansPage.jsx
import { useState } from "react";
import { Crown, Shield } from "lucide-react";
import { C, card } from "../theme";
import { plans } from "../data/mockData";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { useLang } from "../context/LangContext";

export default function PlansPage() {
  const { t } = useLang();
  const { isMobile } = useBreakpoints();
  const p = t.plans;
  const [currentPlan] = useState("gold");

  return (
    <div>
      <p style={{ color: C.muted, textAlign: "center", margin: "0 0 28px", fontSize: 14 }}>{p.sub}</p>

      {/* PLAN CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {plans.map(pl => (
          <div key={pl.id} style={{ ...card(), padding: isMobile ? "18px 14px" : "24px 18px", border: pl.id === currentPlan ? `2px solid ${C.gold}` : pl.popular ? `1px solid ${pl.color}44` : `1px solid ${C.border}`, position: "relative" }}>
            {pl.id === currentPlan && (
              <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: C.gold, color: "#000", fontSize: 9, fontWeight: 800, padding: "2px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
                {t.badges.yourPlan}
              </div>
            )}
            {pl.popular && pl.id !== currentPlan && (
              <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: pl.color, color: "#000", fontSize: 9, fontWeight: 800, padding: "2px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
                {p.popular}
              </div>
            )}

            <div style={{ width: 38, height: 38, borderRadius: 9, background: pl.accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Crown size={18} color={pl.color} />
            </div>
            <p style={{ fontWeight: 800, fontSize: 15, margin: "0 0 2px" }}>{pl.name}</p>
            <p style={{ color: pl.color, fontSize: isMobile ? 16 : 20, fontWeight: 800, margin: "3px 0 14px" }}>{pl.priceUSD}</p>

            {[
              { l: p.daily,    v: pl.daily },
              { l: p.rate,     v: pl.rate },
              { l: p.tracks,   v: pl.tracks === 999 ? p.unlimited : pl.tracks },
              { l: p.referral, v: pl.referral },
            ].map(r => (
              <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ color: C.muted, fontSize: 11 }}>{r.l}</span>
                <span style={{ color: C.text, fontWeight: 600, fontSize: 11 }}>{r.v}</span>
              </div>
            ))}

            <button style={{ width: "100%", marginTop: 16, background: pl.id === currentPlan ? "transparent" : pl.color, border: pl.id === currentPlan ? `1px solid ${C.border}` : "none", color: pl.id === currentPlan ? C.muted : "#000", borderRadius: 9, padding: "10px 0", cursor: pl.id === currentPlan ? "default" : "pointer", fontSize: 12, fontWeight: 800 }}>
              {pl.id === currentPlan ? p.current : pl.price === 0 ? p.free : `${p.upgrade} ${pl.priceUSD}`}
            </button>
          </div>
        ))}
      </div>

      {/* SECURITY NOTE */}
      <div style={{ ...card(), padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <Shield size={20} color={C.gold} style={{ flexShrink: 0 }} />
        <div>
          <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: 14 }}>{p.secureNote}</p>
          <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>{p.secureDesc}</p>
        </div>
      </div>
    </div>
  );
}