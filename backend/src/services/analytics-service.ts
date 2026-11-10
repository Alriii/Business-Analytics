import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { expenses, harvests, products, sales, spoilages } from "@/schema";

const toNumber = (value: string | number | null | undefined) => Number(value ?? 0);

const safeValue = (value: unknown) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const getOverviewAnalytics = async (ownerId: string) => {
  const [revenueRow] = await db.select({
    totalRevenue: sql<number>`COALESCE(SUM(CAST(${sales.quantity} AS numeric) * CAST(${sales.unitPrice} AS numeric)), 0)::float`,
  }).from(sales).where(eq(sales.ownerId, ownerId));

  const [salesQuantityRow] = await db.select({
    totalSalesQuantity: sql<number>`COALESCE(SUM(CAST(${sales.quantity} AS numeric)), 0)::float`,
  }).from(sales).where(eq(sales.ownerId, ownerId));

  const [harvestQuantityRow] = await db.select({
    totalHarvestedQuantity: sql<number>`COALESCE(SUM(CAST(${harvests.quantity} AS numeric)), 0)::float`,
  }).from(harvests).where(eq(harvests.ownerId, ownerId));

  const [spoilageQuantityRow] = await db.select({
    totalSpoiledQuantity: sql<number>`COALESCE(SUM(CAST(${spoilages.quantity} AS numeric)), 0)::float`,
  }).from(spoilages).where(eq(spoilages.ownerId, ownerId));

  const [expenseRow] = await db.select({
    totalExpenses: sql<number>`COALESCE(SUM(CAST(${expenses.amount} AS numeric)), 0)::float`,
  }).from(expenses).where(eq(expenses.ownerId, ownerId));

  const totalRevenue = safeValue(revenueRow?.totalRevenue ?? 0);
  const totalSalesQuantity = safeValue(salesQuantityRow?.totalSalesQuantity ?? 0);
  const totalHarvestedQuantity = safeValue(harvestQuantityRow?.totalHarvestedQuantity ?? 0);
  const totalSpoiledQuantity = safeValue(spoilageQuantityRow?.totalSpoiledQuantity ?? 0);
  const totalRecordedExpenses = safeValue(expenseRow?.totalExpenses ?? 0);
  const estimatedOperatingProfit = totalRevenue - totalRecordedExpenses;
  const availableUsableStock = Math.max(totalHarvestedQuantity - totalSalesQuantity - totalSpoiledQuantity, 0);
  const spoilageRate = totalHarvestedQuantity > 0 ? (totalSpoiledQuantity / totalHarvestedQuantity) * 100 : 0;

  return {
    totalSalesRevenue: totalRevenue,
    totalSalesQuantity: totalSalesQuantity,
    totalHarvestedQuantity: totalHarvestedQuantity,
    totalSpoiledQuantity: totalSpoiledQuantity,
    totalRecordedExpenses: totalRecordedExpenses,
    estimatedOperatingProfit,
    currentEstimatedUsableStock: availableUsableStock,
    spoilageRate,
    stockModel: {
      formula: "Total Harvested Quantity - Total Sold Quantity - Total Spoiled Quantity",
      assumptions: "This is a simple operational stock model for the authenticated owner. It excludes lead times, losses, and unrecorded costs.",
    },
  };
};

export const getSalesByProduct = async (ownerId: string) => {
  const rows = await db.select({
    productId: sales.productId,
    productName: products.name,
    totalQuantity: sql<number>`COALESCE(SUM(CAST(${sales.quantity} AS numeric)), 0)::float`,
    totalRevenue: sql<number>`COALESCE(SUM(CAST(${sales.quantity} AS numeric) * CAST(${sales.unitPrice} AS numeric)), 0)::float`,
  })
    .from(sales)
    .innerJoin(products, eq(sales.productId, products.id))
    .where(eq(sales.ownerId, ownerId))
    .groupBy(sales.productId, products.name)
    .orderBy(desc(sql<number>`COALESCE(SUM(CAST(${sales.quantity} AS numeric) * CAST(${sales.unitPrice} AS numeric)), 0)::float`));

  return rows.map((row) => ({
    productId: row.productId,
    productName: row.productName,
    totalQuantity: safeValue(row.totalQuantity),
    totalRevenue: safeValue(row.totalRevenue),
  }));
};

