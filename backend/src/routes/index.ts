import { Router } from "express";
import authRoutes from "@/routes/auth.routes";
import productRoutes from "@/routes/products.routes";
import salesRoutes from "@/routes/sales.routes";
import harvestRoutes from "@/routes/harvests.routes";
import expenseRoutes from "@/routes/expenses.routes";
import spoilageRoutes from "@/routes/spoilages.routes";
import analyticsRoutes from "@/routes/analytics.routes";
import { dashboardController } from "@/controllers/analytics.controller";
import { requireAuth } from "@/middleware/auth";

const router = Router();
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/sales", salesRoutes);
router.use("/harvests", harvestRoutes);
router.use("/expenses", expenseRoutes);
router.use("/spoilages", spoilageRoutes);
router.use("/analytics", analyticsRoutes);
router.get("/dashboard", requireAuth, dashboardController);

export default router;
