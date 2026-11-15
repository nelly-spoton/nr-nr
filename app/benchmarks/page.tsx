"use client";
import { ExternalLink } from "lucide-react";
import {
  BENCHMARK_KINDS,
  ILLUSTRATIVE_RANGES,
  NRA_SOURCE,
  PLANNING_NOTE,
  REFERENCE_MEDIANS,
  defaultPlanningFor,
} from "@/config/benchmarks";
import { CONCEPT_BY_ID, CONCEPT_LABELS } from "@/config/concepts";
import { BenchmarkCard } from "@/components/marginlab/BenchmarkCard";
import { SecondaryButton } from "@/components/marginlab/Buttons";
import { Badge, Callout, ContentCard, MetricCard, PageHeader, SectionHeader } from "@/components/marginlab/Cards";
import { DataTable } from "@/components/marginlab/DataTable";
import { useScenario } from "@/components/marginlab/ScenarioProvider";
import { pct, pts, usd } from "@/lib/format";
import { buildReport } from "@/lib/report";
import type { PlanningRanges, Range } from "@/lib/types";

export default function BenchmarksPage() {
  const { scenario: s, result: r, update } = useScenario();
  const rep = buildReport(s, r);
  const planning = s.planning[s.concept];
  const cmp = rep.comparison;
  const med = rep.medians.set;
  const def = CONCEPT_BY_ID[s.concept];

  const setRange = (k: "food" | "labor" | "prime", v: Range) =>
    update((x) => ({ ...x, planning: { ...x.planning, [x.concept]: { ...x.planning[x.concept], [k]: v, origin: "operator" } } }));
  const setAll = (p: PlanningRanges) => update((x) => ({ ...x, planning: { ...x.planning, [x.concept]: p } }));
  const delta = (cur: number, m: number) => `${cur - m >= 0 ? "+" : "−"}${Math.abs(cur - m).toFixed(2)} pts vs. published median`;

  return (
    <>
      <PageHeader
        title="Prime Cost Benchmarks"
        description={`How ${s.restaurantName || "this restaurant"}'s cost ratios compare with published medians and the targets you set. Context for discussion, not a verdict.`}
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Food & beverage" value={pct(r.current.food)} sub={`${usd(r.current.foodMonthly)}/mo`} />
        <MetricCard label="Labor" value={pct(r.current.labor)} sub={`${usd(r.current.laborMonthly)}/mo`} />
        <MetricCard
          label="Prime cost"
          value={pct(r.current.prime)}
          sub={`${usd(r.current.primeMonthly)}/mo`}
          tooltip="Prime cost % = food & beverage COGS % + labor %. All on one net-sales denominator."
        />
      </div>

      <ContentCard tone="muted" className="mb-6">
        <SectionHeader title="Four kinds of numbers" description="MarginLab keeps these separate and never relabels one as another." />
        <ul className="grid gap-3 md:grid-cols-2">
          {BENCHMARK_KINDS.map((k) => (
            <li key={k.id} className="flex gap-3 text-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface font-semibold text-accent">{k.id}</span>
              <span>
                <strong>{k.label}.</strong> <span className="text-muted">{k.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </ContentCard>

      {rep.medians.qualification && (
        <div className="mb-6">
          <Callout tone={def.alcoholLed ? "warn" : "info"}>
            <strong>{CONCEPT_LABELS[s.concept]}:</strong> {rep.medians.qualification}
          </Callout>
        </div>
      )}

      <SectionHeader
        title="Your cost ratios vs. planning ranges"
        description={PLANNING_NOTE}
        action={
          <SecondaryButton size="sm" onClick={() => setAll(defaultPlanningFor(s.concept))}>
            Reset ranges
          </SecondaryButton>
        }
      />
      {planning.origin === "none" && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">No illustrative range exists for this concept. Enter your own, or borrow a starting point:</span>
          {(["full_service", "quick_service"] as const).map((k) => (
            <SecondaryButton
              key={k}
              size="sm"
              onClick={() => {
                const r2 = ILLUSTRATIVE_RANGES[k];
                setAll({ food: { ...r2.food }, labor: { ...r2.labor }, prime: { ...r2.prime }, origin: "illustrative" });
              }}
            >
              {k === "full_service" ? "Full-service range" : "Quick-service range"}
            </SecondaryButton>
          ))}
        </div>
      )}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <BenchmarkCard
          id="bm-food"
          title="Food & beverage cost"
          current={r.current.food}
          range={planning.food}
          origin={planning.origin}
          onRange={(v) => setRange("food", v)}
          status={cmp.food}
          medianLine={med ? `${delta(r.current.food, med.foodPct)} (${pct(med.foodPct)}; excludes alcoholic beverage cost)` : undefined}
        />
        <BenchmarkCard
          id="bm-labor"
          title="Labor cost"
          current={r.current.labor}
          range={planning.labor}
          origin={planning.origin}
          onRange={(v) => setRange("labor", v)}
          status={cmp.labor}
          medianLine={med ? `${delta(r.current.labor, med.laborPct)} (${pct(med.laborPct)}, including benefits)` : undefined}
        />
        <BenchmarkCard
          id="bm-prime"
          title="Prime cost"
          current={r.current.prime}
          range={planning.prime}
          origin={planning.origin}
          onRange={(v) => setRange("prime", v)}
          status={cmp.prime}
          medianLine="No published median prime cost is shown: the Association reports food and labor medians separately."
        />
      </div>

      <ContentCard className="mb-6">
        <SectionHeader
          title="D · AI-generated estimates"
          description="None in this version. If website research is added later, its estimates will be labeled separately, shown as low/base/high assumptions with sources, and never treated as verified."
        />
      </ContentCard>

      <ContentCard>
        <SectionHeader
          title="A · Published reference medians"
          description="Historical industry medians, not ideal targets."
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
                  {m.label} {med?.id === m.id && <Badge tone="good">Shown for this concept</Badge>}
                </span>
              ),
            },
            { key: "food", header: "Food & nonalcoholic beverage", align: "right", render: (m) => pct(m.foodPct) },
            { key: "labor", header: "Labor incl. benefits", align: "right", render: (m) => pct(m.laborPct) },
            {
              key: "diff",
              header: "Your gap (food / labor)",
              align: "right",
              render: (m) => (med?.id === m.id ? `${pts(r.current.food - m.foodPct)} / ${pts(r.current.labor - m.laborPct)}` : "—"),
            },
          ]}
        />
        <div className="mt-4 space-y-2 text-sm text-muted">
          <p>
            <strong className="text-ink">Source:</strong> {NRA_SOURCE.publisher}, <em>{NRA_SOURCE.title}</em>, using {NRA_SOURCE.dataPeriod}.{" "}
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
