import { Router } from "express";
import { dashboardController, expensesAnalyticsController, forecastAnalyticsController, harvestAnalyticsController, overviewAnalyticsController, recommendationsAnalyticsController, salesAnalyticsController, salesChartController, spoilagesAnalyticsController } from "@/controllers/analytics.controller";
import { requireAuth } from "@/middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/overview", overviewAnalyticsController);
router.get("/sales", salesAnalyticsController);
router.get("/harvests", harvestAnalyticsController);
router.get("/expenses", expensesAnalyticsController);
router.get("/spoilages", spoilagesAnalyticsController);
router.get("/forecast", forecastAnalyticsController);
router.get("/recommendations", recommendationsAnalyticsController);
router.get("/sales-chart", salesChartController);

router.get("/dashboard", dashboardController);

export default router;
