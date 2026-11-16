"use client";
import { ExternalLink } from "lucide-react";
import { EVIDENCE_LABELS, SEGMENT_LABELS, SOURCES, SUBSEGMENT_LABELS, type Stat } from "@/config/stats";
import { cn } from "@/lib/utils";
import { Badge } from "./Cards";
import { PrimaryButton, SecondaryButton } from "./Buttons";
import { buttonStyles } from "./Buttons";

const EVIDENCE_TONE = {
  published_measured: "good",
  vendor_historical: "warn",
  illustrative_planning: "neutral",
  operator_target: "brand",
  ai_estimate: "warn",
} as const;

/** One research statistic, with its source, definition and qualifications. */
export function StatCard({
  stat,
  comparable,
  picked,
  onPick,
}: {
  stat: Stat;
  /** True only when this statistic is directly comparable to the restaurant's current inputs. */
  comparable: boolean;
  picked: boolean;
  onPick: (pick: boolean) => void;
}) {
  const src = SOURCES[stat.sourceId]!;
  const value = stat.valueMax !== undefined ? `${stat.value}–${stat.valueMax}%` : `${stat.value.toFixed(1)}%`;
  const valueNote =
    stat.evidence === "illustrative_planning" ? "Planning range" : stat.condition ? `Median, ${stat.condition} operators` : "Median";
  const historical = stat.evidence === "vendor_historical";
  return (
    <article
      id={stat.id}
      className={cn(
        "scroll-mt-20 flex flex-col gap-3 rounded-card border bg-surface p-5 shadow-card",
        historical ? "border-warn/40" : "border-rule",
        picked && "ring-2 ring-brand",
      )}
    >
      <header>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={EVIDENCE_TONE[stat.evidence]}>{EVIDENCE_LABELS[stat.evidence]}</Badge>
          <Badge>{SEGMENT_LABELS[stat.segment]}</Badge>
          {stat.subSegment && <Badge>{SUBSEGMENT_LABELS[stat.subSegment]}</Badge>}
        </div>
        <h3 className="mt-2 text-sm font-semibold uppercase tracking-[0.1em] text-accent">{stat.metric}</h3>
        <p className="tabular text-4xl font-semibold tracking-tight">{value}</p>
        <p className="text-sm text-muted">{valueNote}</p>
      </header>

      {historical && (
        <p role="note" className="rounded-ctl bg-warn-soft p-3 text-xs font-semibold text-warn">
          Historical (2016), vendor-specific research. Not a 2026 industry average.
        </p>
      )}

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="text-muted">Published</dt>
        <dd>{src.publicationYear ?? "—"}</dd>
        <dt className="text-muted">Financial data</dt>
        <dd>{src.dataPeriod}</dd>
        <dt className="text-muted">Source</dt>
        <dd>{src.organization}</dd>
      </dl>

      <p className="text-sm">{stat.explanation}</p>
      <div>
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">Why it matters</h4>
        <p className="text-sm">{stat.operatorMeaning}</p>
      </div>

      <details className="rounded-ctl border border-rule bg-surface-2 p-3 text-sm">
        <summary className="cursor-pointer font-semibold">Definition, sample and qualifications</summary>
        <dl className="mt-2 grid gap-2">
          <div>
            <dt className="text-xs font-semibold text-muted">Numerator</dt>
            <dd>{stat.numerator}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-muted">Denominator</dt>
            <dd>{stat.denominator}</dd>
          </div>
          {!stat.definitionConfirmed && <p className="text-xs text-warn">Definition not yet confirmed against the publication.</p>}
          <div>
            <dt className="text-xs font-semibold text-muted">Sample / population</dt>
            <dd>{src.sample}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-muted">Source</dt>
            <dd>{src.title}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-muted">Publication date</dt>
            <dd>{src.publicationDate ?? (src.publicationYear ? `Not captured (published ${src.publicationYear})` : "Not captured")}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-muted">Last verified</dt>
            <dd>
              {stat.lastVerified.status === "verified"
                ? stat.lastVerified.on
                : `Supplied by the SpotOn team ${stat.lastVerified.on}; not independently checked`}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-muted">Important qualifications</dt>
            <dd>
              <ul className="list-disc pl-5">
                {stat.qualifications.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </details>

      <footer className="mt-auto flex flex-wrap items-center gap-2 border-t border-rule pt-3">
        {src.url ? (
          <a href={src.url} target="_blank" rel="noopener noreferrer" className={buttonStyles({ variant: "secondary", size: "sm" })}>
            {src.urlStatus === "publisher_home" ? "View source (publisher site)" : "View source"} <ExternalLink className="h-3 w-3" aria-hidden />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <span className="text-xs text-muted">No source link captured</span>
        )}
        {comparable &&
          (picked ? (
            <SecondaryButton size="sm" onClick={() => onPick(false)}>
              Using in comparison · remove
            </SecondaryButton>
          ) : (
            <PrimaryButton size="sm" onClick={() => onPick(true)}>
              Use in benchmark comparison
            </PrimaryButton>
          ))}
      </footer>
      {src.urlStatus === "publisher_home" && (
        <p className="text-[11px] text-muted">Link goes to the publisher&apos;s site; a deep link to the publication has not been captured.</p>
      )}
    </article>
  );
}
