/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Music2, Home, Wallet, Users, Crown, Bell,
  Settings, LogOut, BarChart3, Star, Search, X, Menu,
  DollarSign, ArrowDownLeft, Shield,
} from "lucide-react";
import { C } from "../theme";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { useLang } from "../context/LangContext";
import { LangSelector } from "./LangSelector";
import { Badge } from "./SharedComponents";

const PLAN_COLORS = { beginner: C.muted, silver: "#94A3B8", gold: C.gold, elite: C.purple };

export function AppLayout({ page, onNavigate, onSignOut, user, children }) {
  const { t } = useLang();
  const { isMobile, isTablet } = useBreakpoints();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen]     = useState(false);

  const isAdmin    = user?.isAdmin === true;
  const planColor  = PLAN_COLORS[user?.activePlan] || C.muted;

  const navItems = [
    { icon: Home,     label: t.nav.dashboard,  page: "dashboard" },
    { icon: Music2,   label: t.nav.music,       page: "music" },
    { icon: Crown,    label: t.nav.plans,       page: "plans" },
    { icon: Wallet,   label: t.nav.wallet,      page: "wallet" },
    { icon: Users,    label: t.nav.referral,    page: "referral" },
    { icon: Star,     label: t.nav.leaderboard, page: "leaderboard" },
    { icon: Settings, label: t.nav.settings,    page: "settings" },
  ];

  const pageTitle = {
    dashboard: t.nav.dashboard, music: t.nav.music, plans: t.nav.plans,
    wallet: t.nav.wallet, referral: t.nav.referral, leaderboard: t.nav.leaderboard,
    settings: t.nav.settings, admin: t.nav.admin,
  };

  const notifs = [
    { icon: DollarSign,    msg: "Ganaste $0.45 en Midnight Frequencies", time: "2m",  color: C.success },
    { icon: Users,         msg: "Nuevo referido registrado",              time: "1h",  color: C.teal },
    { icon: ArrowDownLeft, msg: "Retiro de $50 aprobado",                 time: "3h",  color: C.gold },
  ];

  const NavBtn = ({ item }) => (
    <button
      onClick={() => onNavigate(item.page)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "9px 12px", borderRadius: 9, border: "none", cursor: "pointer",
        background: page === item.page ? C.goldDim : "transparent",
        color: page === item.page ? C.gold : C.muted,
        fontWeight: page === item.page ? 600 : 400,
        fontSize: 13, width: "100%",
        justifyContent: (!isMobile && isTablet) ? "center" : "flex-start",
      }}
    >
      <item.icon size={16} style={{ flexShrink: 0 }} />
      {(isMobile || !isTablet) && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
    </button>
  );

  // MOBILE LAYOUT
  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg, overflow: "hidden" }}>
        {/* TOP BAR */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${C.border}`, background: C.surface, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: C.goldDim, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Music2 size={13} color={C.gold} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 14, color: C.text }}>{t.brand}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LangSelector compact />
            <button onClick={() => setNotifOpen(!notifOpen)} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 7, padding: 7, cursor: "pointer", color: C.muted, position: "relative" }}>
              <Bell size={15} />
              <span style={{ position: "absolute", top: 3, right: 3, width: 5, height: 5, background: C.gold, borderRadius: "50%" }} />
            </button>
          </div>
        </div>

        {/* PAGE TITLE */}
        <div style={{ padding: "10px 16px 6px", borderBottom: `1px solid ${C.border}`, background: C.surface, flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text }}>{pageTitle[page] || ""}</h2>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>{children}</div>

        {/* BOTTOM NAV */}
        <div style={{ display: "flex", borderTop: `1px solid ${C.border}`, background: C.surface, flexShrink: 0 }}>
          {navItems.slice(0, 5).map(n => (
            <button key={n.page} onClick={() => onNavigate(n.page)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 4px", background: "transparent", border: "none", cursor: "pointer", color: page === n.page ? C.gold : C.muted }}>
              <n.icon size={18} />
              <span style={{ fontSize: 9, fontWeight: page === n.page ? 700 : 400, whiteSpace: "nowrap" }}>{n.label}</span>
            </button>
          ))}
          <button onClick={() => setSidebarOpen(true)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 4px", background: "transparent", border: "none", cursor: "pointer", color: C.muted }}>
            <Menu size={18} />
            <span style={{ fontSize: 9 }}>Más</span>
          </button>
        </div>

        {/* MOBILE DRAWER */}
        {sidebarOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300 }}>
            <div onClick={() => setSidebarOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.surface, borderRadius: "16px 16px 0 0", padding: "20px 16px", zIndex: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: C.text }}>{user?.username || "Usuario"}</p>
                  <Badge color={planColor} bg={planColor + "22"} small>{user?.activePlan || "beginner"}</Badge>
                </div>
                <button onClick={() => setSidebarOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.muted }}><X size={18} /></button>
              </div>
              {navItems.slice(5).map(n => (
                <button key={n.page} onClick={() => { onNavigate(n.page); setSidebarOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: "transparent", border: "none", color: C.text, padding: "12px 4px", cursor: "pointer", fontSize: 15, borderBottom: `1px solid ${C.border}` }}>
                  <n.icon size={18} color={C.muted} />{n.label}
                </button>
              ))}
              {/* Admin only */}
              {isAdmin && (
                <button onClick={() => { onNavigate("admin"); setSidebarOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: C.purpleDim, border: `1px solid ${C.purple}44`, color: C.purple, padding: "12px 14px", cursor: "pointer", fontSize: 14, fontWeight: 700, borderRadius: 10, marginTop: 12 }}>
                  <BarChart3 size={16} />{t.nav.admin}
                </button>
              )}
              <button onClick={() => { onSignOut(); setSidebarOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: "transparent", border: "none", color: C.muted, padding: "12px 4px", cursor: "pointer", fontSize: 14, marginTop: 4 }}>
                <LogOut size={16} />{t.nav.signout}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // DESKTOP LAYOUT
  const collapsed = isTablet;
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: C.bg }}>
      {/* SIDEBAR */}
      <div style={{ width: collapsed ? 60 : 220, flexShrink: 0, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", padding: "14px 10px", transition: "width 0.2s" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 8, marginBottom: 22, padding: "0 4px" }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: C.goldDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Music2 size={14} color={C.gold} />
          </div>
          {!collapsed && <span style={{ fontWeight: 800, fontSize: 13, color: C.text }}>{t.brand}</span>}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(n => <NavBtn key={n.page} item={n} />)}
          {/* Admin link in sidebar — admin only */}
          {isAdmin && (
            <button
              onClick={() => onNavigate("admin")}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 9, border: "none", cursor: "pointer",
                background: page === "admin" ? C.purpleDim : "transparent",
                color: page === "admin" ? C.purple : C.muted,
                fontWeight: page === "admin" ? 600 : 400,
                fontSize: 13, width: "100%",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
            >
              <Shield size={16} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{t.nav.admin}</span>}
            </button>
          )}
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", marginBottom: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: planColor + "22", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, color: planColor, flexShrink: 0 }}>
                {(user?.username || "U")[0].toUpperCase()}
              </div>
              <div style={{ overflow: "hidden" }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.username || "Usuario"}</p>
                <Badge color={planColor} bg={planColor + "22"} small>{user?.activePlan || "beginner"}</Badge>
              </div>
            </div>
          )}
          <button onClick={onSignOut} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "transparent", border: "none", cursor: "pointer", color: C.muted, width: "100%", borderRadius: 8, fontSize: 12, justifyContent: collapsed ? "center" : "flex-start" }}>
            <LogOut size={15} />{!collapsed && t.nav.signout}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* TOPBAR */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderBottom: `1px solid ${C.border}`, background: C.surface, flexShrink: 0, gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.text, whiteSpace: "nowrap" }}>{pageTitle[page] || ""}</h2>
            <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {!isTablet && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 11px" }}>
                <Search size={13} color={C.muted} />
                <input placeholder={t.common.search} style={{ background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 12, width: 110 }} />
              </div>
            )}
            <LangSelector compact={isTablet} />
            <div style={{ position: "relative" }}>
              <button onClick={() => setNotifOpen(!notifOpen)} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: 7, cursor: "pointer", color: C.muted, position: "relative" }}>
                <Bell size={15} />
                <span style={{ position: "absolute", top: 4, right: 4, width: 5, height: 5, background: C.gold, borderRadius: "50%" }} />
              </button>
              {notifOpen && (
                <div style={{ position: "absolute", right: 0, top: 40, width: 280, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, zIndex: 100, overflow: "hidden" }}>
                  <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>Notificaciones</span>
                    <button onClick={() => setNotifOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}><X size={13} /></button>
                  </div>
                  {notifs.map((n, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "11px 14px", borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ background: n.color + "22", borderRadius: 7, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <n.icon size={13} color={n.color} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 12, color: C.text, lineHeight: 1.4 }}>{n.msg}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Admin button in topbar — admin only */}
            {isAdmin && (
              <button onClick={() => onNavigate("admin")} style={{ background: C.purpleDim, border: `1px solid ${C.purple}44`, color: C.purple, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                {t.nav.admin}
              </button>
            )}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>{children}</div>
      </div>
    </div>
  );
}