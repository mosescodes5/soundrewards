# setup.ps1 - Complete SoundRewards setup including Plisio endpoints
# Run with: powershell -ExecutionPolicy Bypass -File setup.ps1

function Write-OK   { param($m) Write-Host "  [OK] $m" -ForegroundColor Green }
function Write-Info { param($m) Write-Host "  [..] $m" -ForegroundColor Yellow }
function Write-Err  { param($m) Write-Host "  [!!] $m" -ForegroundColor Red; exit 1 }

function New-TextFile {
    param([string]$FilePath, [string]$Content)
    $dir = Split-Path $FilePath -Parent
    if ($dir -and $dir -ne "" -and !(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    $fullPath = Join-Path (Get-Location).Path $FilePath
    [System.IO.File]::WriteAllText($fullPath, $Content, (New-Object System.Text.UTF8Encoding $false))
}

Clear-Host
Write-Host ""
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host "    SoundRewards - Full Vercel Setup Script  " -ForegroundColor Cyan
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host ""

if (!(Test-Path "frontend")) { Write-Err "Run this script from inside your soundrewards/ folder." }

# ─────────────────────────────────────────────────────────────────────────────
Write-Info "Creating all api/ folders..."
foreach ($d in @("api/auth","api/music","api/wallet","api/referral","api/admin","api/payment","api/withdrawal")) {
    New-Item -ItemType Directory -Path $d -Force | Out-Null
}
Write-OK "api/ folders created"

# ─────────────────────────────────────────────────────────────────────────────
Write-Info "Writing api/_middleware.js..."
New-TextFile "api/_middleware.js" @"
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

let isConnected = false;

export async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI not set');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  isConnected = true;
}

export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

export function handleOptions(req, res) {
  if (req.method === 'OPTIONS') { setCors(res); res.status(200).end(); return true; }
  return false;
}

export function requireAuth(req, res) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) { res.status(401).json({ message: 'No autorizado' }); return null; }
  try { return jwt.verify(token, process.env.JWT_SECRET); }
  catch { res.status(401).json({ message: 'Token invalido' }); return null; }
}
"@
Write-OK "api/_middleware.js"

# ─────────────────────────────────────────────────────────────────────────────
Write-Info "Writing api/auth/register.js..."
New-TextFile "api/auth/register.js" @"
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connectDB, setCors, handleOptions } from '../_middleware.js';

const userSchema = new mongoose.Schema({
  username:       { type: String, required: true, unique: true, trim: true },
  email:          { type: String, required: true, unique: true, lowercase: true },
  password:       { type: String, required: true, select: false },
  country:        { type: String, enum: ['US','MX','HN'], required: true },
  referralCode:   { type: String, unique: true },
  referredBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  balance:        { type: Number, default: 0 },
  totalEarned:    { type: Number, default: 0 },
  activePlan:     { type: String, default: 'beginner' },
  role:           { type: String, enum: ['user','admin'], default: 'user' },
  dailyEarned:    { type: Number, default: 0 },
  lastDailyReset: { type: Date, default: Date.now },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();
  await connectDB();

  const { username, email, password, country, referralCode } = req.body;
  if (!username || !email || !password || !country)
    return res.status(400).json({ message: 'Todos los campos son requeridos' });

  const exists = await User.findOne({ `$or`: [{ email }, { username }] });
  if (exists) return res.status(400).json({ message: 'Usuario o correo ya en uso' });

  const hashed = await bcrypt.hash(password, 12);
  const myCode = username.toUpperCase() + '-' + Math.random().toString(36).slice(2,6).toUpperCase();

  let referredBy = null;
  if (referralCode) {
    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    if (referrer) referredBy = referrer._id;
  }

  const user = await User.create({ username, email, password: hashed, country, referralCode: myCode, referredBy });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

  res.status(201).json({
    token,
    user: { id: user._id, username, email, country, balance: 0, referralCode: myCode, activePlan: 'beginner' },
  });
}
"@
Write-OK "api/auth/register.js"

# ─────────────────────────────────────────────────────────────────────────────
Write-Info "Writing api/auth/login.js..."
New-TextFile "api/auth/login.js" @"
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
"@
Write-OK "api/auth/login.js"

# ─────────────────────────────────────────────────────────────────────────────
Write-Info "Writing api/music/complete.js..."
New-TextFile "api/music/complete.js" @"
import mongoose from 'mongoose';
import { connectDB, setCors, handleOptions, requireAuth } from '../_middleware.js';

const DAILY_LIMITS = { beginner: 1.5, silver: 5, gold: 12, elite: 35 };

const userSchema = new mongoose.Schema({
  username: String, email: String, country: String,
  balance:         { type: Number, default: 0 },
  totalEarned:     { type: Number, default: 0 },
  activePlan:      { type: String, default: 'beginner' },
  dailyEarned:     { type: Number, default: 0 },
  lastDailyReset:  { type: Date, default: Date.now },
  completedTracks: [{ type: String }],
}, { timestamps: true });

const earningSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  trackId:     String,
  amount:      Number,
  completedAt: { type: Date, default: Date.now },
});

