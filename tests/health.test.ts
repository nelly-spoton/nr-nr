import { describe, expect, it } from "vitest";
import { computeScenario } from "@/lib/calc";
import { computeDetailed, groupRatioPct } from "@/lib/detailed";
import { buildHealth, classify, PEER_LABEL } from "@/lib/health";
import { computeProfit } from "@/lib/profit";
import { emptyExpenses, exampleScenario, hydrateScenario, EXPENSE_KEYS } from "@/lib/scenario";
import { validateScenario } from "@/lib/validate";
import { buildSummaryText } from "@/lib/summary";
import { REFERENCE_MEDIANS, defaultPlanning } from "@/config/benchmarks";
import { STATS, STAT_BY_ID, SOURCES, EVIDENCE_LABELS, overallMedian } from "@/config/stats";
import type { Scenario } from "@/lib/types";

const ex = (p: Partial<Scenario> = {}): Scenario => ({ ...exampleScenario(), ...p });
const detailed = (p: Partial<Scenario> = {}): Scenario =>
  ex({
    costMode: "detailed",
    locations: 1,
    amount: 180000,
    detailed: { foodSharePct: 75, alcoholSharePct: 25, foodCogsRatePct: 34, alcoholCogsRatePct: 22 },
    laborPct: 36,
    foodImprovementPts: 0.4,
    laborImprovementPts: 0.6,
    ...p,
  });

describe("detailed mode — the specified acceptance scenario", () => {
  const r = computeScenario(detailed());
  const d = r.cogs.detail!;
  it("revenue split and COGS in dollars", () => {
    expect(d.foodRevenue).toBe(135000);
    expect(d.alcoholRevenue).toBe(45000);
    expect(d.foodCogs).toBe(45900);
    expect(d.alcoholCogs).toBe(9900);
    expect(d.totalCogs).toBe(55800);
  });
  it("blended F&B COGS is 31%, not the sum of category rates", () => {
    expect(d.blendedPct).toBe(31);
    expect(d.blendedPct).not.toBe(34 + 22);
    expect(r.current.food).toBe(31);
  });
  it("labor $64,800 and prime $120,600 = 67%", () => {
    expect(r.current.laborMonthly).toBe(64800);
    expect(r.current.primeMonthly).toBe(120600);
    expect(r.current.prime).toBe(67);
  });
  it("a one-point improvement is $1,800 a month and $21,600 a year", () => {
    expect(r.improvement.totalPts).toBe(1);
    expect(r.savings.monthlyTotal).toBe(1800);
    expect(r.savings.annualTotal).toBe(21600);
    expect(r.savings.monthlyFood + r.savings.monthlyLabor).toBe(r.savings.monthlyTotal);
  });
  it("food COGS as % of total sales is the comparable basis (25.5%)", () => {
    expect(d.foodCogsPctOfSales).toBe(25.5);
    expect(d.alcoholCogsPctOfSales).toBe(5.5);
  });
});

