import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ValidationError } from "../../infrastructure/errors";

const uuidSchema = z.string().uuid();

export function validateUUIDParam(paramName: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const value = req.params[paramName];
    const result = uuidSchema.safeParse(value);
    if (!result.success) {
      return next(new ValidationError(`${paramName} must be a valid UUID`));
    }
    next();
  };
}
