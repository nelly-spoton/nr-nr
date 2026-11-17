/**
 * The "Does the restaurant sell alcohol?" question, in plain terms.
 * Operators give ONE number for the split (alcohol's share of sales); the food share is simply the rest.
 * Pure functions; the blended-cost math is in detailed.ts and is unchanged.
 */
import type { DetailedBreakdown } from "./detailed";
import { usd } from "./format";
import type { NumField, Scenario } from "./types";

const r2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;

/** Answer the alcohol question. Yes starts the split; No goes back to one food & beverage cost. */
export function chooseAlcohol(s: Scenario, yes: boolean): Scenario {
  if (!yes) return { ...s, sellsAlcohol: false, costMode: "quick" };
  const empty = Object.values(s.detailed).every((v) => v === null);
  return {
    ...s,
    sellsAlcohol: true,
    costMode: "detailed",
    // Carry the typed food & beverage % across as the food rate; never invent a split.
    detailed: empty ? { foodSharePct: null, alcoholSharePct: null, foodCogsRatePct: s.foodPct, alcoholCogsRatePct: null } : s.detailed,
  };
}

/** Alcohol's share of sales; the food & nonalcoholic share is the rest, so the two always add to 100. */
export function setAlcoholShare(s: Scenario, alcohol: NumField): Scenario {
  const food = typeof alcohol === "number" && Number.isFinite(alcohol) ? r2(100 - alcohol) : null;
  return { ...s, detailed: { ...s.detailed, alcoholSharePct: alcohol, foodSharePct: food } };
}

/** "Use one combined cost instead" / "Split it". Alcohol stays marked as sold. */
export function setSplitMode(s: Scenario, split: boolean): Scenario {
  return split ? chooseAlcohol({ ...s, sellsAlcohol: true }, true) : { ...s, costMode: "quick" };
}

/** The arithmetic in plain words, built from the same numbers the engine used. */
export function splitSentences(d: DetailedBreakdown, rates: { food: NumField; alcohol: NumField }): string[] {
  const out = [
    `Food sales ${usd(d.foodRevenue)} × ${rates.food ?? 0}% = ${usd(d.foodCogs)} food cost`,
  ];
  if (d.sellsAlcohol) out.push(`Alcohol sales ${usd(d.alcoholRevenue)} × ${rates.alcohol ?? 0}% = ${usd(d.alcoholCogs)} alcohol cost`);
  out.push(`Together ${usd(d.totalCogs)} = ${d.blendedPct.toFixed(2)}% of all sales. That is the food & beverage cost.`);
  return out;
}
