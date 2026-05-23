import mongoose from 'mongoose';
import { connectDB, setCors, handleOptions, requireAuth } from '../_middleware.js';

const userSchema = new mongoose.Schema({
  username: String, email: String,
  balance:    { type: Number, default: 0 },
  activePlan: { type: String, default: 'beginner' },
}, { timestamps: true });

const txSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type:       { type: String, enum: ['deposit','withdrawal'] },
  amount:     Number,
  currency:   String,
  walletAddr: String,
  status:     { type: String, default: 'pending' },
  txHash:     String,
}, { timestamps: true });

const User        = mongoose.models.User        || mongoose.model('User', userSchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', txSchema);

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();

  const decoded = requireAuth(req, res);
  if (!decoded) return;
  await connectDB();

  const { amount, currency, walletAddr } = req.body;
  if (!amount || !currency || !walletAddr)
    return res.status(400).json({ message: 'Faltan campos requeridos' });
  if (amount < 10)
    return res.status(400).json({ message: 'El minimo de retiro es 10 USD' });

  const user = await User.findById(decoded.id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  if (user.balance < amount) return res.status(400).json({ message: 'Saldo insuficiente' });

  user.balance -= amount;
  await user.save();
  const tx = await Transaction.create({ userId: user._id, type: 'withdrawal', amount, currency, walletAddr });
  res.status(201).json({ message: 'Solicitud enviada. Se procesara en 24-48h.', transactionId: tx._id, newBalance: user.balance });
}