/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Wallet, TrendingUp, Users, Activity, Music2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { C, card } from "../theme";
import { earningsData } from "../data/mockData";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { useLang } from "../context/LangContext";
import { StatCard, Badge, CustomTooltip } from "../components/SharedComponents";

const PLAN_LIMITS = { beginner: 1.5, silver: 5, gold: 12, elite: 35 };

export default function Dashboard({ user }) {
  const { t } = useLang();
  const { isMobile } = useBreakpoints();
  const d = t.dashboard;

  const plan     = user?.activePlan || "beginner";
  const dailyMax = PLAN_LIMITS[plan] || 1.5;

  // Live balance — updates when MusicPage credits a reward
  const [balance, setBalance]         = useState(user?.balance     ?? 0);
  const [totalEarned, setTotalEarned] = useState(user?.totalEarned ?? 0);
  const [dailyEarned, setDailyEarned] = useState(0);
  const [tracksToday, setTracksToday] = useState(0);
  const [txns, setTxns]               = useState([]);
  const [countdown, setCountdown]     = useState("");

  // Listen for balance updates from MusicPage via localStorage
  useEffect(() => {
    const refresh = () => {
      try {
        const u = JSON.parse(localStorage.getItem("sr_user") || "{}");
        if (u.balance     !== undefined) setBalance(u.balance);
        if (u.totalEarned !== undefined) setTotalEarned(u.totalEarned);
        if (u.dailyEarned !== undefined) setDailyEarned(u.dailyEarned);
        if (u.tracksToday !== undefined) setTracksToday(u.tracksToday);
      } catch { /* ignore */ }
    };

    refresh(); // run once on mount
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  // Midnight countdown
  useEffect(() => {
    const tick = () => {
      const now      = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.floor((midnight - now) / 1000);
      const h    = String(Math.floor(diff / 3600)).padStart(2, "0");
      const m    = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
      const s    = String(diff % 60).padStart(2, "0");
      setCountdown(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Load recent transactions
  useEffect(() => {
    const token = localStorage.getItem("sr_token");
    if (!token) return;
    fetch("/api/wallet/history", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.transactions) setTxns(data.transactions.slice(0, 5)); })
      .catch(() => {});
  }, []);

  const txIcon = (type, color) => {
    const p = { size: 13, color };
    if (type === "earn")       return <Music2 {...p} />;
    if (type === "withdrawal") return <ArrowUpRight {...p} />;
    if (type === "referral")   return <Users {...p} />;
    return <ArrowDownLeft {...p} />;
  };

  const txColor = (type) => {
    if (type === "earn" || type === "deposit" || type === "referral") return C.success;
    return C.danger;
  };

  return (
    <div>
      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard
          label={d.balance}
          value={`$${balance.toFixed(2)}`}
          sub={`≈ ${(balance * 0.0000103).toFixed(6)} BTC`}
          icon={Wallet}
          trend={dailyEarned > 0 ? `+$${dailyEarned.toFixed(2)} hoy` : undefined}
        />
        <StatCard
          label={d.earned}
          value={`$${totalEarned.toFixed(2)}`}
          sub={d.allTime}
          icon={TrendingUp}
          accent={C.tealDim}
        />
        <StatCard
          label={d.referralEarn}
          value="$0.00"
          sub={`0 ${d.activeRefs}`}
          icon={Users}
          accent={C.purpleDim}
        />
        <StatCard
          label={d.dailyProgress}
          value={`$${dailyEarned.toFixed(2)}`}
          sub={`de $${dailyMax.toFixed(2)} ${d.dailyMax}`}
          icon={Activity}
          accent={C.tealDim}
        />
      </div>

      {/* CHART + TASKS */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 300px", gap: 16, marginBottom: 16 }}>
        <div style={{ ...card(), padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <div>
              <p style={{ color: C.muted, fontSize: 11, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: 0.5 }}>{d.weeklyEarnings}</p>
              <p style={{ color: C.text, fontSize: 20, fontWeight: 700, margin: 0 }}>
                ${totalEarned.toFixed(2)}
              </p>
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

        {/* TODAY'S TASKS */}
        <div style={{ ...card(), padding: "20px" }}>
          <p style={{ color: C.muted, fontSize: 11, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: 0.5 }}>{d.todayTasks}</p>
          {[
            { label: d.tracksListened, val: tracksToday, max: plan === "beginner" ? 5 : plan === "silver" ? 15 : plan === "gold" ? 40 : 999, color: C.gold },
            { label: d.dailyEarning,   val: parseFloat(dailyEarned.toFixed(2)), max: dailyMax, color: C.teal, prefix: "$" },
            { label: d.referralTasks,  val: 0, max: 5, color: C.purple },
          ].map(p => (
            <div key={p.label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: C.muted }}>{p.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
                  {p.prefix||""}{p.val}/{p.prefix||""}{p.max === 999 ? "∞" : p.max}
                </span>
              </div>
              <div style={{ height: 5, background: C.surface2, borderRadius: 3 }}>
                <div style={{ height: "100%", width: `${Math.min((p.val / (p.max || 1)) * 100, 100)}%`, background: p.color, borderRadius: 3, transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
            <p style={{ color: C.muted, fontSize: 11, margin: "0 0 6px" }}>{d.dailyReset}</p>
            <p style={{ color: C.text, fontWeight: 700, fontSize: 20, margin: 0 }}>{countdown}</p>
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div style={{ ...card(), padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{d.recentTx}</p>
          <span style={{ color: C.gold, fontSize: 12, cursor: "pointer" }}>{d.viewAll}</span>
        </div>

        {txns.length === 0 ? (
          <p style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "20px 0", margin: 0 }}>
            No transactions yet. Start listening to earn!
          </p>
        ) : (
          txns.map((tx, i) => {
            const color = txColor(tx.type);
            const isOut = tx.type === "withdrawal";
            return (
              <div key={tx._id || i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < txns.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {txIcon(tx.type, color)}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: C.text, textTransform: "capitalize" }}>{tx.type} {tx.currency ? `· ${tx.currency}` : ""}</p>
                    <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span style={{ color, fontWeight: 700, fontSize: 13 }}>
                  {isOut ? "-" : "+"} ${tx.amount?.toFixed(2)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}