// AdminPage.jsx — Real admin dashboard with live API data
/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from "react";
import {
  Users, DollarSign, Crown, Clock, Shield, Search,
  Check, X, ChevronLeft, ChevronRight, RefreshCw,
  AlertTriangle, Loader, BarChart3, ArrowUpRight,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { C, card } from "../theme";
import { earningsData } from "../data/mockData";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { useLang } from "../context/LangContext";
import { StatCard, Badge, CustomTooltip } from "../components/SharedComponents";

const PLAN_COLORS = { beginner: C.muted, silver: "#94A3B8", gold: C.gold, elite: C.purple };
const TABS = ["overview", "users", "withdrawals"];

function useAdminData() {
  const [stats, setStats]       = useState(null);
  const [users, setUsers]       = useState([]);
  const [withdrawals, setWith]  = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [totalUsers, setTotal]  = useState(0);

  const token = localStorage.getItem("sr_token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/stats", { headers });
      if (r.ok) { const d = await r.json(); setStats(d); }
    } catch { /* ignore */ }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page, limit: 10, search });
      const r = await fetch(`/api/admin/users?${params}`, { headers });
      if (r.ok) {
        const d = await r.json();
        setUsers(d.users || []);
        setTotal(d.total || 0);
      }
    } catch { /* ignore */ }
  }, [page, search]);

  const fetchWithdrawals = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/withdrawals", { headers });
      if (r.ok) { const d = await r.json(); setWith(d.withdrawals || []); }
    } catch { /* ignore */ }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try {
      await Promise.all([fetchStats(), fetchUsers(), fetchWithdrawals()]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fetchStats, fetchUsers, fetchWithdrawals]);

  useEffect(() => { refresh(); }, [refresh]);

  return { stats, users, withdrawals, loading, error, page, setPage, search, setSearch, totalUsers, refresh, headers };
}