describe("detailed mode — rules", () => {
  it("no alcohol sales → alcohol revenue and COGS are zero, whatever rate was typed", () => {
    const b = computeDetailed(180000, { foodSharePct: 100, alcoholSharePct: 0, foodCogsRatePct: 32, alcoholCogsRatePct: 99 });
    expect(b.alcoholRevenue).toBe(0);
    expect(b.alcoholCogs).toBe(0);
    expect(b.blendedPct).toBe(32);
    expect(b.sellsAlcohol).toBe(false);
  });
  it("revenue shares must total 100%", () => {
    const b = computeDetailed(180000, { foodSharePct: 70, alcoholSharePct: 25, foodCogsRatePct: 34, alcoholCogsRatePct: 22 });
    expect(b.valid).toBe(false);
    expect(b.problems.join(" ")).toMatch(/100%/);
    const errs = validateScenario(detailed({ detailed: { foodSharePct: 70, alcoholSharePct: 25, foodCogsRatePct: 34, alcoholCogsRatePct: 22 } }));
    expect(errs.some((e) => e.severity === "error" && /100%/.test(e.message))).toBe(true);
  });
  it("an invalid detailed model yields zero cost, never a guessed one", () => {
    const r = computeScenario(detailed({ detailed: { foodSharePct: 70, alcoholSharePct: 25, foodCogsRatePct: 34, alcoholCogsRatePct: 22 } }));
    expect(r.cogs.valid).toBe(false);
    expect(r.current.food).toBe(0);
  });
  it("alcohol sales without an alcohol rate is flagged", () => {
    const b = computeDetailed(180000, { foodSharePct: 75, alcoholSharePct: 25, foodCogsRatePct: 34, alcoholCogsRatePct: null });
    expect(b.valid).toBe(false);
  });
  it("quick mode keeps the fast calculator and fabricates no breakdown", () => {
    const r = computeScenario(exampleScenario());
    expect(r.cogs.mode).toBe("quick");
    expect(r.cogs.detail).toBeNull();
    expect(r.savings.annualTotal).toBe(108000);
  });
  it("group ratio is total cost ÷ total sales, never an average of percentages", () => {
    const g = groupRatioPct([{ sales: 100000, cost: 30000 }, { sales: 300000, cost: 60000 }]);
    expect(g).toBe(22.5);
    expect(g).not.toBe((30 + 20) / 2);
    expect(groupRatioPct([])).toBeNull();
  });
  it("hydrating a V2 save defaults to quick mode with no breakdown", () => {
    const s = hydrateScenario({ concept: "full_service", locations: 2, foodPct: 30, laborPct: 34 });
    expect(s.costMode).toBe("quick");
    expect(s.detailed.foodSharePct).toBeNull();
    expect(s.nearWindowPts).toBe(1);
    expect(s.expenses.basis).toBe("assumed");
  });
});

