import type { Response } from "express";
import { AppError } from "@/lib/errors";
import type { AuthenticatedRequest } from "@/middleware/auth";
import { createSale, createSaleSchema, deleteSale, getSale, listSales, saleIdParamSchema, updateSale, updateSaleSchema } from "@/services/sales-service";

export const listSalesController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const data = await listSales(req.owner.id);
  res.json({ success: true, data });
};

export const getSaleController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const parsed = saleIdParamSchema.safeParse(req.params);
  if (!parsed.success) throw new AppError("Invalid sale id", 400, parsed.error.flatten());
  const data = await getSale(req.owner.id, parsed.data.id);
  res.json({ success: true, data });
};

export const createSaleController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const parsed = createSaleSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Validation failed", 400, parsed.error.flatten());
  const data = await createSale(req.owner.id, parsed.data);
  res.status(201).json({ success: true, data });
};

export const updateSaleController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const params = saleIdParamSchema.safeParse(req.params);
  if (!params.success) throw new AppError("Invalid sale id", 400, params.error.flatten());
  const body = updateSaleSchema.safeParse(req.body);
  if (!body.success) throw new AppError("Validation failed", 400, body.error.flatten());
  const data = await updateSale(req.owner.id, params.data.id, body.data);
  res.json({ success: true, data });
};

export const deleteSaleController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const parsed = saleIdParamSchema.safeParse(req.params);
  if (!parsed.success) throw new AppError("Invalid sale id", 400, parsed.error.flatten());
  const data = await deleteSale(req.owner.id, parsed.data.id);
  res.json({ success: true, data });
};
