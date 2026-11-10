import { Router } from "express";
import { createHarvestController, deleteHarvestController, getHarvestController, listHarvestsController, updateHarvestController } from "@/controllers/harvest.controller";
import { requireAuth } from "@/middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", listHarvestsController);
router.get("/:id", getHarvestController);
router.post("/", createHarvestController);
router.patch("/:id", updateHarvestController);
router.delete("/:id", deleteHarvestController);

export default router;
