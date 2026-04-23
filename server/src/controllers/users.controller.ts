import type { Request, Response as ExpressResponse } from "express";
import { tFromReq } from "../common/utils/translator.utils.js";
import type { Response as ApiResponse } from "../common/models/basic.model.js";
import { usersService } from "../services/users.service.js";

type ApiRes = ExpressResponse<Partial<ApiResponse<unknown>>>;

export const getUserByToken = async (req: Request, res: ApiRes) => {
  const user = res.locals.user;
  res.status(200).json({ message: tFromReq(req, "controller.auth.authenticated"), content: user });
};

export const getAllUsers = async (req: Request, res: ApiRes) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const sortBy = String(req.query.sortBy ?? "createdAt");
  const sort = String(req.query.sort ?? "desc") === "desc" ? "desc" : "asc";
  const searchTerm = req.query.searchTerm ? String(req.query.searchTerm) : undefined;

  try {
    const { users, total } = await usersService.list({ page, limit, sortBy, sort, searchTerm });
    res.status(200).json({
      page: limit > 0 ? page : 1,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
      content: users
    });
  } catch (err) {
    res.status(500).json({ message: tFromReq(req, "common.serverError") });
  }
};

export const getUserById = async (req: Request, res: ApiRes) => {
  const id = String(req.params.id);
  try {
    const user = await usersService.getById(id);
    if (!user) return res.status(404).json({ message: tFromReq(req, "controller.user.notFound") });
    res.status(200).json({ content: user });
  } catch (err) {
    res.status(500).json({ message: tFromReq(req, "common.serverError") });
  }
};

export const updateUserByToken = async (req: Request, res: ApiRes) => {
  try {
    const user = res.locals.user;
    const updated = await usersService.updateByToken(user, req.body);
    res.status(200).json({ message: tFromReq(req, "controller.user.updateSuccess"), content: updated });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg === "emailInUse") {
      return res.status(400).json({ message: tFromReq(req, "controller.auth.emailInUse") });
    }
    res.status(500).json({ message: tFromReq(req, "common.serverError") });
  }
};

export const createUser = async (req: Request, res: ApiRes) => {
  try {
    const user = await usersService.create(req.body);
    res.status(201).json({ message: tFromReq(req, "controller.user.createdSuccess"), content: user });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg === "passwordMinLength") {
      return res.status(400).json({ message: tFromReq(req, "controller.auth.passwordLengthError") });
    }
    if (msg === "emailInUse") {
      return res.status(400).json({ message: tFromReq(req, "controller.auth.emailInUse") });
    }
    res.status(500).json({ message: tFromReq(req, "common.serverError") });
  }
};

export const updateUser = async (req: Request, res: ApiRes) => {
  const id = String(req.params.id);
  try {
    const user = await usersService.updateById(id, req.body);
    if (!user) return res.status(404).json({ message: tFromReq(req, "controller.user.notFound") });
    res.status(200).json({ message: tFromReq(req, "controller.user.updateSuccess"), content: user });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg === "emailInUse") {
      return res.status(400).json({ message: tFromReq(req, "controller.auth.emailInUse") });
    }
    res.status(500).json({ message: tFromReq(req, "common.serverError") });
  }
};

export const deleteUser = async (req: Request, res: ApiRes) => {
  const id = String(req.params.id);
  try {
    await usersService.deleteById(id);
    res.status(200).json({ message: tFromReq(req, "controller.user.deleteSuccess") });
  } catch (err) {
    res.status(500).json({ message: tFromReq(req, "common.serverError") });
  }
};

export const hasUsers = async (_req: Request, res: ApiRes) => {
  const has = await usersService.hasUsers();
  res.status(200).json({ content: has });
};
