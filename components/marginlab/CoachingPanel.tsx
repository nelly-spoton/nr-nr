"use client";
import { COACHING_PRINCIPLES } from "@/lib/coaching";
import { buildReport } from "@/lib/report";
import { useScenario } from "./ScenarioProvider";
import { ContentCard } from "./Cards";

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">{title}</h4>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {items.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

/** Collapsible discovery guidance for the Hospitality Specialist. Questions, not scripts. */
export function CoachingPanel() {
  const { scenario: s, result: r } = useScenario();
  const c = buildReport(s, r).coaching;
  return (
    <ContentCard tone="muted" className="no-print">
      <details>
        <summary className="cursor-pointer text-sm font-semibold">What this means for your discovery</summary>
        <div className="mt-4 flex flex-col gap-4">
          <p className="flex flex-wrap gap-2">
            {COACHING_PRINCIPLES.map((p) => (
              <span key={p} className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
                {p}
              </span>
            ))}
          </p>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">The challenge this scenario suggests</h4>
            <p className="mt-1 text-sm">{c.challenge}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <List title="Information still missing" items={c.missing} />
            <List title="Metrics to validate" items={c.validate} />
            <List title="Questions to ask first" items={c.questions} />
            <List title="Operational changes that could help" items={c.changes} />
          </div>
          {c.proof && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">Supporting customer result</h4>
              <p className="mt-1 text-sm">
                {c.proof.text}{" "}
                <a href={c.proof.link} target="_blank" rel="noopener noreferrer" className="font-semibold text-link underline">
                  Source
                </a>
              </p>
              <p className="text-xs text-muted">{c.proof.qualifier}</p>
            </div>
          )}
        </div>
      </details>
    </ContentCard>
  );
}
