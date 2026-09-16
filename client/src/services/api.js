// In production the frontend is served by the same Express app that
// exposes /api, so a relative URL is enough. In development, set
// VITE_API_BASE_URL if you're not using the Vite dev proxy (see
// vite.config.js) — for example when running the client against a
// backend on a different host.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const GENERIC_ERROR = "Something went wrong. Please try again.";

/**
 * Reads a fetch Response body as newline-delimited SSE `data: {...}`
 * frames and dispatches each parsed event to `onEvent`.
 */
async function readEventStream(response, onEvent) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      const line = frame.trim();
      if (!line.startsWith("data:")) continue;

      const jsonText = line.slice(5).trim();
      if (!jsonText) continue;

      try {
        onEvent(JSON.parse(jsonText));
      } catch {
        // Ignore a malformed frame rather than breaking the whole stream.
      }
    }
  }
}

/**
 * Requests generated content and streams it back through callbacks.
 *
 * @param {{prompt: string, type: string, tone: string, length: string}} formValues
 * @param {{onChunk: (text: string) => void, onDone: () => void, onError: (message: string) => void, signal?: AbortSignal}} handlers
 */
export async function generateContent(formValues, { onChunk, onDone, onError, signal }) {
  let sawError = false;
  let sawDone = false;

  try {
    const response = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formValues),
      signal,
    });

    if (!response.ok) {
      let message = GENERIC_ERROR;
      try {
        const data = await response.json();
        message = data.message || message;
      } catch {
        // Response wasn't JSON (e.g. a proxy error page) — keep the generic message.
      }
      onError(message);
      return;
    }

    await readEventStream(response, (event) => {
      if (event.type === "chunk" && typeof event.content === "string") {
        onChunk(event.content);
      } else if (event.type === "error") {
        sawError = true;
        onError(event.message || GENERIC_ERROR);
      } else if (event.type === "done") {
        sawDone = true;
      }
    });

    if (sawError) {
      // onError already fired from inside the loop above.
    } else if (sawDone) {
      onDone();
    } else {
      // The connection closed before a terminal event arrived (dropped
      // network, proxy timeout, server crash, etc.) — without this, the UI
      // would be stuck showing "streaming" forever.
      onError("The connection was lost before the response finished. Please try again.");
    }
  } catch (err) {
    if (err.name === "AbortError") return; // user-initiated cancel, not a failure
    onError(navigator.onLine === false ? "You appear to be offline. Check your connection and try again." : GENERIC_ERROR);
  }
}
