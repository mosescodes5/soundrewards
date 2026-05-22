// User.js — DB schema (MongoDB/Postgres)
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  country:      { type: String, default: "MX" },
  plan:         { type: String, enum: ["beginner","silver","gold","elite"], default: "beginner" },
  balance:      { type: Number, default: 0 },
  totalEarned:  { type: Number, default: 0 },
  referralCode: { type: String, unique: true },
  referredBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  isAdmin:      { type: Boolean, default: false },
  isFlagged:    { type: Boolean, default: false },
}, { timestamps: true });

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Auto-generate referral code
userSchema.pre("validate", function (next) {
  if (!this.referralCode) {
    this.referralCode = (this.username || "USER").toUpperCase().slice(0, 6) + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  }
  next();
});

userSchema.methods.toSafeObject = function () {
  return {
    id:           this._id,
    username:     this.username,
    email:        this.email,
    country:      this.country,
    plan:         this.plan,
    balance:      this.balance,
    totalEarned:  this.totalEarned,
    referralCode: this.referralCode,
    isAdmin:      this.isAdmin,
  };
};

export default mongoose.model("User", userSchema);