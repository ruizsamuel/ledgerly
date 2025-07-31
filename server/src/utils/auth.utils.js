import jwt from 'jsonwebtoken';
const { sign, verify } = jwt

export const createToken = (payload, options = {}) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = options.expiresIn || "7d";

  return sign(payload, secret, { expiresIn });
};

export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  return verify(token, secret);
};

export const PASSWORD_MIN_LENGTH = 8;
