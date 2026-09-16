import { Link, NavLink } from "react-router";
import { SparkleIcon } from "../icons";

export function Header() {
  return (
    <header className="border-b border-paper-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Faircopy home">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-950 text-paper-50">
            <SparkleIcon className="h-4 w-4" />
          </span>
          <span className="font-display text-xl font-medium tracking-tight text-ink-950">Faircopy</span>
        </Link>

        <nav className="flex items-center gap-6">
          <NavLink
            to="/generate"
            className={({ isActive }) =>
              `hidden font-mono text-xs uppercase tracking-widest sm:inline ${
                isActive ? "text-ink-950" : "text-ink-600 hover:text-ink-950"
              } transition-colors`
            }
          >
            Generator
          </NavLink>
          <Link
            to="/generate"
            className="rounded-full bg-ink-950 px-4 py-2 text-sm font-medium text-paper-50 transition-colors hover:bg-ink-800"
          >
            Start writing
          </Link>
        </nav>
      </div>
    </header>
  );
}
