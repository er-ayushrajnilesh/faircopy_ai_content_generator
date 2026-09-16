/**
 * An error with an HTTP status code attached, so route handlers can throw
 * a single kind of error and the central error handler decides how to
 * present it to the client without guessing at the right status code.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.isAppError = true;
  }
}

export function badRequest(message, code = "BAD_REQUEST") {
  return new AppError(message, 400, code);
}

export function serviceUnavailable(message, code = "SERVICE_UNAVAILABLE") {
  return new AppError(message, 503, code);
}

export function gatewayTimeout(message, code = "GATEWAY_TIMEOUT") {
  return new AppError(message, 504, code);
}