export const getSalesOverTime = async (ownerId: string) => {
  const rows = await db.select({
    date: sql<string>`DATE(${sales.soldAt})`,
    totalRevenue: sql<number>`COALESCE(SUM(CAST(${sales.quantity} AS numeric) * CAST(${sales.unitPrice} AS numeric)), 0)::float`,
    totalQuantity: sql<number>`COALESCE(SUM(CAST(${sales.quantity} AS numeric)), 0)::float`,
  })
    .from(sales)
    .where(eq(sales.ownerId, ownerId))
    .groupBy(sql`DATE(${sales.soldAt})`)
    .orderBy(sql`DATE(${sales.soldAt})`);

  return rows.map((row) => ({
    date: String(row.date),
    totalRevenue: safeValue(row.totalRevenue),
    totalQuantity: safeValue(row.totalQuantity),
  }));
};

export const getExpensesByCategory = async (ownerId: string) => {
  const rows = await db.select({
    category: expenses.category,
    totalAmount: sql<number>`COALESCE(SUM(CAST(${expenses.amount} AS numeric)), 0)::float`,
  })
    .from(expenses)
    .where(eq(expenses.ownerId, ownerId))
    .groupBy(expenses.category)
    .orderBy(desc(sql<number>`COALESCE(SUM(CAST(${expenses.amount} AS numeric)), 0)::float`));

  return rows.map((row) => ({ category: row.category, totalAmount: safeValue(row.totalAmount) }));
};

export const getForecast = async (ownerId: string) => {
  const productRows = await db.select({
    id: products.id,
    name: products.name,
  }).from(products).where(eq(products.ownerId, ownerId));

  const salesByProduct = await db.select({
    productId: sales.productId,
    weekStart: sql<string>`DATE_TRUNC('week', ${sales.soldAt})::date`,
    totalQuantity: sql<number>`COALESCE(SUM(CAST(${sales.quantity} AS numeric)), 0)::float`,
  })
    .from(sales)
    .where(eq(sales.ownerId, ownerId))
    .groupBy(sales.productId, sql`DATE_TRUNC('week', ${sales.soldAt})::date`);

  const map = new Map<string, { weekStart: string; totalQuantity: number }[]>();
  for (const row of salesByProduct) {
    const productId = String(row.productId);
    const list = map.get(productId) ?? [];
    list.push({ weekStart: String(row.weekStart), totalQuantity: safeValue(row.totalQuantity) });
    map.set(productId, list);
  }

  const currentWeekStart = new Date();
  currentWeekStart.setHours(0, 0, 0, 0);
  const day = currentWeekStart.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  currentWeekStart.setDate(currentWeekStart.getDate() + diff);

  const forecast = productRows.map((product) => {
    const values = (map.get(product.id) ?? []).sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());
    const completed = values.filter((entry) => new Date(entry.weekStart).getTime() < currentWeekStart.getTime());
    const lastThree = completed.slice(0, 3);

    if (lastThree.length < 3) {
      return {
        productId: product.id,
        productName: product.name,
        predictedDemand: null,
        forecastPeriod: "last-3-complete-weeks",
        availableData: lastThree.length,
        weeksUsed: lastThree.map((entry) => ({ weekStart: entry.weekStart, totalQuantity: entry.totalQuantity })),
        insufficientHistoricalData: true,
        note: "At least three complete sales weeks are required for a demand forecast.",
      };
    }

    const avg = lastThree.reduce((sum, entry) => sum + entry.totalQuantity, 0) / lastThree.length;

    return {
      productId: product.id,
      productName: product.name,
      predictedDemand: Number(avg.toFixed(2)),
      forecastPeriod: "last-3-complete-weeks",
      availableData: lastThree.length,
      weeksUsed: lastThree.map((entry) => ({ weekStart: entry.weekStart, totalQuantity: entry.totalQuantity })),
      insufficientHistoricalData: false,
      note: "Simple three-period moving average for completed weeks only.",
    };
  });

  return { forecast, generatedAt: new Date().toISOString() };
};

