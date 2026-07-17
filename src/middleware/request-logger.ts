import type { NextFunction, Request, Response } from "express";

/**
 * Minimal structured request logger.
 * Swap later for pino/winston without touching controllers.
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    const line = [
      new Date().toISOString(),
      req.method,
      req.originalUrl,
      res.statusCode,
      `${durationMs}ms`,
    ].join(" ");

    console.log(line);
  });

  next();
}
