import { Router } from "express";
import { config } from "../config/index.js";

const router = Router();

// GET /api/health — used by AWS App Runner's health check and Docker's
// HEALTHCHECK instruction to confirm the service is up. Deliberately does
// not call Gemini, so it stays fast and free.
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    aiConfigured: Boolean(config.gemini.apiKey),
    uptimeSeconds: Math.round(process.uptime()),
  });
});

export default router;
