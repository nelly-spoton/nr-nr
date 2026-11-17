import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { computeScenario } from "@/lib/calc";
import { exampleScenario, hydrateScenario } from "@/lib/scenario";
import { buildProfile } from "@/lib/profile";
import { bestProofFor, matchCaseStudies } from "@/lib/matching";
import { recommendSolutions } from "@/lib/recommend";
import { buildReport } from "@/lib/report";
import { buildSummaryText } from "@/lib/summary";
import { blendCogs } from "@/lib/beverage";
import { researchToScenarioPatch, validateResearch, type ResearchResult } from "@/lib/research";
import { pageSupportsMetric } from "@/lib/verify";
import { CASE_STUDIES, metricQualifier, verificationLabel } from "@/config/caseStudies";
import { medianApplicability, ALCOHOL_QUALIFICATION } from "@/config/benchmarks";
import { CONCEPTS, ATTRIBUTES } from "@/config/concepts";
import { SOLUTIONS } from "@/config/solutions";
import type { Scenario } from "@/lib/types";

const ex = (p: Partial<Scenario> = {}): Scenario => ({ ...exampleScenario(), ...p });
const prof = (p: Partial<Scenario>) => {
  const s = ex(p);
  return buildProfile(s, computeScenario(s));
};

describe("acceptance 1–3: financials unchanged", () => {
  it("1 location, $180k, 1 pt → $21,600/yr", () => {
    const r = computeScenario(ex({ locations: 1, foodImprovementPts: 0.4, laborImprovementPts: 0.6 }));
    expect(r.savings.annualTotal).toBe(21600);
  });
  it("5 locations, $180k each, 1 pt → $108,000/yr", () => {
    expect(computeScenario(exampleScenario()).savings.annualTotal).toBe(108000);
  });
  it("food + labor = total", () => {
    const r = computeScenario(exampleScenario());
    expect(r.savings.annualFood).toBe(43200);
    expect(r.savings.annualLabor).toBe(64800);
    expect(r.savings.annualFood + r.savings.annualLabor).toBe(r.savings.annualTotal);
  });
});

describe("concept taxonomy", () => {
  it("has the ten concepts and seven attributes", () => {
    expect(CONCEPTS).toHaveLength(10);
    expect(ATTRIBUTES).toHaveLength(7);
  });
  it("migrates V1 saves (bar → bar_pub, custom → multi_concept) and keeps operator edits", () => {
    const old = { concept: "bar", locations: 2, planning: { bar: { food: { min: 20, max: 30 }, labor: { min: 20, max: 30 }, prime: { min: 50, max: 60 } } }, selectedSolutionIds: ["marginedge"] };
    const s = hydrateScenario(old);
    expect(s.concept).toBe("bar_pub");
    expect(s.planning.bar_pub.food).toEqual({ min: 20, max: 30 });
    expect(s.planning.bar_pub.origin).toBe("operator");
    expect(hydrateScenario({ concept: "custom" }).concept).toBe("multi_concept");
    expect(hydrateScenario({ concept: "nonsense" }).concept).toBe("full_service");
  });
});

