import type { NextFunction, Request, Response } from "express";
import { AppError } from "@/lib/errors";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const csrfProtection = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const method = req.method.toUpperCase();

  if (SAFE_METHODS.has(method) || !req.cookies?.authToken) {
    next();
    return;
  }

  const headerToken = req.headers["x-csrf-token"];
  const cookieToken = req.cookies?.csrfToken;

  if (
    typeof headerToken !== "string" ||
    typeof cookieToken !== "string" ||
    headerToken !== cookieToken
  ) {
    next(new AppError("Invalid CSRF token", 403));
    return;
  }

  next();
};
