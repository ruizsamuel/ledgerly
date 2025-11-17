import { Router } from "express";
import { admin, auth } from "../middlewares/auth.middlewares.js";
import { createUser, hasUsers, getUserByToken, updateUserByToken, getAllUsers, getUserById, deleteUser, updateUser } from "../controllers/users.controllers.js";

export const usersRouter = Router();

usersRouter.get("/me", auth, getUserByToken);
usersRouter.patch("/me", auth, updateUserByToken);

usersRouter.get("/has-users", hasUsers);

usersRouter.post("/", admin, createUser);
usersRouter.get("/", admin, getAllUsers);
usersRouter.get("/:id", admin, getUserById);
usersRouter.delete("/:id", admin, deleteUser);
usersRouter.patch("/:id", admin, updateUser);
