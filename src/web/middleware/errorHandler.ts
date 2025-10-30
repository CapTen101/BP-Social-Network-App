import { Request, Response, NextFunction } from "express";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../infrastructure/errors";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  if (err instanceof ConflictError) {
    return res.status(409).json({ error: err.message });
  }

  console.error("Unexpected error:", err);

  return res.status(500).json({ error: "Internal Server Error" });
}
