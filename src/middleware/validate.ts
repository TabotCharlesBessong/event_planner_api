// src/middleware/validate.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import { Schema } from "yup";

const validate =
  (schema: Schema): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

export const validateBody =
  (schema: Schema): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedBody = await schema.validate(req.body, {
        abortEarly: false,
      });
      // Replace req.body with validated value
      req.body = validatedBody;
      next();
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.errors || error.message,
      });
    }
  };

export default validate;
