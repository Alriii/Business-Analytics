import type { NextFunction, Request, Response } from "express";
import { verifyAuthToken } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { db } from "@/db";
import { owners } from "@/schema";
import { eq } from "drizzle-orm";

export type AuthenticatedRequest = Request & {
  owner?: {
    id: string;
    email: string;
    fullName: string;
    farmName: string;
  };
};

export const requireAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.authToken;

    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    const payload = await verifyAuthToken(token);
    const owner = await db.query.owners.findFirst({
      where: eq(owners.id, payload.sub),
      columns: {
        id: true,
        email: true,
        fullName: true,
        farmName: true,
      },
    });

    if (!owner) {
      throw new AppError("User not found", 401);
    }

    req.owner = owner;
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Invalid or expired token", 401));
  }
};
