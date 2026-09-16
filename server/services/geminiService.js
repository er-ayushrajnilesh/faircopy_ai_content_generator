import { GoogleGenAI } from "@google/genai";
import { config } from "../config/index.js";
import { AppError, badRequest, gatewayTimeout, serviceUnavailable } from "../utils/AppError.js";

let client = null;

function getClient() {
  if (!config.gemini.apiKey) {
    throw serviceUnavailable(
      "The AI service is not configured. Set GEMINI_API_KEY on the server.",
      "MISSING_API_KEY"
    );
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: config.gemini.apiKey });
  }
  return client;
}

/**
 * Translates an error raised by the Gemini SDK (or our own timeout) into
 * an AppError with a status code and a message safe to show to an end
 * user. The original error is always logged server-side so nothing
 * useful is lost.
 */
function toAppError(error, { timedOut }) {
  console.error("[geminiService] generation failed:", error);

  if (timedOut) {
    return gatewayTimeout("The AI service took too long to respond. Please try again.");
  }

  const status = error?.status;
  if (status === 401 || status === 403) {
    return serviceUnavailable("The AI service is currently unavailable. Please try again shortly.");
  }
  if (status === 429) {
    return serviceUnavailable(
      "The free AI tier's request limit has been reached for now. Please wait a bit and try again."
    );
  }
  if (status === 400) {
    return badRequest("The request could not be processed. Please adjust your prompt and try again.");
  }
  if (typeof status === "number" && status >= 500) {
    return serviceUnavailable("The AI service is temporarily unavailable. Please try again shortly.");
  }
  return serviceUnavailable("Something went wrong while generating content. Please try again.");
}

/**
 * Streams a generation from the Gemini API, invoking `onChunk` with each
 * piece of text as it arrives.
 *
 * @param {object} params
 * @param {string} params.instructions - system-level instructions
 * @param {string} params.input - the user's prompt
 * @param {number} params.maxOutputTokens
 * @param {AbortSignal} [params.externalSignal] - aborts early if the
 *   client disconnects (e.g. the user clicked "Clear" or closed the tab)
 * @param {(text: string) => void} params.onChunk
 */
export async function streamGeneration({ instructions, input, maxOutputTokens, externalSignal, onChunk }) {
  const ai = getClient();
  const controller = new AbortController();

  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, config.gemini.requestTimeoutMs);

  const forwardExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener("abort", forwardExternalAbort);
  }

  try {
    const stream = await ai.models.generateContentStream({
      model: config.gemini.model,
      contents: input,
      config: {
        systemInstruction: instructions,
        temperature: 0.8,
        maxOutputTokens,
        // Gemini 3.x models think by default, and thinking tokens are
        // deducted from the same maxOutputTokens budget as the visible
        // text. `thinkingBudget` is the older (2.5-era) control and is
        // only kept for backwards compatibility on Gemini 3 models —
        // Google recommends `thinkingLevel` instead. Gemini 3 Flash
        // can't fully disable thinking, so "minimal" is the lowest
        // setting available; it keeps as much of the token budget as
        // possible for the actual visible draft.
        thinkingConfig: { thinkingLevel: "minimal" },
        abortSignal: controller.signal,
      },
    });

    for await (const chunk of stream) {
      if (chunk.text) onChunk(chunk.text);
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw toAppError(error, { timedOut });
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", forwardExternalAbort);
  }
}
