// src/routes/auth.routes.ts
import express from "express";
import { getMe, login, register } from "../controllers/auth.controller";
import { loginSchema, registerSchema } from "../validators/schemas";
import { validateBody } from "../middleware/validate";
import { protect } from "../middleware/auth";

const router = express.Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.get("/me", protect, getMe);

export default router;
