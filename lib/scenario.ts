import { defaultPlanning, defaultPlanningFor } from "@/config/benchmarks";
import { LEGACY_CONCEPT_MAP, isConceptId, ATTRIBUTES, type ConceptId } from "@/config/concepts";
import type { BeverageMix, PlanningRanges, Scenario } from "./types";

export const emptyBeverageMix = (): BeverageMix => ({
  enabled: false,
  mixPct: { food: null, beer: null, liquor: null, wine: null, other: null },
  costPct: { food: null, beer: null, liquor: null, wine: null, other: null },
});

/** Illustrative example scenario. Not real restaurant data. */
export function exampleScenario(): Scenario {
  return {
    restaurantName: "Example Restaurant Group",
    scenarioName: "Example scenario",
    concept: "full_service",
    attributes: [],
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
    beverageMix: emptyBeverageMix(),
    planning: defaultPlanning(),
    solutionOverrides: {},
  };
}

const ATTR_IDS = new Set(ATTRIBUTES.map((a) => a.id));

/** Merge unknown stored JSON onto the example so older (V1) or corrupt saves can't crash the UI. */
export function hydrateScenario(raw: unknown): Scenario {
  const base = exampleScenario();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown> & Partial<Scenario>;

  const rawConcept = r.concept as unknown;
  const concept: ConceptId = isConceptId(rawConcept)
    ? rawConcept
    : typeof rawConcept === "string" && rawConcept in LEGACY_CONCEPT_MAP
      ? LEGACY_CONCEPT_MAP[rawConcept]!
      : base.concept;

  // V1 stored planning keyed by old concept ids (bar/custom). Carry operator edits across.
  const planning = defaultPlanning();
  const storedPlanning = (r.planning ?? {}) as Record<string, Partial<PlanningRanges>>;
  for (const [k, v] of Object.entries(storedPlanning)) {
    const id = isConceptId(k) ? k : LEGACY_CONCEPT_MAP[k];
    if (id && v && v.food && v.labor && v.prime) {
      const edited = JSON.stringify([v.food, v.labor, v.prime]) !== JSON.stringify([defaultPlanningFor(id).food, defaultPlanningFor(id).labor, defaultPlanningFor(id).prime]);
      planning[id] = {
        food: v.food,
        labor: v.labor,
        prime: v.prime,
        origin: v.origin ?? (edited ? "operator" : defaultPlanningFor(id).origin),
      };
    }
  }

  const bev = (r.beverageMix ?? {}) as Partial<BeverageMix>;
  const bevBase = emptyBeverageMix();
  const attrs = Array.isArray(r.attributes) ? r.attributes.filter((a) => ATTR_IDS.has(a)) : [];

  return {
    ...base,
    ...(r as Partial<Scenario>),
    concept,
    attributes: attrs,
    gpv: { ...base.gpv, ...(r.gpv ?? {}) },
    roi: { ...base.roi, ...(r.roi ?? {}) },
    beverageMix: {
      enabled: !!bev.enabled,
      mixPct: { ...bevBase.mixPct, ...(bev.mixPct ?? {}) },
      costPct: { ...bevBase.costPct, ...(bev.costPct ?? {}) },
    },
    planning,
    solutionOverrides:
      r.solutionOverrides && typeof r.solutionOverrides === "object" ? (r.solutionOverrides as Record<string, boolean>) : {},
  };
}
