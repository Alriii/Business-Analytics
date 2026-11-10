import type { Response } from "express";
import { AppError } from "@/lib/errors";
import type { AuthenticatedRequest } from "@/middleware/auth";
import { getDashboardSummary, getExpensesByCategory, getForecast, getOverviewAnalytics, getRecommendations, getSalesByProduct, getSalesOverTime } from "@/services/analytics-service";

export const overviewAnalyticsController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const data = await getOverviewAnalytics(req.owner.id);
  res.json({ success: true, data });
};

export const salesAnalyticsController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const data = await getSalesByProduct(req.owner.id);
  res.json({ success: true, data });
};

export const harvestAnalyticsController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const data = await getOverviewAnalytics(req.owner.id);
  res.json({ success: true, data });
};

export const expensesAnalyticsController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const data = await getExpensesByCategory(req.owner.id);
  res.json({ success: true, data });
};

export const spoilagesAnalyticsController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const data = await getOverviewAnalytics(req.owner.id);
  res.json({ success: true, data });
};

export const forecastAnalyticsController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const data = await getForecast(req.owner.id);
  res.json({ success: true, data });
};

export const recommendationsAnalyticsController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const data = await getRecommendations(req.owner.id);
  res.json({ success: true, data });
};

export const dashboardController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const data = await getDashboardSummary(req.owner.id);
  res.json({ success: true, data });
};

export const salesChartController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.owner) throw new AppError("Authentication required", 401);
  const data = await getSalesOverTime(req.owner.id);
  res.json({ success: true, data });
};
