/**
 * Pure financial calculation engine. No React, no DOM, no storage.
 * All improvements are percentage POINTS of net sales (never relative reductions).
 */
import { computeDetailed, type DetailedBreakdown } from "./detailed";
import type { PlanningRanges, Range, SalesStatus, Scenario } from "./types";

export const MAX_IMPROVEMENT_PTS = 5;
export const MONTHS = 12;
export const PRESET_TOTALS = [0.5, 1.0, 1.5, 2.0, 3.0] as const;

export const round2 = (x: number): number => Math.round((x + Number.EPSILON) * 100) / 100;
const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);
/** Missing / NaN / negative / non-finite → 0. */
export const safe = (x: number | null | undefined): number =>
  typeof x === "number" && Number.isFinite(x) && x > 0 ? x : 0;

export function safeLocations(n: number | null): number {
  if (typeof n !== "number" || !Number.isFinite(n)) return 1;
  return clamp(Math.round(n), 1, 10);
}

export interface SalesResult {
  status: SalesStatus;
  /** False when GPV was entered with no usable conversion → no net sales yet. */
  resolved: boolean;
  /** True for any estimate, GPV-derived or unresolved figure: savings are preliminary. */
  preliminary: boolean;
  monthlyPerLocation: number;
  monthlyGroup: number;
  annualGroup: number;
  annualPerLocation: number;
}

/**
 * Resolves monthly net sales. GPV is NEVER silently treated as net sales: it needs an
 * independent net-sales estimate or an explicit user-provided conversion factor.
 */
export function resolveSales(s: Scenario): SalesResult {
  const locations = safeLocations(s.locations);
  let base = 0; // monthly net sales in the same scope as `amount`
  let status: SalesStatus;
  let resolved = true;

  if (s.salesMode === "net") {
    base = safe(s.amount);
    status = s.salesConfidence === "verified" ? "net-verified" : "net-estimated";
  } else if (s.gpv.basis === "netEstimate") {
    base = safe(s.gpv.netEstimate);
    status = "gpv-via-net-estimate";
    resolved = base > 0;
  } else {
    const f = safe(s.gpv.conversionFactor);
    base = f > 0 && f <= 1.5 ? safe(s.amount) * f : 0;
    status = "gpv-via-factor";
    resolved = base > 0;
  }
  if (!resolved) status = "gpv-unresolved";

  const monthlyGroup = round2(s.volumeScope === "group" ? base : base * locations);
  const monthlyPerLocation = round2(monthlyGroup / locations);
  return {
    status,
    resolved,
    preliminary: status !== "net-verified",
    monthlyPerLocation,
    monthlyGroup,
    annualGroup: round2(monthlyGroup * MONTHS),
    annualPerLocation: round2(monthlyPerLocation * MONTHS),
  };
}

/** Convert a monthly group-dollar cost to % of net sales. Null when sales are zero. */
export function dollarsToPct(monthlyGroupDollars: number, monthlyGroupSales: number): number | null {
  if (!(monthlyGroupSales > 0)) return null;
  return round4(clamp((safe(monthlyGroupDollars) / monthlyGroupSales) * 100, 0, 100));
}
export function pctToDollars(pct: number, monthlyGroupSales: number): number {
  return round2((monthlyGroupSales * safe(pct)) / 100);
}
const round4 = (x: number) => Math.round(x * 1e4) / 1e4;

export interface CostBlock {
  food: number;
  labor: number;
  prime: number;
  foodMonthly: number;
  laborMonthly: number;
  primeMonthly: number;
}

function costBlock(food: number, labor: number, monthlyGroup: number): CostBlock {
  const foodMonthly = pctToDollars(food, monthlyGroup);
  const laborMonthly = pctToDollars(labor, monthlyGroup);
  return {
    food: round4(food),
    labor: round4(labor),
    prime: round4(food + labor),
    foodMonthly,
    laborMonthly,
    primeMonthly: round2(foodMonthly + laborMonthly),
  };
}

export interface RoiResult {
  annualGrossSavings: number;
  annualIncrementalCost: number;
  annualNetBenefit: number;
  firstYearNetBenefit: number;
  monthlyNetBenefit: number;
  /** Months to recover one-time cost; null unless monthly net benefit is positive. */
  paybackMonths: number | null;
  /** True when there are no incremental costs entered at all. */
  hasCosts: boolean;
}

export function computeRoi(s: Scenario, monthlySavings: number): RoiResult {
  const monthlySoftware = safe(s.roi.monthlySoftwareCost);
  const other = safe(s.roi.otherMonthlyCost);
  const oneTime = safe(s.roi.oneTimeCost);
  const monthlyNet = round2(monthlySavings - monthlySoftware - other);
  const annualGross = round2(monthlySavings * MONTHS);
  const annualCost = round2((monthlySoftware + other) * MONTHS);
  const annualNet = round2(annualGross - annualCost);
  return {
    annualGrossSavings: annualGross,
    annualIncrementalCost: annualCost,
    annualNetBenefit: annualNet,
    firstYearNetBenefit: round2(annualNet - oneTime),
    monthlyNetBenefit: monthlyNet,
    paybackMonths: monthlyNet > 0 ? round2(oneTime / monthlyNet) : null,
    hasCosts: monthlySoftware + other + oneTime > 0,
  };
}

