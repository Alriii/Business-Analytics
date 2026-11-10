import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { AppError } from "@/lib/errors";
import { sales, products } from "@/schema";

export const createSaleSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().positive(),
  soldAt: z.string().datetime().optional(),
});

export const updateSaleSchema = createSaleSchema.partial();
export const saleIdParamSchema = z.object({ id: z.string().uuid() });

const toMoney = (value: string | number | null | undefined) => Number(value ?? 0);

export const ensureProductOwned = async (ownerId: string, productId: string) => {
  const product = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.ownerId, ownerId)),
  });

  if (!product) {
    throw new AppError("Product not found or not owned by this account", 404);
  }

  return product;
};

export const listSales = async (ownerId: string) => {
  const rows = await db.select().from(sales).where(eq(sales.ownerId, ownerId)).orderBy(desc(sales.soldAt));
  return rows.map((row) => ({ ...row, quantity: toMoney(row.quantity), unitPrice: toMoney(row.unitPrice) }));
};

export const getSale = async (ownerId: string, saleId: string) => {
  const row = await db.query.sales.findFirst({ where: and(eq(sales.id, saleId), eq(sales.ownerId, ownerId)) });
  if (!row) throw new AppError("Sale not found", 404);
  return { ...row, quantity: toMoney(row.quantity), unitPrice: toMoney(row.unitPrice) };
};

export const createSale = async (ownerId: string, input: z.infer<typeof createSaleSchema>) => {
  await ensureProductOwned(ownerId, input.productId);

  const [row] = await db.insert(sales)
    .values({
      ownerId,
      productId: input.productId,
      quantity: String(input.quantity) as any,
      unitPrice: String(input.unitPrice) as any,
      soldAt: input.soldAt ? new Date(input.soldAt) : new Date(),
    })
    .returning();

  return { ...row, quantity: toMoney(row.quantity), unitPrice: toMoney(row.unitPrice) };
};

export const updateSale = async (ownerId: string, saleId: string, input: z.infer<typeof updateSaleSchema>) => {
  const existing = await getSale(ownerId, saleId);

  if (input.productId) {
    await ensureProductOwned(ownerId, input.productId);
  }

  const [row] = await db.update(sales)
    .set({
      productId: input.productId ?? existing.productId,
      quantity: input.quantity !== undefined ? String(input.quantity) as any : existing.quantity,
      unitPrice: input.unitPrice !== undefined ? String(input.unitPrice) as any : existing.unitPrice,
      soldAt: input.soldAt ? new Date(input.soldAt) : existing.soldAt,
    })
    .where(and(eq(sales.id, saleId), eq(sales.ownerId, ownerId)))
    .returning();

  if (!row) throw new AppError("Sale not found", 404);
  return { ...row, quantity: toMoney(row.quantity), unitPrice: toMoney(row.unitPrice) };
};

export const deleteSale = async (ownerId: string, saleId: string) => {
  const [row] = await db.delete(sales).where(and(eq(sales.id, saleId), eq(sales.ownerId, ownerId))).returning();
  if (!row) throw new AppError("Sale not found", 404);
  return { ...row, quantity: toMoney(row.quantity), unitPrice: toMoney(row.unitPrice) };
};
