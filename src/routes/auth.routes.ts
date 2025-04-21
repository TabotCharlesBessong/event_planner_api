// src/routes/auth.routes.ts
import express, { RequestHandler } from "express";
import { 
  getMe, 
  login, 
  register, 
  verifyUser, 
  forgotPassword, 
  resetPassword 
} from "../controllers/auth.controller";
import { 
  loginSchema, 
  registerSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema 
} from "../validators/schemas";
import { validateBody } from "../middleware/validate";
import { protect } from "../middleware/auth";

const router = express.Router();

// Public routes
router.post("/register", validateBody(registerSchema), register as RequestHandler);
router.post("/login", validateBody(loginSchema), login as RequestHandler);
router.get("/verify/:token", verifyUser as RequestHandler);
router.post("/forgotpassword", validateBody(forgotPasswordSchema), forgotPassword as RequestHandler);
router.put("/resetpassword/:resetToken", validateBody(resetPasswordSchema), resetPassword as RequestHandler);

// Protected routes
router.get("/me", protect, getMe as RequestHandler);

export default router;
