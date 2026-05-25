/* eslint-disable react/prop-types */
import { useState } from "react";
import { Lock, Mail, Shield } from "lucide-react";
import { C, card } from "../theme";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      if (data.user.role !== "admin") throw new Error("Access denied — admin only");

      localStorage.setItem("sr_admin_token", data.token);
      localStorage.setItem("sr_admin_user",  JSON.stringify(data.user));
      onLogin(data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, background: C.purpleDim, border: `1px solid ${C.purple}44`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Shield size={28} color={C.purple} />
          </div>
          <h1 style={{ color: C.text, fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>Admin Dashboard</h1>
          <p style={{ color: C.muted, margin: 0, fontSize: 14 }}>Restricted access — admins only</p>
        </div>

        <div style={{ ...card(), padding: 28 }}>
          {error && (
            <div style={{ background: C.dangerDim, border: `1px solid ${C.danger}44`, borderRadius: 8, padding: "10px 14px", color: C.danger, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: C.muted, fontSize: 11, fontWeight: 600, marginBottom: 5 }}>EMAIL</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 13px" }}>
              <Mail size={15} color={C.muted} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="admin@example.com" style={{ background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 14, flex: 1 }} />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", color: C.muted, fontSize: 11, fontWeight: 600, marginBottom: 5 }}>PASSWORD</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 13px" }}>
              <Lock size={15} color={C.muted} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="••••••••" style={{ background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 14, flex: 1 }} />
            </div>
          </div>

          <button onClick={handleLogin} disabled={loading} style={{ width: "100%", background: loading ? C.dim : C.purple, border: "none", color: "#fff", borderRadius: 10, padding: 13, cursor: loading ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 800 }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}