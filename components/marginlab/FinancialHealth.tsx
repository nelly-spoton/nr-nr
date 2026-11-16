"use client";
import { ArrowDown, ArrowUp, Equal } from "lucide-react";
import Link from "next/link";
import { SEGMENT_LABELS } from "@/config/stats";
import { BAND_LABEL, buildHealth, nearNote, PEER_LABEL, type HealthRow, type PeerStatus } from "@/lib/health";
import { pct, pts, usd } from "@/lib/format";
import { Badge, Callout, ContentCard, MetricCard, SectionHeader } from "./Cards";
import { ComparisonBar } from "./ComparisonBar";
import { ExpensesPanel } from "./ExpensesPanel";
import { FormField, SegmentedControl } from "./Fields";
import { useScenario } from "./ScenarioProvider";

const ICON = { below: ArrowDown, near: Equal, above: ArrowUp, none: null } as const;

function StatusBadge({ status }: { status: PeerStatus }) {
  const Icon = ICON[status];
  return (
    <Badge tone={status === "none" ? "neutral" : status === "near" ? "neutral" : "brand"}>
      {Icon && <Icon className="mr-1 h-3 w-3" aria-hidden />}
      {PEER_LABEL[status]}
    </Badge>
  );
}

const SEG_SHORT = { full_service: "full-service", limited_service: "limited-service", all: "" } as const;
/** Published medians are given to one decimal; show them that way. */
const med = (n: number) => `${n.toFixed(1)}%`;
const sign = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(1)} pts`;

function Row({ row, windowPts }: { row: HealthRow; windowPts: number }) {
  const seg = row.stat ? SEG_SHORT[row.stat.segment] : "";
  const who = row.stat ? seg + (row.stat.subSegment ? ", " + BAND_LABEL[row.stat.subSegment] : "") : "";
  return (
    <li className="rounded-card border border-rule bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{row.label}</h3>
          <p className="tabular text-2xl font-semibold tracking-tight">
            {row.valuePct === null ? "—" : pct(row.valuePct)}
            {row.monthly !== null && <span className="ml-2 text-sm font-normal text-muted">{usd(row.monthly)}/mo</span>}
          </p>
          {row.detail && <p className="text-xs text-muted">{row.detail}</p>}
        </div>
        <StatusBadge status={row.status} />
      </div>

      {row.stat && row.valuePct !== null ? (
        <>
          <ComparisonBar
            value={row.valuePct}
            median={row.stat.value}
            windowPts={windowPts}
            status={row.status}
            label={`${row.label} ${pct(row.valuePct)} versus ${seg} median ${pct(row.stat.value)}`}
          />
          <p className="mt-2 text-sm">
            <strong className="tabular">{row.deltaPts !== null ? sign(row.deltaPts) : ""}</strong> vs. the {med(row.stat.value)} median ({who})
          </p>
          {row.band && (
            <p className="text-sm text-muted">
              vs. {BAND_LABEL[row.band.stat.subSegment ?? ""] ?? "sales band"} ({med(row.band.stat.value)}): <span className="tabular">{sign(row.band.deltaPts)}</span>
            </p>
          )}
          {row.qualification && <p className="mt-1 text-xs text-warn">{row.qualification}</p>}
          {row.statsHref && (
            <p className="mt-1 text-xs text-muted">
              <Link href={row.statsHref} className="font-semibold text-link underline">
                Source and definition
              </Link>
            </p>
          )}
        </>
      ) : (
        <p className="mt-2 text-sm text-muted">{row.noBenchmarkReason}</p>
      )}
    </li>
  );
}

/** "Restaurant Financial Health": peer-median comparisons plus an honest profitability status. */
export function FinancialHealth() {
  const { scenario: s, result: r, update } = useScenario();
  const h = buildHealth(s, r);
  const p = h.profit;
  const rows = h.rows.filter((x) => !(x.id === "pretax" && p.status === "unknown"));

  return (
    <ContentCard className="border-brand/30" >
      <SectionHeader
        title="Restaurant Financial Health"
        description="How this restaurant compares with published medians. Context, not a score."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Total prime cost" value={pct(r.current.prime)} sub={`${usd(r.current.primeMonthly)}/mo · cost mix, not profit`} />
        <MetricCard
          label="Annual cost-reduction opportunity"
          value={r.sales.resolved ? usd(r.savings.annualTotal) : "—"}
          sub={`Hypothetical · ${pts(r.improvement.totalPts)} improvement`}
          tone="good"
        />
        <MetricCard
          label="Profitability status"
          value={p.status === "unknown" ? "Not yet determined" : p.label.split(" ")[0] === "Verified" ? "Verified" : "Estimated"}
          sub={
            p.status === "unknown"
              ? `${p.addressed} of ${p.total} expense lines addressed`
              : `${p.direction === "loss" ? "Loss" : p.direction === "profit" ? "Profit" : "Break-even"} ${usd(p.pretaxAnnual)}/yr pretax`
          }
          className="[&>div:nth-child(2)]:text-xl"
        />
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <p className="text-xs text-muted">
          {nearNote(s.nearWindowPts)} Bar: you (fill) vs. median (line); shaded = near.
        </p>
        <FormField label="“Near” window" htmlFor="window-group">
          <SegmentedControl
            label="Near window in percentage points"
            className="sm:w-72"
            value={String(s.nearWindowPts)}
            onChange={(v) => update({ nearWindowPts: Number(v) })}
            options={["0.5", "1", "1.5", "2", "3"].map((v) => ({ value: v, label: `±${v}` }))}
          />
        </FormField>
      </div>

      {!r.cogs.valid && <div className="mb-4"><Callout>{r.cogs.problems[0]}</Callout></div>}

      <ul className="grid gap-3 md:grid-cols-2">
        {rows.map((row) => (
          <Row key={row.id} row={row} windowPts={h.windowPts} />
        ))}
      </ul>

      {h.laborContext && (
        <p className="mt-4 rounded-ctl bg-surface-2 p-3 text-xs text-muted">
          <strong className="text-ink">Labor context ({SEGMENT_LABELS[h.segment!].toLowerCase()}):</strong> median {med(h.laborContext.profitable.value)} for
          profitable operators vs. {med(h.laborContext.unprofitable.value)} for unprofitable ones. Group medians, not a threshold.
        </p>
      )}

      <div className="mt-4 rounded-card border border-rule bg-surface-2 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Profitability</h3>
        <p className="mt-1 text-lg font-semibold">{p.label}</p>
        {p.status === "unknown" ? (
          <>
            <p className="mt-1 text-sm text-muted">
              Prime cost alone doesn&apos;t show profit. Add the other expenses to estimate it. {p.reason}
            </p>
            {p.missing.length > 0 && p.addressed > 0 && (
              <p className="mt-1 text-xs text-muted">Still to address: {p.missing.join("; ")}.</p>
            )}
          </>
        ) : (
          <>
            <p className="tabular mt-1 text-sm">
              {p.status === "verified" ? "" : "Estimated "}pretax {p.direction === "loss" ? "loss" : p.direction === "profit" ? "profit" : "break-even"}:{" "}
              <strong>{usd(p.pretaxMonthly)}/mo</strong> · <strong>{usd(p.pretaxAnnual)}/yr</strong> · {pct(p.marginPct ?? 0)} of net sales
            </p>
            <div className="mt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">{p.status === "verified" ? "Basis" : "Assumptions"}</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-muted">
                {p.assumptions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </>
        )}
        <div className="mt-3">
          <ExpensesPanel />
        </div>
      </div>
    </ContentCard>
  );
}
