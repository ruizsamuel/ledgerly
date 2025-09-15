import { User } from "../models/users.models.js"
import { verifyToken } from "../utils/auth.utils.js";

export const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: req.__("middleware.auth.noTokenProvided") });
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: req.__("middleware.auth.userNotFound") });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: req.__("middleware.auth.invalidToken") } );
  }
};

export const admin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: req.__("middleware.auth.adminOnly") });
  }
  next();
};
