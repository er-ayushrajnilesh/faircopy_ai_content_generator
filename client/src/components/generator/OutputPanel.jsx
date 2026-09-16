import { SparkleIcon } from "../icons";

const STATUS_MESSAGES = {
  streaming: "Generating your content…",
  done: "Content generated.",
};

export function OutputPanel({ status, output }) {
  const isEmpty = output.length === 0;
  const statusMessage = STATUS_MESSAGES[status];

  return (
    <div className="flex h-full min-h-96 flex-col rounded-2xl border border-paper-200 bg-paper-50 p-6 sm:p-8">
      {/* Announces state changes without spamming screen readers on every streamed token. */}
      {statusMessage && (
        <span role="status" className="sr-only">
          {statusMessage}
        </span>
      )}

      {isEmpty && status !== "streaming" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-ink-400">
          <SparkleIcon className="h-6 w-6" />
          <p className="max-w-xs text-sm">Your draft will appear here, streamed in live as it's written.</p>
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-950">
          {output}
          {status === "streaming" && (
            <span
              aria-hidden="true"
              className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] animate-caret bg-gold-500"
            />
          )}
        </p>
      )}
    </div>
  );
}
