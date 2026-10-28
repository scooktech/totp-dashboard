import { Router } from "express";

import { validate } from "../../middlewares/validate";
import { requireAuth } from "../../middlewares/requireAuth";
import { loginSchema, twoFactorSchema } from "./auth.schema";
import { authController } from "./auth.controller";

const router = Router();

router.post("/login", validate(loginSchema), authController.login);

router.post(
  "/login/2fa",
  validate(twoFactorSchema),
  authController.verifyTwoFactor,
);

router.get("/welcome", requireAuth, authController.welcome);

export default router;
