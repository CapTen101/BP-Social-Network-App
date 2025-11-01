import { Request, Response, NextFunction } from "express";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../infrastructure/errors";

// maps domain/application errors to HTTP responses.
// keeps controllers thin and consistent.
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

  // Log unexpected errors safely
  const errorMessage =
    err instanceof Error ? err.message : "Unknown error occurred";
  const errorStack = err instanceof Error ? err.stack : undefined;

  console.error("Unexpected error:", {
    message: errorMessage,
    stack: errorStack,
    url: req.url,
    method: req.method,
  });

  return res.status(500).json({ error: "Internal Server Error" }); // return server error if neither of the above cases are met
}