export const getRecommendations = async (ownerId: string) => {
  const overview = await getOverviewAnalytics(ownerId);
  const forecast = await getForecast(ownerId);

  const recommendations = await Promise.all(forecast.forecast.map(async (item) => {
    const [harvestTotal] = await db.select({
      total: sql<number>`COALESCE(SUM(CAST(${harvests.quantity} AS numeric)), 0)::float`,
    }).from(harvests).where(and(eq(harvests.ownerId, ownerId), eq(harvests.productId, item.productId)));

    const [salesTotal] = await db.select({
      total: sql<number>`COALESCE(SUM(CAST(${sales.quantity} AS numeric)), 0)::float`,
    }).from(sales).where(and(eq(sales.ownerId, ownerId), eq(sales.productId, item.productId)));

    const [spoilageTotal] = await db.select({
      total: sql<number>`COALESCE(SUM(CAST(${spoilages.quantity} AS numeric)), 0)::float`,
    }).from(spoilages).where(and(eq(spoilages.ownerId, ownerId), eq(spoilages.productId, item.productId)));

    const productTotalHarvest = toNumber(harvestTotal?.total ?? 0);
    const productTotalSold = toNumber(salesTotal?.total ?? 0);
    const productTotalSpoiled = toNumber(spoilageTotal?.total ?? 0);
    const availableStock = Math.max(productTotalHarvest - productTotalSold - productTotalSpoiled, 0);
    const predictedDemand = item.predictedDemand ?? 0;
    const recommendedHarvest = item.insufficientHistoricalData ? 0 : Math.max(0, predictedDemand - availableStock);

    return {
      productId: item.productId,
      productName: item.productName,
      predictedDemand,
      availableUsableStock: availableStock,
      recommendedHarvest,
      needsMoreData: item.insufficientHistoricalData,
      stockModel: "Available Usable Stock = Total Harvested Quantity - Total Sold Quantity - Total Spoiled Quantity",
    };
  }));

  return {
    overview,
    recommendations,
    generatedAt: new Date().toISOString(),
  };
};

export const getDashboardSummary = async (ownerId: string) => {
  const overview = await getOverviewAnalytics(ownerId);
  const productPerformance = await getSalesByProduct(ownerId);
  const forecast = await getForecast(ownerId);
  const recommendations = await getRecommendations(ownerId);

  const recentSales = await db.select().from(sales).where(eq(sales.ownerId, ownerId)).orderBy(desc(sales.soldAt)).limit(5);
  const recentHarvests = await db.select().from(harvests).where(eq(harvests.ownerId, ownerId)).orderBy(desc(harvests.harvestedAt)).limit(5);

  return {
    ownerId,
    overview,
    totalProducts: await db.select({ count: sql<number>`COUNT(*)::int` }).from(products).where(eq(products.ownerId, ownerId)).then((rows) => Number(rows[0]?.count ?? 0)),
    recentSales: recentSales.map((row) => ({ ...row, quantity: toNumber(row.quantity), unitPrice: toNumber(row.unitPrice) })),
    recentHarvests: recentHarvests.map((row) => ({ ...row, quantity: toNumber(row.quantity) })),
    productPerformance,
    salesChartData: await getSalesOverTime(ownerId),
    forecast,
    harvestRecommendations: recommendations.recommendations,
  };
};
