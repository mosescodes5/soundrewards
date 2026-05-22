// LangSelector.jsx
/* eslint-disable react/prop-types */
import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { C } from "../theme";
import { useLang } from "../context/LangContext";
import { LANGS } from "../i18n";

const flags = { es: "🇲🇽", en: "🇺🇸", pt: "🇧🇷" };

export function LangSelector({ compact }) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: C.surface2, border: `1px solid ${C.border}`,
          color: C.text, borderRadius: 8, padding: "6px 10px",
          cursor: "pointer", fontSize: 13,
        }}
      >
        <span>{flags[lang]}</span>
        {!compact && <span>{lang.toUpperCase()}</span>}
        <ChevronDown size={12} color={C.muted} />
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: 38,
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 10, zIndex: 200, overflow: "hidden", minWidth: 140,
        }}>
          {Object.entries(LANGS).map(([code, name]) => (
            <button
              key={code}
              onClick={() => { setLang(code); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%",
                background: lang === code ? C.goldDim : "transparent",
                border: "none", color: lang === code ? C.gold : C.text,
                padding: "10px 14px", cursor: "pointer", fontSize: 13, textAlign: "left",
              }}
            >
              <span>{flags[code]}</span>
              <span>{name}</span>
              {lang === code && <Check size={12} style={{ marginLeft: "auto" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}