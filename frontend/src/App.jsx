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

const AUTHED_PAGES = ["dashboard","music","plans","wallet","referral","leaderboard","settings","admin"];

// Read logged-in user from localStorage
function getStoredUser() {
  try {
    const u = localStorage.getItem("sr_user");
    const t = localStorage.getItem("sr_token");
    if (u && t) return JSON.parse(u);
  } catch { /* ignore */ }
  return null;
}

export default function App() {
  const [lang, setLang]   = useState("es");
  const [page, setPage]   = useState("landing");
  const [user, setUser]   = useState(getStoredUser);
  const t = T[lang];

  // On mount: if token exists go straight to dashboard
  useEffect(() => {
    const stored = getStoredUser();
    if (stored) setPage("dashboard");
  }, []);

  // Navigate with auth guard
  const navigate = (target) => {
    if (AUTHED_PAGES.includes(target) && !getStoredUser()) {
      setPage("login");
      return;
    }
    setPage(target);
  };

  // Called by AuthPage after successful login/register
  const handleAuth = (userData) => {
    setUser(userData);
    setPage("dashboard");
  };

  // Called by logout button
  const handleSignOut = () => {
    localStorage.removeItem("sr_token");
    localStorage.removeItem("sr_user");
    setUser(null);
    setPage("landing");
  };

  const renderPage = () => {
    if (page === "landing") return <Landing onNavigate={navigate} />;
    if (page === "login" || page === "register") {
      // Already logged in — go to dashboard
      if (user) { setPage("dashboard"); return null; }
      return <AuthPage mode={page} onNavigate={navigate} onAuth={handleAuth} />;
    }
    if (AUTHED_PAGES.includes(page)) {
      const pages = {
        dashboard:   <Dashboard user={user} />,
        music:       <MusicPage user={user} />,
        plans:       <PlansPage user={user} />,
        wallet:      <WalletPage user={user} />,
        referral:    <ReferralPage user={user} />,
        leaderboard: <LeaderboardPage />,
        settings:    <SettingsPage user={user} setUser={setUser} />,
        admin:       <AdminPage />,
      };
      return (
        <AppLayout page={page} onNavigate={navigate} onSignOut={handleSignOut} user={user}>
          {pages[page]}
        </AppLayout>
      );
    }
    return <Landing onNavigate={navigate} />;
  };

  return (
    <LangCtx.Provider value={{ lang, t, setLang }}>
      {renderPage()}
    </LangCtx.Provider>
  );
}