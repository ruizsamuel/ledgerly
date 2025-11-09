import { Router } from "express";
import { admin, auth } from "../middlewares/auth.middlewares.js";
import { createUser, hasUsers, getUserByToken, updateUserByToken } from "../controllers/users.controllers.js";

export const usersRouter = Router();

usersRouter.get("/me", auth, getUserByToken);
usersRouter.patch("/me", auth, updateUserByToken);

usersRouter.post("/", admin, createUser);
//TODO: When admin eliminates a user, remove all accounts owned by that user (and all transactions)

usersRouter.get("/has-users", hasUsers);
