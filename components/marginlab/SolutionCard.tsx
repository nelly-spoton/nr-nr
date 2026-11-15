"use client";
import { ExternalLink } from "lucide-react";
import { CASE_BY_ID } from "@/config/caseStudies";
import { INFLUENCE_LABELS, OBJECTIVE_LABELS } from "@/config/solutions";
import { isIncluded, type Recommendation } from "@/lib/recommend";
import { Badge } from "./Cards";

/** One card per product. Outcome tags replace duplicate cards in multiple sections. */
export function SolutionCard({
  rec,
  overrides,
  onToggle,
}: {
  rec: Recommendation;
  overrides: Record<string, boolean>;
  onToggle: (included: boolean) => void;
}) {
  const x = rec.solution;
  const included = isIncluded(rec, overrides);
  const proof = rec.proofCaseIds.map((id) => CASE_BY_ID[id]).filter((c): c is NonNullable<typeof c> => !!c);
  return (
    <article className="flex flex-col gap-3 rounded-card border border-rule bg-surface p-5 shadow-card">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold">{x.name}</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge tone={x.kind === "partner" ? "brand" : "neutral"}>{x.kind === "partner" ? "Integration partner" : "SpotOn product"}</Badge>
            <Badge tone={x.nature === "workflow" ? "good" : "neutral"}>{x.nature === "workflow" ? "Changes a workflow" : "Primarily insight"}</Badge>
            {x.objectives.map((o) => (
              <Badge key={o}>{OBJECTIVE_LABELS[o]}</Badge>
            ))}
          </div>
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={included} onChange={(e) => onToggle(e.target.checked)} className="h-5 w-5 accent-[var(--brand)]" />
          Include in summary
        </label>
      </header>
      <dl className="grid gap-3 text-sm">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">Why it ranks here</dt>
          <dd>
            <ul className="list-disc pl-5">
              {rec.reasons.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">Business problem</dt>
          <dd>{x.problem}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">How it may help</dt>
          <dd>
            <ul className="list-disc pl-5">
              {x.mechanism.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">Potential cost driver</dt>
          <dd>
            {x.costDriver} <span className="text-muted">({INFLUENCE_LABELS[x.influences]})</span>
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">Confirm before positioning</dt>
          <dd>
            <ul className="list-disc pl-5">
              {x.requirements.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </dd>
        </div>
        {proof.length > 0 && (
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">Published customer evidence</dt>
            <dd>
              <ul className="list-disc pl-5">
                {proof.map((c) => (
                  <li key={c.id}>
                    <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-link underline">
                      {c.name}
                    </a>
                    <span className="text-muted"> ({c.conceptLabel})</span>: {c.metric.wording}{" "}
                    <span className="text-xs text-muted">(used with other products where listed)</span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>
      <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-rule pt-3 text-xs text-muted">
        <span>Exact compatibility and availability require verification.</span>
        <a href={x.link.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1 font-semibold text-link underline">
          {x.link.status === "verified_product_page" ? "Product page" : "Vendor site (product page not yet verified)"}
          <ExternalLink className="h-3 w-3" aria-hidden />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </footer>
    </article>
  );
}
