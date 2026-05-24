/* global process */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connectDB, setCors, handleOptions } from '../_middleware.js';

const REGISTRATION_BONUS = 1.00; // $1.00 welcome bonus

const userSchema = new mongoose.Schema({
  username:       { type: String, required: true, unique: true, trim: true },
  email:          { type: String, required: true, unique: true, lowercase: true },
  password:       { type: String, required: true, select: false },
  country:        { type: String, default: 'US' },
  referralCode:   { type: String, unique: true },
  referredBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  balance:        { type: Number, default: 0 },
  totalEarned:    { type: Number, default: 0 },
  activePlan:     { type: String, default: 'beginner' },
  role:           { type: String, default: 'user' },
  dailyEarned:    { type: Number, default: 0 },
  lastDailyReset: { type: Date, default: Date.now },
}, { timestamps: true });

const txSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String, amount: Number, currency: String,
  status: { type: String, default: 'confirmed' }, description: String,
}, { timestamps: true });

const User        = mongoose.models.User        || mongoose.model('User', userSchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', txSchema);

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  try {
    await connectDB();
    const { username, email, password, country, referralCode } = req.body || {};
    if (!username || !email || !password)
      return res.status(400).json({ message: 'Username, email and password are required' });

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ message: 'Username or email already taken' });

    const hashed = await bcrypt.hash(password, 12);
    const myCode = username.toUpperCase().slice(0, 6) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();

    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (referrer) referredBy = referrer._id;
    }

    // Create user with registration bonus
    const user = await User.create({
      username, email, password: hashed,
      country: country || 'US',
      referralCode: myCode, referredBy,
      balance: REGISTRATION_BONUS,
      totalEarned: REGISTRATION_BONUS,
      activePlan: 'beginner',
    });

    // Record welcome bonus transaction
    await Transaction.create({
      userId: user._id, type: 'bonus',
      amount: REGISTRATION_BONUS, currency: 'USD',
      status: 'confirmed', description: 'Welcome registration bonus',
    });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

    return res.status(201).json({
      token,
      user: {
        id: user._id, username, email,
        country: user.country,
        balance: REGISTRATION_BONUS,
        totalEarned: REGISTRATION_BONUS,
        referralCode: myCode,
        activePlan: 'beginner',
      },
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err.message);
    return res.status(500).json({ message: err.message });
  }
}
