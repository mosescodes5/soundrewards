/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import AdminLogin     from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

function getStoredAdmin() {
  try {
    const u = localStorage.getItem("sr_admin_user");
    const t = localStorage.getItem("sr_admin_token");
    if (u && t) return JSON.parse(u);
  } catch { /* ignore */ }
  return null;
}

export default function AdminPage() {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const stored = getStoredAdmin();
    if (stored) setAdmin(stored);
  }, []);

  const handleLogin = (user) => {
    setAdmin(user);
  };

  const handleSignOut = () => {
    localStorage.removeItem("sr_admin_token");
    localStorage.removeItem("sr_admin_user");
    setAdmin(null);
  };

  if (!admin) return <AdminLogin onLogin={handleLogin} />;
  return <AdminDashboard admin={admin} onSignOut={handleSignOut} />;
}