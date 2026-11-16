import { cn } from "@/lib/utils";
import type { PeerStatus } from "@/lib/health";

/**
 * Horizontal comparison bar: the restaurant's value (filled) against a published median (line),
 * with the "near" window shaded. Purely descriptive; no good/bad colors.
 */
export function ComparisonBar({
  value,
  median,
  windowPts,
  status,
  label,
}: {
  value: number;
  median: number;
  windowPts: number;
  status: PeerStatus;
  label: string;
}) {
  const max = Math.max(10, Math.ceil((Math.max(value, median + windowPts) * 1.25) / 5) * 5);
  const p = (x: number) => `${Math.min(100, Math.max(0, (x / max) * 100))}%`;
  const lo = Math.max(0, median - windowPts);
  const hi = median + windowPts;
  return (
    <div role="img" aria-label={label} className="relative mt-2 h-5">
      <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-rule" />
      <div
        className="absolute top-1/2 h-4 -translate-y-1/2 rounded bg-brand/15"
        style={{ left: p(lo), width: `calc(${p(hi)} - ${p(lo)})` }}
        aria-hidden
      />
      <div
        className={cn("absolute top-1/2 h-2 -translate-y-1/2 rounded-full", status === "near" ? "bg-muted" : "bg-brand")}
        style={{ width: p(value) }}
        aria-hidden
      />
      <div className="absolute top-0 h-5 w-0.5 bg-ink" style={{ left: p(median) }} aria-hidden />
    </div>
  );
}
