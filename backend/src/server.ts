import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "@/config/env";
import apiRouter from "@/routes";
import { AppError } from "@/lib/errors";
import { csrfProtection } from "@/middleware/csrf";

const app = express();
const PORT = env.PORT;

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(csrfProtection);
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({ message: "Business Analytics API is running!" });
});

app.use("/api", apiRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details ?? null,
    });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({
      success: false,
      message: env.NODE_ENV === "production" ? "Internal server error" : err.message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});