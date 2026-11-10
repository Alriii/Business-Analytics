import type { Response } from "express";
import { AppError } from "@/lib/errors";
import type { AuthenticatedRequest } from "@/middleware/auth";
import { createHarvest, createHarvestSchema, deleteHarvest, getHarvest, harvestIdParamSchema, listHarvests, updateHarvest, updateHarvestSchema } from "@/services/harvest-service";

export const listHarvestsController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const data = await listHarvests(req.owner.id);
  res.json({ success: true, data });
};

export const getHarvestController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const parsed = harvestIdParamSchema.safeParse(req.params);
  if (!parsed.success) throw new AppError("Invalid harvest id", 400, parsed.error.flatten());
  const data = await getHarvest(req.owner.id, parsed.data.id);
  res.json({ success: true, data });
};

export const createHarvestController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const parsed = createHarvestSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Validation failed", 400, parsed.error.flatten());
  const data = await createHarvest(req.owner.id, parsed.data);
  res.status(201).json({ success: true, data });
};

export const updateHarvestController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const params = harvestIdParamSchema.safeParse(req.params);
  if (!params.success) throw new AppError("Invalid harvest id", 400, params.error.flatten());
  const body = updateHarvestSchema.safeParse(req.body);
  if (!body.success) throw new AppError("Validation failed", 400, body.error.flatten());
  const data = await updateHarvest(req.owner.id, params.data.id, body.data);
  res.json({ success: true, data });
};

export const deleteHarvestController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const parsed = harvestIdParamSchema.safeParse(req.params);
  if (!parsed.success) throw new AppError("Invalid harvest id", 400, parsed.error.flatten());
  const data = await deleteHarvest(req.owner.id, parsed.data.id);
  res.json({ success: true, data });
};
