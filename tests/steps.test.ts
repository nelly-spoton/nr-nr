import { describe, expect, it } from "vitest";
import { computeScenario } from "@/lib/calc";
import { applyGuided, pointsFor } from "@/lib/focus";
import { blankScenario, exampleScenario, hydrateScenario } from "@/lib/scenario";
import { requiredStatus, STEPS } from "@/lib/steps";
import { buildProfile } from "@/lib/profile";
import { recommendSolutions } from "@/lib/recommend";
import { matchCaseStudies } from "@/lib/matching";
import type { Scenario } from "@/lib/types";

const filled = (p: Partial<Scenario> = {}): Scenario =>
  applyGuided({ ...blankScenario(), conceptConfirmed: true, locations: 5, amount: 180000, foodPct: 32, laborPct: 36, ...p });

describe("blank start", () => {
  const b = blankScenario();
  it("assumes nothing", () => {
    expect(b.conceptConfirmed).toBe(false);
    expect(b.amount).toBeNull();
    expect(b.foodPct).toBeNull();
    expect(b.laborPct).toBeNull();
    expect(b.restaurantName).toBe("");
    expect(b.improvementMode).toBe("guided");
  });
  it("shows no opportunity until the required answers exist", () => {
    const r = computeScenario(b);
    expect(r.savings.annualTotal).toBe(0);
    expect(requiredStatus(b, r).complete).toBe(false);
  });
});

describe("required answers", () => {
  it("lists six items and completes only when all are answered", () => {
    const s = filled();
    const st = requiredStatus(s);
    expect(st.items.map((i) => i.id)).toEqual(["concept", "locations", "sales", "food", "labor", "focus"]);
    expect(st.complete).toBe(true);
    expect(st.doneCount).toBe(6);
  });
  it.each([
    ["concept", { conceptConfirmed: false }],
    ["sales", { amount: null }],
    ["food", { foodPct: null }],
    ["labor", { laborPct: null }],
    ["locations", { locations: null }],
  ] as const)("is incomplete without %s", (id, patch) => {
    const st = requiredStatus(filled(patch as Partial<Scenario>));
    expect(st.complete).toBe(false);
    expect(st.items.find((i) => i.id === id)!.done).toBe(false);
  });
  it("invalid values do not count as answered", () => {
    expect(requiredStatus(filled({ foodPct: 120 })).items.find((i) => i.id === "food")!.done).toBe(false);
    expect(requiredStatus(filled({ amount: -5 })).items.find((i) => i.id === "sales")!.done).toBe(false);
    expect(requiredStatus(filled({ locations: 11 })).items.find((i) => i.id === "locations")!.done).toBe(false);
  });
  it("GPV counts as sales only once it has a conversion", () => {
    const gpv = filled({ salesMode: "gpv", amount: 200000 });
    expect(requiredStatus(gpv).items.find((i) => i.id === "sales")!.done).toBe(false);
    const withNet = filled({ salesMode: "gpv", amount: 200000, gpv: { basis: "netEstimate", netEstimate: 170000, conversionFactor: null } });
    expect(requiredStatus(withNet).items.find((i) => i.id === "sales")!.done).toBe(true);
  });
  it("detailed food/alcohol mode counts only when its shares are valid", () => {
    const bad = filled({ costMode: "detailed", detailed: { foodSharePct: 70, alcoholSharePct: 20, foodCogsRatePct: 34, alcoholCogsRatePct: 22 } });
    expect(requiredStatus(bad).items.find((i) => i.id === "food")!.done).toBe(false);
    const good = filled({ costMode: "detailed", detailed: { foodSharePct: 75, alcoholSharePct: 25, foodCogsRatePct: 34, alcoholCogsRatePct: 22 } });
    expect(requiredStatus(good).items.find((i) => i.id === "food")!.done).toBe(true);
  });
  it("has exactly three steps in order", () => {
    expect(STEPS.map((s) => s.href)).toEqual(["/", "/solutions", "/summary"]);
  });
});

