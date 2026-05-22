// SharedComponents.jsx — Badge, StatCard, CustomTooltip
import { C, card } from "../theme";

/* ── Badge ─────────────────────────────────────────────────────────────────── */
export function Badge({ children, color = C.gold, bg = C.goldDim, small = false }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: small ? "2px 8px" : "4px 12px",
        borderRadius: 999,
        fontSize: small ? 10 : 12,
        fontWeight: 700,
        color,
        background: bg,
        border: `1px solid ${color}33`,
        whiteSpace: "nowrap",
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </span>
  );
}

/* ── StatCard ───────────────────────────────────────────────────────────────── */
export function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  trend,
  accent = C.goldDim,
}) {
  return (
    <div
      style={{
        ...card(),
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{label}</span>
        {Icon && (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={15} color={C.gold} />
          </div>
        )}
      </div>

      <div style={{ fontSize: 26, fontWeight: 800, color: C.text, lineHeight: 1 }}>
        {value}
      </div>

      {(sub || trend) && (
        <div style={{ fontSize: 11, color: C.muted }}>
          {sub && <span>{sub}</span>}
          {trend && (
            <span style={{ color: C.success, marginLeft: sub ? 6 : 0 }}>▲ {trend}</span>
          )}
        </div>
      )}
    </div>
  );
}

/* ── CustomTooltip (Recharts) ───────────────────────────────────────────────── */
export function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border2}`,
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 13,
      }}
    >
      {label && (
        <p style={{ color: C.muted, marginBottom: 4, fontSize: 11 }}>{label}</p>
      )}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || C.gold, fontWeight: 700, margin: 0 }}>
          {p.name ? `${p.name}: ` : ""}
          {typeof p.value === "number" && p.name?.toLowerCase().includes("earn")
            ? `$${p.value.toFixed(2)}`
            : p.value}
        </p>
      ))}
    </div>
  );
}
