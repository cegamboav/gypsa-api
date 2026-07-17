import cors from "cors";
import express from "express";
import helmet from "helmet";
import { APP_NAME, APP_VERSION } from "./config/app.js";
import { env } from "./config/env.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error-handler.js";
import { requestLogger } from "./middleware/request-logger.js";
import { apiRouter } from "./routes/index.js";

/**
 * Builds the Express application.
 *
 * Decision: createApp() is a pure factory (no listen) so the same app
 * can be tested or mounted behind a different process manager later
 * without changing middleware order.
 *
 * Middleware order matters:
 * 1) Helmet / CORS / JSON — harden and parse first
 * 2) Logger — see every request after parsing
 * 3) Routes — business surface
 * 4) 404 + error handler — always last
 */
export function createApp() {
  const app = express();

  app.disable("x-powered-by");

  // Security headers (XSS, clickjacking, MIME sniffing, etc.)
  app.use(helmet());

  // Explicit allow-list from env — required because gypsa.tech (and later
  // CRM/portal) will call this API from different origins.
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Accept"],
    }),
  );

  // Small body limit: contact form only — reduces abuse surface.
  app.use(express.json({ limit: "32kb" }));
  app.use(requestLogger);

  // Liveness probe for NGINX / Oracle / process supervisors.
  // Kept outside /api/v1 so infra can hit it without knowing API versions.
  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: APP_NAME,
      version: APP_VERSION,
    });
  });

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
