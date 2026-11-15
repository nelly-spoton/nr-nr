import { effectiveAttributes, type AttributeId, type ConceptId } from "@/config/concepts";
import type { ScenarioResult } from "./calc";
import type { Scenario } from "./types";

/** What matching, recommendations and coaching know about the prospect. Never includes case data. */
export interface Profile {
  concept: ConceptId;
  attributes: AttributeId[];
  locations: number;
  foodPts: number;
  laborPts: number;
}

export function buildProfile(s: Scenario, r: ScenarioResult): Profile {
  return {
    concept: s.concept,
    attributes: effectiveAttributes(s.attributes, r.locations),
    locations: r.locations,
    foodPts: r.improvement.foodPts,
    laborPts: r.improvement.laborPts,
  };
}

/** Share of the selected improvement that is food vs labor (50/50 when nothing is selected). */
export function leverWeights(p: Pick<Profile, "foodPts" | "laborPts">): { food: number; labor: number } {
  const t = p.foodPts + p.laborPts;
  return t > 0 ? { food: p.foodPts / t, labor: p.laborPts / t } : { food: 0.5, labor: 0.5 };
}
