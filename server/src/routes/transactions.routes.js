import { Router } from "express";
import { auth } from "../middlewares/auth.middlewares.js";
import {
  getUserTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from "../controllers/transactions.controllers.js";


export const transactionsRouter = Router();

transactionsRouter.get("/", auth, getUserTransactions);
transactionsRouter.get("/:id", auth, getTransactionById);
transactionsRouter.post("/", auth, createTransaction);
transactionsRouter.patch("/:id", auth, updateTransaction);
transactionsRouter.delete("/:id", auth, deleteTransaction);
