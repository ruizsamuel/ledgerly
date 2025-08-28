import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settings.controllers.js";
import { auth, admin } from "../middlewares/auth.middlewares.js";

export const settingsRouter = Router();

settingsRouter.get("/settings", auth, admin, getSettings);
settingsRouter.put("/settings", auth, admin, updateSettings);
