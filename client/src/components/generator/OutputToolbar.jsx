import { useState } from "react";
import { CopyIcon, DownloadIcon, RefreshIcon, TrashIcon, StopIcon, CheckIcon } from "../icons";
import { copyToClipboard } from "../../utils/clipboard";
import { downloadTxt, downloadPdf, buildBaseFilename } from "../../utils/download";

const buttonClass =
  "flex items-center gap-1.5 rounded-full border border-paper-200 bg-paper-50 px-3.5 py-2 text-sm text-ink-600 transition-colors hover:border-ink-950 hover:text-ink-950 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-paper-200 disabled:hover:text-ink-600";

export function OutputToolbar({ status, output, contentType, onRegenerate, onClear, onCancel }) {
  const [copied, setCopied] = useState(false);
  const hasOutput = output.trim().length > 0;
  // Regenerate replays the last request regardless of whether any text
  // came back, so a failed attempt with zero output can still be retried.
  const canRetry = status === "done" || status === "error";

  if (status === "idle" && !hasOutput) return null;

  if (status === "streaming") {
    return (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 rounded-full border border-paper-200 px-4 py-2 text-sm text-ink-600 transition-colors hover:border-rust-500 hover:text-rust-500"
        >
          <StopIcon className="h-3.5 w-3.5" />
          Stop
        </button>
      </div>
    );
  }

  async function handleCopy() {
    const success = await copyToClipboard(output);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  const baseFilename = buildBaseFilename(contentType);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={handleCopy} disabled={!hasOutput} className={buttonClass}>
        {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <button type="button" onClick={onRegenerate} disabled={!canRetry} className={buttonClass}>
        <RefreshIcon className="h-3.5 w-3.5" />
        Regenerate
      </button>
      <button type="button" onClick={() => downloadTxt(output, baseFilename)} disabled={!hasOutput} className={buttonClass}>
        <DownloadIcon className="h-3.5 w-3.5" />
        .txt
      </button>
      <button type="button" onClick={() => downloadPdf(output, baseFilename)} disabled={!hasOutput} className={buttonClass}>
        <DownloadIcon className="h-3.5 w-3.5" />
        .pdf
      </button>
      <button
        type="button"
        onClick={onClear}
        className={`ml-auto ${buttonClass} hover:border-rust-500 hover:text-rust-500`}
      >
        <TrashIcon className="h-3.5 w-3.5" />
        Clear
      </button>
    </div>
  );
}
