// wallet.js
import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const router = Router();

// POST /api/wallet/withdraw
router.post("/withdraw", protect, async (req, res) => {
  try {
    const { amount, coin, walletAddress } = req.body;
    const user = req.user;

    if (!amount || !coin || !walletAddress)
      return res.status(400).json({ message: "amount, coin and walletAddress are required" });

    const amt = parseFloat(amount);
    if (amt < 10) return res.status(400).json({ message: "Minimum withdrawal is $10" });
    if (user.balance < amt) return res.status(400).json({ message: "Insufficient balance" });

    // Deduct balance and create pending withdrawal
    await User.findByIdAndUpdate(user._id, { $inc: { balance: -amt } });
    const tx = await Transaction.create({
      user: user._id, type: "withdraw", amount: amt,
      coin, wallet: walletAddress, status: "pending",
      desc: `Withdraw ${amt} via ${coin}`,
    });

    res.json({ message: "Withdrawal request submitted", transaction: tx });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/wallet/history
router.get("/history", protect, async (req, res) => {
  try {
    const txns = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ transactions: txns });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;