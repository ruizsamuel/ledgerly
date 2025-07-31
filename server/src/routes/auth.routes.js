import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { login, getUser, changePassword, register } from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
//TODO: logout
authRouter.get("/me", auth, getUser);
authRouter.patch("/change-password", auth, changePassword);
