/* eslint-env node */
// server.js — Express entry point
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes     from "./routes/auth.js";
import userRoutes     from "./routes/users.js";
import walletRoutes   from "./routes/wallet.js";
import musicRoutes    from "./routes/music.js";
import adminRoutes    from "./routes/admin.js";
import referralRoutes from "./routes/referral.js";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/users",    userRoutes);
app.use("/api/wallet",   walletRoutes);
app.use("/api/music",    musicRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/referral", referralRoutes);

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", ts: Date.now() }));

// ── START ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`✅  Backend running on http://localhost:${PORT}`));