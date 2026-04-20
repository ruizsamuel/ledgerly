import type { Request, Response as ExpressResponse } from "express";
import { tFromReq } from "../common/utils/translator.utils.js";
import type { Response as ApiResponse } from "../common/models/response.model.js";
import { transactionsService } from "../services/transactions.service.js";

type ApiRes = ExpressResponse<Partial<ApiResponse<unknown>>>;

export const getTransactionsByToken = async (req: Request, res: ApiRes) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const sortBy = String(req.query.sortBy ?? "date") as "date" | "amount";
  const sort = String(req.query.sort ?? "desc") === "desc" ? "desc" : "asc";
  const description = req.query.description ? String(req.query.description) : undefined;
  const fromDate = req.query.fromDate ? new Date(String(req.query.fromDate)) : undefined;
  const toDate = req.query.toDate ? new Date(String(req.query.toDate)) : undefined;
  const account = req.query.account ? String(req.query.account) : undefined;

  try {
    const user = res.locals.user;
    const { transactions, total } = await transactionsService.listByUser(user.id, {
      page,
      limit,
      sortBy,
      sort,
      description,
      fromDate,
      toDate,
      account
    });

    res.status(200).json({
      page: limit > 0 ? Number(page) : 1,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
      content: transactions
    });
  } catch (err) {
    res.status(500).json({ message: tFromReq(req, "common.serverError") });
  }
};

export const getTransactionById = async (req: Request, res: ApiRes) => {
  const transactionId = req.params.id;

  try {
    const user = res.locals.user;
    const transaction = await transactionsService.getById(user.id, transactionId);
    if (!transaction) return res.status(404).json({ message: tFromReq(req, "controller.transaction.notFound") });

    res.status(200).json({ content: transaction });
  } catch (err) {
    res.status(500).json({ message: tFromReq(req, "common.serverError") });
  }
};

export const createTransaction = async (req: Request, res: ApiRes) => {
  const { description, amount, account, date } = req.body;

  try {
    const user = res.locals.user;

    const transaction = await transactionsService.create(user.id, {
      description,
      amount,
      account,
      date
    });

    res.status(201).json({ message: tFromReq(req, "controller.transaction.createdSuccess"), content: transaction });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg === "accountNotFound") {
      return res.status(400).json({ message: tFromReq(req, "controller.transaction.accountNotFound") });
    }
    res.status(500).json({ message: tFromReq(req, "common.serverError") });
  }
};

export const updateTransaction = async (req: Request, res: ApiRes) => {
  const transactionId = req.params.id;
  const { description, amount, date, account } = req.body;

  try {
    const user = res.locals.user;

    const transaction = await transactionsService.update(user.id, transactionId, {
      description,
      amount,
      date,
      account
    });

    if (!transaction) return res.status(404).json({ message: tFromReq(req, "controller.transaction.notFound") });

    res.status(200).json({ message: tFromReq(req, "controller.transaction.updatedSuccess"), content: transaction });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg === "accountNotFound") {
      return res.status(400).json({ message: tFromReq(req, "controller.transaction.accountNotFound") });
    }
    res.status(500).json({ message: tFromReq(req, "common.serverError") });
  }
};
export const deleteTransaction = async (req: Request, res: ApiRes) => {
  const transactionId = req.params.id;
  try {
    const user = res.locals.user;
    const deleted = await transactionsService.delete(user.id, transactionId);
    if (!deleted) return res.status(404).json({ message: tFromReq(req, "controller.transaction.notFound") });

    res.status(200).json({ message: tFromReq(req, "controller.transaction.deletedSuccess") });
  } catch (err) {
    res.status(500).json({ message: tFromReq(req, "common.serverError") });
  }
};
