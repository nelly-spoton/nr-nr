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

export type CostMode = "quick" | "detailed";

/** Which cost the operator wants to improve (drives recommendations and the points split). */
export type Focus = "food" | "labor" | "both";
/** guided = points follow focus + level; custom = the operator set the sliders directly. */
export type ImprovementMode = "guided" | "custom";

/** Detailed food/alcohol inputs. Revenue shares are % of total net sales; rates are % of that category's own sales. */
export interface DetailedCogs {
  foodSharePct: NumField;
  alcoholSharePct: NumField;
  foodCogsRatePct: NumField;
  alcoholCogsRatePct: NumField;
}

export type ExpenseKey =
  | "occupancy"
  | "utilities"
  | "marketing"
  | "repairs"
  | "admin"
  | "processing"
  | "delivery"
  | "corporate"
  | "otherOpex"
  | "depreciation"
  | "interestOther";

export interface ExpenseLine {
  /** Monthly dollars, entire group. Null = not yet addressed. 0 is a valid, addressed answer. */
  monthly: NumField;
  /** Already counted in food/beverage COGS or fully loaded labor, so excluded here to avoid double counting. */
  excluded: boolean;
}

export interface Expenses {
  /** actual = taken from the restaurant's real financial statements; assumed = operator/HS estimate. */
  basis: "assumed" | "actual";
  lines: Record<ExpenseKey, ExpenseLine>;
}

export interface Scenario {
  restaurantName: string;
  scenarioName: string;
  concept: ConceptId;
  /** False until the operator picks a restaurant type (the select starts on a placeholder). */
  conceptConfirmed: boolean;
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
  /** Quick-mode combined food & beverage COGS % of net sales. */
  foodPct: NumField;
  laborPct: NumField;
  costMode: CostMode;
  detailed: DetailedCogs;
  /** "Near peer median" window in percentage points (a display convention, not a statistical range). */
  nearWindowPts: number;
  expenses: Expenses;
  /** Operator-chosen comparison statistic per metric (only comparable ones are offered). */
  benchmarkPick: Record<string, string>;

  /** Guided improvement: focus + total points. Individual points follow them unless mode is custom. */
  focus: Focus;
  level: number;
  improvementMode: ImprovementMode;

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
