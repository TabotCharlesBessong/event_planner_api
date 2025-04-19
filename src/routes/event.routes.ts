// src/routes/event.routes.ts
import express from "express";
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
router.get("/", getEvents);
router.get("/:id", getEvent);

// Protected admin routes
router.post(
  "/",
  protect,
  authorize(UserRole.ADMIN),
  validateBody(eventSchema),
  createEvent
);
router.put(
  "/:id",
  protect,
  authorize(UserRole.ADMIN),
  validateBody(eventSchema),
  updateEvent
);
router.delete("/:id", protect, authorize(UserRole.ADMIN), deleteEvent);
router.get(
  "/:id/bookings",
  protect,
  authorize(UserRole.ADMIN),
  getEventBookings
);

export default router;
