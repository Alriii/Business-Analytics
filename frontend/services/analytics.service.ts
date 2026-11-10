import { api, unwrapApiResponse } from "@/lib/api";
import type { DashboardSummary } from "@/types";

type OverviewResponse = {
  totalSalesRevenue: number;
  totalSalesQuantity: number;
  totalHarvestedQuantity: number;
  totalSpoiledQuantity: number;
  totalRecordedExpenses: number;
  estimatedOperatingProfit: number;
  currentEstimatedUsableStock: number;
  spoilageRate: number;
};

type ForecastItem = {
  productId: string;
  productName: string;
  predictedDemand: number | null;
  forecastPeriod: string;
  availableData: number;
  insufficientHistoricalData: boolean;
  note: string;
  weeksUsed: Array<{ weekStart: string; totalQuantity: number }>;
};

type RecommendationItem = {
  productId: string;
  productName: string;
  predictedDemand: number;
  availableUsableStock: number;
  recommendedHarvest: number;
  needsMoreData: boolean;
};

export async function getDashboard(): Promise<DashboardSummary> {
  const response = await api.get("/dashboard");
  return unwrapApiResponse<DashboardSummary>(response.data);
}

export async function getOverview(): Promise<OverviewResponse> {
  const response = await api.get("/analytics/overview");
  return unwrapApiResponse<OverviewResponse>(response.data);
}

export async function getSalesAnalytics(): Promise<Array<Record<string, unknown>>> {
  const response = await api.get("/analytics/sales");
  return unwrapApiResponse<Array<Record<string, unknown>>>(response.data);
}

export async function getForecast(): Promise<{ forecast: ForecastItem[]; generatedAt: string }> {
  const response = await api.get("/analytics/forecast");
  return unwrapApiResponse<{ forecast: ForecastItem[]; generatedAt: string }>(response.data);
}

export async function getRecommendations(): Promise<{ recommendations: RecommendationItem[]; generatedAt: string }> {
  const response = await api.get("/analytics/recommendations");
  return unwrapApiResponse<{ recommendations: RecommendationItem[]; generatedAt: string }>(response.data);
}
