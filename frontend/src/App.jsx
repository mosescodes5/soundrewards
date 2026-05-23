// App.jsx
import { useState } from "react";
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

// Pages that need the AppLayout wrapper (sidebar + topbar)
const AUTHED_KEYS = ["dashboard","music","plans","wallet","referral","leaderboard","settings","admin"];

export default function App() {
  const [lang, setLang] = useState("es");
  const [page, setPage] = useState("landing");
  const t = T[lang];

  // Guard: if someone somehow ends up on an authed page without a token,
  // send them back to landing instead of showing a broken screen.
  const handleNavigate = (dest) => {
    if (AUTHED_KEYS.includes(dest) && !localStorage.getItem("sr_token")) {
      setPage("landing");
      return;
    }
    setPage(dest);
  };

  // Sign-out clears storage and goes home
  const handleSignOut = () => {
    localStorage.removeItem("sr_token");
    localStorage.removeItem("sr_user");
    setPage("landing");
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const isLanding = page === "landing";
  const isAuth    = page === "login" || page === "register";
  const isAuthed  = AUTHED_KEYS.includes(page);

  const pageMap = {
    dashboard:   <Dashboard />,
    music:       <MusicPage />,
    plans:       <PlansPage />,
    wallet:      <WalletPage />,
    referral:    <ReferralPage />,
    leaderboard: <LeaderboardPage />,
    settings:    <SettingsPage />,
    admin:       <AdminPage />,
  };

  return (
    <LangCtx.Provider value={{ lang, t, setLang }}>
      {isLanding && <Landing onNavigate={handleNavigate} />}

      {isAuth && (
        <AuthPage mode={page} onNavigate={handleNavigate} />
      )}

      {isAuthed && pageMap[page] && (
        <AppLayout page={page} onNavigate={handleNavigate} onSignOut={handleSignOut}>
          {pageMap[page]}
        </AppLayout>
      )}
    </LangCtx.Provider>
  );
}