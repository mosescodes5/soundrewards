import mongoose from 'mongoose';
import { connectDB, setCors, handleOptions, requireAuth } from '../_middleware.js';

const User        = mongoose.models.User        || mongoose.model('User',        new mongoose.Schema({ activePlan: String }, { timestamps: true }));
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', new mongoose.Schema({ type: String, amount: Number, status: String }, { timestamps: true }));

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return res.status(405).end();
  const decoded = requireAuth(req, res);
  if (!decoded) return;
  if (decoded.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });
  await connectDB();

  const [totalUsers, paid, pending, plans] = await Promise.all([
    User.countDocuments(),
    Transaction.aggregate([{ $match: { type: 'withdrawal', status: 'approved' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Transaction.aggregate([{ $match: { type: 'withdrawal', status: 'pending'  } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    User.aggregate([{ $match: { activePlan: { $ne: 'beginner' } } }, { $count: 'total' }]),
  ]);

  res.json({ totalUsers, totalPaid: paid[0]?.total || 0, pendingWithdrawals: pending[0]?.total || 0, activePlans: plans[0]?.total || 0 });
}