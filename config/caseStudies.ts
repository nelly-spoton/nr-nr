/**
 * Customer success-story library (structured, editable).
 *
 * VERIFICATION STATUS: every record below is `unverified`. The source pages could not be
 * fetched when this file was written (network policy), so fields contain ONLY what the
 * requester's brief stated. Anything not stated is `null` and shown as "not yet captured".
 * Run `npm run verify:sources` somewhere that can reach spoton.com, check each record against
 * its page, then set `verification` and `wordingStatus` by hand.
 *
 * A published % is a RELATIVE change reported by the customer. It is never converted into
 * percentage points of net sales and never feeds the calculator.
 */
import type { AttributeId, ConceptId, ServiceModel } from "@/config/concepts";

export type MetricKind = "relative_change" | "absolute_amount" | "duration";
export type MetricUnit = "percent_relative" | "usd_per_week" | "days";
export type MetricMeasure = "cogs" | "labor_cost" | "labor_savings" | "sales" | "tip_payout_time";
export type EvidenceLevel = "direct" | "indirect" | "none";

export interface CaseMetric {
  /** Result wording. While `wordingStatus` is "as_provided" it is the requester's wording, not checked verbatim. */
  wording: string;
  wordingStatus: "as_provided" | "verbatim_verified";
  kind: MetricKind;
  unit: MetricUnit;
  measure: MetricMeasure;
  direction: "decrease" | "increase";
  /** Numeric value (or low end of a range) as published. */
  min: number;
  max?: number;
}

export interface CaseStudy {
  id: string;
  name: string;
  /** Concept label as given in the brief (e.g. "BBQ / Fast Casual"). */
  conceptLabel: string;
  /** MarginLab classification used for matching. */
  concepts: ConceptId[];
  attributes: AttributeId[];
  serviceModel: ServiceModel;
  locationText: string | null;
  /** Only when verified; null otherwise. */
  locations: number | null;
  focusTags: string[];
  challenge: string | null;
  improvement: string | null;
  products: Array<{ name: string; solutionId?: string }>;
  /** Confirmed integration partners only. */
  partners: string[];
  metric: CaseMetric;
  sourceUrl: string;
  verification: { status: "unverified" | "verified"; verifiedOn: string | null; note: string };
  outcomes: { food: EvidenceLevel; labor: EvidenceLevel; revenue: EvidenceLevel };
  evidenceClass: "direct_cost_outcome" | "indirect_prime_cost";
  limitations: string[];
}

const UNVERIFIED = {
  status: "unverified",
  verifiedOn: null,
  note: "Populated from the requester's brief; source page not yet checked.",
} as const;

