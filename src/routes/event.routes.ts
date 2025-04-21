// src/routes/event.routes.ts
import express, { RequestHandler } from "express";
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getEventBookings,
} from "../controllers/event.controller";
import { protect, authorize } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { eventSchema } from "../validators/schemas";
import { UserRole } from "../models/user.model";

const router = express.Router();

// Public routes
router.get("/", getEvents as RequestHandler);
router.get("/:id", getEvent as RequestHandler);

// Protected admin routes
router.post(
  "/",
  protect,
  authorize(UserRole.ADMIN),
  validateBody(eventSchema),
  createEvent as RequestHandler
);
router.put(
  "/:id",
  protect,
  authorize(UserRole.ADMIN),
  validateBody(eventSchema),
  updateEvent as RequestHandler
);
router.delete("/:id", protect, authorize(UserRole.ADMIN), deleteEvent as RequestHandler);
router.get(
  "/:id/bookings",
  protect,
  authorize(UserRole.ADMIN),
  getEventBookings as RequestHandler
);

export default router;
