import { Router } from "express";
import { loginController, logoutController, meController, registerController } from "@/controllers/auth.controller";
import { requireAuth } from "@/middleware/auth";
import { authRateLimit } from "@/middleware/rate-limit";
import { validateBody } from "@/middleware/validate";
import { z } from "zod";

const router = Router();

router.post(
  "/register",
  authRateLimit(),
  validateBody(z.object({
    fullName: z.string().trim().min(2).max(100),
    farmName: z.string().trim().min(2).max(150),
    email: z.string().trim().email().max(255),
    password: z.string().min(8).max(128),
  })),
  registerController,
);

router.post(
  "/login",
  authRateLimit(),
  validateBody(z.object({
    email: z.string().trim().email().max(255),
    password: z.string().min(8).max(128),
  })),
  loginController,
);

router.post("/logout", logoutController);
router.get("/me", requireAuth, meController);

export default router;
