import { Router } from "express";
import { createExpenseController, deleteExpenseController, getExpenseController, listExpensesController, updateExpenseController } from "@/controllers/expense.controller";
import { requireAuth } from "@/middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", listExpensesController);
router.get("/:id", getExpenseController);
router.post("/", createExpenseController);
router.patch("/:id", updateExpenseController);
router.delete("/:id", deleteExpenseController);

export default router;
