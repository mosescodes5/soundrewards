// LeaderboardPage.jsx
import { C, card } from "../theme";
import { plans } from "../data/mockData";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { useLang } from "../context/LangContext";
import { Badge } from "../components/SharedComponents";

const top = [
  { rank: 1, user: "amy_us",    country: "🇺🇸", total: "$4,820", plan: "Elite",  refs: 42 },
  { rank: 2, user: "carlos_mx", country: "🇲🇽", total: "$3,140", plan: "Elite",  refs: 31 },
  { rank: 3, user: "mike_us",   country: "🇺🇸", total: "$2,890", plan: "Gold",   refs: 14 },
  { rank: 4, user: "sofia_hn",  country: "🇭🇳", total: "$1,950", plan: "Gold",   refs: 22 },
  { rank: 5, user: "pedro_mx",  country: "🇲🇽", total: "$1,430", plan: "Silver", refs: 8 },
  { rank: 6, user: "diana_us",  country: "🇺🇸", total: "$1,200", plan: "Elite",  refs: 18 },
  { rank: 7, user: "jose_hn",   country: "🇭🇳", total: "$980",   plan: "Gold",   refs: 5 },
  { rank: 8, user: "luis_mx",   country: "🇲🇽", total: "$740",   plan: "Silver", refs: 9 },
];

export default function LeaderboardPage() {
  const { t } = useLang();
  const { isMobile } = useBreakpoints();

  const getPlan = name => plans.find(p => p.name.toLowerCase() === name.toLowerCase());

  return (
    <div>
      {/* TOP 3 PODIUM */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
        {top.slice(0, 3).map((u, i) => (
          <div key={u.rank} style={{ ...card(), padding: "22px", textAlign: "center", border: i === 0 ? `1px solid ${C.gold}` : `1px solid ${C.border}` }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{["🥇","🥈","🥉"][i]}</div>
            <p style={{ fontWeight: 800, fontSize: 15, margin: "0 0 3px" }}>{u.user} {u.country}</p>
            <p style={{ color: C.gold, fontWeight: 900, fontSize: 20, margin: "0 0 8px" }}>{u.total}</p>
            <Badge color={getPlan(u.plan)?.color || C.muted} bg={getPlan(u.plan)?.accent || "rgba(255,255,255,0.05)"}>{u.plan}</Badge>
          </div>
        ))}
      </div>

      {/* FULL TABLE */}
      <div style={{ ...card(), padding: 0 }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{t.leaderboard.title}</p>
        </div>
        {top.map((u, i) => (
          <div key={u.rank} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", borderBottom: i < top.length - 1 ? `1px solid ${C.border}` : "none", background: u.user === "mike_us" ? C.goldDim : "transparent" }}>
            <span style={{ width: 24, fontWeight: 700, fontSize: 13, color: i < 3 ? C.gold : C.muted, flexShrink: 0 }}>#{u.rank}</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: C.text, flexShrink: 0 }}>{u.user[0].toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: "0 0 1px", fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {u.user} {u.country}{" "}
                {u.user === "mike_us" && <Badge color={C.gold} bg={C.goldDim} small>Tú</Badge>}
              </p>
              <p style={{ margin: 0, color: C.muted, fontSize: 11 }}>{u.refs} {t.leaderboard.referrals}</p>
            </div>
            <span style={{ color: C.success, fontWeight: 700, fontSize: 13 }}>{u.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}