/* global process */
import mongoose from 'mongoose';
import { connectDB, setCors, handleOptions, requireAuth } from '../_middleware.js';

const PLANS = { silver: { name: 'Silver Plan', amount: 29 }, gold: { name: 'Gold Plan', amount: 89 }, elite: { name: 'Elite Plan', amount: 249 } };
const userSchema = new mongoose.Schema({ username: String, email: String, activePlan: String }, { timestamps: true });
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const decoded = requireAuth(req, res);
  if (!decoded) return;
  try {
    await connectDB();
    const { planId, currency = 'USDT' } = req.body || {};
    if (!PLANS[planId]) return res.status(400).json({ message: 'Invalid plan' });
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const plan    = PLANS[planId];
    const orderId = 'SR-' + decoded.id + '-' + planId + '-' + Date.now();
    const params  = new URLSearchParams({
      api_key: process.env.PLISIO_SECRET_KEY, order_name: plan.name, order_number: orderId,
      currency: currency, source_currency: 'USD', source_amount: plan.amount, email: user.email,
      callback_url: process.env.FRONTEND_URL + '/api/payment/webhook',
      success_url:  process.env.FRONTEND_URL + '/dashboard?payment=success',
      cancel_url:   process.env.FRONTEND_URL + '/plans?payment=cancelled',
    });
    const plisioRes = await fetch('https://plisio.net/api/v1/invoices/new?' + params.toString());
    const data = await plisioRes.json();
    if (data.status !== 'success') return res.status(500).json({ message: 'Plisio error', detail: data.data?.message });
    return res.json({ invoiceUrl: data.data.invoice_url, invoiceId: data.data.txn_id, orderId });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}