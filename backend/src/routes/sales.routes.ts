import { Router } from "express";
import { createSaleController, deleteSaleController, getSaleController, listSalesController, updateSaleController } from "@/controllers/sales.controller";
import { requireAuth } from "@/middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", listSalesController);
router.get("/:id", getSaleController);
router.post("/", createSaleController);
router.patch("/:id", updateSaleController);
router.delete("/:id", deleteSaleController);

export default router;
