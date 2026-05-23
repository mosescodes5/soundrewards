import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Inline everything - no imports from _middleware to rule out import errors
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
}

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

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    // Step 1 - check env vars
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({ message: 'Server error: MONGODB_URI not set' });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server error: JWT_SECRET not set' });
    }

    // Step 2 - connect DB
    await connectDB();

    // Step 3 - validate body
    const { username, email, password, country, referralCode } = req.body || {};
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email and password are required' });
    }

    // Step 4 - check existing user
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(400).json({ message: 'Username or email already taken' });
    }

    // Step 5 - create user
    const hashed  = await bcrypt.hash(password, 12);
    const myCode  = username.toUpperCase() + '-' + Math.random().toString(36).slice(2,6).toUpperCase();

    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (referrer) referredBy = referrer._id;
    }

    const user  = await User.create({ username, email, password: hashed, country: country || 'US', referralCode: myCode, referredBy });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

    return res.status(201).json({
      token,
      user: { id: user._id, username, email, country: user.country, balance: 0, referralCode: myCode, activePlan: 'beginner' },
    });

  } catch (err) {
    // Return the ACTUAL error so we can see it in the browser
    console.error('REGISTER ERROR:', err);
    return res.status(500).json({
      message: err.message,
      type: err.name,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    });
  }
}