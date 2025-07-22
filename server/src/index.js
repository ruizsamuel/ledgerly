import express, { json } from "express";
import { connectDB } from "./config/database.config.js";
import { authRouter } from "./routes/auth.routes.js";
import { settingsRouter } from "./routes/settings.routes.js";

const app = express();
app.use(json());

connectDB();

const PORT = 5000;

app.listen(PORT, () => {
  console.log("Server running on port ", PORT);
});

app.use("/api/auth", authRouter);
app.use("/api/settings", settingsRouter);
