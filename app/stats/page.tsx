"use client";
import { useEffect, useMemo, useState } from "react";
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
  importanceOf,
  metricLabel,
  type Importance,
  type Segment,
  type Stat,
} from "@/config/stats";
import { Badge, Callout, ContentCard, PageHeader } from "@/components/marginlab/Cards";
import { Collapsible } from "@/components/marginlab/Collapsible";
import { SegmentedControl, SelectField } from "@/components/marginlab/Fields";
import { useScenario } from "@/components/marginlab/ScenarioProvider";
import { StatCard } from "@/components/marginlab/StatCard";
import { buildHealth } from "@/lib/health";

type SegFilter = "any" | Segment;
type Group = "key" | "useful" | "reference";

const v = (id: string) => STAT_BY_ID[id]!.value;
const pc = (n: number) => `${n.toFixed(1)}%`;

/** Cards on the page. Planning guidelines are retired from the UI (the data is kept). */
const SHOWN = STATS.filter((s) => s.evidence !== "illustrative_planning");

function matches(s: Stat, q: string): boolean {
  if (!q) return true;
  const src = SOURCES[s.sourceId]!;
  const hay = [s.metric, s.explanation, s.operatorMeaning, src.organization, src.title, src.dataPeriod, SEGMENT_LABELS[s.segment], EVIDENCE_LABELS[s.evidence], metricLabel[s.metricKey]]
    .join(" ")
    .toLowerCase();
  return q.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
}

const GLANCE: Array<{ label: string; fs: string; ls: string }> = [
  { label: "Food & nonalcoholic cost", fs: pc(v("nra-fs-food")), ls: pc(v("nra-ls-food")) },
  { label: "Labor (incl. benefits)", fs: pc(v("nra-fs-labor")), ls: pc(v("nra-ls-labor")) },
  { label: "Prime cost (measured)", fs: "None published", ls: pc(v("nra-ls-prime")) },
  { label: "Pretax profit margin", fs: pc(v("nra-fs-margin")), ls: pc(v("nra-ls-margin")) },
];

const laborGap = Math.round((v("nra-fs-labor-unprofitable") - v("nra-fs-labor-profitable")) * 10) / 10;
const lsLaborGap = Math.round((v("nra-ls-labor-unprofitable") - v("nra-ls-labor-profitable")) * 10) / 10;

const TALKING_POINTS = [
  {
    title: "Labor separates the winners",
    body: `Full-service labor was ${pc(v("nra-fs-labor-profitable"))} at profitable operators vs. ${pc(v("nra-fs-labor-unprofitable"))} at unprofitable ones, a ${laborGap}-pt gap (limited-service: ${pc(v("nra-ls-labor-profitable"))} vs. ${pc(v("nra-ls-labor-unprofitable"))}, ${lsLaborGap} pts).`,
  },
  {
    title: "Margins are thin",
    body: `The typical pretax margin was ${pc(v("nra-fs-margin"))} for full-service and ${pc(v("nra-ls-margin"))} for limited-service, so small cost gains matter.`,
  },
  {
    title: "Size changes the picture (full-service)",
    body: `Median food cost was ${pc(v("nra-fs-food-below2m"))} under $2M in sales and ${pc(v("nra-fs-food-2m"))} at $2M or more.`,
  },
];

