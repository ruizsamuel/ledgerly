import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settings.controllers.js";
import { admin } from "../middlewares/auth.middlewares.js";

export const settingsRouter = Router();

settingsRouter.get("/", admin, getSettings);
settingsRouter.put("/", admin, updateSettings);
