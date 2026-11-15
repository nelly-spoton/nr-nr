import { CONCEPT_LABELS } from "@/config/concepts";
import { NRA_SOURCE, PLANNING_NOTE } from "@/config/benchmarks";
import { PROOF_DISCLAIMER, metricQualifier, verificationLabel } from "@/config/caseStudies";
import { OVERLAP_NOTE, SOLUTIONS_DISCLAIMER } from "@/config/solutions";
import { compareAll, RANGE_STATUS_LABEL, type ScenarioResult } from "./calc";
import { pct, pts, usd } from "./format";
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
    "Confirm product compatibility, availability and pricing with SpotOn and each partner.",
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
    "Customer examples are published results from other restaurants and do not change this model.",
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

export function benchmarkLine(s: Scenario, rep: Report): string {
  const m = rep.medians;
  if (!m.set) return m.qualification ?? "No published benchmark applied.";
  return `Published medians (${m.set.label}): food ${pct(m.set.foodPct)}, labor ${pct(m.set.laborPct)}.${m.qualification ? " " + m.qualification : ""}`;
}

export function buildSummaryText(s: Scenario, r: ScenarioResult): string {
  const rep = buildReport(s, r);
  const name = s.restaurantName.trim() || "Restaurant";
  const cmp = compareAll(r, s.planning[s.concept]);
  const cmpLine = (label: string, k: "food" | "labor" | "prime") =>
    cmp[k] === "unset" ? `${label}: no planning range set` : `${label}: ${RANGE_STATUS_LABEL[cmp[k]]}`;
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
    "BENCHMARK CONTEXT",
    cmpLine("Food", "food"),
    cmpLine("Labor", "labor"),
    cmpLine("Prime", "prime"),
    benchmarkLine(s, rep),
    "",
    "CUSTOMER PROOF (published examples, not predictions)",
    ...(rep.proofPoints.length
      ? rep.proofPoints.flatMap((m) => [
          `- ${m.study.name} (${m.study.conceptLabel}): ${m.study.metric.wording} [${verificationLabel(m.study)}]`,
          `  ${metricQualifier(m.study.metric)}`,
          `  Source: ${m.study.sourceUrl}`,
        ])
      : ["- No sufficiently relevant published example for this profile."]),
    PROOF_DISCLAIMER,
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
    `${NRA_SOURCE.publisher}, ${NRA_SOURCE.title} (${NRA_SOURCE.dataPeriod}). ${NRA_SOURCE.caveats[0]} ${NRA_SOURCE.caveats[1]}`,
    PLANNING_NOTE,
    SOLUTIONS_DISCLAIMER,
  ];
  return lines.filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n");
}
