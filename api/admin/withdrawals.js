/* global process */
import mongoose from 'mongoose';
import { connectDB, setCors, handleOptions, requireAuth } from '../_middleware.js';

const txSchema   = new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, type: String, amount: Number, currency: String, walletAddr: String, status: { type: String, default: 'pending' }, txHash: String, plisioId: String }, { timestamps: true });
const userSchema = new mongoose.Schema({ username: String, email: String, country: String, balance: { type: Number, default: 0 } });
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', txSchema);
const User        = mongoose.models.User        || mongoose.model('User', userSchema);

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;
  const decoded = requireAuth(req, res);
  if (!decoded) return;
  if (decoded.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
  try {
    await connectDB();
    if (req.method === 'GET') {
      const list = await Transaction.find({ type: 'withdrawal', status: 'pending' }).populate('userId', 'username email country').sort({ createdAt: -1 });
      return res.json({ withdrawals: list });
    }
    if (req.method === 'PUT') {
      const { transactionId, action, txHash } = req.body || {};
      if (!transactionId || !action) return res.status(400).json({ message: 'transactionId and action required' });
      const tx = await Transaction.findById(transactionId);
      if (!tx) return res.status(404).json({ message: 'Transaction not found' });
      if (action === 'approve') { tx.status = 'approved'; if (txHash) tx.txHash = txHash; }
      else if (action === 'reject') { tx.status = 'rejected'; await User.findByIdAndUpdate(tx.userId, { $inc: { balance: tx.amount } }); }
      else return res.status(400).json({ message: 'Invalid action' });
      await tx.save();
      return res.json({ success: true, transaction: tx });
    }
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}