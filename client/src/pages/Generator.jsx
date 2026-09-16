import { useState } from "react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { PromptForm } from "../components/generator/PromptForm";
import { OutputPanel } from "../components/generator/OutputPanel";
import { OutputToolbar } from "../components/generator/OutputToolbar";
import { ErrorBanner } from "../components/generator/ErrorBanner";
import { ExamplePrompts } from "../components/generator/ExamplePrompts";
import { useContentGeneration } from "../hooks/useContentGeneration";
import { DEFAULT_FORM_VALUES } from "../constants/options";

export default function Generator() {
  const [formValues, setFormValues] = useState(DEFAULT_FORM_VALUES);
  const generation = useContentGeneration();

  function updateForm(patch) {
    setFormValues((prev) => ({ ...prev, ...patch }));
  }

  function applyExample(example) {
    setFormValues({ prompt: example.prompt, type: example.type, tone: example.tone, length: example.length });
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper-50">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-10">
            <p className="font-mono text-xs uppercase tracking-widest text-gold-600">Generator</p>
            <h1 className="mt-2 font-display text-3xl text-ink-950 sm:text-4xl">Write your next draft</h1>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div className="flex flex-col gap-6">
              <PromptForm
                values={formValues}
                onChange={updateForm}
                onSubmit={() => generation.generate(formValues)}
                disabled={generation.isStreaming}
              />
              <ExamplePrompts onSelect={applyExample} disabled={generation.isStreaming} />
            </div>

            <div className="flex flex-col gap-4">
              <OutputToolbar
                status={generation.status}
                output={generation.output}
                contentType={formValues.type}
                onRegenerate={generation.regenerate}
                onClear={generation.clear}
                onCancel={generation.cancel}
              />
              <ErrorBanner message={generation.error} />
              <OutputPanel status={generation.status} output={generation.output} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
