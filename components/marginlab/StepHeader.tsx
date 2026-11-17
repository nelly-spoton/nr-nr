"use client";
import { Check } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { requiredStatus, STEPS } from "@/lib/steps";
import { cn } from "@/lib/utils";
import { useScenario } from "./ScenarioProvider";

/** Branded top of each step: where you are, what this step is for, and a progress bar. */
export function StepHeader({
  step,
  title,
  subtitle,
  actions,
}: {
  step: 1 | 2 | 3;
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  const { scenario, result } = useScenario();
  const ready = requiredStatus(scenario, result).complete;
  return (
    <header className="no-print mb-6 rounded-hero bg-[image:var(--hero-gradient)] px-5 py-5 text-white sm:px-9 sm:py-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-eyebrow-bg px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-eyebrow-fg">
          <span aria-hidden className="h-2 w-2 rounded-full bg-lime-dot" />
          Step {step} of 3
        </span>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-1 max-w-2xl text-sm text-hero-sub sm:text-base">{subtitle}</p>

      <ol aria-label="Progress" className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        {STEPS.map((s) => {
          const done = s.n < step || (s.n === 1 && step > 1 && ready);
          const active = s.n === step;
          return (
            <li key={s.id}>
              <Link href={s.href} aria-current={active ? "step" : undefined} className="block rounded-ctl py-1">
                <span aria-hidden className={cn("block h-1.5 rounded-full", done ? "bg-lime" : active ? "bg-white" : "bg-white/20")} />
                <span className={cn("mt-2 flex items-center gap-2 text-xs font-semibold sm:text-sm", active ? "text-white" : done ? "text-hero-sub" : "text-hero-sub/70")}>
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px]",
                      done ? "bg-lime text-ink" : active ? "bg-white text-ink" : "bg-white/15 text-white/80",
                    )}
                  >
                    {done ? <Check className="h-3 w-3" /> : s.n}
                  </span>
                  <span className="truncate sm:hidden">{s.short}</span>
                  <span className="hidden truncate sm:inline">{s.label}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </header>
  );
}
