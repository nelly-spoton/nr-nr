"use client";
import { chooseAlcohol, setAlcoholShare, setSplitMode, splitSentences } from "@/lib/alcohol";
import { issueFor } from "@/lib/validate";
import { Callout } from "./Cards";
import { FormField, NumberField, SegmentedControl } from "./Fields";
import { useScenario } from "./ScenarioProvider";

/**
 * Food & beverage cost, with the alcohol question asked plainly.
 * No: one cost %. Yes: alcohol's share of sales (food is the rest), then each cost per $100 of its own sales.
 */
export function AlcoholQuestion() {
  const { scenario: s, result: r, update, issues } = useScenario();
  const err = (f: string) => {
    const i = issueFor(issues, f);
    return i?.severity === "error" && !/is required/.test(i.message) ? i.message : undefined;
  };
  const d = s.detailed;
  const detail = r.cogs.detail;
  const split = s.sellsAlcohol && s.costMode === "detailed";
  const link = "text-sm font-semibold text-link underline";

  return (
    <div className="flex flex-col gap-4 sm:col-span-2">
      <FormField
        label="Does the restaurant sell alcohol?"
        htmlFor="alcohol-group"
        tooltip="Alcohol costs a different share of its own sales than food does. If it is sold, we combine the two for you."
      >
        <SegmentedControl
          label="Does the restaurant sell alcohol?"
          className="sm:w-56"
          value={s.sellsAlcohol ? "yes" : "no"}
          onChange={(v) => update((x) => chooseAlcohol(x, v === "yes"))}
          options={[
            { value: "no", label: "No" },
            { value: "yes", label: "Yes" },
          ]}
        />
      </FormField>

      {(!s.sellsAlcohol || !split) && (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label={s.sellsAlcohol ? "Food & alcohol cost, combined" : "Food & beverage cost"}
            htmlFor="food"
            tooltip="What you pay for what you sell, as a % of all sales."
            hint={s.sellsAlcohol ? "Food and alcohol together, as a % of all sales." : "% of sales"}
            error={err("foodPct")}
          >
            <NumberField id="food" value={s.foodPct} onChange={(v) => update({ foodPct: v })} suffix="%" invalid={!!err("foodPct")} />
          </FormField>
          {s.sellsAlcohol && (
            <p className="self-end pb-2 text-sm text-muted">
              Know the split?{" "}
              <button type="button" className={link} onClick={() => update((x) => setSplitMode(x, true))}>
                Split food and alcohol
              </button>
            </p>
          )}
        </div>
      )}

      {split && (
        <div className="flex flex-col gap-4 rounded-card border border-rule bg-surface-2 p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              label="How much of sales is alcohol?"
              htmlFor="d-alc-share"
              hint="Beer, wine and liquor as a % of all sales. Your POS sales-mix report shows it."
              error={err("detailed.alcoholSharePct")}
            >
              <NumberField id="d-alc-share" suffix="%" value={d.alcoholSharePct} invalid={!!err("detailed.alcoholSharePct")} onChange={(v) => update((x) => setAlcoholShare(x, v))} />
            </FormField>
            <FormField
              label="Food cost"
              htmlFor="d-food-rate"
              hint="Per $100 of food sales, what do the ingredients cost? If $32, enter 32."
              error={err("detailed.foodCogsRatePct")}
            >
              <NumberField id="d-food-rate" suffix="%" value={d.foodCogsRatePct} invalid={!!err("detailed.foodCogsRatePct")} onChange={(v) => update((x) => ({ ...x, detailed: { ...x.detailed, foodCogsRatePct: v } }))} />
            </FormField>
            <FormField
              label="Alcohol cost"
              htmlFor="d-alc-rate"
              hint="Per $100 of alcohol sales, what do the drinks cost? If $22, enter 22."
              error={err("detailed.alcoholCogsRatePct")}
            >
              <NumberField id="d-alc-rate" suffix="%" value={d.alcoholCogsRatePct} disabled={(d.alcoholSharePct ?? 0) === 0} invalid={!!err("detailed.alcoholCogsRatePct")} onChange={(v) => update((x) => ({ ...x, detailed: { ...x.detailed, alcoholCogsRatePct: v } }))} />
            </FormField>
          </div>
          {typeof d.foodSharePct === "number" && (
            <p className="text-sm text-muted">
              That leaves <strong className="tabular text-ink">{d.foodSharePct}%</strong> of sales for food and non-alcoholic drinks.
            </p>
          )}
          {detail && detail.valid ? (
            <div className="rounded-ctl bg-surface p-3" aria-label="How it adds up">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">How it adds up (per month)</p>
              <ul className="mt-1 grid gap-0.5 text-sm">
                {splitSentences(detail, { food: d.foodCogsRatePct, alcohol: d.alcoholCogsRatePct }).map((l, i, a) => (
                  <li key={l} className={i === a.length - 1 ? "font-semibold text-brand" : "tabular"}>{l}</li>
                ))}
              </ul>
            </div>
          ) : (
            <Callout>Fill in the three numbers to see the food &amp; beverage cost. Until then it counts as not entered.</Callout>
          )}
          <p className="text-sm text-muted">
            Only know one combined number?{" "}
            <button type="button" className={link} onClick={() => update((x) => setSplitMode(x, false))}>
              Use one combined cost instead
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
