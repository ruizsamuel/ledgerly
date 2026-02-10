import { Router } from "express";
import { auth } from "../middlewares/auth.middlewares.js";
import {
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountsByToken
} from "../controllers/accounts.controllers.js";


export const accountsRouter = Router();

accountsRouter.get("/", auth, getAccountsByToken);
accountsRouter.get("/:id", auth, getAccountById);
accountsRouter.post("/", auth, createAccount);
accountsRouter.patch("/:id", auth, updateAccount);
accountsRouter.delete("/:id", auth, deleteAccount);
