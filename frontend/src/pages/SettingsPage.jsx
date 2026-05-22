// SettingsPage.jsx
import { useState } from "react";
import { ToggleLeft, ToggleRight } from "lucide-react";
import { C, card } from "../theme";
import { useLang } from "../context/LangContext";
import { LangSelector } from "../components/LangSelector";

export default function SettingsPage() {
  const { t } = useLang();
  const [notifs, setNotifs] = useState({ earn: true, withdraw: true, refs: true, promo: false });
  const s = t.settings;

  const sections = [
    {
      title: s.profile,
      items: [
        { l: s.username, v: "mike_us" },
        { l: s.email,    v: "mike@example.com" },
        { l: s.country,  v: "🇺🇸 Estados Unidos" },
        { l: s.language, v: <LangSelector /> },
      ],
    },
    {
      title: s.security,
      items: [
        { l: s.changePass, v: s.changePass, btn: true },
        { l: s.enable2fa,  v: s.enable2fa,  btn: true },
        { l: s.kyc,        v: s.kyc,        btn: true },
      ],
    },
  ];

  return (
    <div style={{ maxWidth: 560 }}>
      {sections.map(sec => (
        <div key={sec.title} style={{ ...card(), padding: "20px", marginBottom: 16 }}>
          <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 16px" }}>{sec.title}</p>
          {sec.items.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ color: C.muted, fontSize: 13 }}>{item.l}</span>
              {item.btn
                ? <button style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text, borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontSize: 12 }}>{item.v}</button>
                : typeof item.v === "string"
                  ? <span style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>{item.v}</span>
                  : item.v
              }
            </div>
          ))}
        </div>
      ))}

      {/* NOTIFICATIONS */}
      <div style={{ ...card(), padding: "20px" }}>
        <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 16px" }}>{s.notifications}</p>
        {[
          { key: "earn",     label: s.notifEarn },
          { key: "withdraw", label: s.notifWithdraw },
          { key: "refs",     label: s.notifRefs },
          { key: "promo",    label: s.notifPromo },
        ].map(n => (
          <div key={n.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ color: C.muted, fontSize: 13 }}>{n.label}</span>
            <button onClick={() => setNotifs(v => ({ ...v, [n.key]: !v[n.key] }))} style={{ background: "transparent", border: "none", cursor: "pointer", color: notifs[n.key] ? C.gold : C.dim }}>
              {notifs[n.key] ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}