"use client";
import { ExternalLink } from "lucide-react";
import {
  CONCEPT_LABELS,
  NRA_SOURCE,
  PLANNING_NOTE,
  REFERENCE_MEDIANS,
  defaultPlanning,
  medianSetFor,
} from "@/config/benchmarks";
import { BenchmarkCard } from "@/components/marginlab/BenchmarkCard";
import { SecondaryButton } from "@/components/marginlab/Buttons";
import { Badge, Callout, ContentCard, MetricCard, PageHeader, SectionHeader } from "@/components/marginlab/Cards";
import { DataTable } from "@/components/marginlab/DataTable";
import { useScenario } from "@/components/marginlab/ScenarioProvider";
import { compareAll } from "@/lib/calc";
import { pct, pts, usd } from "@/lib/format";
import type { PlanningRanges, Range } from "@/lib/types";

export default function BenchmarksPage() {
  const { scenario: s, result: r, update } = useScenario();
  const planning = s.planning[s.concept];
  const cmp = compareAll(r, planning);
  const med = medianSetFor(s.concept);
  const setRange = (k: keyof PlanningRanges, v: Range) =>
    update((x) => ({ ...x, planning: { ...x.planning, [x.concept]: { ...x.planning[x.concept], [k]: v } } }));
  const delta = (cur: number, m: number) => `${cur - m >= 0 ? "+" : "−"}${Math.abs(cur - m).toFixed(2)} pts vs. published median`;
  const noRanges = s.concept === "bar" || s.concept === "custom";

  return (
    <>
      <PageHeader
        title="Prime Cost Benchmarks"
        description={`How ${s.restaurantName || "this restaurant"}'s cost ratios compare with published medians and editable planning ranges. Context for discussion, not a verdict.`}
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Food & beverage" value={pct(r.current.food)} sub={`${usd(r.current.foodMonthly)}/mo`} />
        <MetricCard label="Labor" value={pct(r.current.labor)} sub={`${usd(r.current.laborMonthly)}/mo`} />
        <MetricCard
          label="Prime cost"
          value={pct(r.current.prime)}
          sub={`${usd(r.current.primeMonthly)}/mo`}
          tooltip="Prime cost % = food & beverage COGS % + labor %. Prime cost $ = food & beverage COGS $ + labor $. All on one net-sales denominator."
        />
      </div>

      {noRanges && (
        <div className="mb-6">
          <Callout tone="info">
            <strong>{CONCEPT_LABELS[s.concept]}:</strong> no published benchmark is applied and no bar statistics are
            invented. Limited-service medians are not appropriate for bar-led concepts without qualification, so set your own
            targets below. Published tables are shown for context only.
          </Callout>
        </div>
      )}

      <SectionHeader
        title="Your cost ratios vs. planning ranges"
        description={PLANNING_NOTE}
        action={
          !noRanges ? (
            <SecondaryButton size="sm" onClick={() => update((x) => ({ ...x, planning: { ...x.planning, [x.concept]: defaultPlanning()[x.concept] } }))}>
              Reset ranges
            </SecondaryButton>
          ) : undefined
        }
      />
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <BenchmarkCard
          id="bm-food"
          title="Food & beverage cost"
          current={r.current.food}
          range={planning.food}
          onRange={(v) => setRange("food", v)}
          status={cmp.food}
          medianLine={med ? `${delta(r.current.food, med.foodPct)} (${pct(med.foodPct)}; excludes alcoholic beverage cost)` : undefined}
        />
        <BenchmarkCard
          id="bm-labor"
          title="Labor cost"
          current={r.current.labor}
          range={planning.labor}
          onRange={(v) => setRange("labor", v)}
          status={cmp.labor}
          medianLine={med ? `${delta(r.current.labor, med.laborPct)} (${pct(med.laborPct)}, including benefits)` : undefined}
        />
        <BenchmarkCard
          id="bm-prime"
          title="Prime cost"
          current={r.current.prime}
          range={planning.prime}
          onRange={(v) => setRange("prime", v)}
          status={cmp.prime}
          medianLine="No published median prime cost is shown: the Association reports food and labor medians separately."
        />
      </div>

      <ContentCard>
        <SectionHeader
          title="Published reference medians"
          description="Historical industry medians — not ideal targets."
          action={<Badge tone="brand">{NRA_SOURCE.dataPeriod}</Badge>}
        />
        <DataTable
          caption="Published reference medians"
          rowKey={(m) => m.id}
          rows={REFERENCE_MEDIANS}
          columns={[
            {
              key: "type",
              header: "Segment",
              render: (m) => (
                <span className="font-semibold">
                  {m.label}{" "}
                  {med?.id === m.id && <Badge tone="good">Applies to this concept</Badge>}
                </span>
              ),
            },
            { key: "food", header: "Food & nonalcoholic beverage", align: "right", render: (m) => pct(m.foodPct) },
            { key: "labor", header: "Labor incl. benefits", align: "right", render: (m) => pct(m.laborPct) },
            {
              key: "diff",
              header: "Your gap (food / labor)",
              align: "right",
              render: (m) =>
                med?.id === m.id ? `${pts(r.current.food - m.foodPct)} / ${pts(r.current.labor - m.laborPct)}` : "—",
            },
          ]}
        />
        <div className="mt-4 space-y-2 text-sm text-muted">
          <p>
            <strong className="text-ink">Source:</strong> {NRA_SOURCE.publisher}, <em>{NRA_SOURCE.title}</em>, using{" "}
            {NRA_SOURCE.dataPeriod}.{" "}
            <a href={NRA_SOURCE.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-link underline">
              Publisher <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          </p>
          <p>
            <strong className="text-ink">Sample context:</strong> {NRA_SOURCE.sampleContext}
          </p>
          <ul className="list-disc space-y-1 pl-5">
            {NRA_SOURCE.caveats.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </ContentCard>
    </>
  );
}
