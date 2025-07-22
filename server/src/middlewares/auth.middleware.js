import { User } from "../models/auth.models.js"
import { verifyToken } from "../utils/jwt.utils.js";

export const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

export const admin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
};
