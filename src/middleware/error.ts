// src/middleware/error.ts
import { Request, Response, NextFunction } from "express";

interface ErrorResponse extends Error {
  statusCode?: number;
  code?: string;
}

const errorHandler = (
  err: ErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error(err);

  // Sequelize unique constraint error
  if (err.name === "SequelizeUniqueConstraintError") {
    const message = "Duplicate field value entered";
    error = new Error(message) as ErrorResponse;
    error.statusCode = 400;
  }

  // Sequelize validation error
  if (err.name === "SequelizeValidationError") {
    const message = Object.values(err)
      .map((val: any) => val.message)
      .join(", ");
    error = new Error(message) as ErrorResponse;
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

export default errorHandler;
