"use client";
import { ExternalLink } from "lucide-react";
import { EVIDENCE_LABELS, SEGMENT_LABELS, SOURCES, SUBSEGMENT_LABELS, type Stat } from "@/config/stats";
import { cn } from "@/lib/utils";
import { Badge } from "./Cards";
import { PrimaryButton, SecondaryButton, buttonStyles } from "./Buttons";

/** One statistic: the number and a one-line meaning up front; definition, sample and sources on demand. */
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
  const note = stat.condition ? `Median, ${stat.condition} operators` : stat.evidence === "illustrative_planning" ? "Range" : "Median";
  const historical = stat.evidence === "vendor_historical";
  return (
    <article
      id={stat.id}
      className={cn(
        "scroll-mt-20 flex flex-col gap-2 rounded-card border bg-surface p-4",
        historical ? "border-warn/40" : "border-rule",
        picked && "ring-2 ring-brand",
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge>{SEGMENT_LABELS[stat.segment]}</Badge>
        {stat.subSegment && <Badge>{SUBSEGMENT_LABELS[stat.subSegment]}</Badge>}
        {stat.evidence !== "published_measured" && <Badge tone="warn">{EVIDENCE_LABELS[stat.evidence]}</Badge>}
      </div>
      <h3 className="text-sm font-semibold">{stat.metric}</h3>
      <p className="tabular text-3xl font-semibold tracking-tight">
        {value} <span className="text-sm font-normal text-muted">{note}</span>
      </p>
      <p className="text-sm text-muted">{stat.operatorMeaning}</p>
      {historical && <p className="text-xs font-semibold text-warn">2016, BevSpot customers only. Not a current industry average.</p>}

      <details className="text-sm">
        <summary className="cursor-pointer text-xs font-semibold text-link">Details and source</summary>
        <dl className="mt-2 grid gap-2 rounded-ctl bg-surface-2 p-3">
          <p>{stat.explanation}</p>
          <div>
            <dt className="text-xs font-semibold text-muted">Source</dt>
            <dd>
              {src.organization}, {src.title} · data {src.dataPeriod}
              {src.publicationYear ? ` · published ${src.publicationYear}` : ""}
              {src.publicationDate ? ` (${src.publicationDate})` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-muted">Measured as</dt>
            <dd>
              {stat.numerator} ÷ {stat.denominator}
              {!stat.definitionConfirmed && <span className="text-warn"> (definition not yet confirmed)</span>}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-muted">Sample</dt>
            <dd>{src.sample}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-muted">Last verified</dt>
            <dd>{stat.lastVerified.status === "verified" ? stat.lastVerified.on : `Supplied by the SpotOn team ${stat.lastVerified.on}; not independently checked`}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-muted">Keep in mind</dt>
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

      <footer className="mt-auto flex flex-wrap items-center gap-2 pt-1">
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
    </article>
  );
}
