import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../types/errors.js";

type RequestTarget = "body" | "query" | "params";

/**
 * Factory that validates a request slice with Zod and replaces it
 * with the parsed (typed + sanitized) value.
 */
export function validate(
  schema: ZodSchema,
  target: RequestTarget = "body",
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      next(
        new AppError(
          "Request validation failed",
          400,
          "VALIDATION_ERROR",
          result.error.flatten(),
        ),
      );
      return;
    }

    req[target] = result.data;
    next();
  };
}
