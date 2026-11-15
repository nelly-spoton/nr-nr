"use client";
import { Badge, ContentCard } from "./Cards";
import { NumberField } from "./Fields";
import { RANGE_STATUS_LABEL, type RangeStatus } from "@/lib/calc";
import { pct } from "@/lib/format";
import type { Range } from "@/lib/types";

const TONE = { within: "good", above: "warn", below: "brand" } as const;

export function BenchmarkCard({
  id,
  title,
  tooltipNote,
  current,
  range,
  onRange,
  status,
  medianLine,
  origin,
}: {
  id: string;
  title: string;
  tooltipNote?: string;
  current: number;
  range: Range;
  onRange: (r: Range) => void;
  status: RangeStatus;
  medianLine?: string;
  origin?: "illustrative" | "operator" | "none";
}) {
  return (
    <ContentCard className="print-avoid-break">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">{title}</h3>
          <p className="tabular text-3xl font-extrabold tracking-tight">{pct(current)}</p>
        </div>
        {status === "unset" ? (
          <Badge>No planning range set</Badge>
        ) : (
          <Badge tone={TONE[status]}>{RANGE_STATUS_LABEL[status]}</Badge>
        )}
      </div>
      <fieldset className="mt-4">
        <legend className="mb-1.5 flex flex-wrap items-center gap-2 text-sm font-semibold">
          Planning range (editable)
          {origin === "illustrative" && <Badge tone="neutral">B · Illustrative</Badge>}
          {origin === "operator" && <Badge tone="brand">C · Operator target</Badge>}
        </legend>
        <div className="flex items-center gap-2">
          <NumberField
            id={`${id}-min`}
            ariaLabel={`${title} planning range minimum`}
            value={range.min}
            suffix="%"
            onChange={(v) => onRange({ ...range, min: v })}
          />
          <span aria-hidden className="text-muted">
            –
          </span>
          <NumberField
            id={`${id}-max`}
            ariaLabel={`${title} planning range maximum`}
            value={range.max}
            suffix="%"
            onChange={(v) => onRange({ ...range, max: v })}
          />
        </div>
      </fieldset>
      {medianLine && <p className="mt-3 text-xs text-muted">{medianLine}</p>}
      {tooltipNote && <p className="mt-1 text-xs text-muted">{tooltipNote}</p>}
    </ContentCard>
  );
}
