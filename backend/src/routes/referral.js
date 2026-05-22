// referral.js — Referral info & commission
import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const router = Router();
router.use(protect);

// GET /api/referral — get my referral stats
router.get("/", async (req, res) => {
  try {
    const refs = await User.find({ referredBy: req.user._id })
      .select("username plan totalEarned createdAt")
      .sort({ createdAt: -1 });

    const COMMISSION = { silver: 0.05, gold: 0.08, elite: 0.12 };
    const rate = COMMISSION[req.user.plan] ?? 0;
    const totalCommission = refs.reduce((s, r) => s + r.totalEarned * rate, 0);

    res.json({
      referralCode: req.user.referralCode,
      referrals: refs,
      totalReferrals: refs.length,
      commissionRate: rate,
      totalCommissionEarned: +totalCommission.toFixed(4),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
