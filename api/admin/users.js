/* global process */
import mongoose from 'mongoose';
import { connectDB, setCors, handleOptions, requireAuth } from '../_middleware.js';

const userSchema = new mongoose.Schema({
  username:    String,
  email:       { type: String, lowercase: true },
  country:     String,
  activePlan:  { type: String, default: 'beginner' },
  balance:     { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  dailyEarned: { type: Number, default: 0 },
  role:        { type: String, default: 'user' },
  isFlagged:   { type: Boolean, default: false },
  referralCode: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;

  const decoded = requireAuth(req, res);
  if (!decoded) return;
  if (decoded.role !== 'admin') return res.status(403).json({ message: 'Admins only' });

  try {
    await connectDB();

    if (req.method === 'GET') {
      const users = await User.find({})
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(200);
      return res.json({ users });
    }

    if (req.method === 'PUT') {
      const { userId, action } = req.body || {};
      if (!userId || !action) return res.status(400).json({ message: 'userId and action required' });

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (action === 'flag')   user.isFlagged = true;
      if (action === 'unflag') user.isFlagged = false;
      if (action === 'makeAdmin') user.role = 'admin';

      await user.save();
      return res.json({ success: true, user });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    console.error('ADMIN USERS ERROR:', err.message);
    return res.status(500).json({ message: err.message });
  }
}
