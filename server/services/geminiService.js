import { GoogleGenAI } from "@google/genai";
import { config } from "../config/index.js";
import { AppError, badRequest, gatewayTimeout, serviceUnavailable } from "../utils/AppError.js";

let client = null;

// Temporary Google-side errors (overloaded / unavailable). Retrying
// usually works within a second or two. 429 (quota) is deliberately NOT
// retried — waiting a moment rarely helps and it just burns free quota.
const RETRYABLE_STATUSES = new Set([500, 502, 503, 504]);
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1200;

// Gemini 3.x models "think" before answering, and those hidden thinking
// tokens count against maxOutputTokens. A tight cap therefore cuts the
// visible answer off halfway (most noticeable with stories). We keep
// thinking to a minimum and also add headroom so the cap is never the
// thing that ends a response. Visible length is still controlled by the
// word-count target in the prompt, not by this cap.
const THINKING_LEVEL = process.env.GEMINI_THINKING_LEVEL ?? "minimal"; // set to "" to turn off
const OUTPUT_TOKEN_HEADROOM = 4000;

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

function sleep(ms, signal) {
  return new Promise((resolve) => {
    const id = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        resolve();
      },
      { once: true }
    );
  });
}

/**
 * Translates an error raised by the Gemini SDK (or our own timeout) into
 * an AppError with a status code and a message safe to show to an end
 * user. The original error is always logged server-side.
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
    return serviceUnavailable("The AI service is temporarily busy. Please try again in a moment.");
  }
  return serviceUnavailable("Something went wrong while generating content. Please try again.");
}

/**
 * Streams a generation from the Gemini API, invoking `onChunk` with each
 * piece of text as it arrives. If Google reports a temporary server error
 * before any text has been sent, the request is retried automatically.
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

  let useThinkingConfig = Boolean(THINKING_LEVEL);

  try {
    for (let attempt = 0; ; attempt += 1) {
      let sentAnyText = false;
      try {
        const requestConfig = {
          systemInstruction: instructions,
          temperature: 0.8,
          maxOutputTokens: maxOutputTokens + OUTPUT_TOKEN_HEADROOM,
          abortSignal: controller.signal,
        };
        if (useThinkingConfig) requestConfig.thinkingConfig = { thinkingLevel: THINKING_LEVEL };

        const stream = await ai.models.generateContentStream({
          model: config.gemini.model,
          contents: input,
          config: requestConfig,
        });

        for await (const chunk of stream) {
          if (chunk.text) {
            sentAnyText = true;
            onChunk(chunk.text);
          }
          const finishReason = chunk.candidates?.[0]?.finishReason;
          if (finishReason === "MAX_TOKENS") {
            console.warn("[geminiService] response was cut off by the output token limit (MAX_TOKENS).");
          }
        }
        return;
      } catch (error) {
        // Some models reject the thinking setting. If so, retry once without it.
        if (error?.status === 400 && useThinkingConfig && !sentAnyText) {
          console.warn("[geminiService] model rejected thinkingConfig; retrying without it.");
          useThinkingConfig = false;
          continue;
        }

        const canRetry =
          !sentAnyText &&
          attempt < MAX_RETRIES &&
          RETRYABLE_STATUSES.has(error?.status) &&
          !controller.signal.aborted;
        if (!canRetry) throw error;

        console.warn(
          `[geminiService] temporary error (status ${error.status}), retrying (${attempt + 1}/${MAX_RETRIES})...`
        );
        await sleep(RETRY_DELAY_MS * (attempt + 1), controller.signal);
        if (controller.signal.aborted) throw error;
      }
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw toAppError(error, { timedOut });
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", forwardExternalAbort);
  }
}
