// src/routes/booking.routes.ts
import express from "express";
import {
  bookEvent,
  // getUserBookings,
  // cancelBooking,
} from "../controllers/booking.controller";
import { protect, authorize } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { bookingSchema } from "../validators/schemas";
import { UserRole } from "../models/user.model";

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes for clients
router.post(
  "/",
  authorize(UserRole.CLIENT),
  validateBody(bookingSchema),
  bookEvent
);
router.get("/", getUserBookings);
router.delete("/:id", authorize(UserRole.CLIENT), cancelBooking);

export default router;
