// src/validators/schemas.ts
import * as yup from "yup";
import { UserRole } from "../models/user.model";

// User validation schemas
export const registerSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  role: yup
    .string()
    .oneOf(Object.values(UserRole), "Invalid role")
    .default(UserRole.CLIENT),
});

export const loginSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

// Event validation schema
export const eventSchema = yup.object({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  date: yup.date().required("Date is required"),
  time: yup.string().required("Time is required"),
  location: yup.string().required("Location is required"),
  capacity: yup
    .number()
    .required("Capacity is required")
    .positive("Capacity must be positive"),
  image: yup.string().url("Image must be a valid URL").optional(),
  category: yup.string().optional(),
});

// Booking validation schema
export const bookingSchema = yup.object({
  eventId: yup
    .number()
    .required("Event ID is required")
    .positive("Invalid event ID"),
});

export const forgotPasswordSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
});

export const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});
