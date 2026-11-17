import { describe, expect, it } from "vitest";
import { computeScenario } from "@/lib/calc";
import { applyGuided } from "@/lib/focus";
import { matchCaseStudies } from "@/lib/matching";
import { buildProfile } from "@/lib/profile";
import { isIncluded, recommendSolutions } from "@/lib/recommend";
import { samFit } from "@/lib/sam";
import { blankScenario, exampleScenario } from "@/lib/scenario";
import { buildSummaryText } from "@/lib/summary";
import { CASE_BY_ID, CASE_STUDIES, metricQualifier } from "@/config/caseStudies";
import { SOLUTIONS, SOLUTION_BY_ID } from "@/config/solutions";
import type { Scenario } from "@/lib/types";

const filled = (p: Partial<Scenario> = {}): Scenario =>
  applyGuided({ ...blankScenario(), conceptConfirmed: true, locations: 2, amount: 125000, foodPct: 33, laborPct: 38, ...p });
const recs = (s: Scenario) => recommendSolutions(buildProfile(s, computeScenario(s)));

describe("Sam (SpotOn Assistant Manager)", () => {
  const sam = SOLUTION_BY_ID["sam"]!;
  it("is one featured insight product with a help-article link and honest requirements", () => {
    expect(sam.featured).toBe(true);
    expect(sam.nature).toBe("insight");
    expect(sam.influences).toBe("insight");
    expect(sam.link.url).toMatch(/^https:\/\/help\.spoton\.com\//);
    expect(sam.link.status).toBe("provided_link");
    const req = sam.requirements.join(" ");
    expect(req).toMatch(/owners and managers/i);
    expect(req).toMatch(/inventory and accounting/i);
    expect(req).toMatch(/pricing and availability/i);
  });
  it("is included in the summary by default, and the operator can still drop it", () => {
    const r = recs(filled()).find((x) => x.solution.id === "sam")!;
    expect(isIncluded(r, {})).toBe(true);
    expect(isIncluded(r, { sam: false })).toBe(false);
    expect(buildSummaryText(exampleScenario(), computeScenario(exampleScenario()))).toContain("Sam (SpotOn Assistant Manager)");
  });
  it("is an insight tool: it never claims to be a direct cost lever", () => {
    expect(sam.costDriver).toMatch(/insight, not a direct cost lever/);
    expect(JSON.stringify(sam)).not.toMatch(/guarantee|will save|reduces? (your )?(food|labor)/i);
  });
});

describe("Profit AI and Profit Assist", () => {
  it("Profit Assist is for existing merchants and points to Profit AI and Sam, for every concept", () => {
    for (const concept of ["full_service", "fast_casual", "brewery_taproom", "cafe_bakery"] as const) {
      const r = recs(filled({ concept })).find((x) => x.solution.id === "spoton-profit-assist")!;
      expect(r.tier).toBe("not_recommended");
      expect(r.exclusion).toMatch(/Profit AI and Sam/);
    }
  });
  it("Profit AI is offered as an insight product and flags beta availability", () => {
    const r = recs(filled()).find((x) => x.solution.id === "spoton-profit-ai")!;
    expect(r.tier).toBe("visibility");
    expect(r.solution.requirements.join(" ")).toMatch(/beta/i);
  });
  it("older case studies that used Profit Assist still link to it", () => {
    expect(CASE_BY_ID["butcher-paper-bbq"]!.products[0]!.solutionId).toBe("spoton-profit-assist");
  });
});

describe("example questions follow what was entered", () => {
  it("labor focus gets labor questions; food focus gets sales and menu questions", () => {
    expect(samFit("labor").prompts.join(" ")).toMatch(/labor/i);
    expect(samFit("labor").prompts.join(" ")).not.toMatch(/menu items/i);
    expect(samFit("food").prompts.join(" ")).toMatch(/menu items/i);
    expect(samFit("food").prompts.join(" ")).not.toMatch(/labor cost/i);
    expect(samFit("both").prompts.length).toBeGreaterThanOrEqual(2);
  });
  it("every example is a question, and cost-of-goods caveats are stated when food is in scope", () => {
    for (const f of ["food", "labor", "both"] as const) for (const p of samFit(f).prompts) expect(p.endsWith("?")).toBe(true);
    expect(samFit("food").detail).toMatch(/inventory and accounting/i);
    expect(samFit("both").detail).toMatch(/inventory and accounting/i);
  });
});

describe("Weinberger's Deli", () => {
  const c = CASE_BY_ID["weinbergers-deli"]!;
  it("keeps the published wording and ties to Sam", () => {
    expect(c.metric.wording).toBe("$2,000 a week saved in labor");
    expect(c.additionalMetrics!.map((m) => m.wording)).toEqual(["3.5% lower food cost, 30% to 26.5%", "Done for the day at 5 pm, not 10 pm"]);
    expect(c.products[0]!.solutionId).toBe("sam");
    expect(c.concepts).toEqual(["cafe_bakery"]);
    expect(c.outcomes).toMatchObject({ food: "direct", labor: "direct" });
  });
  it("is labeled as taken from launch materials, not independently checked, and does not invent a challenge", () => {
    expect(c.verification.note).toMatch(/not independently checked/i);
    expect(c.verification.note).toMatch(/press release could not be opened/i);
    expect(c.challenge).toBeNull();
    expect(c.limitations.join(" ")).toMatch(/could not be opened/i);
  });
  it("food drop is qualified, never converted into this prospect's model", () => {
    const q = metricQualifier(c.additionalMetrics![0]!);
    expect(q).toMatch(/not captured/i);
    expect(q).toMatch(/not applied to this prospect/i);
    const s = filled({ concept: "cafe_bakery" });
    const before = computeScenario(s);
    matchCaseStudies(buildProfile(s, before));
    expect(computeScenario(s)).toEqual(before);
  });
  it("is the lead example for a deli/cafe wanting both food and labor results", () => {
    const m = matchCaseStudies(buildProfile(filled({ concept: "cafe_bakery", focus: "both" }), computeScenario(filled({ concept: "cafe_bakery", focus: "both" }))));
    expect(m[0]!.study.id).toBe("weinbergers-deli");
  });
});

describe("keeps internal-only launch material out of the public app", () => {
  const all = JSON.stringify({ SOLUTIONS, CASE_STUDIES });
  it("has no competitor comparison, internal pricing plans, launch logistics or channel names", () => {
    for (const bad of [/Toast/i, /Lightspeed/i, /Squaremates/i, /Square AI/i, /Clover/i, /2027/, /free forever/i, /sell sheet/i, /Demo to Deal/i, /pendo/i, /slack/i, /alpha/i]) expect(all).not.toMatch(bad);
  });
  it("does not state that Sam or Profit AI is free", () => {
    expect(JSON.stringify([SOLUTION_BY_ID["sam"], SOLUTION_BY_ID["spoton-profit-ai"]])).not.toMatch(/\bfree\b/i);
  });
});
