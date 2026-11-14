"use client";
import { ExternalLink } from "lucide-react";
import { INFLUENCE_LABELS, OBJECTIVE_LABELS, type Objective, type Solution } from "@/config/solutions";
import { CONCEPT_LABELS } from "@/config/benchmarks";
import type { ConceptType } from "@/lib/types";
import { Badge } from "./Cards";

export function SolutionCard({
  solution: x,
  selected,
  onToggle,
  relevant,
  currentObjective,
  concept,
}: {
  solution: Solution;
  selected: boolean;
  onToggle: () => void;
  relevant: boolean;
  currentObjective: Objective;
  concept: ConceptType;
}) {
  const others = x.objectives.filter((o) => o !== currentObjective);
  const fits = !x.conceptFit || x.conceptFit.includes(concept);
  return (
    <article className="flex flex-col gap-3 rounded-card border border-rule bg-surface p-4 shadow-card sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold">{x.name}</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge tone={x.kind === "partner" ? "brand" : "neutral"}>
              {x.kind === "partner" ? "Integration partner" : "SpotOn product"}
            </Badge>
            <Badge tone={x.nature === "workflow" ? "good" : "neutral"}>
              {x.nature === "workflow" ? "Changes a workflow" : "Primarily insight"}
            </Badge>
            {relevant && <Badge tone="warn">Relevant to this scenario</Badge>}
          </div>
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={selected} onChange={onToggle} className="h-5 w-5 accent-[var(--brand)]" />
          Include in summary
        </label>
      </header>
      <dl className="grid gap-3 text-sm">
        <div>
          <dt className="text-xs font-bold uppercase tracking-wider text-muted">Problem addressed</dt>
          <dd>{x.problem}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wider text-muted">How it may help</dt>
          <dd>
            <ul className="list-disc pl-5">
              {x.mechanism.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wider text-muted">May influence</dt>
          <dd>{INFLUENCE_LABELS[x.influences]}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wider text-muted">Confirm before positioning</dt>
          <dd>
            <ul className="list-disc pl-5">
              {x.requirements.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
      {!fits && (
        <p className="text-xs font-semibold text-warn">
          Typically suited to other concept types than {CONCEPT_LABELS[concept]} — confirm fit.
        </p>
      )}
      {others.length > 0 && (
        <p className="text-xs text-muted">
          Also listed under {others.map((o) => OBJECTIVE_LABELS[o]).join(", ")}. Don&apos;t count its impact twice.
        </p>
      )}
      <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-rule pt-3 text-xs text-muted">
        <span>Exact compatibility and availability require verification.</span>
        <a
          href={x.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-9 items-center gap-1 font-semibold text-brand underline"
        >
          Public product source <ExternalLink className="h-3 w-3" aria-hidden />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </footer>
    </article>
  );
}
