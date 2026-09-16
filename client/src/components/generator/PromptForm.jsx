import { CONTENT_TYPES, TONES, LENGTHS, PROMPT_MAX_LENGTH } from "../../constants/options";
import { SparkleIcon } from "../icons";

const fieldLabelClass = "mb-2 block font-mono text-xs uppercase tracking-widest text-ink-600";
const selectClass =
  "w-full rounded-xl border border-paper-200 bg-paper-50 p-3 text-ink-950 transition-colors focus:border-gold-500";

export function PromptForm({ values, onChange, onSubmit, disabled }) {
  const remaining = PROMPT_MAX_LENGTH - values.prompt.length;
  const canSubmit = values.prompt.trim().length > 0 && !disabled;

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label htmlFor="prompt" className={fieldLabelClass}>
          Your prompt
        </label>
        <textarea
          id="prompt"
          rows={6}
          value={values.prompt}
          onChange={(event) => onChange({ prompt: event.target.value.slice(0, PROMPT_MAX_LENGTH) })}
          placeholder="Describe what you want written — a topic, a product, an idea, or text to summarize…"
          maxLength={PROMPT_MAX_LENGTH}
          className="w-full resize-none rounded-xl border border-paper-200 bg-paper-50 p-4 text-[15px] text-ink-950 placeholder:text-ink-400 transition-colors focus:border-gold-500"
        />
        <div className="mt-1.5 text-right font-mono text-[11px] text-ink-400">{remaining} characters left</div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="type" className={fieldLabelClass}>
            Content type
          </label>
          <select
            id="type"
            value={values.type}
            onChange={(event) => onChange({ type: event.target.value })}
            className={selectClass}
          >
            {CONTENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tone" className={fieldLabelClass}>
            Tone
          </label>
          <select
            id="tone"
            value={values.tone}
            onChange={(event) => onChange({ tone: event.target.value })}
            className={selectClass}
          >
            {TONES.map((tone) => (
              <option key={tone} value={tone}>
                {tone}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset>
        <legend className={fieldLabelClass}>Length</legend>
        <div className="grid grid-cols-3 gap-2">
          {LENGTHS.map((length) => {
            const active = values.length === length.value;
            return (
              <button
                key={length.value}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ length: length.value })}
                className={`rounded-xl border px-3 py-3 text-center transition-colors ${
                  active
                    ? "border-ink-950 bg-ink-950 text-paper-50"
                    : "border-paper-200 bg-paper-50 text-ink-600 hover:border-ink-400"
                }`}
              >
                <span className="block text-sm font-medium">{length.value}</span>
                <span className={`block font-mono text-[11px] ${active ? "text-paper-100/70" : "text-ink-400"}`}>
                  {length.hint}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex items-center justify-center gap-2 rounded-full bg-gold-500 px-6 py-3.5 font-medium text-ink-950 transition-colors hover:bg-gold-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-gold-500"
      >
        <SparkleIcon className="h-4 w-4" />
        {disabled ? "Generating…" : "Generate"}
      </button>
    </form>
  );
}
