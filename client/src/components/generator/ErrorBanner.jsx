import { AlertIcon } from "../icons";

export function ErrorBanner({ message }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-rust-500/30 bg-rust-100 px-4 py-3 text-sm text-rust-500"
    >
      <AlertIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <p>{message}</p>
    </div>
  );
}
