// Admin clicks Approve -> this sends crypto to user via Plisio
import mongoose from 'mongoose';
import { connectDB, setCors, handleOptions, requireAuth } from '../_middleware.js';

const txSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String, amount: Number, currency: String,
  walletAddr: String, status: { type: String, default: 'pending' },
  txHash: String, plisioId: String,
}, { timestamps: true });

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', txSchema);

const CURRENCY_MAP = { USDT: 'USDT_TRX', BTC: 'BTC', ETH: 'ETH', LTC: 'LTC', DOGE: 'DOGE' };

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();

  const decoded = requireAuth(req, res);
  if (!decoded) return;
  if (decoded.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
  await connectDB();

  const { transactionId } = req.body;
  if (!transactionId) return res.status(400).json({ message: 'transactionId requerido' });

  const tx = await Transaction.findById(transactionId);
  if (!tx) return res.status(404).json({ message: 'Transaccion no encontrada' });
  if (tx.status !== 'pending') return res.status(400).json({ message: 'Esta transaccion ya fue procesada' });

  const psys_cid = CURRENCY_MAP[tx.currency] || tx.currency;

  const params = new URLSearchParams({
    api_key:  process.env.PLISIO_SECRET_KEY,
    psys_cid: psys_cid,
    to:       tx.walletAddr,
    amount:   tx.amount,
    type:     'cash_out',
    feePlan:  'normal',
  });

  const plisioRes = await fetch('https://plisio.net/api/v1/operations/withdraw?' + params.toString());
  const data = await plisioRes.json();

  if (data.status !== 'success') {
    console.error('Plisio withdrawal error:', data);
    return res.status(500).json({ message: 'Error al enviar retiro', detail: data.data?.message });
  }

  tx.status   = 'approved';
  tx.plisioId = data.data.txn_id;
  tx.txHash   = data.data.txn_id;
  await tx.save();

  res.json({ message: 'Retiro enviado exitosamente', plisioId: data.data.txn_id, newStatus: 'approved' });
}