import { Router } from "express";
import { validateBody } from "../common/middlewares/validation.middleware.js";
import { authMiddleware } from "../common/middlewares/auth.middleware.js";
import { loginSchema, registerSchema, changePasswordSchema } from "../domain/validations/auth.validators.js";
import { login, changePassword, register, refresh, logout } from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/login", validateBody(loginSchema), login);
authRouter.post("/register", validateBody(registerSchema), register);
authRouter.post("/refresh", refresh);
authRouter.delete("/logout", logout);
authRouter.patch("/change-password", authMiddleware, validateBody(changePasswordSchema), changePassword);
