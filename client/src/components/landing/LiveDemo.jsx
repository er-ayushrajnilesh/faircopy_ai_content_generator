import { useEffect, useRef, useState } from "react";

const DEMO_TEXT =
  "The best ideas rarely arrive fully formed. They start as a rough sentence, a half-finished thought, a note scribbled in the margins—";

/**
 * A small "editor window" that types itself out on load. This is the
 * hero's signature moment: it's a literal, honest demonstration of the
 * product's core feature (live streaming output), not a decorative effect.
 */
export function LiveDemo() {
  const [visibleChars, setVisibleChars] = useState(0);
  const [finished, setFinished] = useState(false);
  const reduceMotion = useRef(
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (reduceMotion.current) {
      setVisibleChars(DEMO_TEXT.length);
      setFinished(true);
      return undefined;
    }

    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setVisibleChars(i);
      if (i >= DEMO_TEXT.length) {
        clearInterval(id);
        setFinished(true);
      }
    }, 26);

    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full rounded-2xl border border-paper-100/10 bg-ink-800/70 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8">
      <div className="mb-5 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rust-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-gold-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-paper-100/25" />
        <span className="ml-3 font-mono text-[11px] uppercase tracking-widest text-paper-100/40">
          Blog Post · Friendly · Medium
        </span>
      </div>
      <p className="min-h-[4.75em] font-mono text-sm leading-relaxed text-paper-100 sm:text-base">
        {DEMO_TEXT.slice(0, visibleChars)}
        <span
          aria-hidden="true"
          className={`ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] bg-gold-500 ${
            finished ? "animate-caret" : ""
          }`}
        />
      </p>
    </div>
  );
}
