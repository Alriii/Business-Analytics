import type { Response } from "express";
import { AppError } from "@/lib/errors";
import type { AuthenticatedRequest } from "@/middleware/auth";
import { createSpoilage, createSpoilageSchema, deleteSpoilage, getSpoilage, listSpoilages, spoilageIdParamSchema, updateSpoilage, updateSpoilageSchema } from "@/services/spoilage-service";

export const listSpoilagesController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const data = await listSpoilages(req.owner.id);
  res.json({ success: true, data });
};

export const getSpoilageController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const parsed = spoilageIdParamSchema.safeParse(req.params);
  if (!parsed.success) throw new AppError("Invalid spoilage id", 400, parsed.error.flatten());
  const data = await getSpoilage(req.owner.id, parsed.data.id);
  res.json({ success: true, data });
};

export const createSpoilageController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const parsed = createSpoilageSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Validation failed", 400, parsed.error.flatten());
  const data = await createSpoilage(req.owner.id, parsed.data);
  res.status(201).json({ success: true, data });
};

export const updateSpoilageController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const params = spoilageIdParamSchema.safeParse(req.params);
  if (!params.success) throw new AppError("Invalid spoilage id", 400, params.error.flatten());
  const body = updateSpoilageSchema.safeParse(req.body);
  if (!body.success) throw new AppError("Validation failed", 400, body.error.flatten());
  const data = await updateSpoilage(req.owner.id, params.data.id, body.data);
  res.json({ success: true, data });
};

export const deleteSpoilageController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const parsed = spoilageIdParamSchema.safeParse(req.params);
  if (!parsed.success) throw new AppError("Invalid spoilage id", 400, parsed.error.flatten());
  const data = await deleteSpoilage(req.owner.id, parsed.data.id);
  res.json({ success: true, data });
};
