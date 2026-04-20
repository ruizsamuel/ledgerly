import type { Request, Response as ExpressResponse, NextFunction } from "express";
import { ZodSchema } from "zod";
import { tFromReq } from "../utils/translator.utils.js";
import type { Response as ApiResponse } from "../models/response.model.js";

type ApiRes = ExpressResponse<Partial<ApiResponse<unknown>>>;

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: ApiRes, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: tFromReq(req, "common.validationFailed"),
        content: parsed.error.flatten()
      });
    }
    req.body = parsed.data;
    next();
  };
};

export const validatePaginationQuery = (req: Request, res: ApiRes, next: NextFunction) => {
  const page = req.query.page;
  const limit = req.query.limit;

  if (page) {
    const parsedPage = Number(page);
    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      return res.status(400).json({ message: tFromReq(req, "common.paginationPositiveInteger") });
    }
  }

  if (limit) {
    const parsedLimit = Number(limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 0) {
      return res.status(400).json({ message: tFromReq(req, "common.paginationPositiveInteger") });
    }
  }

  next();
};
