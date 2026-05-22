// music.js — Track streaming & earnings
import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const router = Router();

// GET /api/music/tracks — public list of tracks
router.get("/tracks", (_req, res) => {
  res.json({
    tracks: [
      { id: "1", title: "Midnight Frequencies", artist: "DJ Lunar",   duration: 210, rewardPer30s: 0.005, genre: "Electronic" },
      { id: "2", title: "Golden Wave",           artist: "SolBeats",  duration: 185, rewardPer30s: 0.004, genre: "Lo-Fi" },
      { id: "3", title: "Urban Pulse",            artist: "CitySound", duration: 230, rewardPer30s: 0.006, genre: "Hip-Hop" },
      { id: "4", title: "Sunset Drive",           artist: "RetroWave", duration: 196, rewardPer30s: 0.005, genre: "Synthwave" },
      { id: "5", title: "Deep Ocean",             artist: "AquaTone",  duration: 240, rewardPer30s: 0.004, genre: "Ambient" },
    ],
  });
});

// POST /api/music/earn — called every 30s of listening
router.post("/earn", protect, async (req, res) => {
  try {
    const { trackId, trackTitle } = req.body;
    const PLAN_MULTIPLIER = { beginner: 1, silver: 1.5, gold: 2, elite: 3 };
    const BASE_REWARD = 0.005;

    const user = req.user;
    const reward = +(BASE_REWARD * (PLAN_MULTIPLIER[user.plan] ?? 1)).toFixed(4);

    await User.findByIdAndUpdate(user._id, {
      $inc: { balance: reward, totalEarned: reward },
    });

    await Transaction.create({
      user: user._id,
      type: "earn",
      amount: reward,
      desc: `Listened: ${trackTitle || trackId}`,
      status: "approved",
    });

    res.json({ earned: reward, message: "Reward added" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
