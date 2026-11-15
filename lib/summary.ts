import { medianSetFor, NRA_SOURCE, PLANNING_NOTE, CONCEPT_LABELS } from "@/config/benchmarks";
import { SOLUTIONS, SOLUTIONS_DISCLAIMER, OVERLAP_NOTE } from "@/config/solutions";
import type { Scenario, SalesStatus } from "./types";
import { compareAll, RANGE_STATUS_LABEL, type ScenarioResult } from "./calc";
import { pct, pts, usd } from "./format";

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
    "Confirm product compatibility, availability and pricing with SpotOn and each partner.",
    "Validate improvement assumptions against observed operational change.",
  ];
  if (r.sales.preliminary) items.unshift("Sales figure is an estimate or GPV-derived: all savings are PRELIMINARY.");
  if (s.salesMode === "gpv")
    items.push("GPV may include taxes and tips and exclude cash sales; it is not net sales.");
  if (s.concept === "bar" || s.concept === "custom")
    items.push("No published benchmark applied; targets are operator-defined.");
  return items;
}

export function keyAssumptions(s: Scenario): string[] {
  return [
    "All savings are hypothetical estimates, not guarantees.",
    "Improvements are percentage POINTS of net sales, not relative reductions.",
    "Equal sales assumed across locations.",
    "Payment-processing, delivery-commission and sales-increase effects are not counted as prime-cost savings.",
    s.volumeScope === "group"
      ? "Entered volume is treated as the entire group's volume."
      : "Entered volume is per location and multiplied by location count.",
  ];
}

export function selectedSolutions(s: Scenario) {
  return SOLUTIONS.filter((x) => s.selectedSolutionIds.includes(x.id));
}

export function buildSummaryText(s: Scenario, r: ScenarioResult): string {
  const name = s.restaurantName.trim() || "Restaurant";
  const cmp = compareAll(r, s.planning[s.concept]);
  const cmpLine = (label: string, k: "food" | "labor" | "prime") =>
    cmp[k] === "unset" ? `${label}: no planning range set` : `${label}: ${RANGE_STATUS_LABEL[cmp[k]]}`;
  const med = medianSetFor(s.concept);
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
    `  Food: ${usd(r.savings.monthlyFood)}/mo · ${usd(r.savings.annualFood)}/yr`,
    `  Labor: ${usd(r.savings.monthlyLabor)}/mo · ${usd(r.savings.annualLabor)}/yr`,
    r.locations > 1
      ? `Per location: ${usd(r.savings.perLocationMonthly)}/mo · ${usd(r.savings.perLocationAnnual)}/yr`
      : "",
    "",
    "BENCHMARK CONTEXT",
    cmpLine("Food", "food"),
    cmpLine("Labor", "labor"),
    cmpLine("Prime", "prime"),
    med
      ? `Published medians (${med.label}): food ${pct(med.foodPct)}, labor ${pct(med.laborPct)}`
      : "No published benchmark applied to this concept.",
    "",
    "RELEVANT SOLUTIONS (possibilities, not guaranteed outcomes)",
    ...selectedSolutions(s).map((x) => `- ${x.name}: ${x.mechanism[0]}`),
    OVERLAP_NOTE,
    "",
    "KEY ASSUMPTIONS",
    ...keyAssumptions(s).map((x) => `- ${x}`),
    "",
    "REQUIRES VALIDATION",
    ...validationItems(s, r).map((x) => `- ${x}`),
    "",
    "SOURCES",
    `${NRA_SOURCE.publisher}, ${NRA_SOURCE.title} (${NRA_SOURCE.dataPeriod}). ${NRA_SOURCE.caveats[0]} ${NRA_SOURCE.caveats[1]}`,
    PLANNING_NOTE,
    SOLUTIONS_DISCLAIMER,
  ];
  return lines.filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n");
}
