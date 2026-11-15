/**
 * Customer-proof matching. Ranks published case studies for a prospect profile.
 * It reads case metadata only; it never touches financial calculations and never converts a
 * published percentage into the prospect's model.
 */
import { CASE_STUDIES, type CaseStudy, type EvidenceLevel } from "@/config/caseStudies";
import { CONCEPT_BY_ID, CONCEPT_LABELS, effectiveServiceModel } from "@/config/concepts";
import { leverWeights, type Profile } from "./profile";

export const MAX_MATCHES = 3;
const MIN_SCORE = 25;

const EV: Record<EvidenceLevel, number> = { direct: 1, indirect: 0.3, none: 0 };
const FOOD_TAGS = ["food costs", "profitability"];
const LABOR_TAGS = ["labor", "management efficiency", "reporting", "labor administration"];

export interface CaseMatch {
  study: CaseStudy;
  score: number;
  /** Why it is relevant, built only from structured facts. */
  reasons: string[];
  /** Which lever the published result speaks to. */
  lever: "food" | "labor" | "revenue" | "other";
  /** True when the evidence is a sales or admin result, not a food/labor cost result. */
  indirect: boolean;
  closestConcept: boolean;
}

function scoreCase(c: CaseStudy, p: Profile): CaseMatch | null {
  const w = leverWeights(p);
  const reasons: string[] = [];

  const leverFit = w.food * EV[c.outcomes.food] + w.labor * EV[c.outcomes.labor];
  const outcome = 50 * leverFit + (c.outcomes.revenue === "direct" ? 6 : 0);
  if (c.outcomes.food === "direct" && p.foodPts > 0) reasons.push("Published food/COGS outcome, matching the food improvement selected");
  if (c.outcomes.labor === "direct" && p.laborPts > 0) reasons.push("Published labor outcome, matching the labor improvement selected");
  if (c.outcomes.labor === "indirect") reasons.push("Labor-administration evidence, not a measured labor saving");
  if (c.outcomes.revenue === "direct") reasons.push("Sales-growth evidence, not a cost saving");

  let concept = 0;
  const exact = c.concepts.includes(p.concept);
  if (exact) {
    concept = 25;
    reasons.unshift(`Same concept: ${CONCEPT_LABELS[p.concept]}`);
  } else {
    const model = effectiveServiceModel(p.concept, p.attributes);
    if (model !== "mixed" && model === c.serviceModel) {
      concept = 12;
      reasons.push(`Comparable service model (${model === "bar" ? "bar service" : model + " service"})`);
    } else if (model === "mixed" || c.serviceModel === "mixed") concept = 4;
  }
  const attrOverlap = c.attributes.filter((a) => p.attributes.includes(a));
  const attrScore = Math.min(12, attrOverlap.length * 4);
  if (attrOverlap.length) reasons.push("Shared attributes: " + attrOverlap.map((a) => a.replace(/_/g, " ")).join(", "));

  const tagHit = (tags: string[]) => c.focusTags.filter((t) => tags.includes(t)).length;
  const challenge = Math.min(10, 5 * (w.food * tagHit(FOOD_TAGS) + w.labor * tagHit(LABOR_TAGS)) * 2);

  let loc = 0;
  if (c.locations !== null) {
    const ratio = Math.max(c.locations, p.locations) / Math.min(c.locations, p.locations);
    if (ratio <= 2) {
      loc = 5;
      reasons.push("Comparable location count");
    }
  }
  const evidence = (c.evidenceClass === "direct_cost_outcome" ? 10 : 0) + (c.verification.status === "verified" ? 5 : 0);

  const score = Math.round((outcome + concept + attrScore + challenge + loc + evidence) * 10) / 10;
  const relevant = outcome > 0 || concept >= 12;
  if (!relevant || score < MIN_SCORE) return null;

  const lever: CaseMatch["lever"] =
    c.outcomes.food === "direct" ? "food" : c.outcomes.labor !== "none" ? "labor" : c.outcomes.revenue !== "none" ? "revenue" : "other";
  return {
    study: c,
    score,
    reasons,
    lever,
    indirect: c.evidenceClass === "indirect_prime_cost",
    closestConcept: exact,
  };
}

/**
 * Up to three matches. For alcohol-led concepts (bar, brewery) the closest same-concept study is
 * shown first (flagged when it is not a cost result); the rest are ranked by outcome relevance.
 * Returns fewer than three, or none, rather than stretching a weak match.
 */
export function matchCaseStudies(p: Profile, limit = MAX_MATCHES): CaseMatch[] {
  const all = CASE_STUDIES.map((c) => scoreCase(c, p)).filter((m): m is CaseMatch => m !== null);
  all.sort((a, b) => b.score - a.score || a.study.name.localeCompare(b.study.name));
  if (CONCEPT_BY_ID[p.concept].alcoholLed) {
    const pinned = all.find((m) => m.closestConcept);
    if (pinned) return [pinned, ...all.filter((m) => m !== pinned)].slice(0, limit);
  }
  return all.slice(0, limit);
}

/** Best published example for one specific lever, independent of the other. */
export function bestProofFor(lever: "food" | "labor", p: Profile): CaseMatch | null {
  const only: Profile = { ...p, foodPts: lever === "food" ? Math.max(p.foodPts, 0.01) : 0, laborPts: lever === "labor" ? Math.max(p.laborPts, 0.01) : 0 };
  return matchCaseStudies(only, 10).find((m) => m.lever === lever && !m.indirect) ?? null;
}

/** Case studies that used a given solution (for per-product proof). */
export function casesForSolution(solutionId: string): CaseStudy[] {
  return CASE_STUDIES.filter((c) => c.products.some((x) => x.solutionId === solutionId));
}
