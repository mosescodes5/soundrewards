// AdminPage.jsx
import { Users, DollarSign, Crown, Clock, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { C, card } from "../theme";
import { earningsData, adminUsers, withdrawals } from "../data/mockData";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { useLang } from "../context/LangContext";
import { StatCard, Badge, CustomTooltip } from "../components/SharedComponents";

export default function AdminPage() {
  const { t } = useLang();
  const { isMobile } = useBreakpoints();
  const a = t.admin;

  const adminStats = [
    { label: a.totalUsers,          value: "84,210", icon: Users,    trend: `+342 ${a.today}` },
    { label: a.totalPaid,           value: "$1.24M",  icon: DollarSign, accent: C.successDim },
    { label: a.activePlans,         value: "12,840",  icon: Crown,    accent: C.purpleDim },
    { label: a.pendingWithdrawals,  value: "$24,800", icon: Clock,    accent: C.goldDim },
  ];

  return (
    <div>
      {/* ADMIN BANNER */}
      <div style={{ ...card(), padding: "11px 14px", marginBottom: 16, background: "#1A0A00", border: `1px solid ${C.gold}44`, display: "flex", alignItems: "center", gap: 10 }}>
        <Shield size={15} color={C.gold} />
        <span style={{ color: C.gold, fontSize: 12, fontWeight: 600 }}>{a.mode}</span>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {adminStats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* USERS + WITHDRAWALS */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* RECENT USERS */}
        <div style={{ ...card(), padding: 0 }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{a.recentUsers}</p>
          </div>
          {adminUsers.map((u, i) => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderBottom: i < adminUsers.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: u.status === "flagged" ? C.dangerDim : C.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, color: u.status === "flagged" ? C.danger : C.text, flexShrink: 0 }}>
                {u.user[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 1px", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {u.user} {u.country === "US" ? "🇺🇸" : u.country === "MX" ? "🇲🇽" : "🇭🇳"}
                </p>
                <p style={{ margin: 0, fontSize: 10, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</p>
              </div>
              <Badge color={u.status === "flagged" ? C.danger : C.success} bg={u.status === "flagged" ? C.dangerDim : C.successDim} small>
                {u.status === "flagged" ? t.badges.flagged : t.badges.active}
              </Badge>
              <span style={{ color: C.success, fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{u.balance}</span>
            </div>
          ))}
        </div>

        {/* WITHDRAWAL REQUESTS */}
        <div style={{ ...card(), padding: 0 }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{a.withdrawalRequests}</p>
            <Badge color={C.gold} bg={C.goldDim}>{withdrawals.filter(w => w.status === "pending").length} {a.pending}</Badge>
          </div>
          {withdrawals.map((w, i) => (
            <div key={w.id} style={{ padding: "13px 18px", borderBottom: i < withdrawals.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, flexWrap: "wrap", gap: 6 }}>
                <div>
                  <p style={{ margin: "0 0 1px", fontWeight: 600, fontSize: 13 }}>{w.user} · {w.amount}</p>
                  <p style={{ margin: 0, fontSize: 10, color: C.muted }}>{w.crypto} · {w.wallet} · {w.date}</p>
                </div>
                <Badge color={w.status === "pending" ? C.gold : C.success} bg={w.status === "pending" ? C.goldDim : C.successDim} small>{w.status}</Badge>
              </div>
              {w.status === "pending" && (
                <div style={{ display: "flex", gap: 7 }}>
                  <button style={{ flex: 1, background: C.successDim, border: `1px solid ${C.success}44`, color: C.success, borderRadius: 6, padding: "6px 0", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>{a.approve}</button>
                  <button style={{ flex: 1, background: C.dangerDim,  border: `1px solid ${C.danger}44`,  color: C.danger,  borderRadius: 6, padding: "6px 0", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>{a.reject}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* REVENUE CHART */}
      <div style={{ ...card(), padding: "20px" }}>
        <p style={{ fontWeight: 700, margin: "0 0 16px", fontSize: 14 }}>{a.revenue}</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={earningsData}>
            <XAxis dataKey="day" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="earned" fill={C.gold} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}