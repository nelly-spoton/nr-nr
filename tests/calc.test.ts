import { describe, expect, it } from "vitest";
import {
  compareToRange,
  computeRoi,
  computeScenario,
  dollarsToPct,
  effectivePts,
  pctToDollars,
  resolveSales,
  splitPreset,
} from "@/lib/calc";
import { exampleScenario, hydrateScenario } from "@/lib/scenario";
import { validateScenario } from "@/lib/validate";
import { buildSummaryText } from "@/lib/summary";
import { medianApplicability, REFERENCE_MEDIANS, defaultPlanning } from "@/config/benchmarks";
import { SOLUTIONS } from "@/config/solutions";
import type { Scenario } from "@/lib/types";

const ex = (patch: Partial<Scenario> = {}): Scenario => ({ ...exampleScenario(), ...patch });

describe("default scenario (acceptance #1)", () => {
  const r = computeScenario(exampleScenario());
  it("sales", () => {
    expect(r.sales.monthlyGroup).toBe(900000);
    expect(r.sales.annualGroup).toBe(10800000);
  });
  it("percentages", () => {
    expect(r.current.prime).toBe(68);
    expect(r.improved.food).toBe(31.6);
    expect(r.improved.labor).toBe(35.4);
    expect(r.improved.prime).toBe(67);
  });
  it("savings are exact", () => {
    expect(r.savings.monthlyFood).toBe(3600);
    expect(r.savings.monthlyLabor).toBe(5400);
    expect(r.savings.monthlyTotal).toBe(9000);
    expect(r.savings.annualTotal).toBe(108000);
    expect(r.savings.perLocationMonthly).toBe(1800);
    expect(r.savings.perLocationAnnual).toBe(21600);
  });
  it("food + labor = total (acceptance #4), month and year", () => {
    expect(r.savings.monthlyFood + r.savings.monthlyLabor).toBe(r.savings.monthlyTotal);
    expect(r.savings.annualFood + r.savings.annualLabor).toBe(r.savings.annualTotal);
  });
});

describe("volume scope (acceptance #2)", () => {
  it("group volume is not multiplied by locations", () => {
    const r = computeScenario(ex({ volumeScope: "group", amount: 900000 }));
    expect(r.sales.monthlyGroup).toBe(900000);
    expect(r.sales.monthlyPerLocation).toBe(180000);
    expect(r.savings.annualTotal).toBe(108000);
  });
  it("per-location volume is multiplied once", () => {
    expect(resolveSales(ex({ locations: 3, amount: 100000 })).monthlyGroup).toBe(300000);
  });
});

describe("GPV handling (acceptance #3)", () => {
  const gpv = (patch: Partial<Scenario["gpv"]>, amount: number | null = 200000): Scenario =>
    ex({ salesMode: "gpv", amount, gpv: { basis: "netEstimate", netEstimate: null, conversionFactor: null, ...patch } });

  it("is never silently equated to net sales", () => {
    const r = resolveSales(gpv({}));
    expect(r.resolved).toBe(false);
    expect(r.status).toBe("gpv-unresolved");
    expect(r.monthlyGroup).toBe(0);
    expect(computeScenario(gpv({})).savings.annualTotal).toBe(0);
  });
  it("factor of nothing does not default to 1", () => {
    expect(resolveSales(gpv({ basis: "factor" })).resolved).toBe(false);
  });
  it("uses an explicit factor and stays preliminary", () => {
    const r = resolveSales(gpv({ basis: "factor", conversionFactor: 0.85 }));
    expect(r.monthlyGroup).toBe(850000);
    expect(r.preliminary).toBe(true);
    expect(r.status).toBe("gpv-via-factor");
  });
  it("uses an independent net estimate", () => {
    const r = resolveSales(gpv({ netEstimate: 170000 }));
    expect(r.monthlyGroup).toBe(850000);
    expect(r.status).toBe("gpv-via-net-estimate");
  });
  it("only verified net sales is non-preliminary", () => {
    expect(resolveSales(ex({ salesConfidence: "verified" })).preliminary).toBe(false);
    expect(resolveSales(ex({ salesConfidence: "estimated" })).preliminary).toBe(true);
  });
  it("validation requires a conversion for GPV", () => {
    const issues = validateScenario(gpv({}));
    expect(issues.some((i) => i.field === "gpv.netEstimate" && i.severity === "error")).toBe(true);
  });
});

describe("percentage points vs relative (acceptance #5)", () => {
  it("1 pt off 32% food is 31%, not 31.68%", () => {
    const r = computeScenario(ex({ foodImprovementPts: 1, laborImprovementPts: 0 }));
    expect(r.improved.food).toBe(31);
    expect(r.savings.monthlyFood).toBe(9000); // 1% of 900k
  });
});

