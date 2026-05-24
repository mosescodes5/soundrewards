// PlansPage.jsx
/* eslint-disable react/prop-types */
import { useState } from "react";
import { Crown, Shield, Loader, CheckCircle, AlertCircle } from "lucide-react";
import { C, card } from "../theme";
import { plans } from "../data/mockData";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { useLang } from "../context/LangContext";

export default function PlansPage({ user }) {
  const { t } = useLang();
  const { isMobile } = useBreakpoints();
  const p = t.plans;
  const currentPlan = user?.activePlan || "beginner";

  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState("");

  const planOrder = { beginner: 0, silver: 1, gold: 2, elite: 3 };
  const currentTier = planOrder[currentPlan] ?? 0;

  const handleUpgrade = async (planId, price) => {
    if (planId === currentPlan) return;
    setError("");

    // Free plan — just show it's already active or downgrade not supported
    if (price === 0) return;

    setLoadingPlan(planId);
    try {
      const token = localStorage.getItem("sr_token");
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId, currency: "USDT" }),
      });

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) throw new Error("Backend not connected. Run: vercel dev");

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Payment error");

      // Redirect to Plisio invoice
      window.location.href = data.invoiceUrl;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPlan(null);
    }
  };

  const getButtonLabel = (pl) => {
    if (pl.id === currentPlan) return p.current;
    if (loadingPlan === pl.id) return "…";
    if (pl.price === 0) return p.free;
    if (planOrder[pl.id] < currentTier) return p.current; // lower plan
    return `${p.upgrade} ${pl.priceUSD}`;
  };

  const isDisabled = (pl) => {
    return pl.id === currentPlan || loadingPlan !== null || planOrder[pl.id] <= currentTier;
  };

  return (
    <div>
      <p style={{ color: C.muted, textAlign: "center", margin: "0 0 28px", fontSize: 14 }}>{p.sub}</p>

      {error && (
        <div style={{ background: C.dangerDim, border: `1px solid ${C.danger}44`, borderRadius: 10, padding: "12px 16px", color: C.danger, fontSize: 13, marginBottom: 20, display: "flex", gap: 8, alignItems: "center" }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* PLAN CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {plans.map(pl => {
          const isCurrent = pl.id === currentPlan;
          const isLoading = loadingPlan === pl.id;
          const isLower = planOrder[pl.id] < currentTier && !isCurrent;

          return (
            <div key={pl.id} style={{ ...card(), padding: isMobile ? "18px 14px" : "24px 18px", border: isCurrent ? `2px solid ${C.gold}` : pl.popular ? `1px solid ${pl.color}44` : `1px solid ${C.border}`, position: "relative" }}>
              {isCurrent && (
                <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: C.gold, color: "#000", fontSize: 9, fontWeight: 800, padding: "2px 10px", borderRadius: 20, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
                  <CheckCircle size={9} /> {t.badges.yourPlan}
                </div>
              )}
              {pl.popular && !isCurrent && (
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

              <button
                onClick={() => handleUpgrade(pl.id, pl.price)}
                disabled={isDisabled(pl)}
                style={{
                  width: "100%",
                  marginTop: 16,
                  background: isCurrent || isLower ? "transparent" : pl.color,
                  border: isCurrent || isLower ? `1px solid ${C.border}` : "none",
                  color: isCurrent || isLower ? C.muted : "#000",
                  borderRadius: 9,
                  padding: "10px 0",
                  cursor: isCurrent || isLower || loadingPlan ? "default" : "pointer",
                  fontSize: 12,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  opacity: isLoading ? 0.7 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {isLoading && <Loader size={12} style={{ animation: "spin 1s linear infinite" }} />}
                {getButtonLabel(pl)}
              </button>
            </div>
          );
        })}
      </div>

      {/* SECURITY NOTE */}
      <div style={{ ...card(), padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <Shield size={20} color={C.gold} style={{ flexShrink: 0 }} />
        <div>
          <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: 14 }}>{p.secureNote}</p>
          <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>{p.secureDesc}</p>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
