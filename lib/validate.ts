import { MAX_IMPROVEMENT_PTS } from "./calc";
import type { Issue, NumField, Scenario } from "./types";

const bad = (x: NumField) => typeof x !== "number" || !Number.isFinite(x);

function checkNumber(
  out: Issue[],
  field: string,
  label: string,
  v: NumField,
  opts: { min?: number; max?: number; required?: boolean },
) {
  if (bad(v)) {
    if (opts.required) out.push({ field, message: `${label} is required.`, severity: "error" });
    return;
  }
  const n = v as number;
  if (n < 0) out.push({ field, message: `${label} cannot be negative.`, severity: "error" });
  else if (opts.min !== undefined && n < opts.min)
    out.push({ field, message: `${label} must be at least ${opts.min}.`, severity: "error" });
  else if (opts.max !== undefined && n > opts.max)
    out.push({ field, message: `${label} must be ${opts.max} or less.`, severity: "error" });
}

export function validateScenario(s: Scenario): Issue[] {
  const out: Issue[] = [];
  checkNumber(out, "locations", "Locations", s.locations, { min: 1, max: 10, required: true });
  if (typeof s.locations === "number" && !Number.isInteger(s.locations))
    out.push({ field: "locations", message: "Locations must be a whole number.", severity: "error" });

  checkNumber(out, "amount", s.salesMode === "gpv" ? "Monthly GPV" : "Monthly net sales", s.amount, {
    required: true,
  });
  if (s.salesMode === "gpv") {
    if (s.gpv.basis === "netEstimate") {
      checkNumber(out, "gpv.netEstimate", "Net-sales estimate", s.gpv.netEstimate, { required: true });
    } else {
      checkNumber(out, "gpv.conversionFactor", "GPV-to-net factor", s.gpv.conversionFactor, {
        required: true,
        max: 1.5,
      });
      if (!bad(s.gpv.conversionFactor) && (s.gpv.conversionFactor as number) === 0)
        out.push({ field: "gpv.conversionFactor", message: "Factor must be greater than zero.", severity: "error" });
    }
  }
  if (typeof s.amount === "number" && s.amount === 0)
    out.push({ field: "amount", message: "Sales are zero, so dollar results are $0.", severity: "warning" });

  checkNumber(out, "foodPct", "Food & beverage cost %", s.foodPct, { max: 100, required: true });
  checkNumber(out, "laborPct", "Labor cost %", s.laborPct, { max: 100, required: true });
  if (!bad(s.foodPct) && !bad(s.laborPct) && (s.foodPct as number) + (s.laborPct as number) > 100)
    out.push({ field: "foodPct", message: "Prime cost exceeds 100% of net sales.", severity: "warning" });

  checkNumber(out, "foodImprovementPts", "Food improvement", s.foodImprovementPts, { max: MAX_IMPROVEMENT_PTS });
  checkNumber(out, "laborImprovementPts", "Labor improvement", s.laborImprovementPts, { max: MAX_IMPROVEMENT_PTS });
  if (typeof s.foodImprovementPts === "number" && typeof s.foodPct === "number" && s.foodImprovementPts > s.foodPct)
    out.push({ field: "foodImprovementPts", message: "Improvement capped so food cost cannot go below 0%.", severity: "warning" });
  if (typeof s.laborImprovementPts === "number" && typeof s.laborPct === "number" && s.laborImprovementPts > s.laborPct)
    out.push({ field: "laborImprovementPts", message: "Improvement capped so labor cost cannot go below 0%.", severity: "warning" });

  checkNumber(out, "roi.monthlySoftwareCost", "Monthly software cost", s.roi.monthlySoftwareCost, {});
  checkNumber(out, "roi.oneTimeCost", "One-time cost", s.roi.oneTimeCost, {});
  checkNumber(out, "roi.otherMonthlyCost", "Other ongoing cost", s.roi.otherMonthlyCost, {});

  return out;
}

export const issueFor = (issues: Issue[], field: string): Issue | undefined =>
  issues.find((i) => i.field === field);
