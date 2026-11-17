import { CONCEPT_LABELS } from "@/config/concepts";
import { NRA_SOURCE } from "@/config/benchmarks";
import { OVERLAP_NOTE, SOLUTIONS_DISCLAIMER } from "@/config/solutions";
import type { ScenarioResult } from "./calc";
import { pct, pts, usd } from "./format";
import { BAND_LABEL, buildHealth, nearNote, PEER_LABEL, type HealthModel } from "./health";
import { buildReport, isAlcoholLed, type Report } from "./report";
import type { SalesStatus, Scenario } from "./types";

export const SALES_STATUS_LABEL: Record<SalesStatus, string> = {
  "net-verified": "Net sales (marked verified)",
  "net-estimated": "Net sales (estimate)",
  "gpv-via-net-estimate": "GPV entered; net sales from separate estimate",
  "gpv-via-factor": "GPV × user-provided conversion factor (estimate)",
  "gpv-unresolved": "GPV entered; net sales not yet established",
};

export function validationItems(s: Scenario, r: ScenarioResult): string[] {
  const items = [
    "Confirm monthly net sales against POS or financial statements.",
    "Confirm food & beverage COGS % using actual invoices / inventory counts.",
    "Confirm fully loaded labor % (wages, employer payroll taxes, benefits) on the same net-sales basis.",
    "Confirm product compatibility and availability with SpotOn and each partner.",
    "Validate improvement assumptions against observed operational change.",
  ];
  if (r.sales.preliminary) items.unshift("Sales figure is an estimate or GPV-derived: all savings are PRELIMINARY.");
  if (s.salesMode === "gpv") items.push("GPV may include taxes and tips and exclude cash sales; it is not net sales.");
  if (isAlcoholLed(s)) items.push("No published benchmark applied; targets are operator-defined.");
  return items;
}

export function keyAssumptions(s: Scenario, r: ScenarioResult): string[] {
  const list = [
    "All savings are hypothetical estimates, not guarantees.",
    "Improvements are percentage POINTS of net sales, not relative reductions.",
    "Payment-processing, delivery-commission and sales-increase effects are not counted as prime-cost savings.",
  ];
  if (r.locations > 1) {
    list.splice(2, 0, "Equal sales and costs assumed across locations.");
    list.push(
      s.volumeScope === "group"
        ? "Entered volume is treated as the entire group's volume."
        : "Entered volume is per location and multiplied by location count.",
    );
  }
  return list;
}

/** Compact text lines for the financial-health section (also used by the printed summary). */
export function healthLines(h: HealthModel): string[] {
  const out: string[] = [];
  for (const row of h.rows) {
    if (row.id === "pretax" && h.profit.status === "unknown") continue;
    const v = row.valuePct === null ? "not entered" : pct(row.valuePct);
    if (row.stat && row.deltaPts !== null) {
      const sign = row.deltaPts >= 0 ? "+" : "−";
      out.push(`${row.label}: ${v} · ${PEER_LABEL[row.status]} (${sign}${Math.abs(row.deltaPts).toFixed(1)} pts vs. ${row.stat.value.toFixed(1)}%${row.stat.subSegment ? ", " + BAND_LABEL[row.stat.subSegment] : ""})`);
    } else out.push(`${row.label}: ${v} · ${PEER_LABEL.none}`);
  }
  return out;
}

/** Unique qualifications attached to any comparison actually shown. */
export function qualificationLines(h: HealthModel): string[] {
  const q = [...new Set(h.rows.map((x) => x.qualification).filter((x): x is string => !!x))];
  return q.length ? [`Qualifications: ${q.join(" ")}`] : [];
}

