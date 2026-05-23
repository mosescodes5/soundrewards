// AuthPage.jsx
/* eslint-disable react/prop-types */
import { useState } from "react";
import { Music2, Mail, Lock, User, Globe, Gift, Eye, EyeOff, AlertCircle } from "lucide-react";
import { C, card } from "../theme";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { useLang } from "../context/LangContext";
import { LangSelector } from "../components/LangSelector";

function validate(form, isReg) {
  const e = {};
  if (!form.email.trim())                     e.email    = "Ingresa tu correo";
  else if (!/\S+@\S+\.\S+/.test(form.email)) e.email    = "Correo inválido";
  if (!form.password)                          e.password = "Ingresa tu contraseña";
  else if (form.password.length < 6)           e.password = "Mínimo 6 caracteres";
  if (isReg) {
    if (!form.username.trim())                e.username = "Ingresa un usuario";
    else if (form.username.length < 3)        e.username = "Mínimo 3 caracteres";
    else if (/\s/.test(form.username))        e.username = "Sin espacios";
  }
  return e;
}

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 5, fontWeight: 600 }}>
        {label}
      </label>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: C.surface2,
        border: `1px solid ${error ? C.danger : C.border}`,
        borderRadius: 9, padding: "10px 13px",
      }}>
        {children}
      </div>
      {error && (
        <p style={{ color: C.danger, fontSize: 11, margin: "4px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

export default function AuthPage({ mode, onNavigate }) {
  const { t } = useLang();
  const { isMobile } = useBreakpoints();
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    username: "", email: "", password: "", country: "MX", referralCode: "",
  });

  const isReg = mode === "register";
  const a = t.auth;

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFieldErrors((fe) => ({ ...fe, [key]: "" }));
    setApiError("");
  };

  const handleSubmit = async () => {
    // 1. Validate first — stop if anything is wrong
    const errors = validate(form, isReg);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const endpoint = isReg ? "/api/auth/register" : "/api/auth/login";
      const body = isReg
        ? { username: form.username, email: form.email, password: form.password, country: form.country, referralCode: form.referralCode }
        : { email: form.email, password: form.password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // If Vite serves HTML instead of JSON, the backend isn't running
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        throw new Error("Backend no conectado. Ejecuta: vercel dev");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error del servidor");

      localStorage.setItem("sr_token", data.token);
      localStorage.setItem("sr_user", JSON.stringify(data.user));
      onNavigate("dashboard");

    } catch (err) {
      if (err.message === "Failed to fetch") {
        setApiError("No se pudo conectar. Ejecuta: vercel dev");
      } else {
        setApiError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  const input = {
    background: "transparent", border: "none", outline: "none",
    color: C.text, fontSize: 14, flex: 1, minWidth: 0,
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
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
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px", color: C.text }}>
            {isReg ? a.registerTitle : a.loginTitle}
          </h1>
          <p style={{ color: C.muted, margin: 0, fontSize: 14 }}>
            {isReg ? a.registerSub : a.loginSub}
          </p>
        </div>

        <div style={{ ...card(), padding: 28 }}>
          {apiError && (
            <div style={{ background: C.dangerDim, border: `1px solid ${C.danger}44`, borderRadius: 8, padding: "10px 14px", color: C.danger, fontSize: 13, marginBottom: 16, display: "flex", gap: 8 }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{apiError}</span>
            </div>
          )}

          {isReg && (
            <Field label={a.username} error={fieldErrors.username}>
              <User size={15} color={C.muted} />
              <input value={form.username} onChange={set("username")} onKeyDown={onKey} placeholder="tu_usuario" autoComplete="username" style={input} />
            </Field>
          )}

          <Field label={a.email} error={fieldErrors.email}>
            <Mail size={15} color={C.muted} />
            <input type="email" value={form.email} onChange={set("email")} onKeyDown={onKey} placeholder="tu@correo.com" autoComplete="email" style={input} />
          </Field>

          <div style={{ marginBottom: isReg ? 14 : 20 }}>
            <label style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 5, fontWeight: 600 }}>{a.password}</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.surface2, border: `1px solid ${fieldErrors.password ? C.danger : C.border}`, borderRadius: 9, padding: "10px 13px" }}>
              <Lock size={15} color={C.muted} />
              <input type={show ? "text" : "password"} value={form.password} onChange={set("password")} onKeyDown={onKey} placeholder="••••••••" autoComplete={isReg ? "new-password" : "current-password"} style={input} />
              <button onClick={() => setShow(!show)} tabIndex={-1} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, flexShrink: 0 }}>
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p style={{ color: C.danger, fontSize: 11, margin: "4px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                <AlertCircle size={11} /> {fieldErrors.password}
              </p>
            )}
          </div>

          {isReg && (
            <>
              <Field label={a.country} error={fieldErrors.country}>
                <Globe size={15} color={C.muted} />
                <select value={form.country} onChange={set("country")} style={{ ...input, cursor: "pointer" }}>
                  <option value="MX">{a.countryMX}</option>
                  <option value="US">{a.countryUS}</option>
                  <option value="HN">{a.countryHN}</option>
                </select>
              </Field>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 5, fontWeight: 600 }}>
                  {a.referralCode} <span style={{ color: C.dim }}>{a.optional}</span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 13px" }}>
                  <Gift size={15} color={C.muted} />
                  <input value={form.referralCode} onChange={set("referralCode")} onKeyDown={onKey} placeholder="CODIGO-REF" style={input} />
                </div>
              </div>
            </>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: "100%", background: loading ? C.dim : C.gold, border: "none", color: "#000", borderRadius: 10, padding: 13, cursor: loading ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 800, marginBottom: 14 }}
          >
            {loading ? "..." : (isReg ? a.registerBtn : a.loginBtn)}
          </button>

          {!isReg && (
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <span style={{ color: C.gold, fontSize: 13, cursor: "pointer" }}>{a.forgot}</span>
            </div>
          )}

          <p style={{ textAlign: "center", color: C.muted, fontSize: 13, margin: 0 }}>
            {isReg ? a.altRegister : a.altLogin}{" "}
            <span onClick={() => { setFieldErrors({}); setApiError(""); onNavigate(isReg ? "login" : "register"); }} style={{ color: C.gold, cursor: "pointer", fontWeight: 600 }}>
              {isReg ? a.altRegisterBtn : a.altLoginBtn}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}