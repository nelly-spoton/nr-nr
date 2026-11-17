/**
 * Customer success-story library (structured, editable).
 *
 * VERIFICATION STATUS: every record below is `requester_confirmed` (accepted by the SpotOn team, not
 * independently checked). The source pages could not be fetched when this file was written (network
 * policy), so fields contain ONLY what the requester's brief stated. Anything not stated is `null` and shown as "not yet captured".
 * Run `npm run verify:sources` somewhere that can reach spoton.com, check each record against
 * its page, then set `verification` and `wordingStatus` by hand.
 *
 * A published % is a RELATIVE change reported by the customer. It is never converted into
 * percentage points of net sales and never feeds the calculator.
 */
import type { AttributeId, ConceptId, ServiceModel } from "@/config/concepts";

export type MetricKind = "relative_change" | "absolute_amount" | "duration" | "percent_unspecified";
export type MetricUnit = "percent_relative" | "usd_per_week" | "usd_total" | "percent_unspecified" | "days";
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
  /** Further published results from the same source, shown beneath the main one. */
  additionalMetrics?: CaseMetric[];
  sourceUrl: string;
  verification: { status: "unverified" | "requester_confirmed" | "verified"; verifiedOn: string | null; note: string };
  outcomes: { food: EvidenceLevel; labor: EvidenceLevel; revenue: EvidenceLevel };
  evidenceClass: "direct_cost_outcome" | "indirect_prime_cost";
  limitations: string[];
}

/**
 * Accepted by the SpotOn team on 2026-11-15. This is the requester's sign-off, NOT an independent
 * check against the source pages (they were unreachable when the records were built).
 */
const UNVERIFIED = {
  status: "requester_confirmed",
  verifiedOn: "2026-11-15",
  note: "Accepted by the SpotOn team; not independently checked against the source page.",
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
    products: [{ name: "SpotOn Restaurant" }, { name: "Profitability analysis", solutionId: "spoton-profit-assist" }],
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
    verification: { ...UNVERIFIED, note: "Accepted by the SpotOn team; challenge, improvement and location come from the requester's example card. Not independently checked against the source page." },
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
            { name: "Tip management", solutionId: "spoton-tip-management" }, { name: "Tip access (DayCheck)", solutionId: "spoton-tip-access" },
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
    id: "weinbergers-deli",
    name: "Weinberger's Deli",
    conceptLabel: "Deli",
    // Classified as cafe/bakery for matching; the release does not state the service style.
    concepts: ["cafe_bakery"],
    attributes: [],
    serviceModel: "mixed",
    locationText: "Grapevine, TX",
    locations: null,
    focusTags: ["food costs", "labor", "profitability"],
    challenge:
      "An independent that expanded this year. Labor was running at 44% of sales, food cost at 30% and prime cost at 74%, against a goal of 63%.",
    improvement:
      "Uses SpotOn Assistant Manager for daily scheduling, food cost comparisons and sales predictions he used to piece together manually. It surfaced rising food costs, waste and overstaffing.",
    products: [{ name: "SpotOn Assistant Manager (Sam)", solutionId: "sam" }],
    partners: [],
    metric: { wording: "Saved more than $124,000", wordingStatus: "as_provided", kind: "absolute_amount", unit: "usd_total", measure: "labor_savings", direction: "decrease", min: 124000 },
    additionalMetrics: [
      { wording: "Lowered food costs by 3.5%", wordingStatus: "as_provided", kind: "percent_unspecified", unit: "percent_unspecified", measure: "cogs", direction: "decrease", min: 3.5 },
    ],
    // Public SpotOn press release (Business Wire, Nov 17, 2026). Text supplied by the requester.
    sourceUrl: "https://www.businesswire.com/news/home/20261117137877/en/SpotOn-Introduces-SpotOn-Assistant-Manager-an-AI-Agent-that-Helped-a-Texas-Restaurant-Save-More-than-%24124000",
    verification: {
      status: "requester_confirmed",
      verifiedOn: "2026-11-17",
      note: "Taken from the SpotOn press release text supplied by the requester; not checked against the live page. Not independently checked.",
    },
    // Food cost is a measured result. The release says overstaffing was addressed but gives no separate labor figure.
    outcomes: { food: "direct", labor: "indirect", revenue: "none" },
    evidenceClass: "direct_cost_outcome",
    limitations: [
      ...COMMON_LIMITS,
      "The $124,000 is described as saved by addressing rising food costs, waste and overstaffing; the release does not split it by cost or state the period.",
      "Reported by SpotOn in a press release, with the owner quoted.",
    ],
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
    verification: { ...UNVERIFIED, note: "Accepted by the SpotOn team; products not stated in the brief. Not independently checked against the source page." },
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
    products: [{ name: "Tip management", solutionId: "spoton-tip-management" }, { name: "Tip access (DayCheck)", solutionId: "spoton-tip-access" }],
    partners: [],
    metric: { wording: "Five-day faster tip payouts", wordingStatus: "as_provided", kind: "duration", unit: "days", measure: "tip_payout_time", direction: "decrease", min: 5 },
    sourceUrl: "https://www.spoton.com/success-stories/cocos-crush-bar/",
    verification: { ...UNVERIFIED, note: "Accepted by the SpotOn team; products not stated in the brief. Not independently checked against the source page." },
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
  if (m.kind === "percent_unspecified")
    return "The release says 3.5% but not whether that is points of sales or a relative reduction (it gives a 30% starting food cost), so it is not converted into this prospect's model.";
  if (m.unit === "usd_total")
    return "A total dollar figure. The period it covers and how it was measured are not stated; one restaurant, not scaled to this prospect.";
  if (m.kind === "absolute_amount")
    return "A dollar figure at that restaurant's own scale; not scaled to this prospect.";
  return "An administrative timing result, not a measured cost saving.";
}

export function verificationLabel(c: CaseStudy): string {
  const { status, verifiedOn } = c.verification;
  if (status === "verified" && verifiedOn) return `Source verified ${verifiedOn}`;
  if (status === "requester_confirmed" && verifiedOn) return `Accepted by SpotOn team ${verifiedOn}; not independently checked`;
  return "Source not yet verified";
}
