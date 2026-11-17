"use client";
import { Check } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { requiredStatus, STEPS } from "@/lib/steps";
import { cn } from "@/lib/utils";
import { useScenario } from "./ScenarioProvider";

/** "1 Your restaurant → 2 Solutions → 3 Summary". Shows where you are and what is finished. */
export function StepProgress() {
  const path = usePathname();
  const { scenario, result } = useScenario();
  const complete = requiredStatus(scenario, result).complete;
  const current = STEPS.find((s) => (s.href === "/" ? path === "/" : path.startsWith(s.href)))?.n ?? 1;
  return (
    <ol aria-label="Steps" className="no-print mb-5 flex items-center gap-2 text-sm">
      {STEPS.map((s, i) => {
        const done = s.n === 1 ? complete && current > 1 : current > s.n;
        const active = s.n === current;
        return (
          <li key={s.id} className="flex min-w-0 items-center gap-2">
            {i > 0 && <span aria-hidden className="h-px w-5 bg-rule sm:w-8" />}
            <Link
              href={s.href}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex min-h-9 items-center gap-2 rounded-full px-2 py-1 font-semibold",
                active ? "bg-brand-soft text-brand" : done ? "text-ink" : "text-muted",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs",
                  active ? "bg-brand text-white" : done ? "bg-good text-white" : "bg-surface-2 text-muted",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : s.n}
              </span>
              <span className="truncate">{s.label}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
