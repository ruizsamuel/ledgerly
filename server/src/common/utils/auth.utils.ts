import jwt from "jsonwebtoken";

const { sign, verify } = jwt;

export const PASSWORD_MIN_LENGTH = 8;

export type JwtPayload = {
  id: string;
};

export const createToken = (payload: JwtPayload, options: jwt.SignOptions = {}) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  const expiresIn = options.expiresIn || "7d";
  return sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return verify(token, secret) as JwtPayload;
};
