import type { Response } from "express";
import { AppError } from "@/lib/errors";
import type { AuthenticatedRequest } from "@/middleware/auth";
import { createExpense, createExpenseSchema, deleteExpense, expenseIdParamSchema, getExpense, listExpenses, updateExpense, updateExpenseSchema } from "@/services/expense-service";

export const listExpensesController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const data = await listExpenses(req.owner.id);
  res.json({ success: true, data });
};

export const getExpenseController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const parsed = expenseIdParamSchema.safeParse(req.params);
  if (!parsed.success) throw new AppError("Invalid expense id", 400, parsed.error.flatten());
  const data = await getExpense(req.owner.id, parsed.data.id);
  res.json({ success: true, data });
};

export const createExpenseController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const parsed = createExpenseSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Validation failed", 400, parsed.error.flatten());
  const data = await createExpense(req.owner.id, parsed.data);
  res.status(201).json({ success: true, data });
};

export const updateExpenseController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const params = expenseIdParamSchema.safeParse(req.params);
  if (!params.success) throw new AppError("Invalid expense id", 400, params.error.flatten());
  const body = updateExpenseSchema.safeParse(req.body);
  if (!body.success) throw new AppError("Validation failed", 400, body.error.flatten());
  const data = await updateExpense(req.owner.id, params.data.id, body.data);
  res.json({ success: true, data });
};

export const deleteExpenseController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const parsed = expenseIdParamSchema.safeParse(req.params);
  if (!parsed.success) throw new AppError("Invalid expense id", 400, parsed.error.flatten());
  const data = await deleteExpense(req.owner.id, parsed.data.id);
  res.json({ success: true, data });
};
