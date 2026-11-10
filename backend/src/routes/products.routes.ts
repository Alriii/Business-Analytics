import { Router } from "express";
import { createProductController, deleteProductController, getProductController, listProductsController, updateProductController } from "@/controllers/product.controller";
import { requireAuth } from "@/middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", listProductsController);
router.get("/:id", getProductController);
router.post("/", createProductController);
router.patch("/:id", updateProductController);
router.delete("/:id", deleteProductController);

export default router;
