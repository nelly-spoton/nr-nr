"use client";
import { Check, Circle } from "lucide-react";
import { requiredStatus } from "@/lib/steps";
import { cn } from "@/lib/utils";
import { ContentCard } from "./Cards";
import { useScenario } from "./ScenarioProvider";

/** What is still needed before Steps 2 and 3 work. */
export function RequiredChecklist({ className }: { className?: string }) {
  const { scenario, result } = useScenario();
  const st = requiredStatus(scenario, result);
  return (
    <ContentCard className={cn("!p-4", className)}>
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        Required · {st.doneCount} of {st.items.length}
      </h2>
      <ul className="mt-2 grid gap-1">
        {st.items.map((i) => (
          <li key={i.id} className={cn("flex items-center gap-2 text-sm", i.done ? "text-ink" : "text-muted")}>
            {i.done ? <Check className="h-4 w-4 text-good" aria-hidden /> : <Circle className="h-4 w-4" aria-hidden />}
            {i.label}
            <span className="sr-only">{i.done ? " (done)" : " (still needed)"}</span>
          </li>
        ))}
      </ul>
    </ContentCard>
  );
}
