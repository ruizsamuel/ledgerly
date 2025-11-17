import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settings.controllers.js";
import { auth, admin } from "../middlewares/auth.middlewares.js";

export const settingsRouter = Router();

settingsRouter.get("/", auth, admin, getSettings);
settingsRouter.put("/", auth, admin, updateSettings);
