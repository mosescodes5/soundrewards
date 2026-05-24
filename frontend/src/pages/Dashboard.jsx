/* eslint-disable react/prop-types */
import { Wallet, TrendingUp, Users, Activity, Music2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { C, card } from "../theme";
import { earningsData } from "../data/mockData";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { useLang } from "../context/LangContext";
import { StatCard, Badge, CustomTooltip } from "../components/SharedComponents";

export default function Dashboard({ user }) {
  const { t } = useLang();
  const { isMobile } = useBreakpoints();
  const d = t.dashboard;

  const balance     = user?.balance     ?? 0;
  const totalEarned = user?.totalEarned ?? 0;
  const plan        = user?.activePlan  ?? "beginner";

  const txns = [
    { type: "earn",     desc: "Midnight Frequencies", amount: "+$0.45", time: "2m",  color: C.success },
    { type: "earn",     desc: "Neon Pulse",            amount: "+$0.52", time: "14m", color: C.success },
    { type: "withdraw", desc: "USDT TRC20",            amount: "-$50.00",time: "1h",  color: C.danger },
    { type: "referral", desc: "Referral: user_mx",     amount: "+$1.20", time: "3h",  color: C.teal },
    { type: "deposit",  desc: "BTC Deposito",          amount: "+$89.00",time: "1d",  color: C.gold },
  ];

  const PLAN_LIMITS = { beginner: 1.5, silver: 5, gold: 12, elite: 35 };
  const dailyMax = PLAN_LIMITS[plan] || 1.5;

  const txIcon = (type, color) => {
    const p = { size: 13, color };
    if (type === "earn")     return <Music2 {...p} />;
    if (type === "withdraw") return <ArrowUpRight {...p} />;
    if (type === "referral") return <Users {...p} />;
    return <ArrowDownLeft {...p} />;
  };

  return (
    <div>
      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label={d.balance}       value={`$${balance.toFixed(2)}`}      sub={`≈ ${(balance * 0.0000103).toFixed(6)} BTC`} icon={Wallet}    trend="+$0.00 hoy" />
        <StatCard label={d.earned}        value={`$${totalEarned.toFixed(2)}`}   sub={d.allTime}                                   icon={TrendingUp} accent={C.tealDim} />
        <StatCard label={d.referralEarn}  value="$0.00"                          sub={`0 ${d.activeRefs}`}                         icon={Users}      accent={C.purpleDim} />
        <StatCard label={d.dailyProgress} value="$0.00"                          sub={`de $${dailyMax.toFixed(2)} ${d.dailyMax}`}  icon={Activity}   accent={C.tealDim} />
      </div>

      {/* CHART + TASKS */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 300px", gap: 16, marginBottom: 16 }}>
        <div style={{ ...card(), padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <div>
              <p style={{ color: C.muted, fontSize: 11, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: 0.5 }}>{d.weeklyEarnings}</p>
              <p style={{ color: C.text, fontSize: 20, fontWeight: 700, margin: 0 }}>$0.00 <span style={{ fontSize: 12, color: C.success }}>+0%</span></p>
            </div>
            <Badge color={C.gold} bg={C.goldDim}>{plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</Badge>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={earningsData}>
              <defs>
                <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={C.gold} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={C.gold} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="earned" stroke={C.gold} strokeWidth={2} fill="url(#eg)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...card(), padding: "20px" }}>
          <p style={{ color: C.muted, fontSize: 11, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: 0.5 }}>{d.todayTasks}</p>
          {[
            { label: d.tracksListened, val: 0,  max: 40,      color: C.gold },
            { label: d.dailyEarning,   val: 0,  max: dailyMax, color: C.teal, prefix: "$" },
            { label: d.referralTasks,  val: 0,  max: 5,        color: C.purple },
          ].map(p => (
            <div key={p.label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: C.muted }}>{p.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{p.prefix||""}{p.val}/{p.prefix||""}{p.max}</span>
              </div>
              <div style={{ height: 5, background: C.surface2, borderRadius: 3 }}>
                <div style={{ height: "100%", width: `${(p.val / p.max) * 100}%`, background: p.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
            <p style={{ color: C.muted, fontSize: 11, margin: "0 0 6px" }}>{d.dailyReset}</p>
            <p style={{ color: C.text, fontWeight: 700, fontSize: 20, margin: 0 }}>00:00:00</p>
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div style={{ ...card(), padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{d.recentTx}</p>
          <span style={{ color: C.gold, fontSize: 12, cursor: "pointer" }}>{d.viewAll}</span>
        </div>
        {txns.map((tx, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < txns.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: tx.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {txIcon(tx.type, tx.color)}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: C.text }}>{tx.desc}</p>
                <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{tx.time}</p>
              </div>
            </div>
            <span style={{ color: tx.color, fontWeight: 700, fontSize: 13 }}>{tx.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}