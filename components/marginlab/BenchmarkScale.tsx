import { ArrowDown, ArrowUp, Equal } from "lucide-react";
import Link from "next/link";
import { SEGMENT_LABELS } from "@/config/stats";
import type { HealthRow, PeerStatus } from "@/lib/health";
import { pct } from "@/lib/format";
import { scaleGeometry } from "@/lib/scale";
import { cn } from "@/lib/utils";

const STATUS_TEXT: Record<PeerStatus, string> = {
  below: "Below the median",
  near: "Near the median",
  above: "Above the median",
  none: "No comparable benchmark",
};
const STATUS_ICON = { below: ArrowDown, near: Equal, above: ArrowUp, none: null } as const;

/** One short line on the scale; the full wording lives on Step 2 and Industry Stats. */
const shortNote = (q: string) =>
  /NONALCOHOLIC/.test(q) ? "The median excludes alcohol; this is food cost as a % of all sales." : q;

const pts = (n: number) => `${Math.abs(n).toFixed(1)} point${Math.abs(n).toFixed(1) === "1.0" ? "" : "s"}`;

/**
 * One cost on a horizontal scale: the restaurant's marker against the published median,
 * with the "typical" band shaded. Descriptive only: no good/bad colors.
 */
export function BenchmarkScale({ title, note, row, windowPts }: { title: string; note?: string; row: HealthRow; windowPts: number }) {
  const hasScale = !!row.stat && row.valuePct !== null;
  const g = hasScale ? scaleGeometry(row.valuePct!, row.stat!.value, windowPts) : null;
  const Icon = STATUS_ICON[row.status];
  const seg = row.stat ? SEGMENT_LABELS[row.stat.segment].toLowerCase() : "";
  const sentence =
    hasScale && row.deltaPts !== null
      ? row.status === "near"
        ? `Within ${windowPts} point${windowPts === 1 ? "" : "s"} of the ${row.stat!.value.toFixed(1)}% ${seg} median`
        : `${pts(row.deltaPts)} ${row.deltaPts > 0 ? "above" : "below"} the ${row.stat!.value.toFixed(1)}% ${seg} median`
      : null;

  return (
    <li className="flex flex-col rounded-card border border-rule bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{title}</h3>
          <p className="tabular text-4xl font-semibold tracking-tight">{row.valuePct === null ? "—" : pct(row.valuePct)}</p>
          {note && <p className="text-xs text-muted">{note}</p>}
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
            row.status === "none" ? "bg-surface-2 text-muted" : row.status === "near" ? "bg-lime text-ink" : "bg-brand-soft text-brand",
          )}
        >
          {Icon && <Icon className="mr-1 h-3.5 w-3.5" aria-hidden />}
          {STATUS_TEXT[row.status]}
        </span>
      </div>

      {g && row.stat ? (
        <>
          <div
            role="img"
            aria-label={`${title} ${pct(row.valuePct!)}. ${sentence}. Scale from ${g.lo.toFixed(0)}% to ${g.hi.toFixed(0)}%.`}
            className="relative mx-4 mb-10 mt-12 h-6"
          >
            {/* track: below | typical | above */}
            <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 overflow-hidden rounded-full bg-brand-soft" aria-hidden>
              <div className="absolute inset-y-0 bg-lime" style={{ left: `${g.nearFrom}%`, width: `${g.nearTo - g.nearFrom}%` }} />
            </div>
            {/* median tick + label */}
            <div className="absolute top-1/2 h-8 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-ink" style={{ left: `${g.medianPos}%` }} aria-hidden />
            <span
              className="tabular absolute top-[calc(50%+1.25rem)] -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold text-ink"
              style={{ left: `${g.medianPos}%` }}
              aria-hidden
            >
              Median {row.stat.value.toFixed(1)}%
            </span>
            {/* the restaurant */}
            <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${g.pos}%` }} aria-hidden>
              <span className="tabular absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-nav px-2.5 py-1 text-xs font-semibold text-white">
                {g.clamped === "low" ? "◀ " : ""}
                {pct(row.valuePct!)}
                {g.clamped === "high" ? " ▶" : ""}
              </span>
              <span className="block h-6 w-6 rounded-full border-4 border-white bg-nav shadow" />
            </div>
            {/* scale ends */}
            <span className="tabular absolute -bottom-9 left-0 -translate-x-1/2 text-[10px] text-muted" aria-hidden>{g.lo.toFixed(0)}%</span>
            <span className="tabular absolute -bottom-9 right-0 translate-x-1/2 text-[10px] text-muted" aria-hidden>{g.hi.toFixed(0)}%</span>
          </div>
          <p className="text-sm font-semibold">{sentence}</p>
          {row.qualification && <p className="mt-1 text-xs text-warn">{shortNote(row.qualification)}</p>}
          {row.statsHref && (
            <p className="mt-1 text-xs">
              <Link href={row.statsHref} className="font-semibold text-link underline">
                Source and definition
              </Link>
            </p>
          )}
        </>
      ) : (
        <p className="mt-3 text-sm text-muted">{row.noBenchmarkReason}</p>
      )}
    </li>
  );
}
