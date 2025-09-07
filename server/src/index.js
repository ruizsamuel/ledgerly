import express, { json } from "express";
import cors  from "cors";
import { connectDB } from "./config/database.config.js";
import { authRouter } from "./routes/auth.routes.js";
import { settingsRouter } from "./routes/settings.routes.js";
import { usersRouter } from "./routes/users.routes.js";
import { enrichResponse } from "./middlewares/response.middlewares.js";
import { accountsRouter } from "./routes/accounts.routes.js";
import { transactionsRouter } from "./routes/transactions.routes.js";

const app = express();
app.use(json());
app.use(cors({
  origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:4200'
}));

connectDB();

const PORT = 5000;

app.listen(PORT, () => {
  console.log("Server running on port: ", PORT);
});

app.use(enrichResponse);

app.use("/api/auth", authRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/users", usersRouter);
app.use("/api/accounts", accountsRouter);
app.use("/api/transactions", transactionsRouter);
