/* eslint-env node */
// auth.js — /api/auth/login + /api/auth/register
import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();
const sign = id => jwt.sign({ id }, process.env.JWT_SECRET || "dev-secret", { expiresIn: "7d" });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, country, referralCode } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: "Username, email and password are required" });

    if (await User.findOne({ $or: [{ email }, { username }] }))
      return res.status(400).json({ message: "Email or username already taken" });

    // Resolve referrer
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (referrer) referredBy = referrer._id;
    }

    const user = await User.create({ username, email, passwordHash: password, country, referredBy });
    res.status(201).json({ token: sign(user._id), user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    res.json({ token: sign(user._id), user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;