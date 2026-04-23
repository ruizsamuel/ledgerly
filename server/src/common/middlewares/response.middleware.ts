import type { Request, Response as ExpressResponse, NextFunction } from "express";
import type { Response as ApiResponse } from "../models/basic.model.js";

type PartialApiResponse = Partial<ApiResponse<unknown>> & Record<string, unknown>;

export const enrichResponse = (_req: Request, res: ExpressResponse, next: NextFunction) => {
  const originalJson = res.json.bind(res);

  res.json = (data: unknown) => {
    if (data && typeof data === "object" && !Array.isArray(data)) {
      const payload = data as PartialApiResponse;
      const normalized: ApiResponse<unknown> = {
        message: typeof payload.message === "string" ? payload.message : "",
        content: Object.prototype.hasOwnProperty.call(payload, "content") ? payload.content : null,
        page: typeof payload.page === "number" ? payload.page : undefined,
        totalPages: typeof payload.totalPages === "number" ? payload.totalPages : undefined
      };

      return originalJson(normalized);
    }

    return originalJson(data);
  };

  next();
};
