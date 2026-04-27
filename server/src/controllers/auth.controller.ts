import type { Request, Response as ExpressResponse } from "express";
import { createToken, verifyToken, PASSWORD_MIN_LENGTH } from "../common/utils/auth.utils.js";
import { tFromReq } from "../common/utils/translator.utils.js";
import type { Response as ApiResponse } from "../common/models/basic.model.js";
import { authService } from "../services/auth.service.js";

type ApiRes = ExpressResponse<Partial<ApiResponse<unknown>>>;

export const login = async (req: Request, res: ApiRes) => {
  const { email, password } = req.body;

  try {
    const user = await authService.login({ email, password });
    if (!user) return res.status(400).json({ message: tFromReq(req, "controller.auth.invalidCredentials") });

    const token = createToken({ id: user.id }, { expiresIn: "15m" });
    const refresh = createToken({ id: user.id });

    res.cookie("refreshToken", refresh, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({ message: tFromReq(req, "controller.auth.loginSuccess"), content: { token } });
  } catch (err) {
    console.error(err);
    const msg = (err as Error).message;
    if (msg === "invalidCredentials") {
      return res.status(400).json({ message: tFromReq(req, "controller.auth.invalidCredentials") });
    }
    res.status(500).json({ message: tFromReq(req, "common.serverError") });
  }
};

export const register = async (req: Request, res: ApiRes) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: tFromReq(req, "controller.auth.passwordMismatch") });
  }

  try {
    const user = await authService.register({ name, email, password, confirmPassword });
    if (!user) return res.status(500).json({ message: tFromReq(req, "common.serverError") });

    const token = createToken({ id: user.id }, { expiresIn: "15m" });
    const refresh = createToken({ id: user.id });

    res.cookie("refreshToken", refresh, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({ message: tFromReq(req, "controller.auth.registeredSuccess"), content: { token } });
  } catch (err) {
    console.error(err);
    const msg = (err as Error).message;
    if (msg === "registrationDisabled") {
      return res.status(403).json({ message: tFromReq(req, "controller.auth.registrationDisabled") });
    }
    if (msg === "passwordMinLength") {
      return res.status(400).json({ message: `${tFromReq(req, "controller.auth.passwordMinLength")}: ${PASSWORD_MIN_LENGTH}` });
    }
    if (msg === "emailInUse") {
      return res.status(400).json({ message: tFromReq(req, "controller.auth.emailInUse") });
    }
    res.status(500).json({ message: tFromReq(req, "common.serverError") });
  }
};

export const refresh = async (req: Request, res: ApiRes) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ message: tFromReq(req, "controller.auth.noTokenProvided") });

  try {
    const payload = verifyToken(token);
    const newAccessToken = createToken({ id: payload.id }, { expiresIn: "15m" });
    res.json({ content: { token: newAccessToken } });
  } catch (err) {
    return res.status(403).json({ message: tFromReq(req, "controller.auth.sessionExpired") });
  }
};

export const logout = (_req: Request, res: ApiRes) => {
  res.clearCookie("refreshToken", {
    path: "/api/auth/refresh",
    sameSite: "strict",
    secure: true,
    httpOnly: true
  });

  res.json({ message: tFromReq(_req, "controller.auth.logoutSuccess") });
};

export const changePassword = async (req: Request, res: ApiRes) => {
  try {
    const user = res.locals.user;
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(user, { currentPassword, newPassword });
    res.status(200).json({ message: tFromReq(req, "controller.auth.passwordChanged") });
  } catch (err) {
    console.error(err);
    const msg = (err as Error).message;
    if (msg === "incorrectPassword") {
      return res.status(401).json({ message: tFromReq(req, "controller.auth.incorrectPassword") });
    }
    if (msg === "passwordMinLength") {
      return res.status(400).json({ message: `${tFromReq(req, "controller.auth.passwordMinLength")}: ${PASSWORD_MIN_LENGTH}` });
    }
    res.status(500).json({ message: tFromReq(req, "common.serverError") });
  }
};
