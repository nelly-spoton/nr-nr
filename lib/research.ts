/**
 * FUTURE FEATURE (not built): AI website research.
 * These types and the pure adapter define the contract so a research provider can be added
 * later without touching the calculator. There is intentionally NO scraper and NO estimator here.
 *
 * Workflow: accept public URL → verify exact restaurant/location → extract concept, menu, hours and
 * revenue channels WITH sources → build editable low/base/high scenarios → separate facts from
 * assumptions → hand the chosen scenario to MarginLab.
 */
import type { ConceptId } from "@/config/concepts";
import type { Scenario } from "./types";

export type FactKind = "fact" | "assumption";

export interface ResearchFact {
  id: string;
  field: "name" | "concept" | "locations" | "hours" | "menu" | "revenue_channel" | "pos_vendor" | "other";
  value: string;
  kind: FactKind;
  /** Required for kind === "fact": where the value was observed. */
  sourceUrl: string | null;
  retrievedAt: string;
  confidence: "low" | "medium" | "high";
}

export interface Range3 {
  low: number;
  base: number;
  high: number;
}

export interface ResearchResult {
  inputUrl: string;
  /** The provider must confirm this is the right restaurant and location before anything transfers. */
  identityConfirmed: boolean;
  restaurantName: string | null;
  suggestedConcept: ConceptId | null;
  locations: number | null;
  facts: ResearchFact[];
  /** Modeling assumptions: always editable, never presented as verified. */
  assumptions: {
    monthlyNetSales?: Range3;
    foodPct?: Range3;
    laborPct?: Range3;
  };
}

export interface ResearchProvider {
  research(url: string): Promise<ResearchResult>;
}

export type Case = "low" | "base" | "high";

/** Facts must cite a source; anything else is rejected before it can reach the scenario. */
export function validateResearch(r: ResearchResult): string[] {
  const problems: string[] = [];
  if (!r.identityConfirmed) problems.push("Restaurant and location identity is not confirmed.");
  for (const f of r.facts)
    if (f.kind === "fact" && !f.sourceUrl) problems.push(`Fact "${f.field}" has no source URL; reclassify it as an assumption.`);
  return problems;
}

/**
 * Pure transfer into a scenario patch. Anything derived from `assumptions` marks sales as an
 * estimate, so every result stays preliminary until the operator verifies it.
 */
export function researchToScenarioPatch(r: ResearchResult, pick: Case): Partial<Scenario> {
  const problems = validateResearch(r);
  if (problems.length) throw new Error(problems.join(" "));
  const patch: Partial<Scenario> = { salesConfidence: "estimated" };
  if (r.restaurantName) patch.restaurantName = r.restaurantName;
  if (r.suggestedConcept) patch.concept = r.suggestedConcept;
  if (r.locations && r.locations >= 1 && r.locations <= 10) patch.locations = r.locations;
  if (r.assumptions.monthlyNetSales) {
    patch.salesMode = "net";
    patch.amount = r.assumptions.monthlyNetSales[pick];
  }
  if (r.assumptions.foodPct) patch.foodPct = r.assumptions.foodPct[pick];
  if (r.assumptions.laborPct) patch.laborPct = r.assumptions.laborPct[pick];
  return patch;
}
