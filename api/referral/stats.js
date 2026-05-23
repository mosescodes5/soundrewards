/* global process */
import mongoose from 'mongoose';
import { connectDB, setCors, handleOptions, requireAuth } from '../_middleware.js';

const COMMISSION = { beginner: 0.02, silver: 0.05, gold: 0.08, elite: 0.12 };
const userSchema = new mongoose.Schema({ username: String, country: String, activePlan: String, totalEarned: { type: Number, default: 0 }, referralCode: String, referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }, { timestamps: true });
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
  const decoded = requireAuth(req, res);
  if (!decoded) return;
  try {
    await connectDB();
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const referrals = await User.find({ referredBy: decoded.id }).select('username country activePlan totalEarned createdAt').sort({ createdAt: -1 });
    const rate = COMMISSION[user.activePlan] || 0.02;
    const totalEarned = referrals.reduce((s, r) => s + r.totalEarned * rate, 0);
    return res.json({ referralCode: user.referralCode, commissionRate: rate, totalReferrals: referrals.length, totalReferralEarnings: Math.round(totalEarned * 100) / 100, referrals: referrals.map(r => ({ username: r.username, country: r.country, plan: r.activePlan, joined: r.createdAt, active: true })) });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}