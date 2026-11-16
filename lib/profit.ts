/**
 * Profitability model. Pretax income is calculated ONLY when every expense line has been addressed
 * (entered, including 0, or marked "already counted in COGS or labor"). Prime cost alone never
 * implies profit or loss.
 */
import { EXPENSE_KEYS } from "./scenario";
import type { ScenarioResult } from "./calc";
import type { ExpenseKey, Scenario } from "./types";

const r2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;
const OPERATING: ExpenseKey[] = ["occupancy", "utilities", "marketing", "repairs", "admin", "processing", "delivery", "corporate", "otherOpex"];

export type ProfitStatus = "unknown" | "estimated" | "verified";

export interface ProfitResult {
  status: ProfitStatus;
  /** Plain label for display. */
  label: string;
  addressed: number;
  total: number;
  missing: string[];
  excludedKeys: ExpenseKey[];
  opexMonthly: number;
  beforeDaMonthly: number;
  operatingIncomeMonthly: number;
  pretaxMonthly: number;
  pretaxAnnual: number;
  marginPct: number | null;
  direction: "profit" | "loss" | "breakeven" | null;
  /** Shown whenever an estimated (or verified) figure is presented. */
  assumptions: string[];
  reason: string | null;
}

export function computeProfit(s: Scenario, r: ScenarioResult): ProfitResult {
  const total = EXPENSE_KEYS.length;
  const lines = s.expenses.lines;
  const addressedKeys = EXPENSE_KEYS.filter(({ key }) => {
    const l = lines[key];
    return l.excluded || (typeof l.monthly === "number" && Number.isFinite(l.monthly) && l.monthly >= 0);
  });
  const missing = EXPENSE_KEYS.filter((e) => !addressedKeys.includes(e)).map((e) => e.label);
  const excludedKeys = EXPENSE_KEYS.filter(({ key }) => lines[key].excluded).map((e) => e.key);
  const base = {
    addressed: addressedKeys.length,
    total,
    missing,
    excludedKeys,
    opexMonthly: 0,
    beforeDaMonthly: 0,
    operatingIncomeMonthly: 0,
    pretaxMonthly: 0,
    pretaxAnnual: 0,
    marginPct: null,
    direction: null,
    assumptions: [],
  } as const;

  const unknown = (reason: string): ProfitResult => ({
    ...base,
    missing: [...missing],
    excludedKeys: [...excludedKeys],
    assumptions: [],
    status: "unknown",
    label: "Profitability not yet determined",
    reason,
  });

  if (!r.sales.resolved || r.sales.monthlyGroup <= 0) return unknown("Net sales are not established.");
  if (!r.cogs.valid) return unknown("The detailed food/alcohol inputs are incomplete or invalid.");
  if (missing.length) return unknown(`${missing.length} of ${total} expense lines have not been addressed.`);

  const amount = (k: ExpenseKey) => (lines[k].excluded ? 0 : Math.max(0, lines[k].monthly ?? 0));
  const opex = r2(OPERATING.reduce((sum, k) => sum + amount(k), 0));
  const sales = r.sales.monthlyGroup;
  const beforeDa = r2(sales - r.current.primeMonthly - opex);
  const operating = r2(beforeDa - amount("depreciation"));
  const pretax = r2(operating - amount("interestOther"));
  const margin = Math.round((pretax / sales) * 1e4) / 100;

  const verified = s.expenses.basis === "actual" && s.salesConfidence === "verified";
  const assumptions: string[] = [];
  if (r.sales.preliminary) assumptions.push("Net sales are an estimate or GPV-derived.");
  if (s.expenses.basis === "assumed") assumptions.push("Expense lines are assumptions, not figures from actual financial statements.");
  assumptions.push("Food/beverage COGS and labor are the percentages entered above, not verified from invoices and payroll.");
  if (excludedKeys.length)
    assumptions.push(`${excludedKeys.length} line${excludedKeys.length > 1 ? "s" : ""} excluded as already counted in COGS or labor, to avoid double counting.`);
  if (r.locations > 1) assumptions.push("Equal sales and costs assumed across locations; expense lines are group totals.");
  assumptions.push("Processing and delivery fees are counted here as expenses; they are not treated as prime-cost savings.");

  return {
    ...base,
    missing: [],
    excludedKeys: [...excludedKeys],
    opexMonthly: opex,
    beforeDaMonthly: beforeDa,
    operatingIncomeMonthly: operating,
    pretaxMonthly: pretax,
    pretaxAnnual: r2(pretax * 12),
    marginPct: margin,
    direction: Math.abs(pretax) < 0.005 * sales ? "breakeven" : pretax > 0 ? "profit" : "loss",
    assumptions,
    status: verified ? "verified" : "estimated",
    label: verified ? "Verified result from actual financials" : "Estimated from assumptions",
    reason: null,
  };
}
