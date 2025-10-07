// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Provider from "../models/provider.js";

export const userAuthMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid token" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const providerAuthMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const provider = await Provider.findById(decoded.id);
    if (!provider) return res.status(401).json({ message: "Invalid token" });

    req.user = provider; // attach provider to req.user
    next();
  } catch (err) {
    console.error("Provider auth error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};