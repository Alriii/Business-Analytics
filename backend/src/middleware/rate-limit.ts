import type { NextFunction, Request, Response } from "express";
import { AppError } from "@/lib/errors";

const windows = new Map<string, { count: number; resetAt: number }>();

export const authRateLimit = (maxRequests = 10, windowMs = 60_000) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const current = windows.get(key);

    if (!current || now > current.resetAt) {
      windows.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (current.count >= maxRequests) {
      next(new AppError("Too many authentication attempts. Please try again later.", 429));
      return;
    }

    current.count += 1;
    next();
  };
};
