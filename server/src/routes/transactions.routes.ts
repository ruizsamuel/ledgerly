import { Router } from "express";
import { validateBody, validatePaginationQuery } from "../common/middlewares/validation.middleware.js";
import { authMiddleware } from "../common/middlewares/auth.middleware.js";
import { createTransactionSchema, updateTransactionSchema } from "../domain/validations/transaction.validators.js";
import {
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByToken
} from "../controllers/transactions.controller.js";

export const transactionsRouter = Router();

transactionsRouter.use(authMiddleware);

transactionsRouter.get("/", validatePaginationQuery, getTransactionsByToken);
transactionsRouter.get("/:id", getTransactionById);
transactionsRouter.post("/", validateBody(createTransactionSchema), createTransaction);
transactionsRouter.patch("/:id", validateBody(updateTransactionSchema), updateTransaction);
transactionsRouter.delete("/:id", deleteTransaction);
