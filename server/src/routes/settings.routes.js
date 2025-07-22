import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";
import { auth, admin } from "../middlewares/auth.middleware.js";

export const settingsRouter = Router();

settingsRouter.get("/settings", auth, admin, getSettings);
settingsRouter.put("/settings", auth, admin, updateSettings);
