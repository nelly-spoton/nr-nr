import { describe, expect, it } from "vitest";
import { chooseAlcohol, setAlcoholShare, setSplitMode, splitSentences } from "@/lib/alcohol";
import { computeScenario } from "@/lib/calc";
import { applyGuided } from "@/lib/focus";
import { buildHealth } from "@/lib/health";
import { blankScenario, hydrateScenario } from "@/lib/scenario";
import { requiredStatus } from "@/lib/steps";
import type { Scenario } from "@/lib/types";

const base = (): Scenario =>
  applyGuided({ ...blankScenario(), conceptConfirmed: true, locations: 1, amount: 180000, foodPct: 32, laborPct: 36 });

describe("does the restaurant sell alcohol?", () => {
  it("starts as No with one food & beverage cost", () => {
    const s = base();
    expect(s.sellsAlcohol).toBe(false);
    expect(s.costMode).toBe("quick");
  });
  it("Yes starts the split without inventing numbers, and food & beverage is incomplete until answered", () => {
    const s = chooseAlcohol(base(), true);
    expect(s.sellsAlcohol).toBe(true);
    expect(s.costMode).toBe("detailed");
    expect(s.detailed.alcoholSharePct).toBeNull();
    expect(s.detailed.foodSharePct).toBeNull();
    expect(s.detailed.foodCogsRatePct).toBe(32);
    expect(requiredStatus(s).items.find((i) => i.id === "food")!.done).toBe(false);
  });
  it("one number gives the split: alcohol share, with food as the rest (always 100)", () => {
    const s = setAlcoholShare(chooseAlcohol(base(), true), 25);
    expect(s.detailed.alcoholSharePct).toBe(25);
    expect(s.detailed.foodSharePct).toBe(75);
    expect(setAlcoholShare(s, 0).detailed.foodSharePct).toBe(100);
    expect(setAlcoholShare(s, null).detailed.foodSharePct).toBeNull();
  });
  it("the specified scenario: 25% alcohol, 34% food cost, 22% alcohol cost → 31% blended, $120,600 prime", () => {
    let s = setAlcoholShare(chooseAlcohol(base(), true), 25);
    s = applyGuided({ ...s, detailed: { ...s.detailed, foodCogsRatePct: 34, alcoholCogsRatePct: 22 } });
    const r = computeScenario(s);
    expect(r.cogs.detail!.foodCogs).toBe(45900);
    expect(r.cogs.detail!.alcoholCogs).toBe(9900);
    expect(r.current.food).toBe(31);
    expect(r.current.primeMonthly).toBe(120600);
    expect(r.current.prime).toBe(67);
    expect(r.savings.annualTotal).toBe(21600);
    expect(requiredStatus(s, r).complete).toBe(true);
  });
  it("0% alcohol is a valid answer and needs no alcohol cost", () => {
    let s = setAlcoholShare(chooseAlcohol(base(), true), 0);
    s = { ...s, detailed: { ...s.detailed, foodCogsRatePct: 32 } };
    const r = computeScenario(s);
    expect(r.cogs.detail!.alcoholCogs).toBe(0);
    expect(r.current.food).toBe(32);
    expect(requiredStatus(s, r).complete).toBe(true);
  });
  it("No goes back to one combined cost and keeps the typed %", () => {
    const s = chooseAlcohol(setAlcoholShare(chooseAlcohol(base(), true), 25), false);
    expect(s.sellsAlcohol).toBe(false);
    expect(s.costMode).toBe("quick");
    expect(s.foodPct).toBe(32);
  });
  it("'one combined cost' keeps alcohol marked as sold, and the comparison says so", () => {
    const combined = setSplitMode(chooseAlcohol(base(), true), false);
    expect(combined.sellsAlcohol).toBe(true);
    expect(combined.costMode).toBe("quick");
    const h = buildHealth({ ...combined, concept: "full_service" }, computeScenario(combined));
    expect(h.rows.find((x) => x.id === "combined")!.qualification).toMatch(/NONALCOHOLIC/);
    const no = base();
    expect(buildHealth(no, computeScenario(no)).rows.find((x) => x.id === "combined")!.qualification).toBeNull();
  });
  it("older saves keep working: detailed with alcohol counts as 'sells alcohol'", () => {
    const old = hydrateScenario({ costMode: "detailed", detailed: { foodSharePct: 75, alcoholSharePct: 25, foodCogsRatePct: 34, alcoholCogsRatePct: 22 }, locations: 1, amount: 180000, laborPct: 36 });
    expect(old.sellsAlcohol).toBe(true);
    expect(hydrateScenario({ costMode: "quick" }).sellsAlcohol).toBe(false);
  });
  it("explains the math in plain sentences from the same numbers", () => {
    let s = setAlcoholShare(chooseAlcohol(base(), true), 25);
    s = { ...s, detailed: { ...s.detailed, foodCogsRatePct: 34, alcoholCogsRatePct: 22 } };
    const r = computeScenario(s);
    const lines = splitSentences(r.cogs.detail!, { food: 34, alcohol: 22 });
    expect(lines[0]).toBe("Food sales $135,000 × 34% = $45,900 food cost");
    expect(lines[1]).toBe("Alcohol sales $45,000 × 22% = $9,900 alcohol cost");
    expect(lines[2]).toMatch(/Together \$55,800 = 31\.00% of all sales/);
  });
});
