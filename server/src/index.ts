import express, { json } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDb } from "./common/utils/database.utils.js";
import { initI18n } from "./common/utils/translator.utils.js";
import { enrichResponse } from "./common/middlewares/response.middleware.js";
import { authRouter } from "./routes/auth.routes.js";
import { usersRouter } from "./routes/users.routes.js";
import { accountsRouter } from "./routes/accounts.routes.js";
import { transactionsRouter } from "./routes/transactions.routes.js";
import { settingsRouter } from "./routes/settings.routes.js";

const app = express();

app.use(json());
app.use(cors({
  origin: process.env["CORS_ORIGIN"] ?? "http://localhost:4200",
  credentials: true
}));
app.use(cookieParser());

await connectDb();
initI18n();

app.use(enrichResponse);

app.use("/api/auth", authRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/users", usersRouter);
app.use("/api/accounts", accountsRouter);
app.use("/api/transactions", transactionsRouter);

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => {
  console.log("Server running on port:", PORT);
});
