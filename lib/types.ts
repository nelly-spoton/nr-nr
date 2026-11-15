import type { AttributeId, ConceptId } from "@/config/concepts";

export type { AttributeId, ConceptId };
export type SalesInputMode = "net" | "gpv";
export type VolumeScope = "perLocation" | "group";
export type GpvBasis = "netEstimate" | "factor";
export type SalesConfidence = "verified" | "estimated";
export type CostCategory = "food" | "labor";

/** A numeric field the user may leave blank (null) while typing. */
export type NumField = number | null;

export interface Range {
  min: NumField;
  max: NumField;
}

/** Editable management planning range (illustrative, not a statistical boundary). */
export interface PlanningRanges {
  food: Range;
  labor: Range;
  prime: Range;
  /** illustrative = config default; operator = edited/entered by the operator; none = not set. */
  origin: "illustrative" | "operator" | "none";
}

export type BevCategory = "food" | "beer" | "liquor" | "wine" | "other";

/** Optional beverage-aware COGS. Mix is % of NET SALES; cost is % of that category's own sales. */
export interface BeverageMix {
  enabled: boolean;
  mixPct: Record<BevCategory, NumField>;
  costPct: Record<BevCategory, NumField>;
}

export interface Scenario {
  restaurantName: string;
  scenarioName: string;
  concept: ConceptId;
  attributes: AttributeId[];
  /** 1–10. V2 may replace equal-split with a per-location array. */
  locations: number | null;

  salesMode: SalesInputMode;
  volumeScope: VolumeScope;
  /** Monthly dollar amount (net sales or GPV depending on salesMode). */
  amount: NumField;
  salesConfidence: SalesConfidence;
  gpv: {
    basis: GpvBasis;
    /** Independently entered monthly net-sales estimate (same scope as `amount`). */
    netEstimate: NumField;
    /** User-provided GPV → net sales factor, e.g. 0.85 */
    conversionFactor: NumField;
  };

  /** Canonical cost inputs, % of net sales. Dollar entry converts into these. */
  foodPct: NumField;
  laborPct: NumField;

  /** Improvement in percentage POINTS. */
  foodImprovementPts: NumField;
  laborImprovementPts: NumField;

  roi: {
    monthlySoftwareCost: NumField;
    oneTimeCost: NumField;
    otherMonthlyCost: NumField;
  };

  beverageMix: BeverageMix;
  planning: Record<ConceptId, PlanningRanges>;
  /** Per-solution include/exclude in the summary; absent = follow the recommendation tier. */
  solutionOverrides: Record<string, boolean>;
}

export type SalesStatus =
  | "net-verified"
  | "net-estimated"
  | "gpv-via-net-estimate"
  | "gpv-via-factor"
  | "gpv-unresolved";

export interface Issue {
  field: string;
  message: string;
  severity: "error" | "warning";
}
