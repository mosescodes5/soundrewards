import { useState } from "react";
import { Music2, Mail, Lock, User, Globe, Gift, Eye, EyeOff } from "lucide-react";
import { C, card } from "../theme";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { useLang } from "../context/LangContext";
import { LangSelector } from "../components/LangSelector";

export default function AuthPage({ mode, onNavigate, onAuth }) {
  const { t } = useLang();
  const { isMobile } = useBreakpoints();
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm]       = useState({
    username: "", email: "", password: "", country: "MX", referralCode: "",
  });

  const isReg = mode === "register";
  const a = t.auth;

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const endpoint = isReg ? "/api/auth/register" : "/api/auth/login";
      const body     = isReg
        ? form
        : { email: form.email, password: form.password };

      const res  = await fetch(endpoint, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error");

      // Save to localStorage
      localStorage.setItem("sr_token", data.token);
      localStorage.setItem("sr_user",  JSON.stringify(data.user));

      // Tell App.jsx we're logged in
      onAuth(data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inp = (style = {}) => ({
    background: "transparent", border: "none", outline: "none",
    color: C.text, fontSize: 14, flex: 1, minWidth: 0, ...style,
  });

  const row = (children) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 13px" }}>
      {children}
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      {/* Back to landing */}
      <div style={{ position: "absolute", top: 20, left: isMobile ? 20 : 40 }}>
        <button onClick={() => onNavigate("landing")} style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", cursor: "pointer" }}>
          <Music2 size={16} color={C.gold} />
          <span style={{ fontWeight: 800, color: C.text, fontSize: 14 }}>{t.brand}</span>
        </button>
      </div>
      <div style={{ position: "absolute", top: 18, right: isMobile ? 20 : 40 }}>
        <LangSelector />
      </div>

      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 13, background: C.goldDim, border: `1px solid ${C.gold}44`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <Music2 size={24} color={C.gold} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>
            {isReg ? a.registerTitle : a.loginTitle}
          </h1>
          <p style={{ color: C.muted, margin: 0, fontSize: 14 }}>
            {isReg ? a.registerSub : a.loginSub}
          </p>
        </div>

        <div style={{ ...card(), padding: 28 }}>
          {error && (
            <div style={{ background: C.dangerDim, border: `1px solid ${C.danger}44`, borderRadius: 8, padding: "10px 14px", color: C.danger, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {/* USERNAME (register only) */}
          {isReg && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 5, fontWeight: 600 }}>{a.username}</label>
              {row(<>
                <User size={15} color={C.muted} />
                <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="tu_usuario" style={inp()} />
              </>)}
            </div>
          )}

          {/* EMAIL */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 5, fontWeight: 600 }}>{a.email}</label>
            {row(<>
              <Mail size={15} color={C.muted} />
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="tu@correo.com" style={inp()} />
            </>)}
          </div>

          {/* PASSWORD */}
          <div style={{ marginBottom: isReg ? 14 : 20 }}>
            <label style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 5, fontWeight: 600 }}>{a.password}</label>
            {row(<>
              <Lock size={15} color={C.muted} />
              <input type={show ? "text" : "password"} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder="••••••••" style={inp()} />
              <button onClick={() => setShow(!show)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, flexShrink: 0 }}>
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </>)}
          </div>

          {/* COUNTRY + REFERRAL (register only) */}
          {isReg && (<>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 5, fontWeight: 600 }}>{a.country}</label>
              {row(<>
                <Globe size={15} color={C.muted} />
                <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} style={{ ...inp(), background: "transparent" }}>
                  <option value="US">{a.countryUS}</option>
                  <option value="MX">{a.countryMX}</option>
                  <option value="HN">{a.countryHN}</option>
                </select>
              </>)}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 5, fontWeight: 600 }}>
                {a.referralCode} <span style={{ color: C.dim }}>{a.optional}</span>
              </label>
              {row(<>
                <Gift size={15} color={C.muted} />
                <input value={form.referralCode} onChange={e => setForm(f => ({ ...f, referralCode: e.target.value }))} placeholder="CODIGO-REF" style={inp()} />
              </>)}
            </div>
          </>)}

          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: "100%", background: loading ? C.dim : C.gold, border: "none", color: "#000", borderRadius: 10, padding: 13, cursor: loading ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 800, marginBottom: 14 }}
          >
            {loading ? t.common.loading : (isReg ? a.registerBtn : a.loginBtn)}
          </button>

          {!isReg && (
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <span style={{ color: C.gold, fontSize: 13, cursor: "pointer" }}>{a.forgot}</span>
            </div>
          )}

          <p style={{ textAlign: "center", color: C.muted, fontSize: 13, margin: 0 }}>
            {isReg ? a.altRegister : a.altLogin}{" "}
            <span onClick={() => onNavigate(isReg ? "login" : "register")} style={{ color: C.gold, cursor: "pointer", fontWeight: 600 }}>
              {isReg ? a.altRegisterBtn : a.altLoginBtn}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}