/**
 * Ranked SpotOn solution recommendations. One record per product; tiers replace a flat list.
 * Recommendations are possibilities and never alter financial calculations.
 */
import { effectiveServiceModel } from "@/config/concepts";
import { SOLUTIONS, type Solution } from "@/config/solutions";
import { casesForSolution } from "./matching";
import { leverWeights, type Profile } from "./profile";

export type Tier = "highest" | "additional" | "visibility" | "not_recommended";

export interface Recommendation {
  solution: Solution;
  tier: Tier;
  score: number;
  /** Plain-language reasons built from structured facts. */
  reasons: string[];
  /** For not_recommended: why. */
  exclusion?: string;
  proofCaseIds: string[];
}

const TOP_N = 4;
const HIGH_CUTOFF = 55;

export function recommendSolutions(p: Profile): Recommendation[] {
  const w = leverWeights(p);
  const model = effectiveServiceModel(p.concept, p.attributes);

  const recs: Recommendation[] = SOLUTIONS.map((s) => {
    const proof = casesForSolution(s.id).map((c) => c.id);
    const reasons: string[] = [];

    if (s.nature === "insight") {
      return { solution: s, tier: "visibility" as Tier, score: 0, reasons: ["Provides visibility to find and measure opportunities; it is not a direct cost lever."], proofCaseIds: proof };
    }

    const fitsModel = model === "mixed" || s.serviceModels.includes(model);
    if (!fitsModel) {
      return { solution: s, tier: "not_recommended" as Tier, score: 0, reasons: [], exclusion: s.poorFitReason, proofCaseIds: proof };
    }

    const leverMatch =
      s.influences === "both" ? w.food + w.labor : s.influences === "food" ? w.food : s.influences === "labor" ? w.labor : 0;
    let score = 60 * leverMatch;
    if (s.influences === "food" && p.foodPts > 0) reasons.push("Targets food & beverage cost, which is part of the improvement selected");
    if (s.influences === "labor" && p.laborPts > 0) reasons.push("Targets labor cost, which is part of the improvement selected");
    if (s.influences === "both") reasons.push("May touch both food and labor drivers");
    if (s.influences === "food" && p.foodPts === 0) reasons.push("Food-cost lever; no food improvement is selected");
    if (s.influences === "labor" && p.laborPts === 0) reasons.push("Labor lever; no labor improvement is selected");

    score += 15;
    if (model !== "mixed") reasons.push(`Fits ${model === "bar" ? "bar-service" : model + "-service"} concepts`);
    const boosts = s.attributeBoost.filter((a) => p.attributes.includes(a));
    if (boosts.length) {
      score += 8 * boosts.length;
      reasons.push("Relevant to: " + boosts.map((a) => a.replace(/_/g, " ")).join(", "));
    }
    if (proof.length) {
      score += Math.min(10, proof.length * 5);
      reasons.push(`Used in ${proof.length} published customer example${proof.length > 1 ? "s" : ""}`);
    }
    return { solution: s, tier: "additional" as Tier, score: Math.round(score * 10) / 10, reasons, proofCaseIds: proof };
  });

  const workflow = recs.filter((r) => r.tier === "additional").sort((a, b) => b.score - a.score);
  workflow.forEach((r, i) => {
    const lever = r.solution.influences;
    const selected = (lever === "food" && p.foodPts > 0) || (lever === "labor" && p.laborPts > 0) || (lever === "both" && p.foodPts + p.laborPts > 0);
    if (i < TOP_N && selected && r.score >= HIGH_CUTOFF) r.tier = "highest";
  });
  const order: Record<Tier, number> = { highest: 0, additional: 1, visibility: 2, not_recommended: 3 };
  return recs.sort((a, b) => order[a.tier] - order[b.tier] || b.score - a.score);
}

export const TIER_LABELS: Record<Tier, string> = {
  highest: "Highest relevance",
  additional: "Additional consideration",
  visibility: "Primarily reporting / visibility",
  not_recommended: "Not currently recommended",
};

/** Included in the summary: recommended-highest by default, anything else only if the user opted in. */
export function isIncluded(r: Recommendation, overrides: Record<string, boolean>): boolean {
  const o = overrides[r.solution.id];
  if (o !== undefined) return o;
  return r.tier === "highest";
}
