import { config } from "../config/index.js";
import { buildGenerationRequest } from "../utils/promptBuilder.js";
import { streamGeneration } from "../services/geminiService.js";
import { serviceUnavailable } from "../utils/AppError.js";

/**
 * POST /api/generate
 *
 * Streams generated content back to the client as Server-Sent Events.
 * `req.validatedBody` is populated by the validateGenerateRequest
 * middleware, which runs first and rejects malformed requests with a
 * normal JSON error before any AI call (and any cost) happens.
 */
export async function generateContent(req, res, next) {
  // Fail fast with a normal JSON response if the server itself isn't
  // configured — this is a deployment problem, not a mid-stream failure,
  // so it deserves a real HTTP status rather than being buried in SSE.
  if (!config.gemini.apiKey) {
    return next(
      serviceUnavailable("The AI service is not configured. Set GEMINI_API_KEY on the server.", "MISSING_API_KEY")
    );
  }

  const { prompt, type, tone, length } = req.validatedBody;
  const { instructions, input, maxOutputTokens } = buildGenerationRequest({ prompt, type, tone, length });

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // disable proxy buffering (e.g. nginx) so tokens arrive live
  });
  res.flushHeaders();

  const abortController = new AbortController();
  res.on("close", () => abortController.abort());
  // A write can still be in flight at the exact moment the socket closes.
  // Without this listener, that would surface as an unhandled 'error'
  // event on the response and could crash the process.
  res.on("error", () => {});

  const send = (event) => {
    if (res.writableEnded || res.destroyed) return;
    try {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    } catch {
      // Client disconnected in the instant between the check above and
      // this write; nothing more to do.
    }
  };

  try {
    await streamGeneration({
      instructions,
      input,
      maxOutputTokens,
      externalSignal: abortController.signal,
      onChunk: (text) => send({ type: "chunk", content: text }),
    });
    send({ type: "done" });
  } catch (error) {
    const message = error.isAppError
      ? error.message
      : "Something went wrong while generating content. Please try again.";
    if (!error.isAppError) console.error("[generateController] unexpected error:", error);
    send({ type: "error", message });
  } finally {
    res.end();
  }
}