describe("benchmarks and beverage", () => {
  it("bars and breweries get no published median and an alcohol qualification", () => {
    for (const c of ["bar_pub", "brewery_taproom"] as const) {
      const m = medianApplicability(c);
      expect(m.set).toBeNull();
      expect(m.qualification).toContain("NONALCOHOLIC");
    }
  });
  it("beverage-heavy concepts carry the alcohol qualification next to any median", () => {
    expect(medianApplicability("full_service", ["beverage_heavy"]).qualification).toBe(ALCOHOL_QUALIFICATION);
    expect(medianApplicability("full_service", []).qualification).toBeNull();
  });
  it("fine dining is context-only; pizza needs a service-model attribute", () => {
    expect(medianApplicability("fine_dining").qualification).toMatch(/context/);
    expect(medianApplicability("pizza_italian", []).set).toBeNull();
    expect(medianApplicability("pizza_italian", ["table_service"]).set?.id).toBe("full_service");
    expect(medianApplicability("pizza_italian", ["counter_service"]).set?.id).toBe("limited_service");
  });
  it("blends category COGS on one net-sales denominator", () => {
    const b = blendCogs({
      enabled: true,
      mixPct: { food: 60, beer: 25, liquor: 10, wine: 5, other: 0 },
      costPct: { food: 32, beer: 24, liquor: 20, wine: 35, other: null },
    });
    // .6*32 + .25*24 + .1*20 + .05*35 = 19.2 + 6 + 2 + 1.75
    expect(b.blendedPct).toBeCloseTo(28.95, 4);
    expect(b.valid).toBe(true);
    expect(b.lines.reduce((s, l) => s + l.contributionPct, 0)).toBeCloseTo(b.blendedPct, 4);
  });
  it("rejects a mix that does not total 100%", () => {
    const b = blendCogs({ enabled: true, mixPct: { food: 60, beer: 20, liquor: null, wine: null, other: null }, costPct: { food: 30, beer: 25, liquor: null, wine: null, other: null } });
    expect(b.valid).toBe(false);
    expect(b.problems.join(" ")).toMatch(/100%/);
  });
});

