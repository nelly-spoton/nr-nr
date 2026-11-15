"use client";
import { ALCOHOL_QUALIFICATION } from "@/config/benchmarks";
import { BEV_CATEGORIES, blendCogs } from "@/lib/beverage";
import { pct } from "@/lib/format";
import type { BevCategory, NumField } from "@/lib/types";
import { Callout } from "./Cards";
import { SecondaryButton } from "./Buttons";
import { NumberField } from "./Fields";
import { useScenario } from "./ScenarioProvider";

/** Optional food / beer / liquor / wine / other COGS. Blends onto ONE net-sales denominator. */
export function BeverageMixPanel() {
  const { scenario: s, update } = useScenario();
  const m = s.beverageMix;
  const blend = blendCogs(m);
  const set = (kind: "mixPct" | "costPct", id: BevCategory, v: NumField) =>
    update((x) => ({ ...x, beverageMix: { ...x.beverageMix, enabled: true, [kind]: { ...x.beverageMix[kind], [id]: v } } }));
  const filled = BEV_CATEGORIES.some((c) => m.mixPct[c.id] !== null);

  return (
    <details className="mt-4 rounded-ctl border border-rule bg-surface-2 p-4" open={m.enabled || filled}>
      <summary className="cursor-pointer text-sm font-semibold">Beverage-aware COGS (optional)</summary>
      <div className="mt-3 flex flex-col gap-3">
        <p className="text-sm text-muted">
          Use only if you know the sales mix. Enter each category&apos;s share of <strong>net sales</strong> (must total 100%) and its
          cost as a % of <strong>that category&apos;s own sales</strong>. The blend is a % of total net sales, the same denominator
          as everything else.
        </p>
        <Callout>{ALCOHOL_QUALIFICATION}</Callout>
        <div className="grid grid-cols-[1fr_6.5rem_6.5rem] items-center gap-x-3 gap-y-2 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Category</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">% of sales</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Cost %</span>
          {BEV_CATEGORIES.map((c) => (
            <div key={c.id} className="contents">
              <span className="font-semibold">{c.label}</span>
              <NumberField id={`mix-${c.id}`} ariaLabel={`${c.label} share of net sales`} suffix="%" value={m.mixPct[c.id]} onChange={(v) => set("mixPct", c.id, v)} />
              <NumberField id={`cost-${c.id}`} ariaLabel={`${c.label} cost as percent of its own sales`} suffix="%" value={m.costPct[c.id]} onChange={(v) => set("costPct", c.id, v)} />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-ctl bg-surface p-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Blended COGS (% of net sales)</p>
            <p className="tabular text-2xl font-semibold">{filled ? pct(blend.blendedPct) : "—"}</p>
            <p className="text-xs text-muted">Mix total: {blend.mixTotal.toFixed(2)}%</p>
          </div>
          <SecondaryButton
            disabled={!filled || !blend.valid}
            onClick={() => update({ foodPct: blend.blendedPct })}
          >
            Apply to food &amp; beverage COGS
          </SecondaryButton>
        </div>
        {filled && !blend.valid && (
          <ul role="alert" className="list-disc pl-5 text-xs font-semibold text-bad">
            {blend.problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
