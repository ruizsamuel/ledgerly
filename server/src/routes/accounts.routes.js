import { Router } from "express";
import { auth } from "../middlewares/auth.middlewares.js";
import {
  getUserAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount
} from "../controllers/accounts.controllers.js";


export const accountsRouter = Router();

accountsRouter.get("/", auth, getUserAccounts);
accountsRouter.get("/:id", auth, getAccountById);
accountsRouter.post("/", auth, createAccount);
accountsRouter.patch("/:id", auth, updateAccount);
accountsRouter.delete("/:id", auth, deleteAccount);
