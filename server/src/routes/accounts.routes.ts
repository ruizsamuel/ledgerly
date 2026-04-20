import { Router } from "express";
import { validateBody, validatePaginationQuery } from "../common/middlewares/validation.middleware.js";
import { authMiddleware } from "../common/middlewares/auth.middleware.js";
import { createAccountSchema, updateAccountSchema } from "../domain/validations/account.validators.js";
import {
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountsByToken
} from "../controllers/accounts.controller.js";

export const accountsRouter = Router();

accountsRouter.use(authMiddleware);

accountsRouter.get("/", validatePaginationQuery, getAccountsByToken);
accountsRouter.get("/:id", getAccountById);
accountsRouter.post("/", validateBody(createAccountSchema), createAccount);
accountsRouter.patch("/:id", validateBody(updateAccountSchema), updateAccount);
accountsRouter.delete("/:id", deleteAccount);
