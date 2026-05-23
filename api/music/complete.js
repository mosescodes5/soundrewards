import mongoose from 'mongoose';
import { connectDB, setCors, handleOptions, requireAuth } from '../_middleware.js';

const DAILY_LIMITS = { beginner: 1.5, silver: 5, gold: 12, elite: 35 };

const userSchema = new mongoose.Schema({
  username: String, email: String, country: String,
  balance:         { type: Number, default: 0 },
  totalEarned:     { type: Number, default: 0 },
  activePlan:      { type: String, default: 'beginner' },
  dailyEarned:     { type: Number, default: 0 },
  lastDailyReset:  { type: Date, default: Date.now },
  completedTracks: [{ type: String }],
}, { timestamps: true });

const earningSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  trackId:     String,
  amount:      Number,
  completedAt: { type: Date, default: Date.now },
});

const User    = mongoose.models.User    || mongoose.model('User', userSchema);
const Earning = mongoose.models.Earning || mongoose.model('Earning', earningSchema);

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();

  const decoded = requireAuth(req, res);
  if (!decoded) return;
  await connectDB();

  const { trackId, reward = 0.45 } = req.body;
  if (!trackId) return res.status(400).json({ message: 'trackId requerido' });

  const user = await User.findById(decoded.id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

  const now = new Date();
  if (now.toDateString() !== new Date(user.lastDailyReset).toDateString()) {
    user.dailyEarned = 0;
    user.lastDailyReset = now;
  }

  const limit = DAILY_LIMITS[user.activePlan] || 1.5;
  if (user.dailyEarned >= limit)
    return res.status(400).json({ message: 'Limite diario alcanzado', dailyEarned: user.dailyEarned, limit });

  const todayKey = trackId + ':' + now.toDateString();
  if (user.completedTracks && user.completedTracks.includes(todayKey))
    return res.status(400).json({ message: 'Ya completaste esta pista hoy' });

  const actualReward = Math.min(reward, limit - user.dailyEarned);
  user.balance     += actualReward;
  user.totalEarned += actualReward;
  user.dailyEarned += actualReward;
  user.completedTracks = [...(user.completedTracks || []), todayKey].slice(-200);
  await user.save();
  await Earning.create({ userId: user._id, trackId, amount: actualReward });

  res.json({ success: true, reward: actualReward, balance: user.balance, dailyEarned: user.dailyEarned, limit });
}