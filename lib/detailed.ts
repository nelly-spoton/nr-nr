/**
 * Detailed-mode food/alcohol COGS. Pure functions.
 * Category rates are % of THAT category's sales; they are never added together. The blended rate
 * is total COGS dollars divided by total net sales.
 */
import type { DetailedCogs } from "./types";

const r2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;
const r4 = (x: number) => Math.round(x * 1e4) / 1e4;
const n = (x: number | null | undefined) => (typeof x === "number" && Number.isFinite(x) && x > 0 ? x : 0);

export interface DetailedBreakdown {
  valid: boolean;
  problems: string[];
  foodRevenue: number;
  alcoholRevenue: number;
  foodCogs: number;
  alcoholCogs: number;
  totalCogs: number;
  /** Blended F&B COGS as % of total net sales. */
  blendedPct: number;
  /** Food COGS as % of TOTAL net sales (comparable basis for the published food median). */
  foodCogsPctOfSales: number;
  alcoholCogsPctOfSales: number;
  sellsAlcohol: boolean;
}

export function computeDetailed(netSalesMonthly: number, d: DetailedCogs): DetailedBreakdown {
  const sales = n(netSalesMonthly);
  const problems: string[] = [];
  const foodShare = n(d.foodSharePct);
  const alcShare = n(d.alcoholSharePct);
  const total = r4(foodShare + alcShare);
  if (Math.abs(total - 100) > 0.01) problems.push(`Revenue shares total ${total.toFixed(2)}%; they must add to 100%.`);
  if (alcShare > 0 && d.alcoholCogsRatePct === null) problems.push("Enter an alcohol COGS rate, or set the alcohol revenue share to 0%.");
  if (d.foodCogsRatePct === null && foodShare > 0) problems.push("Enter a food COGS rate.");
  for (const [label, v] of [["Food COGS rate", d.foodCogsRatePct], ["Alcohol COGS rate", d.alcoholCogsRatePct]] as const)
    if (typeof v === "number" && (v < 0 || v > 100)) problems.push(`${label} must be between 0% and 100% of that category's sales.`);

  const valid = problems.length === 0;
  const sellsAlcohol = alcShare > 0;
  // No alcohol sales → alcohol revenue and COGS are exactly zero, whatever rate was typed.
  const foodRevenue = valid ? r2((sales * foodShare) / 100) : 0;
  const alcoholRevenue = valid && sellsAlcohol ? r2((sales * alcShare) / 100) : 0;
  const foodCogs = valid ? r2((foodRevenue * n(d.foodCogsRatePct)) / 100) : 0;
  const alcoholCogs = valid && sellsAlcohol ? r2((alcoholRevenue * n(d.alcoholCogsRatePct)) / 100) : 0;
  const totalCogs = r2(foodCogs + alcoholCogs);
  const pctOfSales = (x: number) => (sales > 0 ? r4((x / sales) * 100) : 0);
  return {
    valid,
    problems,
    foodRevenue,
    alcoholRevenue,
    foodCogs,
    alcoholCogs,
    totalCogs,
    blendedPct: pctOfSales(totalCogs),
    foodCogsPctOfSales: pctOfSales(foodCogs),
    alcoholCogsPctOfSales: pctOfSales(alcoholCogs),
    sellsAlcohol,
  };
}

/**
 * A multi-location group's ratio: total cost dollars ÷ total net-sales dollars.
 * (Never add or average the locations' own percentages.)
 */
export function groupRatioPct(locations: Array<{ sales: number; cost: number }>): number | null {
  const sales = locations.reduce((s, l) => s + n(l.sales), 0);
  if (!(sales > 0)) return null;
  const cost = locations.reduce((s, l) => s + n(l.cost), 0);
  return r4((cost / sales) * 100);
}
