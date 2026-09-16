const STEPS = [
  {
    title: "Enter your prompt",
    body: "Describe what you need — from a blog outline to a full product description.",
  },
  {
    title: "Set the format",
    body: "Choose a content type, a tone, and a length.",
  },
  {
    title: "Watch it write",
    body: "Your draft streams in live, word by word, as the model generates it.",
  },
  {
    title: "Copy or download",
    body: "Grab it as plain text or a PDF, ready to paste wherever it needs to go.",
  },
];

export function HowItWorks() {
  return (
    <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((step, index) => (
        <li key={step.title} className="relative pl-0">
          <span className="font-mono text-sm text-gold-600">{String(index + 1).padStart(2, "0")}</span>
          <h3 className="mt-3 font-display text-lg text-ink-950">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}
