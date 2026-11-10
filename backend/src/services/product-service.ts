import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { AppError } from "@/lib/errors";
import { products, sales } from "@/schema";

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(80),
  unit: z.string().trim().min(1).max(20),
  unitPrice: z.coerce.number().positive(),
});

export const updateProductSchema = createProductSchema.partial();
export const productIdParamSchema = z.object({ id: z.string().uuid() });

const toMoney = (value: string | number | null | undefined) => Number(value ?? 0);

export const listProducts = async (ownerId: string) => {
  const rows = await db.select().from(products).where(eq(products.ownerId, ownerId)).orderBy(desc(products.createdAt));
  return rows.map((row) => ({ ...row, unitPrice: toMoney(row.unitPrice) }));
};

export const getProduct = async (ownerId: string, productId: string) => {
  const row = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.ownerId, ownerId)),
  });

  if (!row) {
    throw new AppError("Product not found", 404);
  }

  return { ...row, unitPrice: toMoney(row.unitPrice) };
};

export const createProduct = async (ownerId: string, input: z.infer<typeof createProductSchema>) => {
  const name = input.name.trim();
  const existing = await db.query.products.findFirst({
    where: and(eq(products.ownerId, ownerId), sql`LOWER(${products.name}) = LOWER(${name})`),
  });

  if (existing) {
    throw new AppError("A product with this name already exists for this owner", 409);
  }

  const [row] = await db.insert(products)
    .values({
      ownerId,
      name,
      category: input.category.trim(),
      unit: input.unit.trim(),
      unitPrice: String(input.unitPrice) as any,
    })
    .returning();

  return { ...row, unitPrice: toMoney(row.unitPrice) };
};

export const updateProduct = async (ownerId: string, productId: string, input: z.infer<typeof updateProductSchema>) => {
  const existing = await getProduct(ownerId, productId);

  const nextName = input.name?.trim() ?? existing.name;
  if (input.name) {
    const duplicate = await db.query.products.findFirst({
      where: and(eq(products.ownerId, ownerId), sql`LOWER(${products.name}) = LOWER(${nextName})`, sql`${products.id} != ${productId}`),
    });
    if (duplicate) {
      throw new AppError("A product with this name already exists for this owner", 409);
    }
  }

  const [row] = await db.update(products)
    .set({
      name: nextName,
      category: input.category?.trim() ?? existing.category,
      unit: input.unit?.trim() ?? existing.unit,
      unitPrice: input.unitPrice !== undefined ? String(input.unitPrice) as any : existing.unitPrice,
    })
    .where(and(eq(products.id, productId), eq(products.ownerId, ownerId)))
    .returning();

  if (!row) {
    throw new AppError("Product not found", 404);
  }

  return { ...row, unitPrice: toMoney(row.unitPrice) };
};

export const deleteProduct = async (ownerId: string, productId: string) => {
  const product = await getProduct(ownerId, productId);
  const hasHistory = await db.query.sales.findFirst({
    where: and(eq(sales.productId, productId), eq(sales.ownerId, ownerId)),
  }) !== undefined;

  if (hasHistory) {
    throw new AppError("This product has sales history and cannot be deleted", 409);
  }

  const [deleted] = await db.delete(products).where(and(eq(products.id, productId), eq(products.ownerId, ownerId))).returning();

  if (!deleted) throw new AppError("Product not found", 404);

  return { ...deleted, unitPrice: toMoney(deleted.unitPrice) };
};
