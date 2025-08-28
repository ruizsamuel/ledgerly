import { Router } from "express";
import { admin } from "../middlewares/auth.middlewares.js";
import { createUser, hasUsers } from "../controllers/users.controllers.js";

export const usersRouter = Router();

usersRouter.post("/", admin, createUser);
//TODO: When admin eliminates a user, remove all accounts owned by that user (and all transactions)
usersRouter.get("/has-users", hasUsers);