describe("peer comparison", () => {
  it("classifies with an adjustable window, inclusive at the boundary", () => {
    expect(classify(33, 32, 1).status).toBe("near");
    expect(classify(33.01, 32, 1).status).toBe("above");
    expect(classify(30.99, 32, 1).status).toBe("below");
    expect(classify(33, 32, 0.5).status).toBe("above");
    expect(classify(34, 32, 3).status).toBe("near");
    expect(classify(36, 36.5, 1).deltaPts).toBe(-0.5);
  });
  it("full-service: food and labor compare; prime has no measured median", () => {
    const s = ex({ concept: "full_service", foodPct: 32, laborPct: 36 });
    const h = buildHealth(s, computeScenario(s));
    const row = (id: string) => h.rows.find((x) => x.id === id)!;
    expect(row("combined").status).toBe("near");
    expect(row("labor").status).toBe("near");
    expect(row("labor").deltaPts).toBe(-0.5);
    expect(row("prime").status).toBe("none");
    expect(row("prime").noBenchmarkReason).toMatch(/No measured full-service prime-cost median/);
    expect(PEER_LABEL[row("prime").status]).toBe("No comparable benchmark");
  });
  it("limited-service: the measured 65.0% prime-cost median applies", () => {
    const s = ex({ concept: "quick_service", locations: 1, foodPct: 34, laborPct: 33 });
    const h = buildHealth(s, computeScenario(s));
    const prime = h.rows.find((x) => x.id === "prime")!;
    expect(prime.stat?.value).toBe(65);
    expect(prime.status).toBe("above");
    expect(prime.deltaPts).toBe(2);
    const near = ex({ concept: "quick_service", locations: 1, foodPct: 33, laborPct: 33 }); // 66% is exactly 1.0 pt away
    expect(buildHealth(near, computeScenario(near)).rows.find((x) => x.id === "prime")!.status).toBe("near");
  });
  it("bars and breweries have no comparable benchmark at all", () => {
    for (const c of ["bar_pub", "brewery_taproom", "multi_concept"] as const) {
      const s = ex({ concept: c });
      const h = buildHealth(s, computeScenario(s));
      expect(h.rows.every((x) => x.status === "none")).toBe(true);
      expect(h.segment).toBeNull();
    }
  });
  it("with alcohol sales: food compares on a qualified basis; alcohol and blended do not compare", () => {
    const s = detailed({ concept: "full_service" });
    const h = buildHealth(s, computeScenario(s));
    const get = (id: string) => h.rows.find((x) => x.id === id)!;
    expect(get("food").stat?.id).toBe("nra-fs-food");
    expect(get("food").qualification).toMatch(/NONALCOHOLIC/);
    expect(get("alcohol").status).toBe("none");
    expect(get("alcohol").noBenchmarkReason).toMatch(/No verified current benchmark/);
    expect(get("blended").status).toBe("none");
    expect(get("blended").noBenchmarkReason).toMatch(/exclude alcoholic/);
  });
  it("without alcohol, the blended row matches the food row", () => {
    const s = detailed({ detailed: { foodSharePct: 100, alcoholSharePct: 0, foodCogsRatePct: 32, alcoholCogsRatePct: null } });
    const h = buildHealth(s, computeScenario(s));
    expect(h.rows.find((x) => x.id === "blended")!.status).toBe("near");
  });
  it("full-service adds an annual-sales-band comparison using per-location sales", () => {
    const small = ex({ concept: "full_service", locations: 1, amount: 100000, foodPct: 33, laborPct: 36 }); // $1.2M/yr
    const hs = buildHealth(small, computeScenario(small)).rows[0]!;
    expect(hs.band?.stat.id).toBe("nra-fs-food-below2m");
    const big = ex({ concept: "full_service", locations: 1, amount: 200000, foodPct: 33, laborPct: 36 }); // $2.4M/yr
    expect(buildHealth(big, computeScenario(big)).rows[0]!.band?.stat.id).toBe("nra-fs-food-2m");
  });
  it("an operator pick switches the comparison to another comparable statistic only", () => {
    const s = ex({ concept: "full_service", locations: 1, amount: 100000, benchmarkPick: { food_cost: "nra-fs-food-below2m" } });
    expect(buildHealth(s, computeScenario(s)).rows[0]!.stat?.id).toBe("nra-fs-food-below2m");
    const bad = ex({ concept: "full_service", benchmarkPick: { food_cost: "nra-ls-food" } });
    expect(buildHealth(bad, computeScenario(bad)).rows[0]!.stat?.id).toBe("nra-fs-food");
  });
  it("labor profitable/unprofitable medians are context only, never the comparison", () => {
    const s = ex({ concept: "full_service" });
    const h = buildHealth(s, computeScenario(s));
    expect(h.laborContext?.profitable.value).toBe(34.2);
    expect(h.laborContext?.unprofitable.value).toBe(42.9);
    expect(h.comparableIds.has("nra-fs-labor-profitable")).toBe(false);
  });
});