export default function AdminPage() {
  const { t } = useLang();
  const { isMobile } = useBreakpoints();
  const a = t.admin;
  const [activeTab, setTab] = useState("overview");
  const [actionLoading, setActionLoading] = useState(null);
  const [actionMsg, setActionMsg] = useState("");

  const { stats, users, withdrawals, loading, error, page, setPage, search, setSearch, totalUsers, refresh, headers } = useAdminData();

  const totalPages = Math.ceil(totalUsers / 10);

  const handleWithdrawal = async (id, action) => {
    setActionLoading(id + action); setActionMsg("");
    try {
      const r = await fetch(`/api/admin/withdrawals`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ id, action }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setActionMsg(`Withdrawal ${action}d successfully`);
      refresh();
    } catch (e) {
      setActionMsg(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFlag = async (userId, isFlagged) => {
    setActionLoading(userId); setActionMsg("");
    try {
      const r = await fetch(`/api/admin/users`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ userId, isFlagged: !isFlagged }),
      });
      if (!r.ok) throw new Error("Failed");
      setActionMsg(isFlagged ? "User unflagged" : "User flagged");
      refresh();
    } catch (e) {
      setActionMsg(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const planColor = (plan) => PLAN_COLORS[plan] || C.muted;

  const countryFlag = (c) => ({ US: "🇺🇸", MX: "🇲🇽", HN: "🇭🇳", CA: "🇨🇦" }[c] || "🌍");

  return (
    <div>
      {/* ADMIN BANNER */}
      <div style={{ ...card(), padding: "11px 16px", marginBottom: 16, background: "#0D0820", border: `1px solid ${C.purple}44`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Shield size={15} color={C.purple} />
          <span style={{ color: C.purple, fontSize: 12, fontWeight: 700 }}>{a.mode}</span>
        </div>
        <button onClick={refresh} disabled={loading} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
          <RefreshCw size={12} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: C.dangerDim, border: `1px solid ${C.danger}44`, borderRadius: 10, padding: "10px 14px", color: C.danger, fontSize: 13, marginBottom: 16, display: "flex", gap: 8 }}>
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{error} — Make sure the backend is running.</span>
        </div>
      )}

      {actionMsg && (
        <div style={{ background: C.successDim, border: `1px solid ${C.success}44`, borderRadius: 10, padding: "10px 14px", color: C.success, fontSize: 13, marginBottom: 16 }}>
          ✓ {actionMsg}
        </div>
      )}

      {/* TABS */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 11, padding: 4, width: "fit-content" }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setTab(tab)} style={{ background: activeTab === tab ? C.surface2 : "transparent", border: activeTab === tab ? `1px solid ${C.border2}` : "1px solid transparent", color: activeTab === tab ? C.text : C.muted, borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontSize: 13, fontWeight: activeTab === tab ? 600 : 400, textTransform: "capitalize" }}>
            {tab === "overview" ? "Overview" : tab === "users" ? `Users ${totalUsers > 0 ? `(${totalUsers})` : ""}` : "Withdrawals"}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <>
          {/* STAT CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
            <StatCard label={a.totalUsers}         value={loading ? "—" : (stats?.totalUsers ?? 0).toLocaleString()}  icon={Users}      trend={stats?.newToday ? `+${stats.newToday} today` : ""} />
            <StatCard label={a.totalPaid}           value={loading ? "—" : `$${(stats?.totalPaid ?? 0).toFixed(2)}`}   icon={DollarSign} accent={C.successDim} />
            <StatCard label={a.activePlans}         value={loading ? "—" : (stats?.paidPlans ?? 0).toLocaleString()}   icon={Crown}      accent={C.purpleDim} />
            <StatCard label={a.pendingWithdrawals}  value={loading ? "—" : `$${(stats?.pendingAmount ?? 0).toFixed(2)}`} icon={Clock}    accent={C.goldDim} />
          </div>

          {/* REVENUE CHART */}
          <div style={{ ...card(), padding: "20px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <BarChart3 size={16} color={C.gold} />
              <p style={{ fontWeight: 700, margin: 0, fontSize: 14 }}>{a.revenue}</p>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={earningsData}>
                <XAxis dataKey="day" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="earned" fill={C.gold} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* QUICK STATS ROW */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12 }}>
            {[
              { label: "Beginner users", value: stats?.planCounts?.beginner ?? 0, color: C.muted },
              { label: "Silver users",   value: stats?.planCounts?.silver   ?? 0, color: "#94A3B8" },
              { label: "Gold users",     value: stats?.planCounts?.gold     ?? 0, color: C.gold },
              { label: "Elite users",    value: stats?.planCounts?.elite    ?? 0, color: C.purple },
            ].map(s => (
              <div key={s.label} style={{ ...card(), padding: "14px 16px" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, marginBottom: 8 }} />
                <p style={{ color: s.color, fontSize: 22, fontWeight: 800, margin: "0 0 3px" }}>{loading ? "—" : s.value}</p>
                <p style={{ color: C.muted, fontSize: 11, margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── USERS TAB ── */}
      {activeTab === "users" && (
        <div>
          {/* SEARCH */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 14px", marginBottom: 16, maxWidth: 360 }}>
            <Search size={14} color={C.muted} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by username or email…"
              style={{ background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 13, flex: 1 }}
            />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0 }}><X size={13} /></button>}
          </div>

          <div style={{ ...card(), padding: 0, overflow: "hidden" }}>
            {/* TABLE HEADER */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr auto" : "2fr 2fr 1fr 1fr 1fr auto", gap: 0, padding: "10px 18px", borderBottom: `1px solid ${C.border}`, background: C.surface2 }}>
              {["User", !isMobile && "Email", "Plan", !isMobile && "Balance", !isMobile && "Country", "Actions"].filter(Boolean).map(h => (
                <span key={h} style={{ color: C.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</span>
              ))}
            </div>

            {loading ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <Loader size={20} color={C.muted} style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
              </div>
            ) : users.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>No users found</p>
              </div>
            ) : users.map((u, i) => (
              <div key={u.id || u._id} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr auto" : "2fr 2fr 1fr 1fr 1fr auto", gap: 0, padding: "11px 18px", borderBottom: i < users.length - 1 ? `1px solid ${C.border}` : "none", alignItems: "center", background: u.isFlagged ? "rgba(239,68,68,0.04)" : "transparent" }}>
                {/* Username */}
                <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: u.isFlagged ? C.dangerDim : (planColor(u.activePlan) + "22"), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: u.isFlagged ? C.danger : planColor(u.activePlan), flexShrink: 0 }}>
                    {(u.username || "?")[0].toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.username}</p>
                    {u.isFlagged && <span style={{ fontSize: 9, color: C.danger, fontWeight: 700 }}>FLAGGED</span>}
                  </div>
                </div>
                {/* Email */}
                {!isMobile && <p style={{ margin: 0, fontSize: 11, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</p>}
                {/* Plan */}
                <Badge color={planColor(u.activePlan)} bg={planColor(u.activePlan) + "22"} small>{u.activePlan || "beginner"}</Badge>
                {/* Balance */}
                {!isMobile && <span style={{ color: C.success, fontSize: 12, fontWeight: 600 }}>${parseFloat(u.balance || 0).toFixed(2)}</span>}
                {/* Country */}
                {!isMobile && <span style={{ fontSize: 13 }}>{countryFlag(u.country)} {u.country}</span>}
                {/* Actions */}
                <button
                  onClick={() => handleToggleFlag(u.id || u._id, u.isFlagged)}
                  disabled={actionLoading === (u.id || u._id)}
                  style={{ background: u.isFlagged ? C.successDim : C.dangerDim, border: `1px solid ${u.isFlagged ? C.success : C.danger}44`, color: u.isFlagged ? C.success : C.danger, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}
                >
                  {actionLoading === (u.id || u._id) ? "…" : u.isFlagged ? "Unflag" : "Flag"}
                </button>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 16 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ background: C.surface, border: `1px solid ${C.border}`, color: page === 1 ? C.dim : C.text, borderRadius: 7, padding: "6px 10px", cursor: page === 1 ? "default" : "pointer" }}>
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: 13, color: C.muted }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ background: C.surface, border: `1px solid ${C.border}`, color: page === totalPages ? C.dim : C.text, borderRadius: 7, padding: "6px 10px", cursor: page === totalPages ? "default" : "pointer" }}>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── WITHDRAWALS TAB ── */}
      {activeTab === "withdrawals" && (
        <div style={{ ...card(), padding: 0 }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{a.withdrawalRequests}</p>
            <Badge color={C.gold} bg={C.goldDim}>
              {withdrawals.filter(w => w.status === "pending").length} {a.pending}
            </Badge>
          </div>

          {loading ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <Loader size={20} color={C.muted} style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
            </div>
          ) : withdrawals.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <p style={{ color: C.muted, fontSize: 14, margin: "0 0 6px" }}>No withdrawal requests</p>
              <p style={{ color: C.dim, fontSize: 12, margin: 0 }}>All clear!</p>
            </div>
          ) : withdrawals.map((w, i) => (
            <div key={w._id || w.id} style={{ padding: "14px 18px", borderBottom: i < withdrawals.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: C.goldDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ArrowUpRight size={15} color={C.gold} />
                  </div>
                  <div>
                    <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14, color: C.text }}>${parseFloat(w.amount || 0).toFixed(2)} <span style={{ color: C.muted, fontSize: 12, fontWeight: 400 }}>{w.currency || w.coin || "USDT"}</span></p>
                    <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{w.walletAddr || w.wallet} · {new Date(w.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <Badge color={w.status === "pending" ? C.gold : w.status === "approved" ? C.success : C.danger} bg={w.status === "pending" ? C.goldDim : w.status === "approved" ? C.successDim : C.dangerDim} small>
                  {w.status}
                </Badge>
              </div>
              {w.status === "pending" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleWithdrawal(w._id || w.id, "approve")}
                    disabled={actionLoading === ((w._id || w.id) + "approve")}
                    style={{ flex: 1, background: C.successDim, border: `1px solid ${C.success}44`, color: C.success, borderRadius: 7, padding: "8px 0", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                  >
                    {actionLoading === ((w._id || w.id) + "approve") ? <Loader size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={12} />}
                    {a.approve}
                  </button>
                  <button
                    onClick={() => handleWithdrawal(w._id || w.id, "reject")}
                    disabled={actionLoading === ((w._id || w.id) + "reject")}
                    style={{ flex: 1, background: C.dangerDim, border: `1px solid ${C.danger}44`, color: C.danger, borderRadius: 7, padding: "8px 0", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                  >
                    {actionLoading === ((w._id || w.id) + "reject") ? <Loader size={12} style={{ animation: "spin 1s linear infinite" }} /> : <X size={12} />}
                    {a.reject}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}