const User    = mongoose.models.User    || mongoose.model('User', userSchema);
const Earning = mongoose.models.Earning || mongoose.model('Earning', earningSchema);

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();

  const decoded = requireAuth(req, res);
  if (!decoded) return;
  await connectDB();

  const { trackId, reward = 0.45 } = req.body;
  if (!trackId) return res.status(400).json({ message: 'trackId requerido' });

  const user = await User.findById(decoded.id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

  const now = new Date();
  if (now.toDateString() !== new Date(user.lastDailyReset).toDateString()) {
    user.dailyEarned = 0;
    user.lastDailyReset = now;
  }

  const limit = DAILY_LIMITS[user.activePlan] || 1.5;
  if (user.dailyEarned >= limit)
    return res.status(400).json({ message: 'Limite diario alcanzado', dailyEarned: user.dailyEarned, limit });

  const todayKey = trackId + ':' + now.toDateString();
  if (user.completedTracks && user.completedTracks.includes(todayKey))
    return res.status(400).json({ message: 'Ya completaste esta pista hoy' });

  const actualReward = Math.min(reward, limit - user.dailyEarned);
  user.balance     += actualReward;
  user.totalEarned += actualReward;
  user.dailyEarned += actualReward;
  user.completedTracks = [...(user.completedTracks || []), todayKey].slice(-200);
  await user.save();
  await Earning.create({ userId: user._id, trackId, amount: actualReward });

  res.json({ success: true, reward: actualReward, balance: user.balance, dailyEarned: user.dailyEarned, limit });
}
"@
Write-OK "api/music/complete.js"

# ─────────────────────────────────────────────────────────────────────────────
Write-Info "Writing api/wallet/withdraw.js..."
New-TextFile "api/wallet/withdraw.js" @"
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
  plisioId:   String,
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
"@
Write-OK "api/wallet/withdraw.js"

# ─────────────────────────────────────────────────────────────────────────────
Write-Info "Writing api/wallet/history.js..."
New-TextFile "api/wallet/history.js" @"
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
"@
Write-OK "api/wallet/history.js"

# ─────────────────────────────────────────────────────────────────────────────
Write-Info "Writing api/referral/stats.js..."
New-TextFile "api/referral/stats.js" @"
import mongoose from 'mongoose';
import { connectDB, setCors, handleOptions, requireAuth } from '../_middleware.js';

const COMMISSION = { beginner: 0.02, silver: 0.05, gold: 0.08, elite: 0.12 };

const userSchema = new mongoose.Schema({
  username: String, country: String, activePlan: String,
  totalEarned:  { type: Number, default: 0 },
  referralCode: String,
  referredBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return res.status(405).end();
  const decoded = requireAuth(req, res);
  if (!decoded) return;
  await connectDB();

  const user = await User.findById(decoded.id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

  const referrals = await User.find({ referredBy: decoded.id })
    .select('username country activePlan totalEarned createdAt')
    .sort({ createdAt: -1 });

  const rate = COMMISSION[user.activePlan] || 0.02;
  const totalEarned = referrals.reduce((s, r) => s + r.totalEarned * rate, 0);

  res.json({
    referralCode: user.referralCode,
    commissionRate: rate,
    totalReferrals: referrals.length,
    totalReferralEarnings: Math.round(totalEarned * 100) / 100,
    referrals: referrals.map(r => ({ username: r.username, country: r.country, plan: r.activePlan, joined: r.createdAt, active: true })),
  });
}
"@
Write-OK "api/referral/stats.js"

# ─────────────────────────────────────────────────────────────────────────────
Write-Info "Writing api/admin/stats.js..."
New-TextFile "api/admin/stats.js" @"
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
    Transaction.aggregate([{ `$match`: { type: 'withdrawal', status: 'approved' } }, { `$group`: { _id: null, total: { `$sum`: '`$amount`' } } }]),
    Transaction.aggregate([{ `$match`: { type: 'withdrawal', status: 'pending'  } }, { `$group`: { _id: null, total: { `$sum`: '`$amount`' } } }]),
    User.aggregate([{ `$match`: { activePlan: { `$ne`: 'beginner' } } }, { `$count`: 'total' }]),
  ]);

  res.json({ totalUsers, totalPaid: paid[0]?.total || 0, pendingWithdrawals: pending[0]?.total || 0, activePlans: plans[0]?.total || 0 });
}
"@
Write-OK "api/admin/stats.js"

