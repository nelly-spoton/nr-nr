import { CONCEPT_BY_ID } from "@/config/concepts";
import { medianApplicability, type MedianApplicability } from "@/config/benchmarks";
import { compareAll, type ScenarioResult } from "./calc";
import { buildCoaching, type Coaching } from "./coaching";
import { matchCaseStudies, type CaseMatch } from "./matching";
import { buildProfile, type Profile } from "./profile";
import { isIncluded, recommendSolutions, type Recommendation } from "./recommend";
import type { Scenario } from "./types";

export interface Report {
  profile: Profile;
  recs: Recommendation[];
  included: Recommendation[];
  matches: CaseMatch[];
  proofPoints: CaseMatch[];
  coaching: Coaching;
  contribution: { foodShare: number; laborShare: number };
  medians: MedianApplicability;
  comparison: ReturnType<typeof compareAll>;
}

/** One place that assembles everything the UI, the summary and the copy text show. */
export function buildReport(s: Scenario, r: ScenarioResult): Report {
  const profile = buildProfile(s, r);
  const recs = recommendSolutions(profile);
  const matches = matchCaseStudies(profile);
  const total = r.savings.annualTotal;
  return {
    profile,
    recs,
    included: recs.filter((x) => isIncluded(x, s.solutionOverrides)),
    matches,
    proofPoints: matches.slice(0, 2),
    coaching: buildCoaching(s, r, profile, recs, matches),
    contribution: {
      foodShare: total > 0 ? r.savings.annualFood / total : 0,
      laborShare: total > 0 ? r.savings.annualLabor / total : 0,
    },
    medians: medianApplicability(s.concept, profile.attributes),
    comparison: compareAll(r, s.planning[s.concept]),
  };
}

export const isAlcoholLed = (s: Scenario) => CONCEPT_BY_ID[s.concept].alcoholLed;