describe("what to improve", () => {
  it("food only puts every point on food", () => {
    expect(pointsFor("food", 1, 32, 36)).toEqual({ food: 1, labor: 0 });
  });
  it("labor only puts every point on labor", () => {
    expect(pointsFor("labor", 2, 32, 36)).toEqual({ food: 0, labor: 2 });
  });
  it("both splits the total by current cost and sums to it", () => {
    for (const lvl of [0.5, 1, 1.5, 2, 3]) {
      const p = pointsFor("both", lvl, 32, 36);
      expect(p.food + p.labor).toBeCloseTo(lvl, 10);
      expect(p.food).toBeGreaterThan(0);
      expect(p.labor).toBeGreaterThan(0);
    }
  });
  it("never exceeds 5 points or the current cost", () => {
    expect(pointsFor("food", 3, 2, 36).food).toBe(2);
  });
  it("guided points follow focus, level and costs", () => {
    const s = filled({ focus: "labor", level: 1.5 });
    expect(s.foodImprovementPts).toBe(0);
    expect(s.laborImprovementPts).toBe(1.5);
    expect(applyGuided({ ...s, focus: "food" }).foodImprovementPts).toBe(1.5);
    expect(applyGuided({ ...s, laborPct: 1 }).laborImprovementPts).toBe(1);
  });
  it("custom mode is left alone", () => {
    const s = { ...filled(), improvementMode: "custom" as const, foodImprovementPts: 0.4, laborImprovementPts: 0.6 };
    expect(applyGuided({ ...s, focus: "food" })).toEqual({ ...s, focus: "food" });
  });
  it("the financial result is unchanged: 5 locations × $180k × 1 pt = $108,000/yr", () => {
    expect(computeScenario(filled({ focus: "both", level: 1 })).savings.annualTotal).toBe(108000);
    expect(computeScenario(filled({ focus: "labor", level: 1 })).savings.annualTotal).toBe(108000);
    expect(computeScenario(filled({ locations: 1, focus: "food", level: 1 })).savings.annualTotal).toBe(21600);
  });
});

describe("existing data keeps working", () => {
  it("the example scenario is unchanged ($108,000, 0.4/0.6 custom points)", () => {
    const e = exampleScenario();
    expect(e.improvementMode).toBe("custom");
    expect(computeScenario(e).savings.annualTotal).toBe(108000);
    expect(requiredStatus(e).complete).toBe(true);
  });
  it("old saves load as confirmed, custom-point scenarios", () => {
    const old = hydrateScenario({ concept: "full_service", locations: 2, amount: 100000, foodPct: 30, laborPct: 34, foodImprovementPts: 0.5, laborImprovementPts: 0.5 });
    expect(old.conceptConfirmed).toBe(true);
    expect(old.improvementMode).toBe("custom");
    expect(old.focus).toBe("both");
    expect(computeScenario(old).savings.monthlyTotal).toBe(2000);
  });
});

describe("solutions respond to the Step 1 answers", () => {
  const recs = (s: Scenario) => recommendSolutions(buildProfile(s, computeScenario(s)));
  const highest = (s: Scenario) => recs(s).filter((r) => r.tier === "highest").map((r) => r.solution.id);
  it("changing the focus changes the best-fit products", () => {
    const labor = highest(filled({ focus: "labor" }));
    const food = highest(filled({ focus: "food" }));
    expect(labor).toContain("spoton-teamwork");
    expect(food).not.toContain("spoton-teamwork");
    expect(food).toEqual(expect.arrayContaining(["marginedge"]));
    expect(labor).not.toEqual(food);
  });
  it("changing the restaurant type changes them too", () => {
    const fineLabor = highest(filled({ concept: "fine_dining", focus: "labor" }));
    const fastLabor = highest(filled({ concept: "fast_casual", focus: "labor" }));
    expect(fastLabor).toContain("spoton-kiosk");
    expect(fineLabor).not.toContain("spoton-kiosk");
  });
  it("customer proof follows the answers", () => {
    const p = (s: Scenario) => matchCaseStudies(buildProfile(s, computeScenario(s))).map((m) => m.study.id);
    expect(p(filled({ concept: "fast_casual", focus: "food" }))[0]).toMatch(/butcher-paper-bbq|kaleis-kitchenette/);
    expect(p(filled({ concept: "fine_dining", focus: "labor" }))[0]).toBe("adalina");
  });
});
