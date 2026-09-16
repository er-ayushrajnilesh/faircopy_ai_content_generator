import { EXAMPLE_PROMPTS } from "../../constants/options";

export function ExamplePrompts({ onSelect, disabled }) {
  return (
    <div>
      <p className="mb-2.5 font-mono text-xs uppercase tracking-widest text-ink-600">Need an idea? Try one</p>
      <div className="flex flex-wrap gap-2">
        {EXAMPLE_PROMPTS.map((example) => (
          <button
            key={example.prompt}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(example)}
            className="rounded-full border border-paper-200 bg-paper-50 px-3.5 py-1.5 text-left text-xs text-ink-600 transition-colors hover:border-gold-500 hover:text-ink-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {example.prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
