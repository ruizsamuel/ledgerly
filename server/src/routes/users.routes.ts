import { Router } from "express";
import { validateBody, validatePaginationQuery } from "../common/middlewares/validation.middleware.js";
import { authMiddleware, adminMiddleware } from "../common/middlewares/auth.middleware.js";
import { createUserSchema, updateUserSchema } from "../domain/validations/user.validators.js";
import {
  createUser,
  hasUsers,
  getUserByToken,
  updateUserByToken,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser
} from "../controllers/users.controller.js";

export const usersRouter = Router();

usersRouter.get("/me", authMiddleware, getUserByToken);
usersRouter.patch("/me", authMiddleware, validateBody(updateUserSchema), updateUserByToken);

usersRouter.get("/has-users", hasUsers);

usersRouter.post("/", adminMiddleware, validateBody(createUserSchema), createUser);
usersRouter.get("/", adminMiddleware, validatePaginationQuery, getAllUsers);
usersRouter.get("/:id", adminMiddleware, getUserById);
usersRouter.delete("/:id", adminMiddleware, deleteUser);
usersRouter.patch("/:id", adminMiddleware, validateBody(updateUserSchema), updateUser);
