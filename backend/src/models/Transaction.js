// Transaction.js — DB schema for all money movements
import mongoose from "mongoose";

const txSchema = new mongoose.Schema(
  {
    user:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type:   { type: String, enum: ["earn", "withdraw", "bonus"], required: true },
    amount: { type: Number, required: true },
    coin:   { type: String, default: null },       // for withdrawals: BTC / USDT / etc.
    wallet: { type: String, default: null },        // destination wallet address
    desc:   { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", txSchema);
