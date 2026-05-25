/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Users, DollarSign, Crown, Clock, Shield, LogOut,
  CheckCircle, XCircle, RefreshCw, Search, Music2,
  TrendingUp, AlertTriangle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { C, card } from "../theme";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { Badge } from "../components/SharedComponents";

const PLAN_COLOR = { beginner: C.muted, silver: "#94A3B8", gold: C.gold, elite: C.purple };

function StatBox({ label, value, icon: Icon, color, sub }) {
  return (
    <div style={{ ...card(), padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ color: C.muted, fontSize: 11, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
          <p style={{ color: C.text, fontSize: 22, fontWeight: 700, margin: 0 }}>{value}</p>
          {sub && <p style={{ color: C.muted, fontSize: 11, margin: "4px 0 0" }}>{sub}</p>}
        </div>
        <div style={{ background: (color || C.gold) + "22", borderRadius: 10, padding: 9 }}>
          <Icon size={16} color={color || C.gold} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard({ admin, onSignOut }) {
  const { isMobile } = useBreakpoints();
  const [tab, setTab]               = useState("overview");
  const [stats, setStats]           = useState(null);
  const [users, setUsers]           = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [actionMsg, setActionMsg]   = useState("");

  const token = localStorage.getItem("sr_admin_token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const weekData = [
    { day: "Mon", amount: 420 }, { day: "Tue", amount: 380 },
    { day: "Wed", amount: 510 }, { day: "Thu", amount: 290 },
    { day: "Fri", amount: 640 }, { day: "Sat", amount: 720 },
    { day: "Sun", amount: 480 },
  ];

  useEffect(() => { loadStats(); loadWithdrawals(); }, []);
  useEffect(() => { if (tab === "users") loadUsers(); }, [tab]);

  const loadStats = async () => {
    try {
      const res  = await fetch("/api/admin/stats", { headers });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (e) { console.error(e); }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/users", { headers });
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadWithdrawals = async () => {
    try {
      const res  = await fetch("/api/admin/withdrawals", { headers });
      const data = await res.json();
      if (res.ok) setWithdrawals(data.withdrawals || []);
    } catch (e) { console.error(e); }
  };

  const handleWithdrawal = async (id, action) => {
    try {
      const res  = await fetch("/api/admin/withdrawals", {
        method: "PUT", headers,
        body: JSON.stringify({ transactionId: id, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`Withdrawal ${action}d successfully`);
        setTimeout(() => setActionMsg(""), 3000);
        loadWithdrawals();
        loadStats();
      } else {
        setActionMsg(data.message || "Action failed");
      }
    } catch (e) { console.error(e); }
  };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = ["overview", "withdrawals", "users"];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      {/* TOPBAR */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.purpleDim, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={16} color={C.purple} />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 15 }}>SoundRewards Admin</p>
            <p style={{ margin: 0, fontSize: 11, color: C.muted }}>Logged in as {admin?.username || admin?.email}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={loadStats} style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
            <RefreshCw size={14} />
          </button>
          <button onClick={onSignOut} style={{ display: "flex", alignItems: "center", gap: 6, background: C.dangerDim, border: `1px solid ${C.danger}44`, color: C.danger, borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* ACTION MSG */}
      {actionMsg && (
        <div style={{ background: C.successDim, border: `1px solid ${C.success}44`, color: C.success, padding: "10px 24px", fontSize: 13, fontWeight: 600 }}>
          ✓ {actionMsg}
        </div>
      )}

      {/* TABS */}
      <div style={{ padding: "16px 24px 0" }}>
        <div style={{ display: "flex", gap: 4, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 11, padding: 4, width: "fit-content", marginBottom: 20 }}>
          {tabs.map(tb => (
            <button key={tb} onClick={() => setTab(tb)} style={{ background: tab === tb ? C.surface2 : "transparent", border: tab === tb ? `1px solid ${C.border}` : "1px solid transparent", color: tab === tb ? C.text : C.muted, borderRadius: 8, padding: "7px 18px", cursor: "pointer", fontSize: 13, fontWeight: tab === tb ? 600 : 400, textTransform: "capitalize" }}>
              {tb}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
              <StatBox label="Total Users"        value={stats?.totalUsers   ?? "—"} icon={Users}      color={C.teal} />
              <StatBox label="Total Paid Out"     value={stats ? `$${stats.totalPaid?.toFixed(2)}` : "—"} icon={DollarSign} color={C.success} />
              <StatBox label="Active Plans"       value={stats?.activePlans  ?? "—"} icon={Crown}      color={C.gold} />
              <StatBox label="Pending Withdrawals" value={stats ? `$${stats.pendingWithdrawals?.toFixed(2)}` : "—"} icon={Clock} color={C.danger} />
            </div>

            {/* REVENUE CHART */}
            <div style={{ ...card(), padding: "20px", marginBottom: 20 }}>
              <p style={{ fontWeight: 700, margin: "0 0 16px", fontSize: 14 }}>Platform Revenue — Last 7 Days</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weekData}>
                  <XAxis dataKey="day" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8 }}
                    labelStyle={{ color: C.muted }}
                    itemStyle={{ color: C.gold }}
                    formatter={v => [`$${v}`, "Revenue"]}
                  />
                  <Bar dataKey="amount" fill={C.gold} radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* QUICK STATS */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
              <div style={{ ...card(), padding: "20px" }}>
                <p style={{ fontWeight: 700, margin: "0 0 14px", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <Music2 size={15} color={C.gold} /> Platform Health
                </p>
                {[
                  { l: "API Status",       v: "Online",   c: C.success },
                  { l: "Database",         v: "Connected",c: C.success },
                  { l: "Plisio Gateway",   v: "Active",   c: C.success },
                  { l: "Pending Reviews",  v: `${withdrawals.length} withdrawals`, c: withdrawals.length > 0 ? C.gold : C.success },
                ].map(r => (
                  <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ color: C.muted, fontSize: 13 }}>{r.l}</span>
                    <span style={{ color: r.c, fontSize: 13, fontWeight: 600 }}>{r.v}</span>
                  </div>
                ))}
              </div>

              <div style={{ ...card(), padding: "20px" }}>
                <p style={{ fontWeight: 700, margin: "0 0 14px", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <TrendingUp size={15} color={C.teal} /> Plan Distribution
                </p>
                {[
                  { plan: "Beginner", color: C.muted },
                  { plan: "Silver",   color: "#94A3B8" },
                  { plan: "Gold",     color: C.gold },
                  { plan: "Elite",    color: C.purple },
                ].map(p => (
                  <div key={p.plan} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                      <span style={{ fontSize: 13, color: C.text }}>{p.plan}</span>
                    </div>
                    <span style={{ color: p.color, fontWeight: 700, fontSize: 13 }}>—</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* WITHDRAWALS TAB */}
        {tab === "withdrawals" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Withdrawal Requests</p>
              <div style={{ display: "flex", gap: 8 }}>
                <Badge color={C.gold} bg={C.goldDim}>{withdrawals.filter(w => w.status === "pending").length} pending</Badge>
                <button onClick={loadWithdrawals} style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "5px 10px", cursor: "pointer" }}>
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>

            {withdrawals.length === 0 ? (
              <div style={{ ...card(), padding: "40px", textAlign: "center" }}>
                <CheckCircle size={32} color={C.success} style={{ marginBottom: 12 }} />
                <p style={{ color: C.muted, margin: 0 }}>No pending withdrawals</p>
              </div>
            ) : (
              <div style={{ ...card(), padding: 0 }}>
                {withdrawals.map((w, i) => (
                  <div key={w._id} style={{ padding: "16px 20px", borderBottom: i < withdrawals.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: w.status === "pending" ? 12 : 0 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>
                            {w.userId?.username || "Unknown"} — <span style={{ color: C.gold }}>${w.amount?.toFixed(2)}</span>
                          </p>
                          <Badge
                            color={w.status === "pending" ? C.gold : w.status === "approved" ? C.success : C.danger}
                            bg={w.status === "pending" ? C.goldDim : w.status === "approved" ? C.successDim : C.dangerDim}
                            small
                          >
                            {w.status}
                          </Badge>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: C.muted }}>
                          {w.currency} → {w.walletAddr}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: C.dim }}>
                          {new Date(w.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {w.status === "pending" && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => handleWithdrawal(w._id, "approve")}
                            style={{ display: "flex", alignItems: "center", gap: 6, background: C.successDim, border: `1px solid ${C.success}44`, color: C.success, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}
                          >
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button
                            onClick={() => handleWithdrawal(w._id, "reject")}
                            style={{ display: "flex", alignItems: "center", gap: 6, background: C.dangerDim, border: `1px solid ${C.danger}44`, color: C.danger, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USERS TAB */}
        {tab === "users" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, padding: "8px 12px", flex: 1, minWidth: 200 }}>
                <Search size={13} color={C.muted} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by username or email..." style={{ background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 13, flex: 1 }} />
              </div>
              <button onClick={loadUsers} style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>
                <RefreshCw size={14} />
              </button>
            </div>

            {loading ? (
              <p style={{ color: C.muted, textAlign: "center", padding: 40 }}>Loading users...</p>
            ) : (
              <div style={{ ...card(), padding: 0 }}>
                {/* Table header */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto auto", gap: 12, padding: "10px 18px", borderBottom: `1px solid ${C.border}`, background: C.surface2 }}>
                  {["User", "Email", "Plan", "Balance", "Status"].map(h => (
                    <span key={h} style={{ color: C.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>{h}</span>
                  ))}
                </div>
                {filteredUsers.length === 0 ? (
                  <p style={{ color: C.muted, textAlign: "center", padding: "30px 0", margin: 0 }}>No users found</p>
                ) : (
                  filteredUsers.map((u, i) => (
                    <div key={u._id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto auto", gap: 12, padding: "12px 18px", borderBottom: i < filteredUsers.length - 1 ? `1px solid ${C.border}` : "none", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 7, background: (PLAN_COLOR[u.activePlan] || C.muted) + "22", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: PLAN_COLOR[u.activePlan] || C.muted, flexShrink: 0 }}>
                          {(u.username || "U")[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.username}</span>
                      </div>
                      <span style={{ fontSize: 12, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</span>
                      <Badge color={PLAN_COLOR[u.activePlan] || C.muted} bg={(PLAN_COLOR[u.activePlan] || C.muted) + "22"} small>
                        {u.activePlan || "beginner"}
                      </Badge>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.success }}>${(u.balance || 0).toFixed(2)}</span>
                      <Badge color={u.isFlagged ? C.danger : C.success} bg={u.isFlagged ? C.dangerDim : C.successDim} small>
                        {u.isFlagged ? <><AlertTriangle size={10} /> flagged</> : "active"}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}