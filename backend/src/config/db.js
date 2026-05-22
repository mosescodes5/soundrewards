/* eslint-env node */
// db.js
import mongoose from "mongoose";

export async function connectDB() {
  try {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/soundrewards";
    await mongoose.connect(uri);
    console.log("✅  MongoDB connected");
  } catch (err) {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1);
  }
}