describe("profitability", () => {
  const fill = (s: Scenario, monthly = 1000): Scenario => ({
    ...s,
    expenses: {
      ...s.expenses,
      lines: Object.fromEntries(EXPENSE_KEYS.map((e) => [e.key, { monthly, excluded: false }])) as Scenario["expenses"]["lines"],
    },
  });
  it("is unknown until every line is addressed — prime cost alone never implies profit", () => {
    const s = ex({ foodPct: 20, laborPct: 20 }); // prime 40% — far below any benchmark
    const p = computeProfit(s, computeScenario(s));
    expect(p.status).toBe("unknown");
    expect(p.label).toBe("Profitability not yet determined");
    expect(p.direction).toBeNull();
    expect(p.pretaxMonthly).toBe(0);
    expect(p.missing).toHaveLength(11);
  });
  it("partial entry stays unknown and says what is missing", () => {
    const s = ex();
    s.expenses = { ...s.expenses, lines: { ...s.expenses.lines, occupancy: { monthly: 5000, excluded: false } } };
    const p = computeProfit(s, computeScenario(s));
    expect(p.status).toBe("unknown");
    expect(p.addressed).toBe(1);
    expect(p.reason).toMatch(/10 of 11/);
  });
  it("zero is a valid answer; once complete the model is an estimate with assumptions", () => {
    const s = fill(ex({ locations: 1, amount: 180000 }), 0);
    const r = computeScenario(s);
    const p = computeProfit(s, r);
    expect(p.status).toBe("estimated");
    expect(p.pretaxMonthly).toBe(180000 - r.current.primeMonthly);
    expect(p.assumptions.length).toBeGreaterThan(2);
    expect(p.assumptions.join(" ")).toMatch(/not figures from actual financial statements|assumptions, not figures/);
  });
  it("income arithmetic: sales − prime − operating − D&A − interest", () => {
    const s = fill(ex({ locations: 1, amount: 180000, foodPct: 32, laborPct: 36 }), 1000);
    const p = computeProfit(s, computeScenario(s));
    // prime 122,400; 9 operating lines × 1000 = 9,000; D&A 1,000; interest 1,000
    expect(p.opexMonthly).toBe(9000);
    expect(p.beforeDaMonthly).toBe(180000 - 122400 - 9000);
    expect(p.pretaxMonthly).toBe(180000 - 122400 - 9000 - 1000 - 1000);
    expect(p.marginPct).toBeCloseTo((p.pretaxMonthly / 180000) * 100, 1);
    expect(p.pretaxAnnual).toBe(p.pretaxMonthly * 12);
  });
  it("excluded lines are not double counted but do count as addressed", () => {
    const s = fill(ex({ locations: 1, amount: 180000 }), 1000);
    s.expenses.lines.admin = { monthly: 1000, excluded: true };
    s.expenses.lines.corporate = { monthly: 1000, excluded: true };
    const p = computeProfit(s, computeScenario(s));
    expect(p.excludedKeys).toEqual(["admin", "corporate"]);
    expect(p.opexMonthly).toBe(7000);
    expect(p.assumptions.join(" ")).toMatch(/double counting/);
  });
  it("verified only with actual financials AND verified sales", () => {
    const base = fill(ex({ locations: 1, amount: 180000 }), 500);
    expect(computeProfit({ ...base, expenses: { ...base.expenses, basis: "actual" }, salesConfidence: "verified" }, computeScenario({ ...base, salesConfidence: "verified" })).status).toBe("verified");
    expect(computeProfit({ ...base, expenses: { ...base.expenses, basis: "actual" } }, computeScenario(base)).status).toBe("estimated");
    expect(computeProfit({ ...base, salesConfidence: "verified" }, computeScenario(base)).status).toBe("estimated");
  });
  it("loss and breakeven are named plainly", () => {
    const loss = fill(ex({ locations: 1, amount: 180000 }), 8000);
    expect(computeProfit(loss, computeScenario(loss)).direction).toBe("loss");
  });
  it("pretax margin compares with the published median only when determined", () => {
    const undetermined = ex({ concept: "full_service" });
    expect(buildHealth(undetermined, computeScenario(undetermined)).rows.find((x) => x.id === "pretax")!.status).toBe("none");
    const s = fill(ex({ concept: "full_service", locations: 1, amount: 180000, foodPct: 32, laborPct: 36 }), 500);
    const row = buildHealth(s, computeScenario(s)).rows.find((x) => x.id === "pretax")!;
    expect(row.stat).not.toBeNull();
    expect(row.qualification).toMatch(/Estimated from assumptions/);
  });
  it("the summary never calls a restaurant profitable from prime cost", () => {
    const s = ex({ foodPct: 20, laborPct: 20 });
    const t = buildSummaryText(s, computeScenario(s));
    expect(t).toMatch(/Profitability not yet determined/);
    expect(t).not.toMatch(/\bprofitable\b/i);
  });
});

