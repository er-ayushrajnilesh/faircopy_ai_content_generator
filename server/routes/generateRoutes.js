import { Router } from "express";
import { generateContent } from "../controllers/generateController.js";
import { validateGenerateRequest } from "../middleware/validateRequest.js";

const router = Router();

// POST /api/generate — see server/README section "API" or the root
// README's API Specification for the request/response shape.
router.post("/generate", validateGenerateRequest, generateContent);

export default router;
