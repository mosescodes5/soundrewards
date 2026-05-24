/* global process */
import mongoose from 'mongoose';
import { connectDB, setCors, handleOptions, requireAuth } from '../_middleware.js';

const userSchema = new mongoose.Schema({
  username: String, email: String,
  balance: { type: Number, default: 0 },
  activePlan: { type: String, default: 'beginner' }
}, { timestamps: true });

const txSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String, amount: Number, currency: String,
  walletAddr: String, status: { type: String, default: 'pending' },
  description: String, txHash: String, plisioId: String
}, { timestamps: true });

const User        = mongoose.models.User        || mongoose.model('User', userSchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', txSchema);

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const decoded = requireAuth(req, res);
  if (!decoded) return;
  try {
    await connectDB();
    // Accept both 'walletAddress' and 'walletAddr' for compatibility
    const { amount, coin, currency, walletAddress, walletAddr } = req.body || {};
    const addr    = walletAddress || walletAddr;
    const coinVal = coin || currency || 'USDT';
    if (!amount || !addr) return res.status(400).json({ message: 'amount and wallet address are required' });
    if (parseFloat(amount) < 10) return res.status(400).json({ message: 'Minimum withdrawal is $10.00' });
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.balance < parseFloat(amount)) return res.status(400).json({ message: 'Insufficient balance' });
    user.balance -= parseFloat(amount);
    await user.save();
    const tx = await Transaction.create({
      userId: user._id, type: 'withdraw',
      amount: parseFloat(amount), currency: coinVal,
      walletAddr: addr, status: 'pending',
      description: `Withdrawal via ${coinVal}`,
    });
    return res.status(201).json({ message: 'Withdrawal request submitted', transactionId: tx._id, newBalance: user.balance });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