const COMMON_LIMITS = [
  "Single-restaurant published result; not a prediction or guarantee for another operator.",
  "Baseline, measurement period and method are not captured here.",
];

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "butcher-paper-bbq",
    name: "Butcher Paper BBQ",
    conceptLabel: "BBQ / Fast Casual",
    concepts: ["fast_casual"],
    attributes: [],
    serviceModel: "counter",
    locationText: null,
    locations: null,
    focusTags: ["food costs", "profitability"],
    challenge: null,
    improvement: null,
    products: [{ name: "SpotOn Profit Assist", solutionId: "spoton-profit-assist" }],
    partners: [],
    metric: { wording: "9% decrease in COGS", wordingStatus: "as_provided", kind: "relative_change", unit: "percent_relative", measure: "cogs", direction: "decrease", min: 9 },
    sourceUrl: "https://www.spoton.com/success-stories/butcher-paper-bbq/",
    verification: UNVERIFIED,
    outcomes: { food: "direct", labor: "none", revenue: "none" },
    evidenceClass: "direct_cost_outcome",
    limitations: [...COMMON_LIMITS],
  },
  {
    id: "kaleis-kitchenette",
    name: "Kalei's Kitchenette",
    conceptLabel: "Fast Casual",
    concepts: ["fast_casual"],
    attributes: [],
    serviceModel: "counter",
    locationText: null,
    locations: null,
    focusTags: ["food costs", "profitability"],
    challenge: null,
    improvement: null,
    products: [
      { name: "SpotOn Profit Assist", solutionId: "spoton-profit-assist" },
      { name: "SpotOn Restaurant" },
    ],
    partners: [],
    metric: { wording: "3% reduction in COGS", wordingStatus: "as_provided", kind: "relative_change", unit: "percent_relative", measure: "cogs", direction: "decrease", min: 3 },
    sourceUrl: "https://www.spoton.com/success-stories/kaleis-kitchenette/",
    verification: UNVERIFIED,
    outcomes: { food: "direct", labor: "none", revenue: "none" },
    evidenceClass: "direct_cost_outcome",
    limitations: [...COMMON_LIMITS],
  },
  {
    id: "big-daves-bagels",
    name: "Big Dave's Bagels",
    conceptLabel: "Cafe / Bakery",
    concepts: ["cafe_bakery"],
    attributes: [],
    serviceModel: "counter",
    locationText: null,
    locations: null,
    focusTags: ["food costs", "operations"],
    challenge: null,
    improvement: null,
    products: [{ name: "SpotOn Restaurant" }, { name: "Profitability analysis" }],
    partners: [],
    metric: { wording: "2% decrease in COGS", wordingStatus: "as_provided", kind: "relative_change", unit: "percent_relative", measure: "cogs", direction: "decrease", min: 2 },
    sourceUrl: "https://www.spoton.com/success-stories/big-daves-bagels-and-deli/",
    verification: UNVERIFIED,
    outcomes: { food: "direct", labor: "none", revenue: "none" },
    evidenceClass: "direct_cost_outcome",
    limitations: [...COMMON_LIMITS],
  },
  {
    id: "adalina",
    name: "Adalina",
    conceptLabel: "Fine Dining / Full Service",
    concepts: ["fine_dining", "full_service"],
    attributes: ["table_service"],
    serviceModel: "table",
    locationText: "Chicago, IL",
    locations: null,
    focusTags: ["labor"],
    challenge: "Labor scheduling and early clock-ins",
    improvement: "Schedule enforcement and improved labor oversight",
    products: [{ name: "SpotOn Restaurant" }, { name: "SpotOn Teamwork", solutionId: "spoton-teamwork" }],
    partners: [],
    metric: { wording: "$500–$800 weekly labor savings", wordingStatus: "as_provided", kind: "absolute_amount", unit: "usd_per_week", measure: "labor_savings", direction: "decrease", min: 500, max: 800 },
    sourceUrl: "https://www.spoton.com/success-stories/adalina/",
    verification: { ...UNVERIFIED, note: "Challenge, improvement and location come from the requester's example card; source page not yet checked." },
    outcomes: { food: "none", labor: "direct", revenue: "none" },
    evidenceClass: "direct_cost_outcome",
    limitations: [...COMMON_LIMITS, "Dollar figure reflects this restaurant's own scale and is not scaled to another operator."],
  },
  {
    id: "the-mudpuppy",
    name: "The Mudpuppy",
    conceptLabel: "Seasonal Full Service",
    concepts: ["full_service"],
    attributes: ["seasonal", "table_service"],
    serviceModel: "table",
    locationText: null,
    locations: null,
    focusTags: ["labor", "management efficiency"],
    challenge: null,
    improvement: null,
    products: [
      { name: "SpotOn Teamwork", solutionId: "spoton-teamwork" },
      { name: "SpotOn Handhelds", solutionId: "spoton-handhelds" },
      { name: "DayCheck" },
    ],
    partners: [],
    metric: { wording: "7% decrease in labor costs", wordingStatus: "as_provided", kind: "relative_change", unit: "percent_relative", measure: "labor_cost", direction: "decrease", min: 7 },
    sourceUrl: "https://www.spoton.com/success-stories/the-mudpuppy/",
    verification: UNVERIFIED,
    outcomes: { food: "none", labor: "direct", revenue: "none" },
    evidenceClass: "direct_cost_outcome",
    limitations: [...COMMON_LIMITS, "Multiple products were used together; the result is not attributable to any single one."],
  },
  {
    id: "fat-zachs-pizza",
    name: "Fat Zach's Pizza",
    conceptLabel: "Pizza / Multi-Location",
    concepts: ["pizza_italian"],
    attributes: ["multi_location"],
    serviceModel: "mixed",
    locationText: null,
    locations: null,
    focusTags: ["labor", "reporting"],
    challenge: null,
    improvement: null,
    products: [{ name: "SpotOn Restaurant and related tools" }],
    partners: [],
    metric: { wording: "20% reduction in labor costs", wordingStatus: "as_provided", kind: "relative_change", unit: "percent_relative", measure: "labor_cost", direction: "decrease", min: 20 },
    sourceUrl: "https://www.spoton.com/success-stories/fat-zachs/",
    verification: UNVERIFIED,
    outcomes: { food: "none", labor: "direct", revenue: "none" },
    evidenceClass: "direct_cost_outcome",
    limitations: [...COMMON_LIMITS, "Exact products and the starting labor baseline are not captured; a 20% relative change can be a small or large number of points."],
  },
  {
    id: "big-lake-brewing",
    name: "Big Lake Brewing",
    conceptLabel: "Brewery / Taproom",
    concepts: ["brewery_taproom"],
    attributes: [],
    serviceModel: "bar",
    locationText: null,
    locations: null,
    focusTags: ["revenue", "throughput"],
    challenge: null,
    improvement: null,
    products: [],
    partners: [],
    metric: { wording: "10% increase in Saturday sales", wordingStatus: "as_provided", kind: "relative_change", unit: "percent_relative", measure: "sales", direction: "increase", min: 10 },
    sourceUrl: "https://www.spoton.com/success-stories/big-lake-brewing/",
    verification: { ...UNVERIFIED, note: "Products not stated in the brief; source page not yet checked." },
    outcomes: { food: "none", labor: "none", revenue: "direct" },
    evidenceClass: "indirect_prime_cost",
    limitations: [...COMMON_LIMITS, "A sales increase, not a food or labor saving: it is NOT counted as a prime-cost reduction."],
  },
  {
    id: "cocos-crush-bar",
    name: "Coco's Crush Bar",
    conceptLabel: "Bar / Multi-Location",
    concepts: ["bar_pub"],
    attributes: ["multi_location"],
    serviceModel: "bar",
    locationText: null,
    locations: null,
    focusTags: ["labor administration", "tip management"],
    challenge: null,
    improvement: null,
    products: [],
    partners: [],
    metric: { wording: "Five-day faster tip payouts", wordingStatus: "as_provided", kind: "duration", unit: "days", measure: "tip_payout_time", direction: "decrease", min: 5 },
    sourceUrl: "https://www.spoton.com/success-stories/cocos-crush-bar/",
    verification: { ...UNVERIFIED, note: "Products not stated in the brief; source page not yet checked." },
    outcomes: { food: "none", labor: "indirect", revenue: "none" },
    evidenceClass: "indirect_prime_cost",
    limitations: [...COMMON_LIMITS, "A payout-timing (administration) result; it is not a measured labor-cost saving."],
  },
];

export const CASE_BY_ID: Record<string, CaseStudy> = Object.fromEntries(CASE_STUDIES.map((c) => [c.id, c]));

export const PROOF_DISCLAIMER =
  "Your financial opportunity is hypothetical. The customer outcomes are published examples from other restaurants, not predictions or guarantees.";

/** Plain-language qualification for how to read a published metric. Never converts units. */
export function metricQualifier(m: CaseMetric): string {
  if (m.measure === "sales")
    return "A sales increase reported as a relative %. It is not a cost saving and is not counted as a prime-cost reduction.";
  if (m.kind === "relative_change")
    return "Reported as a relative change (%), not percentage points of net sales. Without the published baseline it cannot be converted into this prospect's prime-cost improvement.";
  if (m.kind === "absolute_amount")
    return "A dollar figure at that restaurant's own scale; not scaled to this prospect.";
  return "An administrative timing result, not a measured cost saving.";
}

export function verificationLabel(c: CaseStudy): string {
  return c.verification.status === "verified" && c.verification.verifiedOn
    ? `Source verified ${c.verification.verifiedOn}`
    : "Source not yet verified";
}
