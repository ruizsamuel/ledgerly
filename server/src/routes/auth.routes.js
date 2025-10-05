import { Router } from "express";
import { auth } from "../middlewares/auth.middlewares.js";
import { login, changePassword, register } from "../controllers/auth.controllers.js";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.patch("/change-password", auth, changePassword);
