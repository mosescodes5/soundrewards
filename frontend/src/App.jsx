/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { T } from "./i18n";
import { LangCtx } from "./context/LangContext";
import { AppLayout } from "./components/AppLayout";

import Landing         from "./pages/Landing";
import AuthPage        from "./pages/AuthPage";
import Dashboard       from "./pages/Dashboard";
import MusicPage       from "./pages/MusicPage";
import PlansPage       from "./pages/PlansPage";
import WalletPage      from "./pages/WalletPage";
import ReferralPage    from "./pages/ReferralPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import SettingsPage    from "./pages/SettingsPage";
import AdminPage       from "./pages/AdminPage";

const AUTHED = ["dashboard","music","plans","wallet","referral","leaderboard","settings","admin"];

function getStoredUser() {
  try {
    const u = localStorage.getItem("sr_user");
    const tk = localStorage.getItem("sr_token");
    if (u && tk) return JSON.parse(u);
  } catch { /* ignore */ }
  return null;
}

export default function App() {
  const [lang, setLang] = useState("es");
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  const t = T[lang];

  // On first load — restore session
  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
      setPage("dashboard");
    }
  }, []);

  const navigate = (target) => {
    // Guard: authed pages require login
    if (AUTHED.includes(target) && !getStoredUser()) {
      setPage("login");
      return;
    }
    setPage(target);
  };

  const handleSignOut = () => {
    localStorage.removeItem("sr_token");
    localStorage.removeItem("sr_user");
    setUser(null);
    setPage("landing");
  };

  // Auth pages — redirect to dashboard if already logged in
  if (page === "login" || page === "register") {
    if (user) { navigate("dashboard"); return null; }
    return (
      <LangCtx.Provider value={{ lang, t, setLang }}>
        <AuthPage
          mode={page}
          onNavigate={(target) => {
            if (target === "dashboard") {
              // Reload user from localStorage after successful auth
              const stored = getStoredUser();
              setUser(stored);
            }
            setPage(target);
          }}
        />
      </LangCtx.Provider>
    );
  }

  if (page === "landing") {
    return (
      <LangCtx.Provider value={{ lang, t, setLang }}>
        <Landing onNavigate={navigate} />
      </LangCtx.Provider>
    );
  }

  if (AUTHED.includes(page)) {
    // Safety check — if somehow on authed page without user, go to login
    if (!user && !getStoredUser()) {
      setPage("login");
      return null;
    }

    const currentUser = user || getStoredUser();

    const pages = {
      dashboard:   <Dashboard   user={currentUser} />,
      music:       <MusicPage   user={currentUser} />,
      plans:       <PlansPage   user={currentUser} />,
      wallet:      <WalletPage  user={currentUser} />,
      referral:    <ReferralPage user={currentUser} />,
      leaderboard: <LeaderboardPage />,
      settings:    <SettingsPage user={currentUser} setUser={(u) => { setUser(u); localStorage.setItem("sr_user", JSON.stringify(u)); }} />,
      admin:       <AdminPage />,
    };

    return (
      <LangCtx.Provider value={{ lang, t, setLang }}>
        <AppLayout page={page} onNavigate={navigate} onSignOut={handleSignOut} user={currentUser}>
          {pages[page]}
        </AppLayout>
      </LangCtx.Provider>
    );
  }

  // Fallback
  return (
    <LangCtx.Provider value={{ lang, t, setLang }}>
      <Landing onNavigate={navigate} />
    </LangCtx.Provider>
  );
}