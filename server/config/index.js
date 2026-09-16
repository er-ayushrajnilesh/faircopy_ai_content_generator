import "dotenv/config";

/**
 * Centralized, validated application configuration.
 * Every other server module reads settings from here instead of
 * touching `process.env` directly, so there is exactly one place
 * that knows how to interpret the environment.
 */

const REQUIRED_IN_PRODUCTION = ["GEMINI_API_KEY"];

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

// In production we fail fast and loud if secrets are missing, since a
// silently-misconfigured deployment is worse than one that refuses to boot.
// In development we only warn, so the frontend can still be worked on
// without an API key present.
for (const key of REQUIRED_IN_PRODUCTION) {
  if (!process.env[key]) {
    const message = `Missing required environment variable: ${key}`;
    if (isProduction) {
      throw new Error(message);
    } else {
      console.warn(`[config] ${message} (requests to /api/generate will fail until it is set)`);
    }
  }
}

function parseOrigins(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const config = {
  nodeEnv,
  isProduction,
  port: Number.parseInt(process.env.PORT, 10) || 3000,

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    // gemini-3.6-flash is Google's current default Flash-tier model
    // (released July 2026) — a strong, current default for everyday
    // writing tasks. Newly-created API keys are blocked from the older
    // gemini-2.5 model family, so this is also the model new keys can
    // actually use. Swap models via GEMINI_MODEL if you want to try
    // another (e.g. gemini-3.5-flash-lite), just note free-tier
    // availability varies by model.
    model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
    requestTimeoutMs: Number.parseInt(process.env.GEMINI_TIMEOUT_MS, 10) || 60_000,
  },

  // Comma-separated list of origins allowed to call the API cross-origin,
  // e.g. "http://localhost:5173,https://staging.example.com".
  // In production the frontend is served by this same Express app, so the
  // browser never makes a cross-origin request and this list can stay empty.
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGINS),

  rateLimit: {
    windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 5 * 60 * 1000,
    max: Number.parseInt(process.env.RATE_LIMIT_MAX, 10) || 30,
  },

  promptMaxLength: Number.parseInt(process.env.PROMPT_MAX_LENGTH, 10) || 4000,
};