export function profitLines(h: HealthModel): string[] {
  const p = h.profit;
  if (p.status === "unknown") return [`Profitability: ${p.label}. ${p.reason ?? ""}`.trim()];
  const dir = p.direction === "loss" ? "loss" : p.direction === "profit" ? "profit" : "break-even";
  return [
    `Profitability: ${p.label}`,
    `Estimated pretax ${dir}: ${usd(p.pretaxMonthly)}/month · ${usd(p.pretaxAnnual)}/year (${pct(p.marginPct ?? 0)} of net sales)`.replace("Estimated pretax", p.status === "verified" ? "Pretax" : "Estimated pretax"),
    ...p.assumptions.map((a) => `  Assumption: ${a}`),
  ];
}

export function buildSummaryText(s: Scenario, r: ScenarioResult): string {
  const rep = buildReport(s, r);
  const health = buildHealth(s, r);
  const name = s.restaurantName.trim() || "Restaurant";
  const lines: string[] = [
    `MARGINLAB — OPERATOR SUMMARY${r.sales.preliminary ? " (PRELIMINARY ESTIMATE)" : ""}`,
    `${name} · ${CONCEPT_LABELS[s.concept]} · ${r.locations} location${r.locations > 1 ? "s" : ""}`,
    s.scenarioName ? `Scenario: ${s.scenarioName}` : "",
    "",
    "FINANCIAL SNAPSHOT",
    `Sales basis: ${SALES_STATUS_LABEL[r.sales.status]}`,
    `Monthly group net sales: ${usd(r.sales.monthlyGroup)}`,
    `Annual group net sales: ${usd(r.sales.annualGroup)}`,
    `Food & beverage cost: ${pct(r.current.food)} (${usd(r.current.foodMonthly)}/mo)`,
    `Labor cost: ${pct(r.current.labor)} (${usd(r.current.laborMonthly)}/mo)`,
    `Current prime cost: ${pct(r.current.prime)}`,
    "",
    "IMPROVEMENT SCENARIO (hypothetical)",
    `Food improvement: ${pts(r.improvement.foodPts)} → ${pct(r.improved.food)}`,
    `Labor improvement: ${pts(r.improvement.laborPts)} → ${pct(r.improved.labor)}`,
    `Proposed prime cost: ${pct(r.improved.prime)} (${pts(r.improvement.totalPts)} lower)`,
    `Potential savings: ${usd(r.savings.monthlyTotal)}/month · ${usd(r.savings.annualTotal)}/year`,
    `  Food: ${usd(r.savings.annualFood)}/yr (${Math.round(rep.contribution.foodShare * 100)}%) · Labor: ${usd(r.savings.annualLabor)}/yr (${Math.round(rep.contribution.laborShare * 100)}%)`,
    r.locations > 1 ? `Per location: ${usd(r.savings.perLocationMonthly)}/mo · ${usd(r.savings.perLocationAnnual)}/yr` : "",
    "",
    "FINANCIAL HEALTH VS. PUBLISHED PEER MEDIANS",
    ...healthLines(health),
    nearNote(health.windowPts).replace(/[“”]/g, '"'),
    ...profitLines(health),
    "Prime cost alone does not show profitability.",
    ...qualificationLines(health),
    "",
    "OPERATIONAL IMPROVEMENTS TO VALIDATE",
    ...rep.coaching.validate.map((x) => `- ${x}`),
    "",
    "RELEVANT SOLUTIONS (possibilities, not guaranteed outcomes)",
    ...(rep.included.length ? rep.included.map((x) => `- ${x.solution.name}: ${x.solution.costDriver}`) : ["- None selected."]),
    OVERLAP_NOTE,
    "",
    "KEY ASSUMPTIONS",
    ...keyAssumptions(s, r).map((x) => `- ${x}`),
    "",
    "REQUIRES VALIDATION",
    ...validationItems(s, r).map((x) => `- ${x}`),
    "",
    "SOURCES",
    `Medians: ${NRA_SOURCE.publisher}, ${NRA_SOURCE.title} (${NRA_SOURCE.dataPeriod}). Not targets. The food median covers food and nonalcoholic beverage cost only. Supplied by the SpotOn team; not independently checked.`,
    SOLUTIONS_DISCLAIMER,
  ];
  return lines.filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n");
}
