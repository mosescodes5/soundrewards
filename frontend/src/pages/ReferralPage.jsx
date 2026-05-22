// ReferralPage.jsx
import { useState } from "react";
import { Users, DollarSign, Award, Copy, Check } from "lucide-react";
import { C, card } from "../theme";
import { plans } from "../data/mockData";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { useLang } from "../context/LangContext";
import { StatCard, Badge } from "../components/SharedComponents";

const refs = [
  { user: "carlos_mx", country: "🇲🇽", plan: "Gold",     earned: "$8.40",  joined: "Ene 12", active: true },
  { user: "sara_hn",   country: "🇭🇳", plan: "Silver",   earned: "$2.10",  joined: "Feb 3",  active: true },
  { user: "juan_mx",   country: "🇲🇽", plan: "Beginner", earned: "$0.30",  joined: "Mar 1",  active: false },
  { user: "amy_us",    country: "🇺🇸", plan: "Elite",    earned: "$24.50", joined: "Dic 28", active: true },
  { user: "pedro_hn",  country: "🇭🇳", plan: "Silver",   earned: "$3.20",  joined: "Feb 15", active: true },
];

export default function ReferralPage() {
  const { t } = useLang();
  const { isMobile } = useBreakpoints();
  const [copied, setCopied] = useState(false);
  const r = t.referral;

  const copy = () => { navigator.clipboard?.writeText("MIKE-SR24"); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div>
      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label={r.totalRefs} value="14"    sub={`5 ${r.thisMonth}`}          icon={Users} />
        <StatCard label={r.earnings}  value="$48.60" sub={`8% ${r.commission} (Gold)`} icon={DollarSign} accent={C.tealDim} />
        <StatCard label={r.rank}      value="#12"    sub={r.global}                    icon={Award} accent={C.purpleDim} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* REFERRAL CODE */}
        <div style={{ ...card(), padding: "20px" }}>
          <p style={{ color: C.muted, fontSize: 11, margin: "0 0 10px", fontWeight: 600 }}>{r.yourCode}</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <div style={{ flex: 1, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 9, padding: "11px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: 2, color: C.gold }}>MIKE-SR24</span>
              <button onClick={copy} style={{ background: C.goldDim, border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", color: C.gold, display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600 }}>
                {copied ? <Check size={12} /> : <Copy size={12} />}{copied ? "¡Listo!" : t.wallet.copyBtn}
              </button>
            </div>
          </div>
          <p style={{ color: C.muted, fontSize: 11, margin: "0 0 8px" }}>{r.shareLink}</p>
          <div style={{ background: C.surface2, borderRadius: 7, padding: "9px 12px", marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: C.muted }}>soundrewards.app/r/mike-sr24</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
            {["Telegram", "WhatsApp", "Twitter", "Copiar"].map(s => (
              <button key={s} style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.muted, borderRadius: 7, padding: "7px 0", cursor: "pointer", fontSize: 10, textAlign: "center" }}>{s}</button>
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

      {/* REFERRAL NETWORK */}
      <div style={{ ...card(), padding: 0 }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{r.network}</p>
          <Badge color={C.teal} bg={C.tealDim}>14 {r.total} · {refs.filter(x => x.active).length} {r.active}</Badge>
        </div>
        {refs.map((rf, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", borderBottom: i < refs.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: C.text, flexShrink: 0 }}>{rf.user[0].toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 13 }}>{rf.user} {rf.country}</p>
              <p style={{ margin: 0, color: C.muted, fontSize: 11 }}>{r.joined} {rf.joined}</p>
            </div>
            <span style={{ color: C.success, fontWeight: 700, fontSize: 13 }}>{rf.earned}</span>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: rf.active ? C.success : C.dim, flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}