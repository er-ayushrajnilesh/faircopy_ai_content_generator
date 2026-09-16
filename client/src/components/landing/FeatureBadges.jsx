const BADGES = ["10 content types", "7 tones", "Live streaming", "No account needed"];

export function FeatureBadges() {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-3">
      {BADGES.map((label) => (
        <li
          key={label}
          className="rounded-full border border-paper-200 bg-paper-100 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-ink-600"
        >
          {label}
        </li>
      ))}
    </ul>
  );
}
