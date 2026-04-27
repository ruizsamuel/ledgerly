import type { Request, Response as ExpressResponse } from "express";
import { tFromReq } from "../common/utils/translator.utils.js";
import type { Response as ApiResponse } from "../common/models/basic.model.js";
import { settingsService } from "../services/settings.service.js";

type ApiRes = ExpressResponse<Partial<ApiResponse<unknown>>>;

export const getSettings = async (req: Request, res: ApiRes) => {
  try {
    const settings = await settingsService.get();
    res.status(200).json({ content: settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: tFromReq(req, "common.serverError") });
  }
};

export const updateSettings = async (req: Request, res: ApiRes) => {
  try {
    const settings = await settingsService.update(req.body);
    res.status(200).json({ message: tFromReq(req, "common.updatedSuccess"), content: settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: tFromReq(req, "common.serverError") });
  }
};
