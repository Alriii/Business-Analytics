import type { Response } from "express";
import { z } from "zod";
import { AppError } from "@/lib/errors";
import type { AuthenticatedRequest } from "@/middleware/auth";
import { createProduct, createProductSchema, deleteProduct, getProduct, listProducts, updateProduct, updateProductSchema, productIdParamSchema } from "@/services/product-service";

export const listProductsController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const data = await listProducts(req.owner.id);
  res.json({ success: true, data });
};

export const getProductController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const parsed = productIdParamSchema.safeParse(req.params);
  if (!parsed.success) throw new AppError("Invalid product id", 400, parsed.error.flatten());
  const data = await getProduct(req.owner.id, parsed.data.id);
  res.json({ success: true, data });
};

export const createProductController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Validation failed", 400, parsed.error.flatten());
  const data = await createProduct(req.owner.id, parsed.data);
  res.status(201).json({ success: true, data });
};

export const updateProductController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const params = productIdParamSchema.safeParse(req.params);
  if (!params.success) throw new AppError("Invalid product id", 400, params.error.flatten());
  const body = updateProductSchema.safeParse(req.body);
  if (!body.success) throw new AppError("Validation failed", 400, body.error.flatten());
  const data = await updateProduct(req.owner.id, params.data.id, body.data);
  res.json({ success: true, data });
};

export const deleteProductController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const parsed = productIdParamSchema.safeParse(req.params);
  if (!parsed.success) throw new AppError("Invalid product id", 400, parsed.error.flatten());
  const data = await deleteProduct(req.owner.id, parsed.data.id);
  res.json({ success: true, data });
};
