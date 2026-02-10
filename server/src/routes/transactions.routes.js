import { Router } from "express";
import { auth } from "../middlewares/auth.middlewares.js";
import {
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByToken
} from "../controllers/transactions.controllers.js";


export const transactionsRouter = Router();

transactionsRouter.get("/", auth, getTransactionsByToken);
transactionsRouter.get("/:id", auth, getTransactionById);
transactionsRouter.post("/", auth, createTransaction);
transactionsRouter.patch("/:id", auth, updateTransaction);
transactionsRouter.delete("/:id", auth, deleteTransaction);
