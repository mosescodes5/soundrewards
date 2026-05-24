// Transaction.js — DB schema for all money movements
import mongoose from "mongoose";

const txSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type:        { type: String, enum: ["earn", "withdraw", "deposit", "bonus", "referral"], required: true },
    amount:      { type: Number, required: true },
    currency:    { type: String, default: "USD" },
    coin:        { type: String, default: null },
    wallet:      { type: String, default: null },
    description: { type: String, default: "" },
    plisioId:    { type: String, default: null },
    orderId:     { type: String, default: null },
    status:      { type: String, enum: ["pending", "confirmed", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", txSchema);
