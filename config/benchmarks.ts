import { CONCEPT_BY_ID, effectiveServiceModel, type AttributeId, type ConceptId } from "@/config/concepts";
import type { PlanningRanges } from "@/lib/types";

import { SOURCES, STAT_BY_ID } from "@/config/stats";

const SRC = SOURCES.nra2025!;

/** Source block for the NRA medians. Derived from config/stats.ts; do not hard-code here. */
export const NRA_SOURCE = {
  publisher: SRC.organization,
  title: SRC.title,
  dataPeriod: SRC.dataPeriod,
  url: SRC.url ?? "https://restaurant.org",
  sampleContext: SRC.sample,
  caveats: [
    "Industry medians, not ideal targets.",
    "The published food-cost figure covers food and NONALCOHOLIC beverage cost only; alcoholic beverage cost is excluded.",
    "Food and labor medians are reported separately. Their sum is not an official median prime cost, so none is shown for full-service.",
  ],
} as const;

export interface ReferenceMedians {
  id: "full_service" | "limited_service";
  label: string;
  foodPct: number;
  laborPct: number;
}

const v = (id: string) => STAT_BY_ID[id]!.value;

/** Derived from the centralized stats so Benchmarks and Industry Stats cannot disagree. */
export const REFERENCE_MEDIANS: ReferenceMedians[] = [
  { id: "full_service", label: "Full-Service Restaurants", foodPct: v("nra-fs-food"), laborPct: v("nra-fs-labor") },
  { id: "limited_service", label: "Limited-Service Restaurants", foodPct: v("nra-ls-food"), laborPct: v("nra-ls-labor") },
];

export interface MedianApplicability {
  set: ReferenceMedians | null;
  /** Shown prominently next to any comparison. */
  qualification: string | null;
}

export const ALCOHOL_QUALIFICATION =
  "The published food figure covers food and NONALCOHOLIC beverage cost only. Do not compare it with total COGS that includes beer, liquor or wine.";

/**
 * Which published median set (if any) may be shown for a concept, and with what qualification.
 * Bars, breweries and multi-concept groups get none; nothing is invented for them.
 */
export function medianApplicability(concept: ConceptId, attributes: AttributeId[] = []): MedianApplicability {
  const def = CONCEPT_BY_ID[concept];
  const fsr = REFERENCE_MEDIANS[0]!;
  const lsr = REFERENCE_MEDIANS[1]!;
  const bevNote = attributes.includes("beverage_heavy") ? ALCOHOL_QUALIFICATION : null;
  if (def.alcoholLed)
    return {
      set: null,
      qualification: "No published median applies to bar-led concepts. " + ALCOHOL_QUALIFICATION,
    };
  switch (concept) {
    case "full_service":
      return { set: fsr, qualification: bevNote };
    case "quick_service":
      return { set: lsr, qualification: bevNote };
    case "fast_casual":
      return {
        set: lsr,
        qualification:
          "Published as 'limited-service'. Confirm in the source whether fast casual is covered before citing." +
          (bevNote ? " " + bevNote : ""),
      };
    case "fine_dining":
      return {
        set: fsr,
        qualification:
          "Published full-service median, shown for context only; fine-dining economics may differ." +
          (bevNote ? " " + bevNote : ""),
      };
    case "pizza_italian":
    case "mexican_latin":
    case "cafe_bakery": {
      const model = effectiveServiceModel(concept, attributes);
      if (model === "table") return { set: fsr, qualification: "Full-service median shown for context; this concept's mix may differ." + (bevNote ? " " + bevNote : "") };
      if (model === "counter") return { set: lsr, qualification: "Limited-service median shown for context; this concept's mix may differ." + (bevNote ? " " + bevNote : "") };
      return { set: null, qualification: "Choose table service or counter service to see a published median for context." };
    }
    default:
      return { set: null, qualification: "No published median applies to a multi-concept group; set targets per concept." };
  }
}

export const PLANNING_NOTE =
  "Management planning ranges are illustrative and editable. They are not statistically measured good/bad percentile boundaries, and they are not published statistics.";

const none = (): PlanningRanges => ({
  food: { min: null, max: null },
  labor: { min: null, max: null },
  prime: { min: null, max: null },
  origin: "none",
});

const plan = (id: string) => ({ min: STAT_BY_ID[id]!.value, max: STAT_BY_ID[id]!.valueMax! });

/** Illustrative planning ranges, derived from config/stats.ts (the single source). */
export const ILLUSTRATIVE_RANGES = {
  full_service: {
    food: plan("plan-fs-food"),
    labor: plan("plan-fs-labor"),
    prime: plan("plan-fs-prime"),
    origin: "illustrative",
  },
  quick_service: {
    food: plan("plan-ls-food"),
    labor: plan("plan-ls-labor"),
    prime: plan("plan-ls-prime"),
    origin: "illustrative",
  },
} as const satisfies Record<string, PlanningRanges>;

/** Illustrative defaults exist only for the two concepts the spec defines; others are operator-set. */
export function defaultPlanningFor(concept: ConceptId): PlanningRanges {
  const basis = CONCEPT_BY_ID[concept].planningBasis;
  if (!basis) return none();
  const r = ILLUSTRATIVE_RANGES[basis];
  return { food: { ...r.food }, labor: { ...r.labor }, prime: { ...r.prime }, origin: "illustrative" };
}

export function defaultPlanning(): Record<ConceptId, PlanningRanges> {
  return Object.fromEntries(
    (Object.keys(CONCEPT_BY_ID) as ConceptId[]).map((c) => [c, defaultPlanningFor(c)]),
  ) as Record<ConceptId, PlanningRanges>;
}

/** The four kinds of numbers MarginLab can show; they are never blended or relabeled. */
export const BENCHMARK_KINDS = [
  { id: "A", label: "Published historical median", detail: "National Restaurant Association, 2024 data. A median, not a target." },
  { id: "B", label: "Illustrative planning range", detail: "Management guideline shipped with the app. Not a statistical boundary." },
  { id: "C", label: "Operator-provided target", detail: "Entered or edited by the operator for this restaurant." },
  { id: "D", label: "AI-generated estimate", detail: "Not enabled in this version. If added, always labeled separately and never treated as verified." },
] as const;
