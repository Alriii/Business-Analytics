import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { AppError } from "@/lib/errors";
import { expenses } from "@/schema";

export const createExpenseSchema = z.object({
  category: z.string().trim().min(1).max(100),
  description: z.string().trim().max(255).optional(),
  amount: z.coerce.number().positive(),
  expenseDate: z.string().datetime().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();
export const expenseIdParamSchema = z.object({ id: z.string().uuid() });

const toNumber = (value: string | number | null | undefined) => Number(value ?? 0);

export const listExpenses = async (ownerId: string) => {
  const rows = await db.select().from(expenses).where(eq(expenses.ownerId, ownerId)).orderBy(desc(expenses.expenseDate));
  return rows.map((row) => ({ ...row, amount: toNumber(row.amount) }));
};

export const getExpense = async (ownerId: string, expenseId: string) => {
  const row = await db.query.expenses.findFirst({ where: and(eq(expenses.id, expenseId), eq(expenses.ownerId, ownerId)) });
  if (!row) throw new AppError("Expense not found", 404);
  return { ...row, amount: toNumber(row.amount) };
};

export const createExpense = async (ownerId: string, input: z.infer<typeof createExpenseSchema>) => {
  const [row] = await db.insert(expenses)
    .values({
      ownerId,
      category: input.category.trim(),
      description: input.description?.trim() ?? null,
      amount: String(input.amount) as any,
      expenseDate: input.expenseDate ? new Date(input.expenseDate) : new Date(),
    })
    .returning();

  return { ...row, amount: toNumber(row.amount) };
};

export const updateExpense = async (ownerId: string, expenseId: string, input: z.infer<typeof updateExpenseSchema>) => {
  const existing = await getExpense(ownerId, expenseId);
  const [row] = await db.update(expenses)
    .set({
      category: input.category?.trim() ?? existing.category,
      description: input.description !== undefined ? (input.description?.trim() ?? null) : existing.description,
      amount: input.amount !== undefined ? String(input.amount) as any : existing.amount,
      expenseDate: input.expenseDate ? new Date(input.expenseDate) : existing.expenseDate,
    })
    .where(and(eq(expenses.id, expenseId), eq(expenses.ownerId, ownerId)))
    .returning();

  if (!row) throw new AppError("Expense not found", 404);
  return { ...row, amount: toNumber(row.amount) };
};

export const deleteExpense = async (ownerId: string, expenseId: string) => {
  const [row] = await db.delete(expenses).where(and(eq(expenses.id, expenseId), eq(expenses.ownerId, ownerId))).returning();
  if (!row) throw new AppError("Expense not found", 404);
  return { ...row, amount: toNumber(row.amount) };
};
