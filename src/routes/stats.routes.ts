// src/routes/stats.routes.ts
import express, { RequestHandler } from "express";
import { getEventStats, getBookingStats } from "../controllers/stats.controller";
import { protect, authorize } from "../middleware/auth";
import { UserRole } from "../models/user.model";

const router = express.Router();

// All routes are protected and admin-only
router.use(protect);
router.use(authorize(UserRole.ADMIN));

// Get statistics
router.get("/events", getEventStats as RequestHandler);
router.get("/bookings", getBookingStats as RequestHandler);

export default router; 