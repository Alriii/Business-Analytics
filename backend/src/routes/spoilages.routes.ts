import { Router } from "express";
import { createSpoilageController, deleteSpoilageController, getSpoilageController, listSpoilagesController, updateSpoilageController } from "@/controllers/spoilage.controller";
import { requireAuth } from "@/middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", listSpoilagesController);
router.get("/:id", getSpoilageController);
router.post("/", createSpoilageController);
router.patch("/:id", updateSpoilageController);
router.delete("/:id", deleteSpoilageController);

export default router;
