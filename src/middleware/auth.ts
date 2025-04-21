// src/middleware/auth.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import User, { UserRole } from "../models/user.model";

interface JwtPayload {
  id: number;
}

// Add user property to Express Request
declare global {
  namespace Express {
    interface Request {
      user?: User | null;
    }
  }
}

// Middleware to protect routes
export const protect: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists
  if (!token) {
    res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // Find user by id and attach to request
    req.user = await User.findByPk(decoded.id);

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

// Middleware to authorize specific roles
export const authorize = (...roles: UserRole[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
      return;
    }

    next();
  };
};