# ─────────────────────────────────────────────────────────────────────────────
Write-Info "Writing api/admin/withdrawals.js..."
New-TextFile "api/admin/withdrawals.js" @"
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
  if (decoded.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });
  await connectDB();

  if (req.method === 'GET') {
    const list = await Transaction.find({ type: 'withdrawal', status: 'pending' }).populate('userId', 'username email country').sort({ createdAt: -1 });
    return res.json({ withdrawals: list });
  }
  if (req.method === 'PUT') {
    const { transactionId, action, txHash } = req.body;
    if (!transactionId || !action) return res.status(400).json({ message: 'Faltan campos' });
    const tx = await Transaction.findById(transactionId);
    if (!tx) return res.status(404).json({ message: 'Transaccion no encontrada' });
    if (action === 'approve') { tx.status = 'approved'; if (txHash) tx.txHash = txHash; }
    else if (action === 'reject') { tx.status = 'rejected'; await User.findByIdAndUpdate(tx.userId, { `$inc`: { balance: tx.amount } }); }
    else return res.status(400).json({ message: 'Accion invalida' });
    await tx.save();
    return res.json({ success: true, transaction: tx });
  }
  res.status(405).end();
}
"@
Write-OK "api/admin/withdrawals.js"

# ─────────────────────────────────────────────────────────────────────────────
Write-Info "Writing api/payment/create.js (Plisio)..."
New-TextFile "api/payment/create.js" @"
// Called when user clicks Upgrade on a plan
import mongoose from 'mongoose';
import { connectDB, setCors, handleOptions, requireAuth } from '../_middleware.js';

const PLANS = {
  silver: { name: 'Silver Plan', amount: 29 },
  gold:   { name: 'Gold Plan',   amount: 89 },
  elite:  { name: 'Elite Plan',  amount: 249 },
};

const userSchema = new mongoose.Schema({ username: String, email: String, activePlan: String }, { timestamps: true });
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();

  const decoded = requireAuth(req, res);
  if (!decoded) return;
  await connectDB();

  const { planId, currency = 'USDT' } = req.body;
  if (!PLANS[planId]) return res.status(400).json({ message: 'Plan invalido' });

  const user = await User.findById(decoded.id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

  const plan    = PLANS[planId];
  const orderId = 'SR-' + decoded.id + '-' + planId + '-' + Date.now();

  const params = new URLSearchParams({
    api_key:         process.env.PLISIO_SECRET_KEY,
    order_name:      plan.name,
    order_number:    orderId,
    currency:        currency,
    source_currency: 'USD',
    source_amount:   plan.amount,
    email:           user.email,
    callback_url:    process.env.FRONTEND_URL + '/api/payment/webhook',
    success_url:     process.env.FRONTEND_URL + '/dashboard?payment=success',
    cancel_url:      process.env.FRONTEND_URL + '/plans?payment=cancelled',
    plugin:          'soundrewards',
    version:         '1.0.0',
  });

  const plisioRes = await fetch('https://plisio.net/api/v1/invoices/new?' + params.toString());
  const data = await plisioRes.json();

  if (data.status !== 'success') {
    console.error('Plisio error:', data);
    return res.status(500).json({ message: 'Error al crear factura', detail: data.data?.message });
  }

  res.json({ invoiceUrl: data.data.invoice_url, invoiceId: data.data.txn_id, orderId });
}
"@
Write-OK "api/payment/create.js"

# ─────────────────────────────────────────────────────────────────────────────
Write-Info "Writing api/payment/webhook.js (Plisio)..."
New-TextFile "api/payment/webhook.js" @"
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
"@
Write-OK "api/payment/webhook.js"

# ─────────────────────────────────────────────────────────────────────────────
Write-Info "Writing api/withdrawal/send.js (Plisio)..."
New-TextFile "api/withdrawal/send.js" @"
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
"@
Write-OK "api/withdrawal/send.js"

# ─────────────────────────────────────────────────────────────────────────────
Write-Info "Writing vercel.json..."
New-TextFile "vercel.json" "{
  `"buildCommand`": `"cd frontend && npm install && npm run build`",
  `"outputDirectory`": `"frontend/dist`",
  `"rewrites`": [
    { `"source`": `"/api/(.*)`", `"destination`": `"/api/`$1`" },
    { `"source`": `"/(.*)`",     `"destination`": `"/index.html`" }
  ]
}
"
Write-OK "vercel.json"

