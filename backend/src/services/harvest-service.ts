import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { AppError } from "@/lib/errors";
import { harvests, products } from "@/schema";

export const createHarvestSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  harvestedAt: z.string().datetime().optional(),
});

export const updateHarvestSchema = createHarvestSchema.partial();
export const harvestIdParamSchema = z.object({ id: z.string().uuid() });

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

export const listHarvests = async (ownerId: string) => {
  const rows = await db.select().from(harvests).where(eq(harvests.ownerId, ownerId)).orderBy(desc(harvests.harvestedAt));
  return rows.map((row) => ({ ...row, quantity: toNumber(row.quantity) }));
};

export const getHarvest = async (ownerId: string, harvestId: string) => {
  const row = await db.query.harvests.findFirst({ where: and(eq(harvests.id, harvestId), eq(harvests.ownerId, ownerId)) });
  if (!row) throw new AppError("Harvest record not found", 404);
  return { ...row, quantity: toNumber(row.quantity) };
};

export const createHarvest = async (ownerId: string, input: z.infer<typeof createHarvestSchema>) => {
  await ensureProductOwned(ownerId, input.productId);

  const [row] = await db.insert(harvests)
    .values({
      ownerId,
      productId: input.productId,
      quantity: String(input.quantity) as any,
      harvestedAt: input.harvestedAt ? new Date(input.harvestedAt) : new Date(),
    })
    .returning();

  return { ...row, quantity: toNumber(row.quantity) };
};

export const updateHarvest = async (ownerId: string, harvestId: string, input: z.infer<typeof updateHarvestSchema>) => {
  const existing = await getHarvest(ownerId, harvestId);

  if (input.productId) {
    await ensureProductOwned(ownerId, input.productId);
  }

  const [row] = await db.update(harvests)
    .set({
      productId: input.productId ?? existing.productId,
      quantity: input.quantity !== undefined ? String(input.quantity) as any : existing.quantity,
      harvestedAt: input.harvestedAt ? new Date(input.harvestedAt) : existing.harvestedAt,
    })
    .where(and(eq(harvests.id, harvestId), eq(harvests.ownerId, ownerId)))
    .returning();

  if (!row) throw new AppError("Harvest record not found", 404);
  return { ...row, quantity: toNumber(row.quantity) };
};

export const deleteHarvest = async (ownerId: string, harvestId: string) => {
  const [row] = await db.delete(harvests).where(and(eq(harvests.id, harvestId), eq(harvests.ownerId, ownerId))).returning();
  if (!row) throw new AppError("Harvest record not found", 404);
  return { ...row, quantity: toNumber(row.quantity) };
};
