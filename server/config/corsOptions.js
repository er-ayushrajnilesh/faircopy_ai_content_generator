import { config } from "./index.js";

/**
 * CORS policy.
 *
 * In production the React build is served by this same Express process,
 * so real browser requests are same-origin and never hit this check.
 * `allowedOrigins` exists for cases like running the built frontend on a
 * separate host, or hitting the API from a second app — nothing is
 * allowed unless it is explicitly listed.
 *
 * In development the Vite dev server normally proxies /api requests to
 * this backend (see client/vite.config.js), which also makes requests
 * same-origin from the browser's point of view. The allowlist below is a
 * fallback for anyone who calls the API directly during development.
 */
const devDefaults = ["http://localhost:5173", "http://127.0.0.1:5173"];

const allowlist = config.isProduction ? config.allowedOrigins : [...config.allowedOrigins, ...devDefaults];

export const corsOptions = {
  origin(origin, callback) {
    // Requests with no Origin header (curl, server-to-server, same-origin
    // navigation) are not subject to CORS and are always allowed through.
    if (!origin || allowlist.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};
