import type { ReactNode } from "react";
import { Check } from "lucide-react";

export function OnboardingFrame({
  step,
  eyebrow,
  title,
  description,
  children,
}: {
  step: 1 | 2;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3f7f8] px-5 py-6 text-slate-950 sm:px-8 sm:py-8 dark:bg-[#111719] dark:text-slate-50">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.14),transparent_42%),radial-gradient(circle_at_85%_15%,rgba(15,42,67,0.12),transparent_35%)] dark:bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.12),transparent_42%),radial-gradient(circle_at_85%_15%,rgba(59,130,246,0.10),transparent_35%)]"
      />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3 text-sm font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-[#102a43] text-base font-black text-cyan-200 shadow-sm">
            F
          </span>
          Form Flow
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
          Step {step} of 2
        </p>
      </header>

      <main className="relative mx-auto grid w-full max-w-6xl items-center gap-10 py-12 lg:min-h-[calc(100vh-88px)] lg:grid-cols-[0.78fr_1.22fr] lg:gap-20 lg:py-16">
        <section className="max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
            {eyebrow}
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-sm text-base leading-7 text-slate-600 dark:text-slate-300">
            {description}
          </p>

          <ol className="mt-9 space-y-4" aria-label="Onboarding progress">
            <li
              className={`flex items-center gap-3 text-sm ${step === 1 ? "font-semibold" : "text-slate-500 dark:text-slate-400"}`}
            >
              <span
                className={`grid size-7 place-items-center rounded-full text-xs ${step === 1 ? "bg-[#102a43] text-white dark:bg-cyan-300 dark:text-slate-950" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"}`}
              >
                {step === 1 ? "1" : <Check className="size-3.5" />}
              </span>
              Personal details
            </li>
            <li
              className={`flex items-center gap-3 text-sm ${step === 2 ? "font-semibold" : "text-slate-500 dark:text-slate-400"}`}
            >
              <span
                className={`grid size-7 place-items-center rounded-full text-xs ${step === 2 ? "bg-[#102a43] text-white dark:bg-cyan-300 dark:text-slate-950" : "border border-slate-300 dark:border-slate-600"}`}
              >
                2
              </span>
              Organization setup
            </li>
          </ol>
        </section>

        {children}
      </main>
    </div>
  );
}
