// mockData.js — tracks, plans, adminUsers, etc.
export const earningsData = [
  { day: "L", earned: 2.4 }, { day: "M", earned: 3.1 },
  { day: "X", earned: 2.8 }, { day: "J", earned: 4.2 },
  { day: "V", earned: 3.9 }, { day: "S", earned: 5.1 },
  { day: "D", earned: 4.6 },
];

export const tracks = [
  { id: 1, title: "Midnight Frequencies", artist: "Luna Echo", duration: 214, reward: 0.45, genre: "Electronic", thumb: "🌙" },
  { id: 2, title: "Solar Wind", artist: "Drift Collective", duration: 187, reward: 0.38, genre: "Ambient", thumb: "☀️" },
  { id: 3, title: "Neon Pulse", artist: "CipherBeat", duration: 201, reward: 0.52, genre: "Synthwave", thumb: "💜" },
  { id: 4, title: "Ocean Protocol", artist: "Deep Current", duration: 243, reward: 0.41, genre: "Chill", thumb: "🌊" },
  { id: 5, title: "Binary Rain", artist: "0xSoundwave", duration: 196, reward: 0.48, genre: "Tech House", thumb: "🔵" },
  { id: 6, title: "Stellar Drift", artist: "Aurora Keys", duration: 228, reward: 0.55, genre: "Space Pop", thumb: "✨" },
];

export const plans = [
  { id: "beginner", name: "Beginner", price: 0, priceUSD: "Gratis", color: "#6B7A96", accent: "#3A456033", daily: "$1.50", rate: "0.30%", tracks: 5, referral: "2%" },
  { id: "silver", name: "Silver", price: 29, priceUSD: "$29 USDT", color: "#94A3B8", accent: "rgba(148,163,184,0.15)", daily: "$5.00", rate: "0.50%", tracks: 15, referral: "5%" },
  { id: "gold", name: "Gold", price: 89, priceUSD: "$89 USDT", color: "#F4A228", accent: "rgba(244,162,40,0.15)", popular: true, daily: "$12.00", rate: "0.75%", tracks: 40, referral: "8%" },
  { id: "elite", name: "Elite", price: 249, priceUSD: "$249 USDT", color: "#8B7CF8", accent: "rgba(139,124,248,0.12)", daily: "$35.00", rate: "1.00%", tracks: 999, referral: "12%" },
];

export const adminUsers = [
  { id: 1, user: "carlos_mx", email: "carlos@mail.com", country: "MX", plan: "Gold", balance: "$142.50", status: "active" },
  { id: 2, user: "sara_hn", email: "sara@mail.com", country: "HN", plan: "Silver", balance: "$38.20", status: "active" },
  { id: 3, user: "mike_us", email: "mike@mail.com", country: "US", plan: "Elite", balance: "$890.00", status: "active" },
  { id: 4, user: "juan_mx", email: "juan@mail.com", country: "MX", plan: "Beginner", balance: "$4.80", status: "flagged" },
  { id: 5, user: "linda_us", email: "linda@mail.com", country: "US", plan: "Gold", balance: "$215.30", status: "active" },
];

export const withdrawals = [
  { id: 1, user: "mike_us", amount: "$250.00", crypto: "USDT TRC20", wallet: "TXx9k...3mQP", date: "Hoy 09:12", status: "pending" },
  { id: 2, user: "linda_us", amount: "$180.00", crypto: "BTC", wallet: "bc1q...7kj2", date: "Hoy 08:45", status: "pending" },
  { id: 3, user: "carlos_mx", amount: "$90.00", crypto: "ETH", wallet: "0x4a...f9c1", date: "Ayer", status: "approved" },
];

export const coins = [
  { id: "USDT", name: "Tether (TRC20)", icon: "₮", min: "$10", color: "#26A17B" },
  { id: "BTC", name: "Bitcoin", icon: "₿", min: "$20", color: "#F4A228" },
  { id: "ETH", name: "Ethereum", icon: "Ξ", min: "$15", color: "#627EEA" },
  { id: "LTC", name: "Litecoin", icon: "Ł", min: "$10", color: "#BFBBBB" },
  { id: "DOGE", name: "Dogecoin", icon: "Ð", min: "$5", color: "#C2A633" },
];