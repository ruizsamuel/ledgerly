import { Router } from "express";
import { admin, auth } from "../middlewares/auth.middleware.js";
import { register, login, getUser, hasUsers, changePassword, createUser } from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", auth, getUser);
authRouter.get("/has-users", hasUsers);
authRouter.put("/change-password", auth, changePassword);
authRouter.post("/create-user", auth, admin, createUser)
