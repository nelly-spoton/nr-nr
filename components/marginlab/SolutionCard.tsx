"use client";
import { ExternalLink } from "lucide-react";
import { CASE_BY_ID } from "@/config/caseStudies";
import { INFLUENCE_LABELS } from "@/config/solutions";
import type { Recommendation } from "@/lib/recommend";
import { Badge } from "./Cards";

const H = ({ children }: { children: string }) => (
  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">{children}</dt>
);

/** A product recommendation: the point first, details on demand. One card per product. */
export function SolutionCard({ rec }: { rec: Recommendation }) {
  const x = rec.solution;
  const proof = rec.proofCaseIds.map((id) => CASE_BY_ID[id]).filter((c): c is NonNullable<typeof c> => !!c);
  return (
    <article className="flex flex-col gap-2 rounded-card border border-rule bg-surface p-4 shadow-card">
      <header className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold">{x.name}</h3>
        <Badge tone={x.kind === "partner" ? "brand" : "neutral"}>{x.kind === "partner" ? "Partner" : "SpotOn"}</Badge>
        {x.featured && <Badge tone="brand">New</Badge>}
      </header>
      <p className="text-sm">{rec.reasons[0] ?? x.problem}</p>
      <dl className="grid gap-2 text-sm">
        <div>
          <H>May help with</H>
          <dd className="text-muted">{x.costDriver}</dd>
        </div>
        <div>
          <H>Check first</H>
          <dd className="text-muted">{x.requirements[0]}</dd>
        </div>
      </dl>
      <details className="text-sm">
        <summary className="cursor-pointer text-xs font-semibold text-link">More details</summary>
        <div className="mt-2 grid gap-2 rounded-ctl bg-surface-2 p-3">
          <p>{x.problem}</p>
          <ul className="list-disc pl-5">
            {x.mechanism.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <p className="text-muted">Influences: {INFLUENCE_LABELS[x.influences]}. {x.nature === "workflow" ? "Changes a workflow." : x.nature === "efficiency" ? "Saves time or speeds service; not a direct cost lever." : "Gives visibility; not a direct cost lever."}</p>
          {x.requirements.length > 1 && (
            <ul className="list-disc pl-5 text-muted">
              {x.requirements.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
          {x.examples && x.examples.length > 0 && (
            <div>
              <p className="font-semibold">{x.id === "sam" ? "What operators ask" : "Example requests"}</p>
              <ul className="list-disc pl-5">
                {x.examples.map((q) => (
                  <li key={q}>“{q}”</li>
                ))}
              </ul>
              <p className="text-xs text-muted">Examples from SpotOn&apos;s own materials. Not a promise of any particular result.</p>
            </div>
          )}
          {x.claims && x.claims.length > 0 && (
            <div>
              <p className="font-semibold">SpotOn reports</p>
              <ul className="list-disc pl-5">
                {x.claims.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p className="text-xs text-muted">Figures published by SpotOn. Not a prediction for this restaurant.</p>
            </div>
          )}
          {rec.reasons.length > 1 && <p className="text-muted">Also: {rec.reasons.slice(1).join(" · ")}</p>}
          {proof.length > 0 && (
            <p>
              Used in:{" "}
              {proof.map((c, i) => (
                <span key={c.id}>
                  {i > 0 && ", "}
                  <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-link underline">
                    {c.name}
                  </a>
                </span>
              ))}{" "}
              <span className="text-muted">(alongside other products)</span>
            </p>
          )}
          <a href={x.link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-link underline">
            {x.link.status === "verified_product_page" ? "Product page" : x.link.status === "provided_link" ? "Help article" : "Vendor site"} <ExternalLink className="h-3 w-3" aria-hidden />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          {x.moreLinks?.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-link underline">
              {l.label} <ExternalLink className="h-3 w-3" aria-hidden />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ))}
        </div>
      </details>
    </article>
  );
}
