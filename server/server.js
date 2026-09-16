import express from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "./config/index.js";
import { corsOptions } from "./config/corsOptions.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import generateRoutes from "./routes/generateRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// AWS App Runner (and most PaaS platforms) sit in front of the app as a
// reverse proxy. Trusting the first hop gives req.ip and the rate limiter
// the real client address instead of the proxy's.
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(requestLogger);
app.use(cors(corsOptions));
app.use(express.json({ limit: "100kb" }));

const generateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please wait a moment and try again.", code: "RATE_LIMITED" },
});

app.use("/api", healthRoutes);
app.use("/api", generateLimiter, generateRoutes);
app.use("/api", notFoundHandler);

// Serve the built React app when it's present. The Dockerfile builds
// client/ and copies the output here as "public"; local `npm run dev`
// never creates this folder because the Vite dev server serves the
// frontend itself and proxies /api calls to this server instead.
const clientDist = path.join(__dirname, "public");
app.use(express.static(clientDist));
app.get("/{*splat}", (req, res, next) => {
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next();
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`AI Content Generation Tool API listening on port ${config.port} [${config.nodeEnv}]`);
  if (!config.gemini.apiKey) {
    console.warn("GEMINI_API_KEY is not set — /api/generate will return an error until it is configured.");
  }
});
