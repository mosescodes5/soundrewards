// admin.js — Admin-only routes
import { Router } from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const router = Router();
router.use(protect, adminOnly);

// GET /api/admin/stats
router.get("/stats", async (_req, res) => {
  try {
    const [totalUsers, totalPaid, pendingCount, pendingTotal] = await Promise.all([
      User.countDocuments(),
      Transaction.aggregate([
        { $match: { type: "withdraw", status: "approved" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.countDocuments({ type: "withdraw", status: "pending" }),
      Transaction.aggregate([
        { $match: { type: "withdraw", status: "pending" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);
    res.json({
      totalUsers,
      totalPaid: totalPaid[0]?.total ?? 0,
      pendingCount,
      pendingTotal: pendingTotal[0]?.total ?? 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const filter = search
      ? { $or: [{ username: new RegExp(search, "i") }, { email: new RegExp(search, "i") }] }
      : {};
    const users = await User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments(filter);
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/users/:id/flag
router.patch("/users/:id/flag", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      [{ $set: { isFlagged: { $not: "$isFlagged" } } }],
      { new: true }
    ).select("-passwordHash");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/withdrawals
router.get("/withdrawals", async (_req, res) => {
  try {
    const txns = await Transaction.find({ type: "withdraw" })
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ transactions: txns });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/withdrawals/:id
router.patch("/withdrawals/:id", async (req, res) => {
  try {
    const { status } = req.body; // "approved" | "rejected"
    if (!["approved", "rejected"].includes(status))
      return res.status(400).json({ message: "status must be approved or rejected" });

    const tx = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    // If rejected, refund balance
    if (status === "rejected") {
      await User.findByIdAndUpdate(tx.user, { $inc: { balance: tx.amount } });
    }
    res.json(tx);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
