"use client";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  BEVSPOT_BANNER,
  DEFINITIONS,
  EVIDENCE_LABELS,
  NO_ALCOHOL_BENCHMARK,
  SEGMENT_LABELS,
  SOURCES,
  STATS,
  STAT_BY_ID,
  metricLabel,
  type MetricKey,
  type Segment,
  type Stat,
  type StatCategory,
} from "@/config/stats";
import { Badge, Callout, ContentCard, PageHeader, SectionHeader } from "@/components/marginlab/Cards";
import { SegmentedControl, SelectField } from "@/components/marginlab/Fields";
import { useScenario } from "@/components/marginlab/ScenarioProvider";
import { StatCard } from "@/components/marginlab/StatCard";
import { buildHealth } from "@/lib/health";

type SegFilter = "any" | Segment;

const CATEGORIES: Array<{ id: StatCategory; letter: string; title: string; blurb: string }> = [
  { id: "financial", letter: "A", title: "Financial Benchmarks", blurb: "Prime cost and pretax margin." },
  { id: "food_beverage", letter: "B", title: "Food & Beverage Economics", blurb: "Food and nonalcoholic cost, and separately kept alcohol references." },
  { id: "labor_profit", letter: "C", title: "Labor & Profitability", blurb: "Labor cost, including how it differed between profitable and unprofitable operators." },
];

const chartData = (key: MetricKey) => ({
  metric: metricLabel[key],
  "Full-service": STAT_BY_ID[`nra-fs-${key === "food_cost" ? "food" : key === "labor" ? "labor" : "margin"}`]!.value,
  "Limited-service": STAT_BY_ID[`nra-ls-${key === "food_cost" ? "food" : key === "labor" ? "labor" : "margin"}`]!.value,
});

function matches(s: Stat, q: string): boolean {
  if (!q) return true;
  const src = SOURCES[s.sourceId]!;
  const hay = [s.metric, s.explanation, s.operatorMeaning, src.organization, src.title, src.dataPeriod, SEGMENT_LABELS[s.segment], EVIDENCE_LABELS[s.evidence], metricLabel[s.metricKey]]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((w) => hay.includes(w));
}

