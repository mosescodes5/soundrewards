import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import Transaction from "../models/Transaction.js";

const router = Router();

// GET /api/users/me
router.get("/me", protect, (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

// GET /api/users/transactions
router.get("/transactions", protect, async (req, res) => {
  try {
    const txns = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ transactions: txns });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;