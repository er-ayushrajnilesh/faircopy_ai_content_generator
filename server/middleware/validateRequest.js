import { config } from "../config/index.js";
import { badRequest } from "../utils/AppError.js";
import { CONTENT_TYPE_OPTIONS, TONE_OPTIONS, LENGTH_OPTIONS } from "../utils/promptBuilder.js";

/**
 * Validates the body of a POST /api/generate request before any AI call is
 * made. Every failure here maps to FR-9's "Empty prompt" / "Invalid
 * request" cases and is reported with a 400 before the response stream
 * (and any Gemini cost) begins.
 */
export function validateGenerateRequest(req, res, next) {
  const body = req.body ?? {};
  const { prompt, type, tone, length } = body;

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return next(badRequest("Please enter a prompt before generating.", "EMPTY_PROMPT"));
  }

  if (prompt.trim().length > config.promptMaxLength) {
    return next(
      badRequest(`Prompts are limited to ${config.promptMaxLength} characters. Please shorten your prompt.`, "PROMPT_TOO_LONG")
    );
  }

  if (!CONTENT_TYPE_OPTIONS.includes(type)) {
    return next(badRequest("Please select a valid content type.", "INVALID_TYPE"));
  }

  if (!TONE_OPTIONS.includes(tone)) {
    return next(badRequest("Please select a valid tone.", "INVALID_TONE"));
  }

  if (!LENGTH_OPTIONS.includes(length)) {
    return next(badRequest("Please select a valid length.", "INVALID_LENGTH"));
  }

  req.validatedBody = { prompt: prompt.trim(), type, tone, length };
  next();
}
