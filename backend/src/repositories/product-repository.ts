import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, sales, harvests, spoilages } from "@/schema";

export const listProductsByOwner = (ownerId: string) =>
  db.select().from(products).where(eq(products.ownerId, ownerId)).orderBy(desc(products.createdAt));

export const findProductByOwner = (ownerId: string, productId: string) =>
  db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.ownerId, ownerId)),
  });

export const createProduct = (input: { ownerId: string; name: string; category: string; unit: string; unitPrice: string | number }) =>
  db.insert(products).values({ ...input, ownerId: input.ownerId, unitPrice: String(input.unitPrice) }).returning();

export const updateProduct = (ownerId: string, productId: string, values: Partial<{ name: string; category: string; unit: string; unitPrice: string | number }>) =>
  db.update(products)
    .set({
      ...values,
      unitPrice: values.unitPrice !== undefined ? String(values.unitPrice) : undefined,
    })
    .where(and(eq(products.id, productId), eq(products.ownerId, ownerId)))
    .returning();

export const deleteProduct = (ownerId: string, productId: string) =>
  db.delete(products).where(and(eq(products.id, productId), eq(products.ownerId, ownerId))).returning();

export const productHasRelatedHistory = async (ownerId: string, productId: string) => {
  const [saleRecord, harvestRecord, spoilageRecord] = await Promise.all([
    db.query.sales.findFirst({ where: and(eq(sales.productId, productId), eq(sales.ownerId, ownerId)) }),
    db.query.harvests.findFirst({ where: and(eq(harvests.productId, productId), eq(harvests.ownerId, ownerId)) }),
    db.query.spoilages.findFirst({ where: and(eq(spoilages.productId, productId), eq(spoilages.ownerId, ownerId)) }),
  ]);

  return Boolean(saleRecord || harvestRecord || spoilageRecord);
};
