// Plisio calls this automatically when payment status changes
import crypto from 'crypto';
import mongoose from 'mongoose';
import { connectDB, setCors } from '../_middleware.js';

const userSchema = new mongoose.Schema({
  username: String, email: String,
  activePlan: { type: String, default: 'beginner' },
  balance:    { type: Number, default: 0 },
}, { timestamps: true });

const txSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String, amount: Number, currency: String,
  status: { type: String, default: 'pending' },
  plisioId: String, orderId: String,
}, { timestamps: true });

const User        = mongoose.models.User        || mongoose.model('User', userSchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', txSchema);

function verifySignature(body, receivedSign) {
  const params = { ...body };
  delete params.verify_hash;
  const sorted = Object.keys(params).sort().reduce((acc, k) => { acc[k] = params[k]; return acc; }, {});
  const hash = crypto.createHmac('sha1', process.env.PLISIO_SECRET_KEY)
    .update(new URLSearchParams(sorted).toString()).digest('hex');
  return hash === receivedSign;
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method !== 'POST') return res.status(405).end();
  await connectDB();

  const body = req.body;
  if (!verifySignature(body, body.verify_hash)) {
    console.error('Invalid Plisio signature');
    return res.status(400).json({ message: 'Invalid signature' });
  }

  const { status, order_number, txn_id, source_amount, currency } = body;

  // order_number = SR-{userId}-{planId}-{timestamp}
  const parts  = order_number.split('-');
  const userId = parts[1];
  const planId = parts[2];

  if (status === 'completed' || status === 'mismatch') {
    const user = await User.findById(userId);
    if (user) {
      user.activePlan = planId;
      await user.save();
      await Transaction.create({
        userId: user._id, type: 'deposit',
        amount: parseFloat(source_amount), currency,
        status: 'confirmed', plisioId: txn_id, orderId: order_number,
      });
      console.log('Plan upgraded: user ' + userId + ' -> ' + planId);
    }
  }

  res.status(200).json({ status: 1 });
}