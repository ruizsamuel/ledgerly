import { Router } from "express";
import { auth } from "../middlewares/auth.middlewares.js";
import { login, getUser, changePassword, register } from "../controllers/auth.controllers.js";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
//TODO: logout
authRouter.get("/me", auth, getUser);
authRouter.patch("/change-password", auth, changePassword);
