// theme.js — C (colors) and card() helper
export const C = {
  bg: "#06090F", surface: "#0C1220", surface2: "#111827",
  border: "rgba(255,255,255,0.06)", border2: "rgba(255,255,255,0.12)",
  gold: "#F4A228", goldDim: "rgba(244,162,40,0.15)",
  teal: "#00CFA8", tealDim: "rgba(0,207,168,0.12)",
  purple: "#8B7CF8", purpleDim: "rgba(139,124,248,0.12)",
  text: "#F0F4FF", muted: "#6B7A96", dim: "#3A4560",
  success: "#22C55E", danger: "#EF4444",
  successDim: "rgba(34,197,94,0.12)", dangerDim: "rgba(239,68,68,0.12)",
};

export const card = (e = {}) => ({
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  ...e,
});