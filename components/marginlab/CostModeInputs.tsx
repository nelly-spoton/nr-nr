"use client";
import { pctToDollars } from "@/lib/calc";
import { usd, pct } from "@/lib/format";
import { issueFor } from "@/lib/validate";
import type { CostMode, NumField } from "@/lib/types";
import { Callout } from "./Cards";
import { CostField } from "./CostField";
import { FormField, NumberField, SegmentedControl } from "./Fields";
import { useScenario } from "./ScenarioProvider";

const MODE_OPTIONS: Array<{ value: CostMode; label: string; sub: string }> = [
  { value: "quick", label: "Quick", sub: "combined COGS %" },
  { value: "detailed", label: "Detailed", sub: "food + alcohol" },
];

/** Quick (combined F&B COGS %) or Detailed (food/alcohol revenue mix and category rates). */
export function CostModeInputs() {
  const { scenario: s, result: r, update, issues } = useScenario();
  const err = (f: string) => {
    const i = issueFor(issues, f);
    return i?.severity === "error" ? i.message : undefined;
  };
  const warn = (f: string) => {
    const i = issueFor(issues, f);
    return i?.severity === "warning" ? i.message : undefined;
  };
  const d = s.detailed;
  const detail = r.cogs.detail;

  const setMode = (m: CostMode) => {
    update((x) => {
      if (m === "detailed" && Object.values(x.detailed).every((v) => v === null)) {
        // Carry over the current number without inventing a food/alcohol split.
        return { ...x, costMode: m, detailed: { foodSharePct: 100, alcoholSharePct: 0, foodCogsRatePct: x.foodPct, alcoholCogsRatePct: null } };
      }
      return { ...x, costMode: m };
    });
  };
  const setDetail = (patch: Partial<typeof d>) => update((x) => ({ ...x, detailed: { ...x.detailed, ...patch } }));
  const complement = (v: NumField) => (typeof v === "number" && Number.isFinite(v) ? Math.round((100 - v) * 100) / 100 : null);

  return (
    <div className="flex flex-col gap-4">
      <FormField label="Cost entry" htmlFor="costmode-group" tooltip="Quick keeps one combined food & beverage COGS %. Detailed splits food and alcohol revenue and cost, then blends them on total net sales.">
        <SegmentedControl label="Cost entry" value={s.costMode} onChange={setMode} options={MODE_OPTIONS} className="sm:w-80" />
      </FormField>

      {s.costMode === "quick" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <CostField
            id="food"
            label="Food & beverage COGS"
            tooltip="Combined cost of goods sold for food and beverage as a % of net sales."
            pct={s.foodPct}
            onPct={(v) => update({ foodPct: v })}
            monthlyGroupSales={r.sales.monthlyGroup}
            error={err("foodPct")}
          />
          <CostField
            id="labor"
            label="Fully loaded labor"
            tooltip="Wages plus employer payroll taxes and relevant benefits, as a % of net sales."
            pct={s.laborPct}
            onPct={(v) => update({ laborPct: v })}
            monthlyGroupSales={r.sales.monthlyGroup}
            error={err("laborPct")}
            warning={warn("foodPct")}
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Food & nonalcoholic revenue share" htmlFor="d-food-share" error={err("detailed.foodSharePct")} hint="% of total net sales">
              <NumberField id="d-food-share" suffix="%" value={d.foodSharePct} invalid={!!err("detailed.foodSharePct")} onChange={(v) => setDetail({ foodSharePct: v, alcoholSharePct: complement(v) })} />
            </FormField>
            <FormField label="Alcoholic beverage revenue share" htmlFor="d-alc-share" error={err("detailed.alcoholSharePct")} hint="% of total net sales. Set 0% if no alcohol is sold.">
              <NumberField id="d-alc-share" suffix="%" value={d.alcoholSharePct} invalid={!!err("detailed.alcoholSharePct")} onChange={(v) => setDetail({ alcoholSharePct: v, foodSharePct: complement(v) })} />
            </FormField>
            <FormField label="Food & nonalcoholic COGS rate" htmlFor="d-food-rate" error={err("detailed.foodCogsRatePct")} hint="% of food & nonalcoholic sales (not of total sales)">
              <NumberField id="d-food-rate" suffix="%" value={d.foodCogsRatePct} invalid={!!err("detailed.foodCogsRatePct")} onChange={(v) => setDetail({ foodCogsRatePct: v })} />
            </FormField>
            <FormField label="Alcohol COGS rate" htmlFor="d-alc-rate" error={err("detailed.alcoholCogsRatePct")} hint="% of alcohol sales (not of total sales)">
              <NumberField id="d-alc-rate" suffix="%" value={d.alcoholCogsRatePct} disabled={(d.alcoholSharePct ?? 0) === 0} invalid={!!err("detailed.alcoholCogsRatePct")} onChange={(v) => setDetail({ alcoholCogsRatePct: v })} />
            </FormField>
            <CostField
              id="labor"
              label="Fully loaded labor"
              tooltip="Wages plus employer payroll taxes and relevant benefits, as a % of total net sales."
              pct={s.laborPct}
              onPct={(v) => update({ laborPct: v })}
              monthlyGroupSales={r.sales.monthlyGroup}
              error={err("laborPct")}
            />
          </div>
          {detail && detail.valid ? (
            <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 rounded-ctl bg-surface-2 p-4 text-sm" aria-label="Derived cost figures">
              <dt className="text-muted">Food revenue (net sales × food share)</dt>
              <dd className="tabular text-right font-semibold">{usd(detail.foodRevenue)}</dd>
              <dt className="text-muted">Alcohol revenue (net sales × alcohol share)</dt>
              <dd className="tabular text-right font-semibold">{usd(detail.alcoholRevenue)}</dd>
              <dt className="text-muted">Food COGS (food revenue × food rate)</dt>
              <dd className="tabular text-right font-semibold">{usd(detail.foodCogs)}</dd>
              <dt className="text-muted">Alcohol COGS (alcohol revenue × alcohol rate)</dt>
              <dd className="tabular text-right font-semibold">{usd(detail.alcoholCogs)}</dd>
              <dt className="font-semibold">Total F&amp;B COGS</dt>
              <dd className="tabular text-right font-semibold">{usd(detail.totalCogs)}</dd>
              <dt className="font-semibold">Blended F&amp;B COGS (÷ total net sales)</dt>
              <dd className="tabular text-right text-base font-semibold text-brand">{pct(detail.blendedPct)}</dd>
              <dt className="text-muted">Labor (net sales × labor %)</dt>
              <dd className="tabular text-right font-semibold">{usd(pctToDollars(r.current.labor, r.sales.monthlyGroup))}</dd>
              <dt className="font-semibold">Prime cost</dt>
              <dd className="tabular text-right font-semibold">
                {usd(r.current.primeMonthly)} · {pct(r.current.prime)}
              </dd>
            </dl>
          ) : (
            <Callout>Complete the detailed inputs to see blended COGS and prime cost. Until then, costs are not estimated.</Callout>
          )}
          <p className="text-xs text-muted">
            Category rates are never added together: blended COGS is total COGS dollars divided by total net-sales dollars.
          </p>
        </>
      )}
      <p className="text-sm text-muted">
        Current prime cost: <strong className="tabular text-ink">{r.current.prime.toFixed(2)}%</strong>
      </p>
    </div>
  );
}
