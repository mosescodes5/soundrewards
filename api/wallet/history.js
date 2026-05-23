import mongoose from 'mongoose';
import { connectDB, setCors, handleOptions, requireAuth } from '../_middleware.js';

const txSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String, amount: Number, currency: String,
  walletAddr: String, status: String, txHash: String, plisioId: String,
}, { timestamps: true });

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', txSchema);

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return res.status(405).end();
  const decoded = requireAuth(req, res);
  if (!decoded) return;
  await connectDB();
  const txns = await Transaction.find({ userId: decoded.id }).sort({ createdAt: -1 }).limit(50);
  res.json({ transactions: txns });
}