import { Link } from "react-router";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { LiveDemo } from "../components/landing/LiveDemo";
import { FeatureBadges } from "../components/landing/FeatureBadges";
import { HowItWorks } from "../components/landing/HowItWorks";
import { ArrowRightIcon } from "../components/icons";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-paper-50">
      <Header />

      <main className="flex-1">
        <section className="bg-ink-950">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:gap-10 lg:py-28">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-gold-500">AI content generator</p>
              <h1 className="text-balance mt-5 font-display text-4xl font-medium leading-[1.1] text-paper-50 sm:text-5xl">
                Watch your first draft write itself.
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-paper-100/70">
                Pick a format, a tone, and a length — get a complete, ready-to-use draft in seconds, streamed live
                as it's written. No signup, no subscription, no clutter.
              </p>
              <Link
                to="/generate"
                className="mt-9 inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3.5 font-medium text-ink-950 transition-colors hover:bg-gold-600"
              >
                Start writing
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
            <LiveDemo />
          </div>
        </section>

        <section className="border-b border-paper-200 py-10">
          <div className="mx-auto max-w-6xl px-6">
            <FeatureBadges />
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-2xl text-ink-950 sm:text-3xl">How it works</h2>
            <div className="mt-10">
              <HowItWorks />
            </div>
          </div>
        </section>

        <section className="border-t border-paper-200 bg-paper-100 py-16">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <h2 className="font-display text-2xl text-ink-950 sm:text-3xl">Ready when you are.</h2>
            <p className="mx-auto mt-3 max-w-md text-ink-600">
              Ten content types, seven tones, three lengths — start with whatever you're stuck on.
            </p>
            <Link
              to="/generate"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink-950 px-6 py-3.5 font-medium text-paper-50 transition-colors hover:bg-ink-800"
            >
              Start writing
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
