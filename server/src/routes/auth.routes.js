import { Router } from "express";
import { auth } from "../middlewares/auth.middlewares.js";
import { login, changePassword, register, refresh, logout } from "../controllers/auth.controllers.js";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/refresh", refresh);
authRouter.delete("/logout", logout);
authRouter.patch("/change-password", auth, changePassword);
