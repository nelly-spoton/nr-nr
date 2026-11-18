"use client";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { CASE_BY_ID, metricQualifier } from "@/config/caseStudies";
import { INFLUENCE_LABELS } from "@/config/solutions";
import { PRIMER, SOLUTION_GUIDES } from "@/config/solutionGuides";
import type { HealthModel } from "@/lib/health";
import type { Recommendation } from "@/lib/recommend";
import { pct } from "@/lib/format";
import { Badge } from "./Cards";

const H = ({ children }: { children: string }) => (
  <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">{children}</h4>
);

function line(label: string, id: string[], health: HealthModel): string | null {
  const row = health.rows.find((x) => id.includes(x.id));
  if (!row || row.valuePct === null) return null;
  if (!row.stat || row.deltaPts === null) return `${label} ${pct(row.valuePct)} (no comparable median)`;
  const d = Math.abs(row.deltaPts).toFixed(1);
  const rel = row.status === "near" ? "near" : row.deltaPts >= 0 ? `${d} pts above` : `${d} pts below`;
  return `${label} ${pct(row.valuePct)}, ${rel} the ${row.stat.value.toFixed(1)}% median`;
}

/** The restaurant's own numbers for the cost this product relates to. */
function yourNumbers(rec: Recommendation, health: HealthModel): ReactNode {
  const infl = rec.solution.influences;
  const parts =
    infl === "food"
      ? [line("Food & beverage cost", ["food", "combined"], health)]
      : infl === "labor"
        ? [line("Labor cost", ["labor"], health)]
        : infl === "both"
          ? [line("Food & beverage cost", ["food", "combined"], health), line("Labor cost", ["labor"], health)]
          : [];
  const shown = parts.filter((x): x is string => !!x);
  if (shown.length === 0)
    return <span className="text-muted">Not a direct food or labor cost lever, so there is no single number to point to. Bring it up if the conversation goes there.</span>;
  return (
    <>
      {shown.join(" · ")} <span className="text-muted">A starting point for a conversation, not a verdict.</span>
    </>
  );
}

/** Training reference for the Summary step: why each chosen solution matters for prime cost. On screen only. */
export function CoachingNotes({ recs, health }: { recs: Recommendation[]; health: HealthModel }) {
  return (
    <section className="mt-8" aria-labelledby="coach-notes">
      <h2 id="coach-notes" className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        From Step 2 · The solutions: why each matters for prime cost
      </h2>
      <p className="mb-3 mt-1 text-sm text-muted">
        These are the best-fit solutions from Step 2.{" "}
        <Link href="/solutions" className="font-semibold text-link underline">Review Step 2</Link>. &ldquo;Why it moves&rdquo;, &ldquo;What to look for&rdquo; and the questions are general
        restaurant knowledge written for training, not SpotOn statements. &ldquo;How it works&rdquo; comes from SpotOn&apos;s public product information.
      </p>

      <details className="mb-3 rounded-card border border-rule bg-surface p-4 shadow-card" open>
        <summary className="cursor-pointer text-base font-semibold">{PRIMER.title}</summary>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
          {PRIMER.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </details>

      {recs.length === 0 ? (
        <p className="rounded-ctl border border-rule bg-surface-2 p-4 text-sm text-muted">No solutions are selected. Choose some in Step 2 and the notes appear here.</p>
      ) : (
        <div className="grid gap-3">
          {recs.map((rec, i) => {
            const x = rec.solution;
            const g = SOLUTION_GUIDES[x.id];
            const stories = rec.proofCaseIds.map((id) => CASE_BY_ID[id]).filter((c): c is NonNullable<typeof c> => !!c);
            return (
              <details key={x.id} className="rounded-card border border-rule bg-surface p-4 shadow-card" open={i === 0}>
                <summary className="flex cursor-pointer flex-wrap items-center gap-2">
                  <span className="text-base font-semibold">{x.name}</span>
                  <Badge tone={x.kind === "partner" ? "brand" : "neutral"}>{x.kind === "partner" ? "Partner" : "SpotOn"}</Badge>
                  <span className="text-xs text-muted">{INFLUENCE_LABELS[x.influences]}</span>
                </summary>
                <div className="mt-3 grid gap-3 text-sm">
                  <p className="rounded-ctl bg-brand-soft p-3">
                    <strong>Your numbers:</strong> {yourNumbers(rec, health)}
                  </p>
                  {g && (
                    <div>
                      <H>Why it moves</H>
                      <p className="mt-1">{g.why}</p>
                    </div>
                  )}
                  <div>
                    <H>How it works</H>
                    <ul className="mt-1 list-disc pl-5">
                      {x.mechanism.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                  {g && (
                    <>
                      <div>
                        <H>What to look for</H>
                        <p className="mt-1">{g.lookFor}</p>
                      </div>
                      <div>
                        <H>Questions to ask the owner</H>
                        <ul className="mt-1 list-disc pl-5">
                          {g.questions.map((q) => (
                            <li key={q}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                  <div>
                    <H>Customer stories</H>
                    {stories.length === 0 ? (
                      <p className="mt-1 text-muted">No published customer story is linked to this product in the tool.</p>
                    ) : (
                      <ul className="mt-1 grid gap-2">
                        {stories.map((c) => (
                          <li key={c.id} className="rounded-ctl bg-surface-2 p-3">
                            <p>
                              <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-link underline">
                                {c.name}
                                <ExternalLink className="h-3 w-3" aria-hidden />
                                <span className="sr-only"> (opens in a new tab)</span>
                              </a>
                              {c.locationText ? <span className="text-muted"> · {c.locationText}</span> : null}
                            </p>
                            <p className="font-semibold">{c.metric.wording}</p>
                            {c.additionalMetrics?.map((m) => (
                              <p key={m.wording} className="font-semibold">{m.wording}</p>
                            ))}
                            <p className="mt-1 text-xs text-muted">
                              {metricQualifier(c.metric)}{c.products.length > 1 ? " Used alongside other products, so the result isn't down to one product." : ""} One restaurant's result, not a prediction.
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <H>Where it may not fit</H>
                    <ul className="mt-1 list-disc pl-5">
                      {x.poorFitReason && <li>{x.poorFitReason}</li>}
                      {g?.caution && <li>{g.caution}</li>}
                      {x.requirements.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}
      <p className="mt-2 text-xs text-muted">Possibilities, not guarantees. Several products can touch the same cost, so never add their results together.</p>
    </section>
  );
}
