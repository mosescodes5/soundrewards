// ReferralPage.jsx
/* eslint-disable react/prop-types */
import { useState } from "react";
import { Users, DollarSign, Award, Copy, Check, Send } from "lucide-react";
import { C, card } from "../theme";
import { plans } from "../data/mockData";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { useLang } from "../context/LangContext";
import { StatCard, Badge } from "../components/SharedComponents";

export default function ReferralPage({ user }) {
  const { t } = useLang();
  const { isMobile } = useBreakpoints();
  const [copied, setCopied] = useState(false);
  const r = t.referral;

  const referralCode = user?.referralCode || "—";
  const referralLink = `https://soundrewards.app/r/${referralCode.toLowerCase()}`;

  const copy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVia = (platform) => {
    const msg = `Join SoundRewards and earn crypto listening to music! Use my code: ${referralCode} — ${referralLink}`;
    const urls = {
      Telegram:  `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(msg)}`,
      WhatsApp:  `https://wa.me/?text=${encodeURIComponent(msg)}`,
      Twitter:   `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}`,
    };
    if (urls[platform]) window.open(urls[platform], "_blank", "noopener");
    else copy(referralLink);
  };

  return (
    <div>
      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label={r.totalRefs} value="0"    sub={`0 ${r.thisMonth}`}           icon={Users} />
        <StatCard label={r.earnings}  value="$0.00" sub={`0% commission`}              icon={DollarSign} accent={C.tealDim} />
        <StatCard label={r.rank}      value="—"     sub={r.global}                     icon={Award} accent={C.purpleDim} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* REFERRAL CODE */}
        <div style={{ ...card(), padding: "20px" }}>
          <p style={{ color: C.muted, fontSize: 11, margin: "0 0 10px", fontWeight: 600 }}>{r.yourCode}</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <div style={{ flex: 1, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 9, padding: "11px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: 2, color: C.gold }}>{referralCode}</span>
              <button onClick={() => copy(referralCode)} style={{ background: C.goldDim, border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", color: C.gold, display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600 }}>
                {copied ? <Check size={12} /> : <Copy size={12} />}{copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <p style={{ color: C.muted, fontSize: 11, margin: "0 0 8px" }}>{r.shareLink}</p>
          <div style={{ background: C.surface2, borderRadius: 7, padding: "9px 12px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: 11, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{referralLink}</span>
            <button onClick={() => copy(referralLink)} style={{ background: "transparent", border: "none", cursor: "pointer", color: copied ? C.success : C.muted, flexShrink: 0 }}>
              <Copy size={12} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
            {["Telegram", "WhatsApp", "Twitter", "Copy"].map(s => (
              <button
                key={s}
                onClick={() => shareVia(s)}
                style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.muted, borderRadius: 7, padding: "7px 0", cursor: "pointer", fontSize: 10, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, transition: "border-color 0.2s, color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
              >
                <Send size={9} />{s}
              </button>
            ))}
          </div>
        </div>

        {/* COMMISSION BY PLAN */}
        <div style={{ ...card(), padding: "20px" }}>
          <p style={{ color: C.muted, fontSize: 11, margin: "0 0 12px", fontWeight: 600 }}>{r.commissionByPlan}</p>
          {plans.map(pl => (
            <div key={pl.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: pl.color }} />
                <span style={{ fontSize: 13, color: C.text }}>{pl.name}</span>
              </div>
              <span style={{ color: pl.color, fontWeight: 700, fontSize: 13 }}>{pl.referral}</span>
            </div>
          ))}
          <div style={{ marginTop: 14, background: C.goldDim, borderRadius: 7, padding: "9px 11px" }}>
            <p style={{ color: C.gold, fontSize: 11, margin: 0 }}>{r.upgradeNote}</p>
          </div>
        </div>
      </div>

      {/* REFERRAL NETWORK - empty state for new users */}
      <div style={{ ...card(), padding: "40px 20px", textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <Users size={22} color={C.muted} />
        </div>
        <p style={{ fontWeight: 700, color: C.text, fontSize: 15, margin: "0 0 6px" }}>No referrals yet</p>
        <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>Share your code and start earning commissions when friends join!</p>
      </div>
    </div>
  );
}
