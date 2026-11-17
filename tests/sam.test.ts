import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { computeScenario } from "@/lib/calc";
import { applyGuided } from "@/lib/focus";
import { matchCaseStudies } from "@/lib/matching";
import { buildProfile } from "@/lib/profile";
import { isIncluded, recommendSolutions } from "@/lib/recommend";
import { SAM_EXAMPLE_QUESTIONS, samFit } from "@/lib/sam";
import { blankScenario, exampleScenario } from "@/lib/scenario";
import { buildSummaryText } from "@/lib/summary";
import { CASE_BY_ID, CASE_STUDIES, metricQualifier } from "@/config/caseStudies";
import { SOLUTIONS, SOLUTION_BY_ID } from "@/config/solutions";
import type { Scenario } from "@/lib/types";

const filled = (p: Partial<Scenario> = {}): Scenario =>
  applyGuided({ ...blankScenario(), conceptConfirmed: true, locations: 2, amount: 125000, foodPct: 33, laborPct: 38, ...p });
const recs = (s: Scenario) => recommendSolutions(buildProfile(s, computeScenario(s)));
const profileOf = (s: Scenario) => buildProfile(s, computeScenario(s));

describe("Sam (SpotOn Assistant Manager)", () => {
  const sam = SOLUTION_BY_ID["sam"]!;
  it("is one featured insight product with a public help-article link", () => {
    expect(sam.featured).toBe(true);
    expect(sam.nature).toBe("insight");
    expect(sam.influences).toBe("insight");
    expect(sam.link.url).toMatch(/^https:\/\/help\.spoton\.com\//);
    expect(sam.costDriver).toMatch(/insight, not a direct cost lever/);
  });
  it("states availability the way the announcement does", () => {
    const req = sam.requirements.join(" ");
    expect(req).toMatch(/dashboard, mobile app or by text/);
    expect(req).toMatch(/English and Spanish/);
    expect(sam.mechanism.join(" ")).toMatch(/first AI agent/);
  });
  it("is included in the summary by default, and can still be dropped", () => {
    const r = recs(filled()).find((x) => x.solution.id === "sam")!;
    expect(isIncluded(r, {})).toBe(true);
    expect(isIncluded(r, { sam: false })).toBe(false);
    expect(buildSummaryText(exampleScenario(), computeScenario(exampleScenario()))).toContain("Sam (SpotOn Assistant Manager)");
  });
  it("ties to the Step 1 focus using the announcement's own description, without promising a result", () => {
    expect(samFit("labor").detail).toMatch(/schedules don't match demand/);
    expect(samFit("labor").detail).not.toMatch(/purchasing/);
    expect(samFit("food").detail).toMatch(/costs are climbing/);
    expect(samFit("food").detail).toMatch(/purchasing doesn't match demand/);
    expect(samFit("both").detail).toMatch(/costs are climbing/);
    expect(samFit("both").detail).toMatch(/schedules don't match demand/);
    for (const f of ["food", "labor", "both"] as const) expect(samFit(f).detail).toMatch(/does not cut cost by itself/);
  });
  it("example questions are the announcement's common requests", () => {
    expect(SAM_EXAMPLE_QUESTIONS).toEqual([
      "How are sales today?",
      "How did this weekend compare with last weekend?",
      "Who has the highest tip average by server?",
    ]);
  });
});

describe("Weinberger's Deli (from the public press release)", () => {
  const c = CASE_BY_ID["weinbergers-deli"]!;
  it("uses the release's figures and wording", () => {
    expect(c.locationText).toBe("Grapevine, TX");
    expect(c.metric.wording).toBe("Saved more than $124,000");
    expect(c.metric.min).toBe(124000);
    expect(c.additionalMetrics!.map((m) => m.wording)).toEqual(["Lowered food costs by 3.5%"]);
    expect(c.challenge).toMatch(/labor was running at 44% of sales/i);
    expect(c.challenge).toMatch(/food cost at 30%/);
    expect(c.challenge).toMatch(/prime cost at 74%, against a goal of 63%/);
    expect(c.improvement).toMatch(/daily scheduling, food cost comparisons and sales predictions/);
    expect(c.products[0]!.solutionId).toBe("sam");
    expect(c.sourceUrl).toMatch(/^https:\/\/www\.businesswire\.com\//);
  });
  it("does not use figures that appear only in internal material", () => {
    const text = JSON.stringify(c);
    expect(text).not.toMatch(/26\.5/);
    expect(text).not.toMatch(/\$2,000/);
    expect(text).not.toMatch(/5 pm, not 10 pm/);
  });
  it("never turns the 3.5% into points or into this prospect's model", () => {
    const m = c.additionalMetrics![0]!;
    expect(m.kind).toBe("percent_unspecified");
    const q = metricQualifier(m);
    expect(q).toMatch(/not whether that is points of sales or a relative reduction/);
    expect(q).toMatch(/not converted into this prospect's model/);
    expect(metricQualifier(c.metric)).toMatch(/period it covers and how it was measured are not stated/);
    const s = filled({ concept: "cafe_bakery" });
    const before = computeScenario(s);
    matchCaseStudies(profileOf(s));
    expect(computeScenario(s)).toEqual(before);
  });
  it("is labeled as taken from the release and not independently checked", () => {
    expect(c.verification.note).toMatch(/press release/i);
    expect(c.verification.note).toMatch(/not independently checked/i);
  });
  it("counts as direct evidence for food cost but only indirect for labor (no separate labor figure)", () => {
    expect(c.outcomes).toMatchObject({ food: "direct", labor: "indirect" });
    const labor = matchCaseStudies(profileOf(filled({ concept: "full_service", foodImprovementPts: 0, laborImprovementPts: 1, improvementMode: "custom" })));
    expect(labor[0]!.study.id).not.toBe("weinbergers-deli");
  });
  it("is a lead example for a deli or cafe wanting to lower food cost", () => {
    const s = filled({ concept: "cafe_bakery", focus: "food" });
    expect(matchCaseStudies(profileOf(s)).map((m) => m.study.id)).toContain("weinbergers-deli");
  });
});

describe("public information only", () => {
  const files = ["config/solutions.ts", "config/caseStudies.ts", "lib/sam.ts", "lib/summary.ts", "lib/coaching.ts", "components/marginlab/SamSpotlight.tsx", "components/marginlab/SolutionCard.tsx"];
  const src = Object.fromEntries(files.map((f) => [f, readFileSync(f, "utf8")]));

  it("never mentions pricing, in any solution or anywhere solutions are described", () => {
    for (const [f, text] of Object.entries(src)) {
      expect(text, f).not.toMatch(/\bpric(e|es|ing|ed)\b/i);
      expect(text, f).not.toMatch(/subscription/i);
      expect(text, f).not.toMatch(/\bfree\b/i);
      expect(text, f).not.toMatch(/\b(cost|fee)s? (of|for) (the )?(product|software|license)/i);
    }
    expect(JSON.stringify(SOLUTIONS)).not.toMatch(/pric|subscription|\bfree\b|\bbeta\b/i);
  });

  it("carries no internal launch material: competitors, enablement, Slack, internal limits, roadmap or guidance on who to pitch", () => {
    const banned = [/Toast/i, /Lightspeed/i, /Squaremates/i, /Square AI/i, /Clover/i, /2027/, /first quarter/i, /agentic/i, /sell sheet/i, /Demo to Deal/i, /pendo/i, /slack/i, /\balpha\b/i, /shift leads?/i, /RPOS/, /Profit AI/, /do not (pitch|sell)/i, /new merchants/i, /launch timeline/i, /26\.5/, /\$2,000/];
    for (const [f, text] of Object.entries(src)) for (const re of banned) expect(text, `${f} ${re}`).not.toMatch(re);
  });

  it("does not recommend Profit Assist or Profit AI", () => {
    expect(SOLUTIONS.map((s) => s.id)).not.toContain("spoton-profit-assist");
    expect(SOLUTIONS.map((s) => s.id)).not.toContain("spoton-profit-ai");
  });

  it("the spotlight's numbers are the ones in the release", () => {
    const spot = src["components/marginlab/SamSpotlight.tsx"]!;
    for (const n of ["44%", "30%", "74%", "63%"]) expect(spot).toContain(n);
    expect(spot).toMatch(/not a prediction for yours/);
    expect(spot).toMatch(/doesn&apos;t say what period/);
  });

  it("the case-study library is the eight SpotOn success stories plus the public press release", () => {
    expect(CASE_STUDIES).toHaveLength(9);
    for (const c of CASE_STUDIES)
      expect(c.sourceUrl).toMatch(c.id === "weinbergers-deli" ? /^https:\/\/www\.businesswire\.com\// : /^https:\/\/www\.spoton\.com\/success-stories\//);
  });
});
