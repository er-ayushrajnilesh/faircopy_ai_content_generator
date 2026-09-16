import { useCallback, useRef, useState } from "react";
import { generateContent } from "../services/api";

/**
 * Owns the full lifecycle of a single generation: kicking it off, tracking
 * streamed output, and exposing regenerate/clear/cancel actions.
 *
 * status: "idle" | "streaming" | "done" | "error"
 */
export function useContentGeneration() {
  const [status, setStatus] = useState("idle");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const abortControllerRef = useRef(null);
  const lastRequestRef = useRef(null);

  const run = useCallback((formValues) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    lastRequestRef.current = formValues;

    setStatus("streaming");
    setOutput("");
    setError("");

    generateContent(formValues, {
      signal: controller.signal,
      onChunk: (text) => setOutput((prev) => prev + text),
      onDone: () => setStatus("done"),
      onError: (message) => {
        setError(message);
        setStatus("error");
      },
    });
  }, []);

  const generate = useCallback((formValues) => run(formValues), [run]);

  const regenerate = useCallback(() => {
    if (lastRequestRef.current) run(lastRequestRef.current);
  }, [run]);

  const clear = useCallback(() => {
    abortControllerRef.current?.abort();
    setOutput("");
    setError("");
    setStatus("idle");
  }, []);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setStatus((current) => (current === "streaming" ? "idle" : current));
  }, []);

  return {
    status,
    output,
    error,
    isStreaming: status === "streaming",
    generate,
    regenerate,
    clear,
    cancel,
  };
}
