import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { AppError } from "@/lib/errors";
import { spoilages, products } from "@/schema";

export const createSpoilageSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  reason: z.string().trim().min(1).max(150),
  recordedAt: z.string().datetime().optional(),
});

export const updateSpoilageSchema = createSpoilageSchema.partial();
export const spoilageIdParamSchema = z.object({ id: z.string().uuid() });

const toNumber = (value: string | number | null | undefined) => Number(value ?? 0);

export const ensureProductOwned = async (ownerId: string, productId: string) => {
  const product = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.ownerId, ownerId)),
  });

  if (!product) {
    throw new AppError("Product not found or not owned by this account", 404);
  }

  return product;
};

export const listSpoilages = async (ownerId: string) => {
  const rows = await db.select().from(spoilages).where(eq(spoilages.ownerId, ownerId)).orderBy(desc(spoilages.recordedAt));
  return rows.map((row) => ({ ...row, quantity: toNumber(row.quantity) }));
};

export const getSpoilage = async (ownerId: string, spoilageId: string) => {
  const row = await db.query.spoilages.findFirst({ where: and(eq(spoilages.id, spoilageId), eq(spoilages.ownerId, ownerId)) });
  if (!row) throw new AppError("Spoilage record not found", 404);
  return { ...row, quantity: toNumber(row.quantity) };
};

export const createSpoilage = async (ownerId: string, input: z.infer<typeof createSpoilageSchema>) => {
  await ensureProductOwned(ownerId, input.productId);

  const [row] = await db.insert(spoilages)
    .values({
      ownerId,
      productId: input.productId,
      quantity: String(input.quantity) as any,
      reason: input.reason.trim(),
      recordedAt: input.recordedAt ? new Date(input.recordedAt) : new Date(),
    })
    .returning();

  return { ...row, quantity: toNumber(row.quantity) };
};

export const updateSpoilage = async (ownerId: string, spoilageId: string, input: z.infer<typeof updateSpoilageSchema>) => {
  const existing = await getSpoilage(ownerId, spoilageId);

  if (input.productId) {
    await ensureProductOwned(ownerId, input.productId);
  }

  const [row] = await db.update(spoilages)
    .set({
      productId: input.productId ?? existing.productId,
      quantity: input.quantity !== undefined ? String(input.quantity) as any : existing.quantity,
      reason: input.reason?.trim() ?? existing.reason,
      recordedAt: input.recordedAt ? new Date(input.recordedAt) : existing.recordedAt,
    })
    .where(and(eq(spoilages.id, spoilageId), eq(spoilages.ownerId, ownerId)))
    .returning();

  if (!row) throw new AppError("Spoilage record not found", 404);
  return { ...row, quantity: toNumber(row.quantity) };
};

export const deleteSpoilage = async (ownerId: string, spoilageId: string) => {
  const [row] = await db.delete(spoilages).where(and(eq(spoilages.id, spoilageId), eq(spoilages.ownerId, ownerId))).returning();
  if (!row) throw new AppError("Spoilage record not found", 404);
  return { ...row, quantity: toNumber(row.quantity) };
};