export default function StatsPage() {
  const { scenario, result, update } = useScenario();
  const comparable = useMemo(() => buildHealth(scenario, result).comparableIds, [scenario, result]);
  const [q, setQ] = useState("");
  const [seg, setSeg] = useState<SegFilter>("any");
  const [metric, setMetric] = useState("any");
  const [year, setYear] = useState("any");
  const [open, setOpen] = useState<Record<Group | "charts" | "defs" | "sources", boolean>>({
    key: false, useful: false, reference: false, charts: false, defs: false, sources: false,
  });
  const toggle = (k: keyof typeof open) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  // Deep links (/stats#nra-fs-labor): open the right section, then scroll to the card.
  useEffect(() => {
    const go = () => {
      const id = window.location.hash.slice(1);
      const st = STAT_BY_ID[id];
      if (!st) return;
      const g: Importance = importanceOf(st);
      setOpen((o) => ({ ...o, [g]: true }));
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "center" }), 60);
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, []);

  const years = useMemo(() => [...new Set(SHOWN.map((s) => SOURCES[s.sourceId]!.dataPeriod))], []);
  const metrics = useMemo(() => [...new Set(SHOWN.map((s) => s.metricKey))], []);
  const searching = q.trim() !== "";
  const filtered = SHOWN.filter(
    (s) =>
      (seg === "any" || s.segment === seg) &&
      (metric === "any" || s.metricKey === metric) &&
      (year === "any" || SOURCES[s.sourceId]!.dataPeriod === year) &&
      matches(s, q),
  );
  const filtering = searching || seg !== "any" || metric !== "any" || year !== "any";
  const by = (g: Group) => filtered.filter((s) => importanceOf(s) === g);
  const qLower = q.toLowerCase();
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
  const grid = (items: Stat[]) =>
    items.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{items.map(card)}</div> : <p className="text-sm text-muted">Nothing matches.</p>;

  return (
    <>
      <PageHeader title="Industry Stats" description="Published restaurant medians for a conversation. Medians describe the middle restaurant; they are not targets." />

      <ContentCard className="mb-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-accent">At a glance · median, NRA 2025 abstract (2024 data)</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] border-collapse text-sm">
            <caption className="sr-only">Published medians, full-service versus limited-service</caption>
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted">
                <th scope="col" className="py-2 pr-3 font-semibold" />
                <th scope="col" className="px-3 py-2 text-right font-semibold">Full-service</th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">Limited-service</th>
              </tr>
            </thead>
            <tbody>
              {GLANCE.map((r) => (
                <tr key={r.label} className="border-t border-rule">
                  <th scope="row" className="py-3 pr-3 text-left font-semibold">{r.label}</th>
                  <td className="tabular px-3 py-3 text-right text-lg font-semibold">{r.fs.startsWith("None") ? <span className="text-sm font-normal text-muted">{r.fs}</span> : r.fs}</td>
                  <td className="tabular px-3 py-3 text-right text-lg font-semibold">{r.ls}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          Food excludes alcohol. Prime cost is measured directly, not food plus labor added together. Supplied by the SpotOn team; not independently checked.
        </p>
      </ContentCard>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        {TALKING_POINTS.map((t) => (
          <div key={t.title} className="rounded-card border border-rule bg-surface p-4">
            <h3 className="text-sm font-semibold">{t.title}</h3>
            <p className="mt-1 text-sm text-muted">{t.body}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <label htmlFor="stat-search" className="mb-1.5 block text-sm font-semibold">Search all statistics</label>
          <input
            id="stat-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. labor, pretax, full-service"
            className="min-h-11 w-full rounded-ctl border border-rule bg-surface px-3 text-base sm:text-sm"
          />
        </div>
        <SegmentedControl
          label="Restaurant segment"
          className="md:w-80"
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
      <details className="mb-6 text-sm">
        <summary className="cursor-pointer text-xs font-semibold text-link">More filters</summary>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="metric-filter" className="mb-1 block text-xs font-semibold text-muted">Metric</label>
            <SelectField id="metric-filter" value={metric} onChange={setMetric} options={[{ value: "any", label: "All metrics" }, ...metrics.map((m) => ({ value: m, label: metricLabel[m] }))]} />
          </div>
          <div>
            <label htmlFor="year-filter" className="mb-1 block text-xs font-semibold text-muted">Data year</label>
            <SelectField id="year-filter" value={year} onChange={setYear} options={[{ value: "any", label: "All years" }, ...years.map((y) => ({ value: y, label: y }))]} />
          </div>
        </div>
      </details>

      <div className="flex flex-col gap-3">
        <Collapsible title="Key numbers: details and sources" tag="Know these" count={by("key").length} open={open.key || filtering} onToggle={() => toggle("key")}>
          {grid(by("key"))}
        </Collapsible>

        <Collapsible title="Good to know" tag="Labor story and size" count={by("useful").length} open={open.useful || filtering} onToggle={() => toggle("useful")}>
          {grid(by("useful"))}
        </Collapsible>

        <Collapsible title="Alcohol (historical)" tag="Reference" count={by("reference").length} open={open.reference || filtering} onToggle={() => toggle("reference")}>
          <Callout>{BEVSPOT_BANNER}</Callout>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {by("reference").map(card)}
            <article className="flex flex-col gap-1 rounded-card border border-rule bg-surface p-4">
              <Badge>Current alcohol benchmark</Badge>
              <p className="text-base font-semibold">{NO_ALCOHOL_BENCHMARK}</p>
              <p className="text-sm text-muted">Ask for the operator&apos;s own current beer, liquor and wine costs.</p>
            </article>
          </div>
        </Collapsible>

        <Collapsible title="Charts" tag="Reference" open={open.charts} onToggle={() => toggle("charts")}>
          <div className="grid gap-6 md:grid-cols-2">
            <div role="img" aria-label="Food cost, labor cost and pretax margin medians, full-service versus limited-service" className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { metric: "Food", "Full-service": v("nra-fs-food"), "Limited-service": v("nra-ls-food") },
                    { metric: "Labor", "Full-service": v("nra-fs-labor"), "Limited-service": v("nra-ls-labor") },
                    { metric: "Pretax margin", "Full-service": v("nra-fs-margin"), "Limited-service": v("nra-ls-margin") },
                  ]}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid stroke="var(--rule)" vertical={false} />
                  <XAxis dataKey="metric" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis unit="%" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(x: number) => `${x.toFixed(1)}%`} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Full-service" fill="var(--brand)" isAnimationActive={false} />
                  <Bar dataKey="Limited-service" fill="var(--teal)" isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div role="img" aria-label="Labor medians for profitable versus unprofitable operators, by segment" className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { segment: "Full-service", Profitable: v("nra-fs-labor-profitable"), Unprofitable: v("nra-fs-labor-unprofitable") },
                    { segment: "Limited-service", Profitable: v("nra-ls-labor-profitable"), Unprofitable: v("nra-ls-labor-unprofitable") },
                  ]}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid stroke="var(--rule)" vertical={false} />
                  <XAxis dataKey="segment" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis unit="%" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(x: number) => `${x.toFixed(1)}%`} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Profitable" name="Labor, profitable" fill="var(--brand)" isAnimationActive={false} />
                  <Bar dataKey="Unprofitable" name="Labor, unprofitable" fill="var(--teal)" isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Collapsible>

        <Collapsible title="Definitions and formulas" tag="Reference" count={DEFINITIONS.length} open={open.defs || (searching && DEFINITIONS.some((d) => `${d.term} ${d.body}`.toLowerCase().includes(qLower)))} onToggle={() => toggle("defs")}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {DEFINITIONS.filter((d) => !searching || `${d.term} ${d.body} ${d.formula ?? ""}`.toLowerCase().includes(qLower)).map((d) => (
              <article key={d.id} id={d.id} className="rounded-card border border-rule bg-surface p-4">
                <h3 className="text-sm font-semibold">{d.term}</h3>
                <p className="mt-1 text-sm text-muted">{d.body}</p>
                {d.formula && <p className="mt-2 rounded-ctl bg-surface-2 p-2 font-mono text-xs">{d.formula}</p>}
              </article>
            ))}
          </div>
        </Collapsible>

        <Collapsible title="Sources" tag="Reference" count={Object.values(SOURCES).filter((s) => s.id !== "marginlab").length} open={open.sources} onToggle={() => toggle("sources")}>
          <ul className="grid gap-3 md:grid-cols-2">
            {Object.values(SOURCES)
              .filter((s) => s.id !== "marginlab")
              .map((s) => (
                <li key={s.id} className="rounded-card border border-rule bg-surface p-4">
                  <h3 className="text-sm font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted">{s.organization} · data {s.dataPeriod}{s.publicationYear ? ` · published ${s.publicationYear}` : ""}</p>
                  <p className="mt-1 text-sm">{s.sample}</p>
                  <p className="mt-1 text-sm">
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-link underline">
                        {s.urlStatus === "publisher_home" ? "Publisher site (no deep link captured)" : s.url}
                      </a>
                    ) : (
                      "No source link captured"
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted">{s.note}</p>
                </li>
              ))}
          </ul>
        </Collapsible>
      </div>
    </>
  );
}
