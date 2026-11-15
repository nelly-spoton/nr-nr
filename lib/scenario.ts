import { DEFAULT_SELECTED_IDS } from "@/config/solutions";
import { defaultPlanning } from "@/config/benchmarks";
import type { Scenario } from "./types";

/** Illustrative example scenario. Not real restaurant data. */
export function exampleScenario(): Scenario {
  return {
    restaurantName: "Example Restaurant Group",
    scenarioName: "Example scenario",
    concept: "full_service",
    locations: 5,
    salesMode: "net",
    volumeScope: "perLocation",
    amount: 180000,
    salesConfidence: "estimated",
    gpv: { basis: "netEstimate", netEstimate: null, conversionFactor: null },
    foodPct: 32.0,
    laborPct: 36.0,
    foodImprovementPts: 0.4,
    laborImprovementPts: 0.6,
    roi: { monthlySoftwareCost: null, oneTimeCost: null, otherMonthlyCost: null },
    planning: defaultPlanning(),
    selectedSolutionIds: [...DEFAULT_SELECTED_IDS],
  };
}

/** Merge unknown stored JSON onto the example so older/corrupt saves can't crash the UI. */
export function hydrateScenario(raw: unknown): Scenario {
  const base = exampleScenario();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<Scenario>;
  return {
    ...base,
    ...r,
    gpv: { ...base.gpv, ...(r.gpv ?? {}) },
    roi: { ...base.roi, ...(r.roi ?? {}) },
    planning: { ...base.planning, ...(r.planning ?? {}) },
    selectedSolutionIds: Array.isArray(r.selectedSolutionIds) ? r.selectedSolutionIds : base.selectedSolutionIds,
  };
}
