import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connectDB, setCors, handleOptions } from '../_middleware.js';

const userSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String, required: true, select: false },
  country:      { type: String, enum: ['US','MX','HN'], required: true },
  referralCode: { type: String, unique: true },
  referredBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  balance:      { type: Number, default: 0 },
  totalEarned:  { type: Number, default: 0 },
  activePlan:   { type: String, default: 'beginner' },
  role:         { type: String, enum: ['user','admin'], default: 'user' },
  dailyEarned:  { type: Number, default: 0 },
  lastDailyReset: { type: Date, default: Date.now },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();
  await connectDB();

  const { username, email, password, country, referralCode } = req.body;
  if (!username || !email || !password || !country)
    return res.status(400).json({ message: 'Todos los campos son requeridos' });

  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) return res.status(400).json({ message: 'Usuario o correo ya en uso' });

  const hashed = await bcrypt.hash(password, 12);
  const myCode = username.toUpperCase() + '-' + Math.random().toString(36).slice(2,6).toUpperCase();

  let referredBy = null;
  if (referralCode) {
    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    if (referrer) referredBy = referrer._id;
  }

  const user = await User.create({ username, email, password: hashed, country, referralCode: myCode, referredBy });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

  res.status(201).json({
    token,
    user: { id: user._id, username, email, country, balance: 0, referralCode: myCode, activePlan: 'beginner' },
  });
}