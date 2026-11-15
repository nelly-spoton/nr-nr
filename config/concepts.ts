/**
 * Restaurant concept taxonomy. A primary concept plus optional secondary attributes
 * tailor benchmarks, hypotheses, recommendations and customer proof. Concepts within
 * one type do NOT share identical economics; nothing here is a statistic.
 */
export type ConceptId =
  | "full_service"
  | "fine_dining"
  | "quick_service"
  | "fast_casual"
  | "pizza_italian"
  | "mexican_latin"
  | "bar_pub"
  | "brewery_taproom"
  | "cafe_bakery"
  | "multi_concept";

export type AttributeId =
  | "high_delivery"
  | "beverage_heavy"
  | "multi_location"
  | "seasonal"
  | "table_service"
  | "counter_service"
  | "catering_events";

export type ServiceModel = "table" | "counter" | "bar" | "mixed";

export interface ConceptDef {
  id: ConceptId;
  label: string;
  serviceModel: ServiceModel;
  /** Alcohol is central to the model → published food/nonalcoholic medians do not describe total COGS. */
  alcoholLed: boolean;
  /** Which illustrative planning range (if any) is offered as the default. */
  planningBasis: "full_service" | "quick_service" | null;
}

export const CONCEPTS: ConceptDef[] = [
  { id: "full_service", label: "Full-Service / Casual Dining", serviceModel: "table", alcoholLed: false, planningBasis: "full_service" },
  { id: "fine_dining", label: "Fine Dining", serviceModel: "table", alcoholLed: false, planningBasis: null },
  { id: "quick_service", label: "Quick Service", serviceModel: "counter", alcoholLed: false, planningBasis: "quick_service" },
  { id: "fast_casual", label: "Fast Casual", serviceModel: "counter", alcoholLed: false, planningBasis: "quick_service" },
  { id: "pizza_italian", label: "Pizza / Italian", serviceModel: "mixed", alcoholLed: false, planningBasis: null },
  { id: "mexican_latin", label: "Mexican / Latin", serviceModel: "mixed", alcoholLed: false, planningBasis: null },
  { id: "bar_pub", label: "Bar / Pub", serviceModel: "bar", alcoholLed: true, planningBasis: null },
  { id: "brewery_taproom", label: "Brewery / Taproom", serviceModel: "bar", alcoholLed: true, planningBasis: null },
  { id: "cafe_bakery", label: "Cafe / Bakery", serviceModel: "counter", alcoholLed: false, planningBasis: null },
  { id: "multi_concept", label: "Multi-Concept Restaurant Group", serviceModel: "mixed", alcoholLed: false, planningBasis: null },
];

export const CONCEPT_BY_ID: Record<ConceptId, ConceptDef> = Object.fromEntries(
  CONCEPTS.map((c) => [c.id, c]),
) as Record<ConceptId, ConceptDef>;

export const CONCEPT_LABELS: Record<ConceptId, string> = Object.fromEntries(
  CONCEPTS.map((c) => [c.id, c.label]),
) as Record<ConceptId, string>;

export const ATTRIBUTES: Array<{ id: AttributeId; label: string }> = [
  { id: "high_delivery", label: "High delivery volume" },
  { id: "beverage_heavy", label: "Beverage-heavy" },
  { id: "multi_location", label: "Multi-location" },
  { id: "seasonal", label: "Seasonal demand" },
  { id: "table_service", label: "Table service" },
  { id: "counter_service", label: "Counter service" },
  { id: "catering_events", label: "Catering / events" },
];

/** Maps pre-V2 saved concept ids onto the new taxonomy. */
export const LEGACY_CONCEPT_MAP: Record<string, ConceptId> = {
  full_service: "full_service",
  quick_service: "quick_service",
  bar: "bar_pub",
  custom: "multi_concept",
};

export function isConceptId(x: unknown): x is ConceptId {
  return typeof x === "string" && x in CONCEPT_BY_ID;
}

/** Attributes in effect: explicit choices plus multi-location derived from the location count. */
export function effectiveAttributes(attributes: AttributeId[], locations: number): AttributeId[] {
  const set = new Set(attributes);
  if (locations > 1) set.add("multi_location");
  return [...set];
}

/** Service model after attribute overrides (table/counter service refine "mixed"). */
export function effectiveServiceModel(concept: ConceptId, attributes: AttributeId[]): ServiceModel {
  const base = CONCEPT_BY_ID[concept].serviceModel;
  if (base !== "mixed") return base;
  const t = attributes.includes("table_service");
  const c = attributes.includes("counter_service");
  if (t && !c) return "table";
  if (c && !t) return "counter";
  return "mixed";
}