export interface CogsBreakdown {
  mode: "quick" | "detailed";
  /** Detailed inputs valid (quick mode: always true). */
  valid: boolean;
  problems: string[];
  /** Null in quick mode: a food/alcohol split is never fabricated. */
  detail: DetailedBreakdown | null;
}

export interface ScenarioResult {
  locations: number;
  cogs: CogsBreakdown;
  sales: SalesResult;
  current: CostBlock;
  improved: CostBlock;
  improvement: {
    foodPts: number;
    laborPts: number;
    totalPts: number;
    foodClamped: boolean;
    laborClamped: boolean;
  };
  savings: {
    monthlyFood: number;
    monthlyLabor: number;
    monthlyTotal: number;
    annualFood: number;
    annualLabor: number;
    annualTotal: number;
    perLocationMonthly: number;
    perLocationAnnual: number;
  };
  roi: RoiResult;
}

/** Effective improvement: within 0..5 and never below zero cost. */
export function effectivePts(requested: number | null, currentPct: number): { pts: number; clamped: boolean } {
  const req = safe(requested);
  const pts = round2(Math.min(req, MAX_IMPROVEMENT_PTS, currentPct));
  return { pts, clamped: pts < round2(req) };
}

export function computeScenario(s: Scenario): ScenarioResult {
  const locations = safeLocations(s.locations);
  const sales = resolveSales(s);
  const detail = s.costMode === "detailed" ? computeDetailed(sales.monthlyGroup, s.detailed) : null;
  // Detailed mode: blended F&B COGS % of total net sales. Quick mode: the entered combined %.
  const food = clamp(detail ? detail.blendedPct : safe(s.foodPct), 0, 100);
  const labor = clamp(safe(s.laborPct), 0, 100);

  const f = effectivePts(s.foodImprovementPts, food);
  const l = effectivePts(s.laborImprovementPts, labor);

  const current = costBlock(food, labor, sales.monthlyGroup);
  const improved = costBlock(round4(food - f.pts), round4(labor - l.pts), sales.monthlyGroup);

  const monthlyFood = round2((sales.monthlyGroup * f.pts) / 100);
  const monthlyLabor = round2((sales.monthlyGroup * l.pts) / 100);
  const monthlyTotal = round2(monthlyFood + monthlyLabor);
  const annualFood = round2(monthlyFood * MONTHS);
  const annualLabor = round2(monthlyLabor * MONTHS);
  const annualTotal = round2(monthlyTotal * MONTHS);

  return {
    locations,
    cogs: { mode: s.costMode, valid: detail ? detail.valid : true, problems: detail ? detail.problems : [], detail },
    sales,
    current,
    improved,
    improvement: {
      foodPts: f.pts,
      laborPts: l.pts,
      totalPts: round2(f.pts + l.pts),
      foodClamped: f.clamped,
      laborClamped: l.clamped,
    },
    savings: {
      monthlyFood,
      monthlyLabor,
      monthlyTotal,
      annualFood,
      annualLabor,
      annualTotal,
      perLocationMonthly: round2(monthlyTotal / locations),
      perLocationAnnual: round2(annualTotal / locations),
    },
    roi: computeRoi(s, monthlyTotal),
  };
}

/**
 * Split a total-improvement preset between food and labor in proportion to current cost
 * (nearest 0.05 pt), so food + labor always equals the preset exactly when feasible.
 */
export function splitPreset(total: number, foodPct: number, laborPct: number): { food: number; labor: number } {
  const f = safe(foodPct);
  const l = safe(laborPct);
  const share = f + l > 0 ? f / (f + l) : 0.5;
  let food = round2(Math.round((total * share) / 0.05) * 0.05);
  food = clamp(food, 0, Math.min(MAX_IMPROVEMENT_PTS, f || MAX_IMPROVEMENT_PTS));
  let labor = round2(total - food);
  if (labor > MAX_IMPROVEMENT_PTS || labor > (l || MAX_IMPROVEMENT_PTS)) {
    labor = round2(Math.min(MAX_IMPROVEMENT_PTS, l || MAX_IMPROVEMENT_PTS));
    food = round2(clamp(total - labor, 0, MAX_IMPROVEMENT_PTS));
  }
  return { food, labor };
}

/* ---------------- Benchmark comparison ---------------- */

export type RangeStatus = "within" | "above" | "below" | "unset";

export const RANGE_STATUS_LABEL: Record<Exclude<RangeStatus, "unset">, string> = {
  within: "Within planning range",
  above: "Above planning range — investigate",
  below: "Below planning range — review operating model",
};

export function compareToRange(value: number, range: Range): RangeStatus {
  const { min, max } = range;
  if (typeof min !== "number" || typeof max !== "number" || !Number.isFinite(min) || !Number.isFinite(max)) {
    return "unset";
  }
  if (value > max) return "above";
  if (value < min) return "below";
  return "within";
}

export function compareAll(result: ScenarioResult, planning: PlanningRanges) {
  return {
    food: compareToRange(result.current.food, planning.food),
    labor: compareToRange(result.current.labor, planning.labor),
    prime: compareToRange(result.current.prime, planning.prime),
  };
}
