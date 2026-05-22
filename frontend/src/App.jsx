// App.jsx
import { useState } from "react";
import { T } from "./i18n";
import { LangCtx } from "./context/LangContext";
import { AppLayout } from "./components/AppLayout";

import Landing        from "./pages/Landing";
import AuthPage       from "./pages/AuthPage";
import Dashboard      from "./pages/Dashboard";
import MusicPage      from "./pages/MusicPage";
import PlansPage      from "./pages/PlansPage";
import WalletPage     from "./pages/WalletPage";
import ReferralPage   from "./pages/ReferralPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import SettingsPage   from "./pages/SettingsPage";
import AdminPage      from "./pages/AdminPage";

const AUTHED_PAGES = {
  dashboard:   <Dashboard />,
  music:       <MusicPage />,
  plans:       <PlansPage />,
  wallet:      <WalletPage />,
  referral:    <ReferralPage />,
  leaderboard: <LeaderboardPage />,
  settings:    <SettingsPage />,
  admin:       <AdminPage />,
};

export default function App() {
  const [lang, setLang] = useState("es");
  const [page, setPage] = useState("landing");
  const t = T[lang];

  return (
    <LangCtx.Provider value={{ lang, t, setLang }}>
      {page === "landing" && <Landing onNavigate={setPage} />}
      {(page === "login" || page === "register") && <AuthPage mode={page} onNavigate={setPage} />}
      {AUTHED_PAGES[page] && (
        <AppLayout page={page} onNavigate={setPage}>
          {AUTHED_PAGES[page]}
        </AppLayout>
      )}
    </LangCtx.Provider>
  );
}