export default function StatsPage() {
  const { scenario, result, update } = useScenario();
  const comparable = useMemo(() => buildHealth(scenario, result).comparableIds, [scenario, result]);
  const [q, setQ] = useState("");
  const [seg, setSeg] = useState<SegFilter>("any");
  const [metric, setMetric] = useState<string>("any");
  const [year, setYear] = useState<string>("any");

  const years = useMemo(() => [...new Set(STATS.map((s) => SOURCES[s.sourceId]!.dataPeriod))], []);
  const metrics = useMemo(() => [...new Set(STATS.map((s) => s.metricKey))], []);
  const filtered = STATS.filter(
    (s) =>
      (seg === "any" || s.segment === seg) &&
      (metric === "any" || s.metricKey === metric) &&
      (year === "any" || SOURCES[s.sourceId]!.dataPeriod === year) &&
      matches(s, q),
  );
  const searching = q.trim() !== "";
  const showRef = seg === "any" && metric === "any" && year === "any";
  const qLower = q.toLowerCase();

  const counts = {
    measured: STATS.filter((s) => s.evidence === "published_measured").length,
    vendor: STATS.filter((s) => s.evidence === "vendor_historical").length,
    planning: STATS.filter((s) => s.evidence === "illustrative_planning").length,
  };
  const orgs = [...new Set(STATS.map((s) => SOURCES[s.sourceId]!.organization))];
  const pick = (stat: Stat, on: boolean) =>
    update((x) => {
      const next = { ...x.benchmarkPick };
      if (on) next[stat.metricKey] = stat.id;
      else delete next[stat.metricKey];
      return { ...x, benchmarkPick: next };
    });

  const card = (s: Stat) => (
    <StatCard key={s.id} stat={s} comparable={comparable.has(s.id)} picked={scenario.benchmarkPick[s.metricKey] === s.id} onPick={(on) => pick(s, on)} />
  );

  return (
    <>
      <PageHeader
        title="Industry Stats"
        description="A research reference library for a discovery conversation. It works on its own; it does not need the calculator."
      />

      <ContentCard className="mb-6">
        <SectionHeader title="Research summary" />
        <p className="text-sm">
          Published restaurant medians from the National Restaurant Association (2025 abstract, 2024 financial data), kept separate from a
          historical vendor reference on beverage cost and from illustrative planning guidelines. Medians describe the middle restaurant; they are
          not targets and not predictions for any one restaurant. There is no geographic data.
        </p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Statistics</dt>
            <dd className="tabular text-2xl font-semibold">{STATS.length}</dd>
            <dd className="text-xs text-muted">
              {counts.measured} published · {counts.vendor} historical vendor · {counts.planning} planning guidelines
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Last verified</dt>
            <dd className="text-base font-semibold">Supplied 2026-11-16</dd>
            <dd className="text-xs text-muted">None independently checked against the publications yet.</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Source organizations</dt>
            <dd className="text-base font-semibold">{orgs.join(" · ")}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Data years</dt>
            <dd className="text-base font-semibold">{years.filter((y) => /^\d/.test(y)).map((y) => y.split(" ")[0]).join(" · ")}</dd>
          </div>
        </dl>
        <div className="mt-4">
          <label htmlFor="stat-search" className="text-sm font-semibold">
            Search statistics
          </label>
          <input
            id="stat-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. labor, full-service, pretax, BevSpot"
            className="mt-1.5 min-h-11 w-full rounded-ctl border border-rule bg-surface px-3 text-base sm:text-sm"
          />
        </div>
      </ContentCard>

      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_12rem_12rem]">
        <div>
          <p className="mb-1.5 text-sm font-semibold">Restaurant segment</p>
          <SegmentedControl
            label="Restaurant segment"
            value={seg}
            onChange={setSeg}
            options={[
              { value: "any", label: "Show all" },
              { value: "full_service", label: "Full-service" },
              { value: "limited_service", label: "Limited" },
              { value: "all", label: "All types" },
            ]}
          />
        </div>
        <div>
          <label htmlFor="metric-filter" className="mb-1.5 block text-sm font-semibold">Financial metric</label>
          <SelectField id="metric-filter" value={metric} onChange={setMetric} options={[{ value: "any", label: "All metrics" }, ...metrics.map((m) => ({ value: m, label: metricLabel[m] }))]} />
        </div>
        <div>
          <label htmlFor="year-filter" className="mb-1.5 block text-sm font-semibold">Publication / data year</label>
          <SelectField id="year-filter" value={year} onChange={setYear} options={[{ value: "any", label: "All years" }, ...years.map((y) => ({ value: y, label: y }))]} />
        </div>
      </div>

      <ContentCard className="mb-8">
        <SectionHeader title="Comparison charts" description="Published medians, full-service vs. limited-service (NRA 2025 abstract, 2024 data)." />
        <div className="grid gap-6 md:grid-cols-2">
          <div role="img" aria-label="Food cost, labor cost and pretax margin medians for full-service versus limited-service restaurants" className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(["food_cost", "labor", "pretax_margin"] as MetricKey[]).map(chartData)} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="var(--rule)" vertical={false} />
                <XAxis dataKey="metric" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis unit="%" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Full-service" fill="var(--brand)" isAnimationActive={false} />
                <Bar dataKey="Limited-service" fill="var(--teal)" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div role="img" aria-label="Labor cost medians for profitable versus unprofitable operators, by segment" className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { segment: "Full-service", Profitable: STAT_BY_ID["nra-fs-labor-profitable"]!.value, Unprofitable: STAT_BY_ID["nra-fs-labor-unprofitable"]!.value },
                  { segment: "Limited-service", Profitable: STAT_BY_ID["nra-ls-labor-profitable"]!.value, Unprofitable: STAT_BY_ID["nra-ls-labor-unprofitable"]!.value },
                ]}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid stroke="var(--rule)" vertical={false} />
                <XAxis dataKey="segment" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis unit="%" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Profitable" name="Labor, profitable operators" fill="var(--brand)" isAnimationActive={false} />
                <Bar dataKey="Unprofitable" name="Labor, unprofitable operators" fill="var(--teal)" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">
          Each bar is a separately published median. Medians are not added together, and no measured full-service prime-cost median is published.
        </p>
      </ContentCard>

      <div className="flex flex-col gap-10">
        {CATEGORIES.map((c) => {
          const items = filtered.filter((s) => s.category === c.id);
          if (!items.length) return null;
          const bev = c.id === "food_beverage";
          const alcohol = items.filter((s) => s.evidence === "vendor_historical");
          const rest = items.filter((s) => s.evidence !== "vendor_historical");
          return (
            <section key={c.id} aria-labelledby={`cat-${c.id}`}>
              <span id={`cat-${c.id}`} className="sr-only">{c.title}</span>
              <SectionHeader title={`${c.letter} · ${c.title}`} description={c.blurb} />
              {rest.length > 0 && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rest.map(card)}</div>}
              {bev && (alcohol.length > 0 || showRef) && (
                <div className="mt-6">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">Alcoholic beverage references (kept separate from NRA medians)</h3>
                  <Callout>{BEVSPOT_BANNER}</Callout>
                  <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {alcohol.map(card)}
                    <article className="flex flex-col gap-2 rounded-card border border-rule bg-surface p-5 shadow-card">
                      <Badge>Current alcohol benchmark</Badge>
                      <p className="text-lg font-semibold">{NO_ALCOHOL_BENCHMARK}</p>
                      <p className="text-sm text-muted">
                        No validated modern benchmark for beer, liquor or wine cost is available in this library. Use the operator&apos;s own current figures.
                      </p>
                    </article>
                  </div>
                </div>
              )}
            </section>
          );
        })}
        {filtered.length === 0 && (
          <p className="rounded-ctl border border-rule bg-surface-2 p-4 text-sm text-muted">No statistics match these filters. Clear the search or filters to see them all.</p>
        )}

        {(showRef || searching) && (
          <>
            <section aria-labelledby="cat-D">
              <span id="cat-D" className="sr-only">Restaurant Economics 101</span>
              <SectionHeader title="D · Restaurant Economics 101" description="Definitions and formulas used throughout MarginLab." />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {DEFINITIONS.filter((d) => !searching || `${d.term} ${d.body} ${d.formula ?? ""}`.toLowerCase().includes(qLower)).map((d) => (
                  <article key={d.id} id={d.id} className="rounded-card border border-rule bg-surface p-5 shadow-card">
                    <Badge>Definition</Badge>
                    <h3 className="mt-2 text-base font-semibold">{d.term}</h3>
                    <p className="mt-1 text-sm">{d.body}</p>
                    {d.formula && <p className="mt-2 rounded-ctl bg-surface-2 p-2 font-mono text-xs">{d.formula}</p>}
                  </article>
                ))}
              </div>
            </section>

            <section aria-labelledby="cat-E">
              <span id="cat-E" className="sr-only">Research Sources</span>
              <SectionHeader title="E · Research Sources" />
              <ul className="grid gap-4 md:grid-cols-2">
                {Object.values(SOURCES)
                  .filter((s) => !searching || `${s.organization} ${s.title}`.toLowerCase().includes(qLower))
                  .map((s) => (
                    <li key={s.id} className="rounded-card border border-rule bg-surface p-5 shadow-card">
                      <h3 className="text-base font-semibold">{s.title}</h3>
                      <p className="text-sm text-muted">{s.organization}</p>
                      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                        <dt className="text-muted">Data period</dt>
                        <dd>{s.dataPeriod}</dd>
                        <dt className="text-muted">Published</dt>
                        <dd>{s.publicationDate ?? (s.publicationYear ? `${s.publicationYear} (exact date not captured)` : "—")}</dd>
                        <dt className="text-muted">Sample</dt>
                        <dd>{s.sample}</dd>
                        <dt className="text-muted">Link</dt>
                        <dd>
                          {s.url ? (
                            <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-link underline">
                              {s.urlStatus === "publisher_home" ? "Publisher site (no deep link captured)" : s.url}
                            </a>
                          ) : (
                            "No source link captured"
                          )}
                        </dd>
                      </dl>
                      <p className="mt-2 text-xs text-muted">{s.note}</p>
                    </li>
                  ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </>
  );
}
