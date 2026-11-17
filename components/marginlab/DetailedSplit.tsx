"use client";
import { usd, pct } from "@/lib/format";
import { issueFor } from "@/lib/validate";
import type { CostMode, NumField } from "@/lib/types";
import { Callout } from "./Cards";
import { FormField, NumberField, SegmentedControl } from "./Fields";
import { useScenario } from "./ScenarioProvider";

/** Optional: split food and alcohol. When used, it replaces the single food & beverage cost %. */
export function DetailedSplit() {
  const { scenario: s, result: r, update, issues } = useScenario();
  const err = (f: string) => {
    const i = issueFor(issues, f);
    return i?.severity === "error" && !/is required/.test(i.message) ? i.message : undefined;
  };
  const d = s.detailed;
  const detail = r.cogs.detail;
  const setMode = (m: CostMode) =>
    update((x) => {
      if (m === "detailed" && Object.values(x.detailed).every((v) => v === null)) {
        // Start from what was typed, without inventing a food/alcohol split.
        return { ...x, costMode: m, detailed: { foodSharePct: 100, alcoholSharePct: 0, foodCogsRatePct: x.foodPct, alcoholCogsRatePct: null } };
      }
      return { ...x, costMode: m };
    });
  const setDetail = (patch: Partial<typeof d>) => update((x) => ({ ...x, detailed: { ...x.detailed, ...patch } }));
  const complement = (v: NumField) => (typeof v === "number" && Number.isFinite(v) ? Math.round((100 - v) * 100) / 100 : null);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">If you know how much of sales is alcohol, splitting it gives a more accurate food &amp; beverage cost.</p>
      <SegmentedControl
        label="Food and beverage cost entry"
        className="sm:w-96"
        value={s.costMode}
        onChange={setMode}
        options={[
          { value: "quick", label: "One combined %" },
          { value: "detailed", label: "Split food and alcohol" },
        ]}
      />
      {s.costMode === "detailed" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Food & nonalcoholic share of sales" htmlFor="d-food-share" error={err("detailed.foodSharePct")}>
              <NumberField id="d-food-share" suffix="%" value={d.foodSharePct} invalid={!!err("detailed.foodSharePct")} onChange={(v) => setDetail({ foodSharePct: v, alcoholSharePct: complement(v) })} />
            </FormField>
            <FormField label="Alcohol share of sales" htmlFor="d-alc-share" error={err("detailed.alcoholSharePct")} hint="0% if none is sold">
              <NumberField id="d-alc-share" suffix="%" value={d.alcoholSharePct} invalid={!!err("detailed.alcoholSharePct")} onChange={(v) => setDetail({ alcoholSharePct: v, foodSharePct: complement(v) })} />
            </FormField>
            <FormField label="Food & nonalcoholic cost" htmlFor="d-food-rate" error={err("detailed.foodCogsRatePct")} hint="% of food & nonalcoholic sales">
              <NumberField id="d-food-rate" suffix="%" value={d.foodCogsRatePct} invalid={!!err("detailed.foodCogsRatePct")} onChange={(v) => setDetail({ foodCogsRatePct: v })} />
            </FormField>
            <FormField label="Alcohol cost" htmlFor="d-alc-rate" error={err("detailed.alcoholCogsRatePct")} hint="% of alcohol sales">
              <NumberField id="d-alc-rate" suffix="%" value={d.alcoholCogsRatePct} disabled={(d.alcoholSharePct ?? 0) === 0} invalid={!!err("detailed.alcoholCogsRatePct")} onChange={(v) => setDetail({ alcoholCogsRatePct: v })} />
            </FormField>
          </div>
          {detail && detail.valid ? (
            <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 rounded-ctl bg-surface p-4 text-sm" aria-label="Derived cost figures">
              <dt className="text-muted">Food cost (food sales × food %)</dt>
              <dd className="tabular text-right font-semibold">{usd(detail.foodCogs)}/mo</dd>
              <dt className="text-muted">Alcohol cost (alcohol sales × alcohol %)</dt>
              <dd className="tabular text-right font-semibold">{usd(detail.alcoholCogs)}/mo</dd>
              <dt className="font-semibold">Food &amp; beverage cost, blended</dt>
              <dd className="tabular text-right text-base font-semibold text-brand">{pct(detail.blendedPct)} of sales</dd>
            </dl>
          ) : (
            <Callout>Complete these to use the split. Until then, food &amp; beverage cost counts as not entered.</Callout>
          )}
          <p className="text-xs text-muted">The two costs are never added as percentages: blended cost is total cost dollars ÷ total sales.</p>
        </>
      )}
    </div>
  );
}
