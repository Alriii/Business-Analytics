import "dotenv/config";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { expenses, harvests, owners, products, sales, spoilages } from "@/schema";

const SEED_OWNER_EMAIL = "dev-seed@farmytrack.local";

const PRODUCT_CATALOG = [
  { name: "Tomato", category: "Vegetable", unit: "kg", unitPrice: 5.5 },
  { name: "Cabbage", category: "Vegetable", unit: "kg", unitPrice: 3.2 },
  { name: "Carrot", category: "Vegetable", unit: "kg", unitPrice: 4.1 },
  { name: "Potato", category: "Vegetable", unit: "kg", unitPrice: 2.9 },
  { name: "Onion", category: "Vegetable", unit: "kg", unitPrice: 3.8 },
  { name: "Banana", category: "Fruit", unit: "bunch", unitPrice: 6.4 },
  { name: "Orange", category: "Fruit", unit: "kg", unitPrice: 7.1 },
  { name: "Mango", category: "Fruit", unit: "kg", unitPrice: 8.6 },
  { name: "Strawberry", category: "Berry", unit: "box", unitPrice: 9.5 },
  { name: "Pepper", category: "Vegetable", unit: "kg", unitPrice: 6.3 },
  { name: "Cucumber", category: "Vegetable", unit: "kg", unitPrice: 4.7 },
  { name: "Lettuce", category: "Leafy", unit: "head", unitPrice: 3.6 },
] as const;

const toNumeric = (value: number) => String(value.toFixed(2));

async function ensureSeedOwner() {
  const existing = await db.query.owners.findFirst({
    where: eq(owners.email, SEED_OWNER_EMAIL),
  });

  if (existing) {
    return existing.id;
  }

  const [owner] = await db.insert(owners)
    .values({
      fullName: "Demo Seed Farmer",
      farmName: "Demo Seed Farm",
      email: SEED_OWNER_EMAIL,
      passwordHash: await hash("DevSeedPass123!", 12),
    })
    .returning({ id: owners.id });

  return owner.id;
}

async function clearSeedData(ownerId: string) {
  await db.delete(spoilages).where(eq(spoilages.ownerId, ownerId));
  await db.delete(harvests).where(eq(harvests.ownerId, ownerId));
  await db.delete(sales).where(eq(sales.ownerId, ownerId));
  await db.delete(expenses).where(eq(expenses.ownerId, ownerId));
  await db.delete(products).where(eq(products.ownerId, ownerId));
}

async function createProductSeed(ownerId: string) {
  const rows = PRODUCT_CATALOG.map((product) => ({
    ownerId,
    name: product.name,
    category: product.category,
    unit: product.unit,
    unitPrice: toNumeric(product.unitPrice),
  }));

  await db.insert(products).values(rows);

  const seededProducts = await db.select().from(products).where(eq(products.ownerId, ownerId));
  return seededProducts;
}

async function createSalesSeed(ownerId: string, productIds: string[]) {
  const rows = Array.from({ length: 60 }, (_, index) => {
    const productId = productIds[index % productIds.length];
    const productIndex = index % PRODUCT_CATALOG.length;
    const unitPrice = PRODUCT_CATALOG[productIndex].unitPrice;
    return {
      ownerId,
      productId,
      quantity: toNumeric(8 + (index % 12) * 3.5),
      unitPrice: toNumeric(unitPrice + (index % 3) * 0.45),
      soldAt: new Date(Date.now() - index * 86400000),
    };
  });

  await db.insert(sales).values(rows);
}

async function createHarvestSeed(ownerId: string, productIds: string[]) {
  const rows = Array.from({ length: 60 }, (_, index) => {
    const productId = productIds[index % productIds.length];
    return {
      ownerId,
      productId,
      quantity: toNumeric(20 + (index % 18) * 4.2),
      harvestedAt: new Date(Date.now() - index * 86400000),
    };
  });

  await db.insert(harvests).values(rows);
}

async function createExpenseSeed(ownerId: string) {
  const categories = ["Labor", "Packaging", "Fuel", "Seeds", "Water", "Maintenance"];
  const rows = Array.from({ length: 60 }, (_, index) => ({
    ownerId,
    category: categories[index % categories.length],
    description: `${categories[index % categories.length]} batch ${index + 1}`,
    amount: toNumeric(70 + (index % 15) * 18.75),
    expenseDate: new Date(Date.now() - index * 86400000),
  }));

  await db.insert(expenses).values(rows);
}

async function createSpoilageSeed(ownerId: string, productIds: string[]) {
  const reasons = ["Overripe", "Transit damage", "Storage issue", "Quality check", "Pests"];
  const rows = Array.from({ length: 60 }, (_, index) => ({
    ownerId,
    productId: productIds[index % productIds.length],
    quantity: toNumeric(1.5 + (index % 9) * 1.2),
    reason: reasons[index % reasons.length],
    recordedAt: new Date(Date.now() - index * 86400000),
  }));

  await db.insert(spoilages).values(rows);
}

async function main() {
  const ownerId = await ensureSeedOwner();
  await clearSeedData(ownerId);

  const productRows = await createProductSeed(ownerId);
  const productIds = productRows.map((product) => product.id);

  await createSalesSeed(ownerId, productIds);
  await createHarvestSeed(ownerId, productIds);
  await createExpenseSeed(ownerId);
  await createSpoilageSeed(ownerId, productIds);

  const counts = {
    products: productRows.length,
    sales: await db.select().from(sales).where(eq(sales.ownerId, ownerId)).then((rows) => rows.length),
    harvests: await db.select().from(harvests).where(eq(harvests.ownerId, ownerId)).then((rows) => rows.length),
    expenses: await db.select().from(expenses).where(eq(expenses.ownerId, ownerId)).then((rows) => rows.length),
    spoilages: await db.select().from(spoilages).where(eq(spoilages.ownerId, ownerId)).then((rows) => rows.length),
  };

  console.log("Seed complete:", counts);
  console.log("Owner email:", SEED_OWNER_EMAIL);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
