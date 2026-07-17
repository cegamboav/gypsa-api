/**
 * App identity constants.
 * Kept separate from SMTP/env secrets so health checks and logs
 * share one source of truth without coupling to process.env.
 */
export const APP_NAME = "gypsa-api";
export const APP_VERSION = "1.0.0";