# ─────────────────────────────────────────────────────────────────────────────
Write-Info "Writing root package.json..."
New-TextFile "package.json" "{
  `"name`": `"soundrewards`",
  `"version`": `"1.0.0`",
  `"type`": `"module`",
  `"dependencies`": {
    `"bcryptjs`": `"^2.4.3`",
    `"jsonwebtoken`": `"^9.0.2`",
    `"mongoose`": `"^8.4.0`"
  }
}
"
Write-OK "root package.json"

# ─────────────────────────────────────────────────────────────────────────────
Write-Info "Writing .env.example..."
New-TextFile ".env.example" "# Copy this file to .env for local dev.
# In Vercel: Project -> Settings -> Environment Variables
# NEVER commit .env to git.

MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/soundrewards
JWT_SECRET=replace_this_with_any_long_random_string_min_32_chars
FRONTEND_URL=https://your-project.vercel.app
PLISIO_SECRET_KEY=your_plisio_secret_key_here
"
Write-OK ".env.example"

# ─────────────────────────────────────────────────────────────────────────────
Write-Info "Updating frontend/.env..."
$frontendEnvPath = Join-Path (Get-Location).Path "frontend/.env"
if (Test-Path $frontendEnvPath) {
    $content = [System.IO.File]::ReadAllText($frontendEnvPath)
    if ($content -match "VITE_API_URL") {
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, "(?m)^VITE_API_URL=.*", "VITE_API_URL=/api")
    } else {
        $content = $content.TrimEnd() + "`nVITE_API_URL=/api`n"
    }
    [System.IO.File]::WriteAllText($frontendEnvPath, $content, (New-Object System.Text.UTF8Encoding $false))
} else {
    [System.IO.File]::WriteAllText($frontendEnvPath, "VITE_API_URL=/api`n", (New-Object System.Text.UTF8Encoding $false))
}
Write-OK "frontend/.env updated"

# ─────────────────────────────────────────────────────────────────────────────
Write-Info "Updating .gitignore..."
$giPath = Join-Path (Get-Location).Path ".gitignore"
if (!(Test-Path $giPath)) { "" | Out-File $giPath -Encoding utf8 }
$gi = [System.IO.File]::ReadAllText($giPath)
foreach ($line in @("node_modules/", ".env", ".env.local", "frontend/dist", "frontend/node_modules")) {
    if ($gi -notmatch [regex]::Escape($line)) { $gi = $gi.TrimEnd() + "`n$line" }
}
[System.IO.File]::WriteAllText($giPath, $gi, (New-Object System.Text.UTF8Encoding $false))
Write-OK ".gitignore updated"

# ─────────────────────────────────────────────────────────────────────────────
Write-Info "Removing node_modules from git tracking..."
try {
    git rm -r --cached node_modules 2>&1 | Out-Null
} catch {}
try {
    git rm -r --cached frontend/node_modules 2>&1 | Out-Null
} catch {}
Write-OK "node_modules removed from git"

# ─────────────────────────────────────────────────────────────────────────────
Write-Info "Committing to git..."
try {
    git add . 2>&1 | Out-Null
    git commit -m "full setup: api routes, plisio payments, vercel config" 2>&1 | Out-Null
    Write-OK "git commit done"
} catch {
    Write-Info "No git repo yet or nothing new to commit"
}

# ─────────────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  ============================================" -ForegroundColor Green
Write-Host "    All done! Ready to deploy to Vercel.    " -ForegroundColor Green
Write-Host "  ============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Run this next:" -ForegroundColor Cyan
Write-Host "    git push origin main" -ForegroundColor White
Write-Host ""
Write-Host "  Then in Vercel dashboard add these env vars:" -ForegroundColor Cyan
Write-Host "    MONGODB_URI       = your Atlas connection string" -ForegroundColor White
Write-Host "    JWT_SECRET        = any random 32+ char string" -ForegroundColor White
Write-Host "    FRONTEND_URL      = https://your-project.vercel.app" -ForegroundColor White
Write-Host "    PLISIO_SECRET_KEY = your key from plisio.net" -ForegroundColor White
Write-Host ""
Write-Host "  Plisio webhook URL (set in Plisio dashboard):" -ForegroundColor Cyan
Write-Host "    https://your-project.vercel.app/api/payment/webhook" -ForegroundColor White
Write-Host ""