import { Router } from "express";
import { validateBody } from "../common/middlewares/validation.middleware.js";
import { adminMiddleware } from "../common/middlewares/auth.middleware.js";
import { settingsSchema } from "../domain/validations/settings.validators.js";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";

export const settingsRouter = Router();

settingsRouter.use(adminMiddleware);

settingsRouter.get("/", getSettings);
settingsRouter.put("/", validateBody(settingsSchema), updateSettings);
