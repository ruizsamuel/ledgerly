import { Router } from "express";
import { admin } from "../middlewares/auth.middleware.js";
import { createUser, hasUsers } from "../controllers/users.controller.js";

export const usersRouter = Router();

usersRouter.post("/", admin, createUser);

usersRouter.get("/has-users", hasUsers);