describe("clamping & robustness", () => {
  it("never reduces a category below zero", () => {
    expect(effectivePts(5, 2).pts).toBe(2);
    expect(effectivePts(5, 2).clamped).toBe(true);
    const r = computeScenario(ex({ foodPct: 2, foodImprovementPts: 5 }));
    expect(r.improved.food).toBe(0);
    expect(r.savings.monthlyFood).toBe(18000);
  });
  it("caps at 5 points", () => {
    expect(effectivePts(9, 40).pts).toBe(5);
  });
  it("zero revenue gives zeros, no NaN/Infinity", () => {
    const r = computeScenario(ex({ amount: 0 }));
    for (const v of [r.savings.annualTotal, r.savings.perLocationMonthly, r.current.primeMonthly]) {
      expect(v).toBe(0);
      expect(Number.isFinite(v)).toBe(true);
    }
    expect(dollarsToPct(1000, 0)).toBeNull();
  });
  it("null / negative / NaN inputs are treated as 0", () => {
    const r = computeScenario(ex({ amount: null, foodPct: -5, laborPct: Number.NaN, locations: null }));
    expect(r.sales.monthlyGroup).toBe(0);
    expect(r.current.prime).toBe(0);
    expect(r.locations).toBe(1);
  });
  it("validation flags missing, negative and out-of-range", () => {
    const issues = validateScenario(ex({ amount: -1, foodPct: null, laborPct: 120, locations: 11, foodImprovementPts: 6 }));
    const fields = issues.filter((i) => i.severity === "error").map((i) => i.field);
    expect(fields).toEqual(expect.arrayContaining(["amount", "foodPct", "laborPct", "locations", "foodImprovementPts"]));
  });
  it("default scenario has no errors", () => {
    expect(validateScenario(exampleScenario()).filter((i) => i.severity === "error")).toEqual([]);
  });
});

describe("dollar ↔ percent entry", () => {
  it("round trips", () => {
    expect(pctToDollars(32, 900000)).toBe(288000);
    expect(dollarsToPct(288000, 900000)).toBe(32);
  });
});

describe("preset split", () => {
  it("food + labor equals the preset", () => {
    for (const t of [0.5, 1, 1.5, 2, 3]) {
      const s = splitPreset(t, 32, 36);
      expect(s.food + s.labor).toBeCloseTo(t, 10);
    }
  });
  it("respects the 5 pt cap per category", () => {
    const s = splitPreset(3, 32, 1);
    expect(s.labor).toBeLessThanOrEqual(1);
  });
});

describe("ROI", () => {
  const s = ex({ roi: { monthlySoftwareCost: 2000, oneTimeCost: 10000, otherMonthlyCost: 500 } });
  const roi = computeRoi(s, 9000);
  it("net benefit", () => {
    expect(roi.annualGrossSavings).toBe(108000);
    expect(roi.annualIncrementalCost).toBe(30000);
    expect(roi.annualNetBenefit).toBe(78000);
    expect(roi.firstYearNetBenefit).toBe(68000);
  });
  it("payback only when meaningful", () => {
    expect(roi.paybackMonths).toBeCloseTo(10000 / 6500, 2);
    expect(computeRoi(s, 1000).paybackMonths).toBeNull();
    expect(computeRoi(s, 0).paybackMonths).toBeNull();
  });
});

describe("benchmarks", () => {
  it("medians match the verified source figures", () => {
    expect(REFERENCE_MEDIANS[0]).toMatchObject({ foodPct: 32.0, laborPct: 36.5 });
    expect(REFERENCE_MEDIANS[1]).toMatchObject({ foodPct: 32.4, laborPct: 31.7 });
  });
  it("no published medians are applied to bars, breweries or multi-concept groups", () => {
    expect(medianApplicability("bar_pub").set).toBeNull();
    expect(medianApplicability("brewery_taproom").set).toBeNull();
    expect(medianApplicability("multi_concept").set).toBeNull();
  });
  it("planning ranges", () => {
    const p = defaultPlanning();
    expect(p.full_service.prime).toEqual({ min: 60, max: 65 });
    expect(p.quick_service.labor).toEqual({ min: 25, max: 30 });
    expect(p.fast_casual.labor).toEqual({ min: 25, max: 30 });
    expect(p.bar_pub.food).toEqual({ min: null, max: null });
    expect(p.bar_pub.origin).toBe("none");
    expect(p.full_service.origin).toBe("illustrative");
  });
  it("range statuses", () => {
    const r = { min: 60, max: 65 };
    expect(compareToRange(62, r)).toBe("within");
    expect(compareToRange(60, r)).toBe("within");
    expect(compareToRange(68, r)).toBe("above");
    expect(compareToRange(55, r)).toBe("below");
    expect(compareToRange(55, { min: null, max: null })).toBe("unset");
  });
});

describe("solutions config & summary", () => {
  it("every solution has a link, requirements and mechanism", () => {
    for (const s of SOLUTIONS) {
      expect(s.link.url).toMatch(/^https:\/\//);
      expect(s.requirements.length).toBeGreaterThan(0);
      expect(s.mechanism.length).toBeGreaterThan(0);
    }
  });
  it("summary labels estimates and carries the headline number", () => {
    const s = exampleScenario();
    const t = buildSummaryText(s, computeScenario(s));
    expect(t).toContain("PRELIMINARY");
    expect(t).toContain("$108,000/year");
    expect(t).toContain("NONALCOHOLIC");
  });
  it("hydrate tolerates garbage", () => {
    expect(hydrateScenario("nope").restaurantName).toBe("Example Restaurant Group");
    expect(hydrateScenario({ locations: 3 }).locations).toBe(3);
  });
});