describe("centralized stats data", () => {
  const pub = (id: string) => STAT_BY_ID[id]!;
  it("holds exactly the supplied NRA values", () => {
    const expected: Record<string, number> = {
      "nra-fs-food": 32.0, "nra-fs-labor": 36.5, "nra-fs-margin": 2.8, "nra-fs-labor-profitable": 34.2, "nra-fs-labor-unprofitable": 42.9,
      "nra-ls-food": 32.4, "nra-ls-labor": 31.7, "nra-ls-prime": 65.0, "nra-ls-margin": 4.0, "nra-ls-labor-profitable": 30.0, "nra-ls-labor-unprofitable": 34.1,
      "nra-fs-food-below2m": 33.7, "nra-fs-margin-below2m": 1.1, "nra-fs-food-2m": 31.0, "nra-fs-margin-2m": 4.3,
    };
    for (const [id, v] of Object.entries(expected)) {
      expect(pub(id).value).toBe(v);
      expect(pub(id).evidence).toBe("published_measured");
      expect(pub(id).sourceId).toBe("nra2025");
    }
  });
  it("has no measured full-service prime-cost median", () => {
    expect(STATS.filter((s) => s.metricKey === "prime_cost" && s.segment === "full_service" && s.evidence === "published_measured")).toEqual([]);
    expect(overallMedian("prime_cost", "full_service")).toBeNull();
  });
  it("keeps BevSpot separate, historical and vendor-specific", () => {
    for (const id of ["bevspot-beer", "bevspot-spirits", "bevspot-wine"]) {
      const s = pub(id);
      expect(s.evidence).toBe("vendor_historical");
      expect(s.sourceId).toBe("bevspot2016");
      expect(s.qualifications.join(" ")).toMatch(/HISTORICAL \(2016\)/);
      expect(s.qualifications.join(" ")).toMatch(/Not a 2026 industry average/);
    }
    expect([pub("bevspot-beer").value, pub("bevspot-spirits").value, pub("bevspot-wine").value]).toEqual([24, 15, 28]);
    expect(STATS.filter((s) => s.evidence === "published_measured").every((s) => s.sourceId === "nra2025")).toBe(true);
  });
  it("every statistic carries the required fields and a resolvable source", () => {
    const ids = new Set<string>();
    for (const s of STATS) {
      expect(ids.has(s.id)).toBe(false);
      ids.add(s.id);
      for (const k of ["id", "metricKey", "metric", "value", "unit", "segment", "numerator", "denominator", "sourceId", "evidence", "qualifications", "explanation", "operatorMeaning", "lastVerified"] as const)
        expect(s[k], `${s.id}.${k}`).toBeDefined();
      expect(s.qualifications.length).toBeGreaterThan(0);
      const src = SOURCES[s.sourceId]!;
      expect(src, s.id).toBeDefined();
      expect(src).toHaveProperty("dataPeriod");
      expect(src).toHaveProperty("publicationDate"); // explicit null when not captured
      expect(src).toHaveProperty("sample");
      expect(EVIDENCE_LABELS[s.evidence]).toBeTruthy();
    }
  });
  it("does not invent unsupplied provenance", () => {
    expect(SOURCES.nra2025!.publicationDate).toBeNull();
    expect(SOURCES.nra2025!.urlStatus).toBe("publisher_home");
    expect(SOURCES.bevspot2016!.url).toBeNull();
    for (const s of STATS) expect(s.lastVerified.status).not.toBe("verified");
  });
  it("has no geographic fields or geographic segments anywhere", () => {
    const text = JSON.stringify({ STATS, SOURCES });
    expect(text).not.toMatch(/"(region|state|city|metro|zip|geo\w*|market)"\s*:/i);
    for (const s of STATS) expect(["full_service", "limited_service", "all"]).toContain(s.segment);
  });
  it("Benchmarks reference medians are derived from the same central data", () => {
    expect(REFERENCE_MEDIANS[0]).toMatchObject({ foodPct: pub("nra-fs-food").value, laborPct: pub("nra-fs-labor").value });
    expect(REFERENCE_MEDIANS[1]).toMatchObject({ foodPct: pub("nra-ls-food").value, laborPct: pub("nra-ls-labor").value });
    const p = defaultPlanning();
    expect(p.full_service.prime).toMatchObject({ min: pub("plan-fs-prime").value, max: pub("plan-fs-prime").valueMax });
    expect(p.quick_service.labor).toMatchObject({ min: pub("plan-ls-labor").value, max: pub("plan-ls-labor").valueMax });
  });
  it("planning guidelines are labeled illustrative, never measured", () => {
    for (const s of STATS.filter((x) => x.id.startsWith("plan-"))) expect(s.evidence).toBe("illustrative_planning");
  });
});
