import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth.utils.js";
import { tFromReq } from "../utils/translator.utils.js";
import { usersService } from "../../services/users.service.js";

const getBearerToken = (req: Request): string | null => {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const [, token] = auth.split(" ");
  return token || null;
};

export const getUserByToken = async (token: string) => {
  const payload = verifyToken(token);
  const user = await usersService.getByToken(payload.id);
  if (!user) {
    throw new Error("userNotFound");
  }
  return user;
};

const loadUser = async (req: Request, res: Response): Promise<boolean> => {
  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ message: tFromReq(req, "middleware.auth.noTokenProvided") });
    return false;
  }

  try {
    const user = await getUserByToken(token);
    res.locals.user = user;
    return true;
  } catch (err) {
    const msg = (err as Error).message;
    if (msg === "userNotFound") {
      res.status(404).json({ message: tFromReq(req, "middleware.auth.userNotFound") });
      return false;
    }
    res.status(401).json({ message: tFromReq(req, "middleware.auth.invalidToken") });
    return false;
  }
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const ok = await loadUser(req, res);
  if (!ok) return;
  next();
};

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const ok = await loadUser(req, res);
  if (!ok) return;
  if (!res.locals.user?.isAdmin) {
    return res.status(403).json({ message: tFromReq(req, "middleware.auth.adminOnly") });
  }
  next();
};
