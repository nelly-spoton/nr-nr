"use client";
import { buildHealth, nearNote } from "@/lib/health";
import { pct } from "@/lib/format";
import { Callout } from "./Cards";
import { BenchmarkScale } from "./BenchmarkScale";
import { SegmentedControl } from "./Fields";
import { useScenario } from "./ScenarioProvider";

/** The centerpiece of Step 1: food, labor and prime cost against the published medians. */
export function WhereYouStand() {
  const { scenario: s, result: r, update } = useScenario();
  const h = buildHealth(s, r);
  const get = (id: string) => h.rows.find((x) => x.id === id)!;
  const detailed = s.costMode === "detailed";
  const food = get(detailed ? "food" : "combined");
  const labor = get("labor");
  const prime = get("prime");
  const alcohol = detailed ? get("alcohol") : null;
  const anyBenchmark = [food, labor, prime].some((x) => x.stat);

  // One plain takeaway: the largest difference from a median among the comparable costs.
  const compared = [
    { name: detailed ? "Food cost" : "Food & beverage cost", row: food },
    { name: "Labor cost", row: labor },
    { name: "Prime cost", row: prime },
  ].filter((x) => x.row.stat && x.row.deltaPts !== null);
  const biggest = [...compared].sort((a, b) => Math.abs(b.row.deltaPts!) - Math.abs(a.row.deltaPts!))[0];
  const headline = !biggest
    ? null
    : biggest.row.status === "near"
      ? "Every cost shown is near its median."
      : `Largest difference from the median: ${biggest.name}, ${Math.abs(biggest.row.deltaPts!).toFixed(1)} point${Math.abs(biggest.row.deltaPts!).toFixed(1) === "1.0" ? "" : "s"} ${biggest.row.deltaPts! > 0 ? "above" : "below"}.`;

  return (
    <section aria-labelledby="stand" className="rounded-card border border-brand/30 bg-surface-2 p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="stand" className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Where you stand</h2>
          <p className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">{headline ?? "How this restaurant compares with the industry median"}</p>
          <p className="text-sm text-muted">National Restaurant Association, 2025 abstract (2024 data). A median is the middle restaurant, not a target.</p>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-muted">“Typical” range</span>
          <SegmentedControl
            label="Typical range in points around the median"
            className="w-52"
            value={String(s.nearWindowPts)}
            onChange={(v) => update({ nearWindowPts: Number(v) })}
            options={["0.5", "1", "1.5", "2"].map((v) => ({ value: v, label: `±${v}` }))}
          />
        </div>
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted" aria-hidden>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border-2 border-white bg-nav shadow" /> This restaurant</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3.5 w-0.5 bg-ink" /> Industry median</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-5 rounded-full bg-lime" /> Typical (median ± {s.nearWindowPts} pt)</span>
      </p>

      {anyBenchmark ? (
        <ul className="mt-4 grid gap-4 lg:grid-cols-3">
          <BenchmarkScale title={detailed ? "Food cost" : "Food & beverage cost"} note={detailed ? "Alcohol shown separately" : undefined} row={food} windowPts={h.windowPts} />
          <BenchmarkScale title="Labor cost" row={labor} windowPts={h.windowPts} />
          <BenchmarkScale title="Prime cost" note="food + labor" row={prime} windowPts={h.windowPts} />
        </ul>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <Callout>{food.noBenchmarkReason ?? "No published median applies to this concept."}</Callout>
          <ul className="grid gap-3 sm:grid-cols-3">
            {[["Food & beverage cost", food.valuePct], ["Labor cost", labor.valuePct], ["Prime cost", prime.valuePct]].map(([l, v]) => (
              <li key={l as string} className="rounded-card border border-rule bg-surface p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{l}</p>
                <p className="tabular text-3xl font-semibold">{v === null ? "—" : pct(v as number)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {alcohol && alcohol.valuePct !== null && alcohol.valuePct > 0 && (
        <p className="mt-3 text-sm text-muted">
          <strong className="text-ink">Alcohol cost:</strong> <span className="tabular">{pct(alcohol.valuePct)}</span> of sales. No verified current benchmark, so it isn&apos;t scored.
        </p>
      )}
      <p className="mt-2 text-xs text-muted">{nearNote(s.nearWindowPts)} Statistics supplied by the SpotOn team; not independently checked.</p>
    </section>
  );
}