describe("case-study library", () => {
  it("contains the eight requested records with unique ids and source URLs", () => {
    expect(CASE_STUDIES.map((c) => c.id).sort()).toEqual(
      ["adalina", "big-daves-bagels", "big-lake-brewing", "butcher-paper-bbq", "cocos-crush-bar", "fat-zachs-pizza", "kaleis-kitchenette", "the-mudpuppy", "weinbergers-deli"].sort(),
    );
    for (const c of CASE_STUDIES)
      expect(c.sourceUrl).toMatch(c.id === "weinbergers-deli" ? /^https:\/\/www\.businesswire\.com\// : /^https:\/\/www\.spoton\.com\/success-stories\//);
  });
  it("records are labeled as accepted by the team, never as independently verified", () => {
    for (const c of CASE_STUDIES) {
      expect(c.verification.status).toBe("requester_confirmed");
      expect(c.verification.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(c.verification.note).toMatch(/not independently checked/i);
      expect(verificationLabel(c)).toMatch(/not independently checked/);
      expect(c.metric.wordingStatus).toBe("as_provided");
    }
  });
  it("does not invent unstated fields", () => {
    const butcher = CASE_STUDIES.find((c) => c.id === "butcher-paper-bbq")!;
    expect(butcher.challenge).toBeNull();
    expect(butcher.locations).toBeNull();
    expect(butcher.partners).toEqual([]);
  });
});

describe("acceptance 8: relative percentages are never percentage points", () => {
  it("COGS and labor percentages are typed as relative and qualified", () => {
    for (const id of ["butcher-paper-bbq", "kaleis-kitchenette", "big-daves-bagels", "the-mudpuppy", "fat-zachs-pizza"]) {
      const m = CASE_STUDIES.find((c) => c.id === id)!.metric;
      expect(m.unit).toBe("percent_relative");
      expect(m.kind).toBe("relative_change");
      expect(metricQualifier(m)).toMatch(/relative/i);
      expect(metricQualifier(m)).toMatch(/not percentage points/i);
    }
  });
  it("sales and admin results are flagged as not cost savings", () => {
    expect(metricQualifier(CASE_STUDIES.find((c) => c.id === "big-lake-brewing")!.metric)).toMatch(/not a cost saving/);
    expect(metricQualifier(CASE_STUDIES.find((c) => c.id === "cocos-crush-bar")!.metric)).toMatch(/not a measured cost saving/);
  });
});

describe("acceptance 7: case studies cannot alter the calculation", () => {
  it("results are identical whatever the matching returns", () => {
    const s = exampleScenario();
    const before = computeScenario(s);
    buildReport(s, before);
    matchCaseStudies(prof({}));
    expect(computeScenario(s)).toEqual(before);
  });
  it("the calculation engine does not import case-study or matching code", () => {
    const src = readFileSync("lib/calc.ts", "utf8");
    expect(src).not.toMatch(/caseStudies|matching|recommend|coaching/);
  });
});

describe("acceptance 4: brewery", () => {
  const p = prof({ concept: "brewery_taproom", locations: 1 });
  it("closest brewery evidence comes first and is flagged as not a cost result", () => {
    const m = matchCaseStudies(p);
    expect(m[0]!.study.id).toBe("big-lake-brewing");
    expect(m[0]!.indirect).toBe(true);
    expect(m[0]!.reasons.join(" ")).toMatch(/not a cost saving/);
  });
  it("gets bar-appropriate products and not counter/kitchen formats", () => {
    const recs = recommendSolutions(p);
    const tier = (id: string) => recs.find((r) => r.solution.id === id)!.tier;
    expect(tier("spoton-kiosk")).toBe("not_recommended");
    expect(tier("spoton-kds")).toBe("not_recommended");
    expect(tier("spoton-handhelds")).not.toBe("not_recommended");
    expect(tier("spoton-teamwork")).toBe("highest");
  });
});

describe("acceptance 5: full service prioritizing labor", () => {
  it("includes Adalina or comparable labor proof", () => {
    const p5 = prof({ concept: "full_service", foodImprovementPts: 0, laborImprovementPts: 1 });
    const m = matchCaseStudies(p5);
    expect(m.map((x) => x.study.id)).toContain("adalina");
    expect(m[0]!.study.outcomes.labor).toBe("direct");
  });
  it("fine dining labor prospect gets Adalina first", () => {
    const m = matchCaseStudies(prof({ concept: "fine_dining", foodImprovementPts: 0, laborImprovementPts: 1 }));
    expect(m[0]!.study.id).toBe("adalina");
  });
});

describe("acceptance 6: fast casual prioritizing food", () => {
  it("returns Butcher Paper BBQ and Kalei's first", () => {
    const m = matchCaseStudies(prof({ concept: "fast_casual", foodImprovementPts: 1, laborImprovementPts: 0 }));
    expect(m.slice(0, 2).map((x) => x.study.id).sort()).toEqual(["butcher-paper-bbq", "kaleis-kitchenette"]);
    expect(m.every((x) => x.study.outcomes.food === "direct")).toBe(true);
  });
});

describe("matching rules", () => {
  it("never returns more than three, and never fabricates a match", () => {
    for (const c of CONCEPTS) expect(matchCaseStudies(prof({ concept: c.id })).length).toBeLessThanOrEqual(3);
    // nothing selected + a concept with no same-model evidence still yields only relevant studies
    for (const m of matchCaseStudies(prof({ foodImprovementPts: 0, laborImprovementPts: 0 }))) expect(m.score).toBeGreaterThanOrEqual(25);
  });
  it("labor-only prospects do not get food-only studies as lead evidence", () => {
    const m = matchCaseStudies(prof({ concept: "full_service", foodImprovementPts: 0, laborImprovementPts: 1 }));
    expect(m.find((x) => x.study.outcomes.food === "direct" && x.study.outcomes.labor === "none")).toBeUndefined();
  });
  it("bestProofFor returns a direct cost result for the requested lever", () => {
    const p = prof({});
    expect(bestProofFor("food", p)?.study.outcomes.food).toBe("direct");
    expect(bestProofFor("labor", p)?.study.outcomes.labor).toBe("direct");
  });
});

describe("recommendations", () => {
  it("has exactly one record per product (no duplicate cards)", () => {
    const ids = SOLUTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const recs = recommendSolutions(prof({}));
    expect(recs.map((r) => r.solution.id).sort()).toEqual([...ids].sort());
  });
  it("insight products land in the reporting tier, never 'highest'", () => {
    for (const r of recommendSolutions(prof({}))) if (r.solution.nature === "insight" && !r.solution.existingOnly) expect(r.tier).toBe("visibility");
  });
  it("highest tier is capped and tied to the selected levers", () => {
    const labor = recommendSolutions(prof({ foodImprovementPts: 0, laborImprovementPts: 1 }));
    const high = labor.filter((r) => r.tier === "highest");
    expect(high.length).toBeLessThanOrEqual(4);
    for (const r of high) expect(["labor", "both"]).toContain(r.solution.influences);
  });
  it("kiosk is recommended for counter service and not for fine dining", () => {
    const fc = recommendSolutions(prof({ concept: "fast_casual", foodImprovementPts: 0, laborImprovementPts: 1 }));
    expect(fc.find((r) => r.solution.id === "spoton-kiosk")!.tier).toBe("highest");
    const fd = recommendSolutions(prof({ concept: "fine_dining" }));
    expect(fd.find((r) => r.solution.id === "spoton-kiosk")!.tier).toBe("not_recommended");
  });
  it("links products to published evidence by solution id", () => {
    const recs = recommendSolutions(prof({}));
    expect(recs.find((r) => r.solution.id === "spoton-teamwork")!.proofCaseIds).toEqual(expect.arrayContaining(["adalina", "the-mudpuppy"]));
  });
});

describe("operator summary keeps customer evidence out (HS reference only)", () => {
  const s = ex({ concept: "full_service", foodImprovementPts: 0.4, laborImprovementPts: 0.6 });
  const text = buildSummaryText(s, computeScenario(s));
  it("copy text carries no customer names, metrics or source links", () => {
    expect(text).not.toMatch(/success-stories/);
    expect(text).not.toMatch(/CUSTOMER PROOF/i);
    for (const c of CASE_STUDIES) {
      expect(text).not.toContain(c.name);
      expect(text).not.toContain(c.metric.wording);
    }
  });
  it("still shows food vs labor contribution and the unchanged headline", () => {
    expect(text).toContain("$108,000/year");
    expect(text).toMatch(/Food: \$43,200\/yr \(40%\) · Labor: \$64,800\/yr \(60%\)/);
  });
  it("no longer says volume is multiplied for a single location", () => {
    const one = ex({ locations: 1 });
    expect(buildSummaryText(one, computeScenario(one))).not.toMatch(/multiplied by location count/);
  });
});

describe("future website research (contract only)", () => {
  const base: ResearchResult = {
    inputUrl: "https://example.com",
    identityConfirmed: true,
    restaurantName: "Test Taproom",
    suggestedConcept: "brewery_taproom",
    locations: 1,
    facts: [{ id: "1", field: "hours", value: "Tue–Sun", kind: "fact", sourceUrl: "https://example.com/hours", retrievedAt: "2026-01-01", confidence: "high" }],
    assumptions: { monthlyNetSales: { low: 100000, base: 150000, high: 200000 } },
  };
  it("transfers the chosen case and stays preliminary", () => {
    const patch = researchToScenarioPatch(base, "low");
    expect(patch.amount).toBe(100000);
    expect(patch.salesConfidence).toBe("estimated");
  });
  it("rejects unconfirmed identity and facts without sources", () => {
    expect(() => researchToScenarioPatch({ ...base, identityConfirmed: false }, "base")).toThrow();
    expect(validateResearch({ ...base, facts: [{ ...base.facts[0]!, sourceUrl: null }] })[0]).toMatch(/no source URL/);
  });
});

describe("verification helper", () => {
  it("flags a page missing the expected figure", () => {
    const c = CASE_STUDIES.find((x) => x.id === "butcher-paper-bbq")!;
    expect(pageSupportsMetric("COGS dropped 9% after rollout", c).ok).toBe(true);
    expect(pageSupportsMetric("nothing relevant", c).ok).toBe(false);
    const a = CASE_STUDIES.find((x) => x.id === "adalina")!;
    expect(pageSupportsMetric("saving $500 – $800 a week", a).missing).toEqual([]);
  });
});
