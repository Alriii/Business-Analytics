import type { Response } from "express";
import { z } from "zod";
import { registerOwner, loginOwner, clearAuthCookies, applyAuthCookies } from "@/services/auth-service";
import { AppError } from "@/lib/errors";
import { db } from "@/db";
import { owners } from "@/schema";
import { eq } from "drizzle-orm";
import type { AuthenticatedRequest } from "@/middleware/auth";

export const registerController = async (req: any, res: Response) => {
  const parsed = z.object({
    fullName: z.string().trim().min(2).max(100),
    farmName: z.string().trim().min(2).max(150),
    email: z.string().trim().email().max(255),
    password: z.string().min(8).max(128),
  }).safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Validation failed", 400, parsed.error.flatten());
  }

  const owner = await registerOwner(parsed.data);

  res.status(201).json({
    success: true,
    message: "Owner registered successfully",
    data: owner,
  });
};

export const loginController = async (req: any, res: Response) => {
  const parsed = z.object({
    email: z.string().trim().email().max(255),
    password: z.string().min(8).max(128),
  }).safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Validation failed", 400, parsed.error.flatten());
  }

  const result = await loginOwner(parsed.data);
  applyAuthCookies(res, result.token, result.csrfToken);

  res.json({
    success: true,
    message: "Login successful",
    data: {
      owner: result.owner,
      csrfToken: result.csrfToken,
    },
  });
};

export const logoutController = async (_req: any, res: Response) => {
  clearAuthCookies(res);
  res.json({ success: true, message: "Logged out successfully" });
};

export const meController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) {
    throw new AppError("Authentication required", 401);
  }

  const owner = await db.query.owners.findFirst({
    where: eq(owners.id, req.owner.id),
    columns: {
      id: true,
      fullName: true,
      farmName: true,
      email: true,
      createdAt: true,
    },
  });

  res.json({ success: true, data: owner });
};
