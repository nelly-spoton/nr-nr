import type { ConceptType, PlanningRanges } from "@/lib/types";

/**
 * Verified historical reference medians. Edit here only if the source is re-verified.
 * These are industry medians, NOT ideal targets, and NOT an official prime-cost median.
 */
export const NRA_SOURCE = {
  publisher: "National Restaurant Association",
  title: "2025 Restaurant Operations Data Abstract",
  dataPeriod: "2024 restaurant financial data",
  url: "https://restaurant.org",
  sampleContext:
    "Medians reported by operators in the Association's operations survey; sample size and respondent mix are described in the publication — confirm there before citing externally.",
  caveats: [
    "Industry medians, not ideal targets.",
    "The published food-cost figure covers food and NONALCOHOLIC beverage cost only; alcoholic beverage cost is excluded.",
    "Food and labor medians are reported separately. Their sum is not an official median prime cost, so none is shown.",
  ],
} as const;

export interface ReferenceMedians {
  id: "full_service" | "limited_service";
  label: string;
  foodPct: number;
  laborPct: number;
}

export const REFERENCE_MEDIANS: ReferenceMedians[] = [
  { id: "full_service", label: "Full-Service Restaurants", foodPct: 32.0, laborPct: 36.5 },
  { id: "limited_service", label: "Limited-Service Restaurants", foodPct: 32.4, laborPct: 31.7 },
];

/** Which published median set applies to a concept. Bars/custom have none. */
export function medianSetFor(concept: ConceptType): ReferenceMedians | null {
  if (concept === "full_service") return REFERENCE_MEDIANS[0]!;
  if (concept === "quick_service") return REFERENCE_MEDIANS[1]!;
  return null;
}

export const PLANNING_NOTE =
  "Management planning ranges are illustrative and editable. They are not statistically measured good/bad percentile boundaries, and they are not published statistics.";

const empty = (): PlanningRanges => ({
  food: { min: null, max: null },
  labor: { min: null, max: null },
  prime: { min: null, max: null },
});

export function defaultPlanning(): Record<ConceptType, PlanningRanges> {
  return {
    full_service: {
      food: { min: 28, max: 32 },
      labor: { min: 30, max: 34 },
      prime: { min: 60, max: 65 },
    },
    quick_service: {
      food: { min: 27, max: 32 },
      labor: { min: 25, max: 30 },
      prime: { min: 55, max: 60 },
    },
    // No fabricated bar statistics: operator sets targets.
    bar: empty(),
    custom: empty(),
  };
}

export const CONCEPT_LABELS: Record<ConceptType, string> = {
  full_service: "Full Service Restaurant",
  quick_service: "Quick Service / Fast Casual",
  bar: "Bar / Beverage Led",
  custom: "Custom",
};
