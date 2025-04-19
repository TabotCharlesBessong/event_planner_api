// src/middleware/validate.ts
import { Request, Response, NextFunction } from "express";
import { Schema } from "yup";

const validate =
  (schema: Schema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

export const validateBody =
  (schema: Schema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedBody = await schema.validate(req.body, {
        abortEarly: false,
      });
      // Replace req.body with validated value
      req.body = validatedBody;
      return next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.errors || error.message,
      });
    }
  };

export default validate;
