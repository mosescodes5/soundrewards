import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connectDB, setCors, handleOptions } from '../_middleware.js';

const userSchema = new mongoose.Schema({
  username:    String,
  email:       { type: String, lowercase: true },
  password:    { type: String, select: false },
  country:     String,
  referralCode: String,
  balance:     { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  activePlan:  { type: String, default: 'beginner' },
  role:        { type: String, default: 'user' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();
  await connectDB();

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Faltan campos' });

  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(401).json({ message: 'Credenciales incorrectas' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Credenciales incorrectas' });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({
    token,
    user: { id: user._id, username: user.username, email: user.email, country: user.country, balance: user.balance, referralCode: user.referralCode, activePlan: user.activePlan },
  });
}