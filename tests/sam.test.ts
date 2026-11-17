import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { computeScenario } from "@/lib/calc";
import { applyGuided } from "@/lib/focus";
import { buildProfile } from "@/lib/profile";
import { isIncluded, recommendSolutions } from "@/lib/recommend";
import { samFit } from "@/lib/sam";
import { blankScenario, exampleScenario } from "@/lib/scenario";
import { buildSummaryText } from "@/lib/summary";
import { CASE_STUDIES } from "@/config/caseStudies";
import { SOLUTIONS, SOLUTION_BY_ID } from "@/config/solutions";
import type { Scenario } from "@/lib/types";

const filled = (p: Partial<Scenario> = {}): Scenario =>
  applyGuided({ ...blankScenario(), conceptConfirmed: true, locations: 2, amount: 125000, foodPct: 33, laborPct: 38, ...p });
const recs = (s: Scenario) => recommendSolutions(buildProfile(s, computeScenario(s)));

describe("Sam (SpotOn Assistant Manager)", () => {
  const sam = SOLUTION_BY_ID["sam"]!;
  it("is one featured insight product with a public help-article link", () => {
    expect(sam.featured).toBe(true);
    expect(sam.nature).toBe("insight");
    expect(sam.influences).toBe("insight");
    expect(sam.link.url).toMatch(/^https:\/\/help\.spoton\.com\//);
    expect(sam.link.status).toBe("provided_link");
    expect(sam.costDriver).toMatch(/insight, not a direct cost lever/);
  });
  it("is included in the summary by default, and can still be dropped", () => {
    const r = recs(filled()).find((x) => x.solution.id === "sam")!;
    expect(isIncluded(r, {})).toBe(true);
    expect(isIncluded(r, { sam: false })).toBe(false);
    expect(buildSummaryText(exampleScenario(), computeScenario(exampleScenario()))).toContain("Sam (SpotOn Assistant Manager)");
  });
  it("ties to the Step 1 focus without promising a result", () => {
    expect(samFit("labor").headline).toMatch(/labor/);
    expect(samFit("food").headline).toMatch(/food & beverage cost/);
    expect(samFit("both").headline).toMatch(/food and labor/);
    for (const f of ["food", "labor", "both"] as const) {
      expect(samFit(f).detail).toMatch(/insight tool/);
      expect(samFit(f).detail).toMatch(/does not cut cost by itself/);
    }
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

  it("carries no internal launch material: competitors, plans, enablement, Slack, internal limits or customer names from internal decks", () => {
    const banned = [/Toast/i, /Lightspeed/i, /Squaremates/i, /Square AI/i, /Clover/i, /2027/, /sell sheet/i, /Demo to Deal/i, /pendo/i, /slack/i, /\balpha\b/i, /shift leads?/i, /RPOS/, /Weinberger/i, /Profit AI/, /do not (pitch|sell)/i, /new merchants/i, /launch timeline/i];
    for (const [f, text] of Object.entries(src)) for (const re of banned) expect(text, `${f} ${re}`).not.toMatch(re);
  });

  it("does not recommend Profit Assist or Profit AI", () => {
    expect(SOLUTIONS.map((s) => s.id)).not.toContain("spoton-profit-assist");
    expect(SOLUTIONS.map((s) => s.id)).not.toContain("spoton-profit-ai");
  });

  it("Sam's only quantified claim is the announcement headline, and it is qualified", () => {
    const spot = src["components/marginlab/SamSpotlight.tsx"]!;
    expect(spot).toMatch(/more than \$124,000/);
    expect(spot).toMatch(/not captured here/);
    expect(spot).toMatch(/not a prediction for yours/);
    expect(spot).not.toMatch(/3\.5%|\$2,000|26\.5/);
  });

  it("the case-study library holds only the eight public SpotOn success stories", () => {
    expect(CASE_STUDIES).toHaveLength(8);
    for (const c of CASE_STUDIES) expect(c.sourceUrl).toMatch(/^https:\/\/www\.spoton\.com\/success-stories\//);
  });
});
