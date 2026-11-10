export type Owner = {
  id: string;
  fullName: string;
  farmName: string;
  email: string;
  createdAt: string;
};

export type Product = {
  id: string;
  ownerId: string;
  name: string;
  category: string;
  unit: string;
  unitPrice: number | string;
  createdAt: string;
};

export type Sale = {
  id: string;
  ownerId: string;
  productId: string;
  quantity: number | string;
  unitPrice: number | string;
  soldAt: string;
};

export type Harvest = {
  id: string;
  ownerId: string;
  productId: string;
  quantity: number | string;
  harvestedAt: string;
};

export type Expense = {
  id: string;
  ownerId: string;
  category: string;
  description?: string | null;
  amount: number | string;
  expenseDate: string;
};

export type Spoilage = {
  id: string;
  ownerId: string;
  productId: string;
  quantity: number | string;
  reason: string;
  recordedAt: string;
};

export type DashboardSummary = {
  ownerId: string;
  overview: {
    totalSalesRevenue: number;
    totalSalesQuantity: number;
    totalHarvestedQuantity: number;
    totalSpoiledQuantity: number;
    totalRecordedExpenses: number;
    estimatedOperatingProfit: number;
    currentEstimatedUsableStock: number;
    spoilageRate: number;
  };
  totalProducts: number;
  recentSales: Sale[];
  recentHarvests: Harvest[];
  productPerformance: Array<{
    productId: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  salesChartData: Array<{ date: string; totalRevenue: number; totalQuantity: number }>;
  forecast: {
    forecast: Array<{
      productId: string;
      productName: string;
      predictedDemand: number | null;
      forecastPeriod: string;
      availableData: number;
      insufficientHistoricalData: boolean;
      note: string;
      weeksUsed: Array<{ weekStart: string; totalQuantity: number }>;
    }>;
    generatedAt: string;
  };
  harvestRecommendations: Array<{
    productId: string;
    productName: string;
    predictedDemand: number;
    availableUsableStock: number;
    recommendedHarvest: number;
    needsMoreData: boolean;
  }>;
};
