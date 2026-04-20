import type { Request, Response as ExpressResponse } from "express";
import { tFromReq } from "../common/utils/translator.utils.js";
import type { Response as ApiResponse } from "../common/models/response.model.js";
import { accountsService } from "../services/accounts.service.js";

type ApiRes = ExpressResponse<Partial<ApiResponse<unknown>>>;

export const getAccountsByToken = async (req: Request, res: ApiRes) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);

  try {
    const user = res.locals.user;
    const { accounts, total } = await accountsService.listByUser(user.id, { page, limit });
    res.status(200).json({
      page: limit > 0 ? page : 1,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
      content: accounts
    });
  } catch (err) {
    res.status(500).json({ message: tFromReq(req, "common.serverError") });
  }
};

export const getAccountById = async (req: Request, res: ApiRes) => {
  const accountId = String(req.params.id);
  try {
    const user = res.locals.user;
    const account = await accountsService.getById(user.id, accountId);
    if (!account) return res.status(404).json({ message: tFromReq(req, "controller.account.notFound") });
    res.status(200).json({ content: account });
  } catch (err) {
    res.status(500).json({ message: tFromReq(req, "common.serverError") });
  }
};

export const createAccount = async (req: Request, res: ApiRes) => {
  const { name, balance, description } = req.body;
  try {
    const user = res.locals.user;

    const account = await accountsService.create(
      user.id,
      { name, balance, description },
      tFromReq(req, "controller.account.initialBalance")
    );
    res.status(201).json({ message: tFromReq(req, "controller.account.createdSuccess"), content: account });
  } catch (err) {
    res.status(500).json({ message: tFromReq(req, "common.serverError") });
  }
};

export const updateAccount = async (req: Request, res: ApiRes) => {
  const accountId = String(req.params.id);
  const { description, name } = req.body;

  try {
    const user = res.locals.user;

    const account = await accountsService.update(user.id, accountId, { description, name });
    if (!account) return res.status(404).json({ message: tFromReq(req, "controller.account.notFound") });

    res.status(200).json({ message: tFromReq(req, "controller.account.updatedSuccess"), content: account });
  } catch (err) {
    res.status(500).json({ message: tFromReq(req, "common.serverError") });
  }
};

export const deleteAccount = async (req: Request, res: ApiRes) => {
  const accountId = String(req.params.id);
  const backupAccount = req.query.backupAccount ? String(req.query.backupAccount) : undefined;

  try {
    const user = res.locals.user;
    const account = await accountsService.delete(user.id, accountId, backupAccount);
    if (!account) return res.status(404).json({ message: tFromReq(req, "controller.account.notFound") });

    res.status(200).json({ message: tFromReq(req, "controller.account.deletedSuccess") });
  } catch (err) {
    res.status(500).json({ message: tFromReq(req, "common.serverError") });
  }
};
