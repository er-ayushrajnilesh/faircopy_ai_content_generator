import { config } from "../config/index.js";

/**
 * Catches requests to routes that don't exist.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({ message: "Not found." });
}

/**
 * Central error handler. Must be registered last, after all routes.
 *
 * Only reached for errors thrown before a streaming response has started
 * (validation errors, a failed initial connection to the AI service, CORS
 * rejections, etc.) — once SSE headers are sent, the generate controller
 * reports errors as an event inside the stream instead, since HTTP forbids
 * changing the status code after that point.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    // Streaming had already begun; nothing more we can send as a normal
    // HTTP error response. Just end the connection.
    res.end();
    return;
  }

  const statusCode = err.isAppError ? err.statusCode : 500;
  const message = err.isAppError ? err.message : "An unexpected error occurred. Please try again.";

  if (!err.isAppError) {
    console.error("[errorHandler] unexpected error:", err);
  }

  const body = { message, code: err.code || "INTERNAL_ERROR" };
  if (!config.isProduction && !err.isAppError) {
    body.detail = err.message;
  }

  res.status(statusCode).json(body);
}
