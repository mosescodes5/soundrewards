/* eslint-env node */
// authMiddleware.js — JWT verify
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided" });

  try {
    const { id } = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET || "dev-secret");
    req.user = await User.findById(id).select("-passwordHash");
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function adminOnly(req, res, next) {
  if (!req.user?.isAdmin)
    return res.status(403).json({ message: "Admin access required" });
  next();
}