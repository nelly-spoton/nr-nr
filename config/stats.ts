/**
 * CENTRALIZED BENCHMARK DATA — the single source for the Benchmarks page, the Overview financial-health
 * dashboard, the Industry Stats page, the summary and the copy text. Nothing else may hard-code a statistic.
 *
 * PROVENANCE: values were supplied by the SpotOn team (2026-11-16). They were NOT independently checked
 * against the publications (sources unreachable from the build environment). Fields the supplier did not
 * give — exact publication date, deep source link, sample size — are explicit `null`, never guessed.
 *
 * Evidence classes are never mixed without labels. No geographic fields exist by design.
 */

export type EvidenceClass =
  | "published_measured"
  | "vendor_historical"
  | "illustrative_planning"
  | "operator_target"
  | "ai_estimate";

export const EVIDENCE_LABELS: Record<EvidenceClass, string> = {
  published_measured: "Published measured statistic",
  vendor_historical: "Historical vendor-reported statistic",
  illustrative_planning: "Illustrative planning guideline",
  operator_target: "Operator-entered target",
  ai_estimate: "AI-estimated assumption",
};

export type MetricKey =
  | "food_cost"
  | "labor"
  | "prime_cost"
  | "pretax_margin"
  | "labor_profitable"
  | "labor_unprofitable"
  | "beer_cost"
  | "spirits_cost"
  | "wine_cost";

export type Segment = "full_service" | "limited_service" | "all";
/** Sub-population within a segment (e.g. annual-sales band). */
export type SubSegment = "sales_below_2m" | "sales_2m_plus";

export type StatCategory = "financial" | "food_beverage" | "labor_profit";

export interface Source {
  id: string;
  organization: string;
  title: string;
  url: string | null;
  /** "publisher_home" = organization home page, NOT a deep link to the publication. */
  urlStatus: "direct" | "publisher_home" | "none";
  dataPeriod: string;
  publicationYear: number | null;
  /** Exact date when known; otherwise null. */
  publicationDate: string | null;
  sample: string;
  note: string;
}

export const SOURCES: Record<string, Source> = {
  nra2025: {
    id: "nra2025",
    organization: "National Restaurant Association",
    title: "2025 Restaurant Operations Data Abstract",
    url: "https://restaurant.org",
    urlStatus: "publisher_home",
    dataPeriod: "2024 restaurant financial data",
    publicationYear: 2025,
    publicationDate: null,
    sample:
      "Medians reported by operators in the Association's operations survey. Sample size and respondent mix are described in the publication; not captured here.",
    note: "Values supplied by the SpotOn team; not independently checked against the publication.",
  },
  bevspot2016: {
    id: "bevspot2016",
    organization: "BevSpot",
    title: "BevSpot customer sample (2016)",
    url: null,
    urlStatus: "none",
    dataPeriod: "2016",
    publicationYear: 2016,
    publicationDate: null,
    sample: "BevSpot's own customers in 2016. Vendor-specific; sample size and mix not captured.",
    note: "Historical, vendor-specific research. Not a 2026 industry average. Values supplied by the SpotOn team.",
  },
};

export interface Stat {
  id: string;
  metricKey: MetricKey;
  metric: string;
  value: number;
  /** Upper end when the statistic is a range (planning guidelines only). */
  valueMax?: number;
  unit: "percent";
  segment: Segment;
  subSegment?: SubSegment;
  /** Operating condition the median describes (profitable / unprofitable operators). */
  condition?: "profitable" | "unprofitable";
  category: StatCategory;
  numerator: string;
  denominator: string;
  /** False until the numerator/denominator wording is checked against the source. */
  definitionConfirmed: boolean;
  sourceId: string;
  evidence: EvidenceClass;
  qualifications: string[];
  explanation: string;
  operatorMeaning: string;
  lastVerified: { status: "requester_supplied" | "verified"; on: string };
}

const SUPPLIED = { status: "requester_supplied", on: "2026-11-16" } as const;

const NRA_DENOM = "Sales (denominator as defined in the source; assumed total sales, not confirmed)";
const NRA_FOOD_NUM = "Cost of food and nonalcoholic beverages";
const FOOD_QUAL = [
  "Covers food and NONALCOHOLIC beverage cost only; alcoholic beverage cost is excluded.",
  "A median, not a target.",
];

function nra(
  id: string,
  metricKey: MetricKey,
  metric: string,
  value: number,
  segment: "full_service" | "limited_service",
  category: StatCategory,
  numerator: string,
  extra: Partial<Stat> & { explanation: string; operatorMeaning: string; qualifications?: string[] },
): Stat {
  return {
    id,
    metricKey,
    metric,
    value,
    unit: "percent",
    segment,
    category,
    numerator,
    denominator: NRA_DENOM,
    definitionConfirmed: false,
    sourceId: "nra2025",
    evidence: "published_measured",
    lastVerified: SUPPLIED,
    qualifications: ["A median, not a target."],
    ...extra,
  };
}

const FOOD_EXPL = "Food and nonalcoholic beverage cost as a share of sales, for the middle restaurant.";
const FOOD_MEAN = "Check purchasing and waste before assuming food cost is the problem.";
const LABOR_EXPL = "Labor cost including benefits, as a share of sales, for the middle restaurant.";
const LABOR_MEAN = "Labor is a major cost. Compare actual staffing with similar restaurants before suggesting changes.";
const MARGIN_EXPL = "Pretax profit as a share of sales, for the middle restaurant.";
const MARGIN_MEAN = "Margins are thin, so small cost gains matter. Not a target.";

export const STATS: Stat[] = [
  // ---------------- Full-service (NRA 2025, 2024 data)
  nra("nra-fs-food", "food_cost", "Food and nonalcoholic beverage cost", 32.0, "full_service", "food_beverage", NRA_FOOD_NUM, {
    qualifications: FOOD_QUAL, explanation: FOOD_EXPL, operatorMeaning: FOOD_MEAN,
  }),
  nra("nra-fs-labor", "labor", "Fully loaded labor cost (including benefits)", 36.5, "full_service", "labor_profit", "Wages, payroll taxes and benefits", {
    explanation: LABOR_EXPL, operatorMeaning: LABOR_MEAN,
  }),
  nra("nra-fs-margin", "pretax_margin", "Pretax profit margin", 2.8, "full_service", "financial", "Pretax income", {
    explanation: MARGIN_EXPL, operatorMeaning: MARGIN_MEAN,
  }),
  nra("nra-fs-labor-profitable", "labor_profitable", "Labor cost, profitable operators", 34.2, "full_service", "labor_profit", "Wages, payroll taxes and benefits", {
    condition: "profitable",
    qualifications: ["Describes a group of operators, not a threshold for one restaurant.", "A median, not a target."],
    explanation: "Labor cost among full-service operators that reported a pretax profit.",
    operatorMeaning: "Context only. It says nothing about whether a given restaurant is profitable.",
  }),
  nra("nra-fs-labor-unprofitable", "labor_unprofitable", "Labor cost, unprofitable operators", 42.9, "full_service", "labor_profit", "Wages, payroll taxes and benefits", {
    condition: "unprofitable",
    qualifications: ["Describes a group of operators, not a threshold for one restaurant.", "A median, not a target."],
    explanation: "Labor cost among full-service operators that reported a pretax loss.",
    operatorMeaning: "Shows how much heavier labor was at loss-making operators. Not a prediction.",
  }),
  nra("nra-fs-food-below2m", "food_cost", "Food and nonalcoholic beverage cost, annual sales below $2M", 33.7, "full_service", "food_beverage", NRA_FOOD_NUM, {
    subSegment: "sales_below_2m",
    qualifications: [...FOOD_QUAL, "Sales band applies to one restaurant's annual sales; for a group, per-location sales are assumed."],
    explanation: FOOD_EXPL + " Full-service restaurants with annual sales below $2 million.",
    operatorMeaning: "Smaller restaurants had a higher median food cost.",
  }),
  nra("nra-fs-margin-below2m", "pretax_margin", "Pretax profit margin, annual sales below $2M", 1.1, "full_service", "financial", "Pretax income", {
    subSegment: "sales_below_2m",
    qualifications: ["A median, not a target.", "Sales band applies to one restaurant's annual sales; for a group, per-location sales are assumed."],
    explanation: MARGIN_EXPL + " Full-service restaurants with annual sales below $2 million.",
    operatorMeaning: MARGIN_MEAN,
  }),
  nra("nra-fs-food-2m", "food_cost", "Food and nonalcoholic beverage cost, annual sales $2M or more", 31.0, "full_service", "food_beverage", NRA_FOOD_NUM, {
    subSegment: "sales_2m_plus",
    qualifications: [...FOOD_QUAL, "Sales band applies to one restaurant's annual sales; for a group, per-location sales are assumed."],
    explanation: FOOD_EXPL + " Full-service restaurants with annual sales of $2 million or more.",
    operatorMeaning: "Larger restaurants had a lower median food cost.",
  }),
  nra("nra-fs-margin-2m", "pretax_margin", "Pretax profit margin, annual sales $2M or more", 4.3, "full_service", "financial", "Pretax income", {
    subSegment: "sales_2m_plus",
    qualifications: ["A median, not a target.", "Sales band applies to one restaurant's annual sales; for a group, per-location sales are assumed."],
    explanation: MARGIN_EXPL + " Full-service restaurants with annual sales of $2 million or more.",
    operatorMeaning: MARGIN_MEAN,
  }),
  // ---------------- Limited-service (NRA 2025, 2024 data)
  nra("nra-ls-food", "food_cost", "Food and nonalcoholic beverage cost", 32.4, "limited_service", "food_beverage", NRA_FOOD_NUM, {
    qualifications: FOOD_QUAL, explanation: FOOD_EXPL, operatorMeaning: FOOD_MEAN,
  }),
  nra("nra-ls-labor", "labor", "Fully loaded labor cost (including benefits)", 31.7, "limited_service", "labor_profit", "Wages, payroll taxes and benefits", {
    explanation: LABOR_EXPL, operatorMeaning: LABOR_MEAN,
  }),
  nra("nra-ls-prime", "prime_cost", "Prime cost (measured)", 65.0, "limited_service", "financial", "Prime cost as measured in the source (food/beverage cost plus labor)", {
    qualifications: [
      "A measured median published for limited-service restaurants. It is not the sum of the food and labor medians.",
      "Whether the published prime cost includes alcoholic beverage cost is not confirmed here.",
      "A median, not a target.",
    ],
    explanation: "Food/beverage plus labor cost as a share of sales, measured directly (not added from separate medians).",
    operatorMeaning: "A direct prime-cost reference for limited-service. Compare only if defined the same way.",
  }),
  nra("nra-ls-margin", "pretax_margin", "Pretax profit margin", 4.0, "limited_service", "financial", "Pretax income", {
    explanation: MARGIN_EXPL, operatorMeaning: MARGIN_MEAN,
  }),
  nra("nra-ls-labor-profitable", "labor_profitable", "Labor cost, profitable operators", 30.0, "limited_service", "labor_profit", "Wages, payroll taxes and benefits", {
    condition: "profitable",
    qualifications: ["Describes a group of operators, not a threshold for one restaurant.", "A median, not a target."],
    explanation: "Labor cost among limited-service operators that reported a pretax profit.",
    operatorMeaning: "Context only. It says nothing about whether a given restaurant is profitable.",
  }),
  nra("nra-ls-labor-unprofitable", "labor_unprofitable", "Labor cost, unprofitable operators", 34.1, "limited_service", "labor_profit", "Wages, payroll taxes and benefits", {
    condition: "unprofitable",
    qualifications: ["Describes a group of operators, not a threshold for one restaurant.", "A median, not a target."],
    explanation: "Labor cost among limited-service operators that reported a pretax loss.",
    operatorMeaning: "Shows how much heavier labor was at loss-making operators. Not a prediction.",
  }),
  // ---------------- Alcohol: historical, vendor-specific (kept apart from NRA medians)
  ...(
    [
      ["bevspot-beer", "beer_cost", "Beer pour cost median", 24],
      ["bevspot-spirits", "spirits_cost", "Spirits cost median", 15],
      ["bevspot-wine", "wine_cost", "Wine cost median", 28],
    ] as const
  ).map(
    ([id, metricKey, metric, value]): Stat => ({
      id,
      metricKey,
      metric,
      value,
      unit: "percent",
      segment: "all",
      category: "food_beverage",
      numerator: "Category beverage cost (exact definition not captured)",
      denominator: "That beverage category's own sales (assumed; not confirmed)",
      definitionConfirmed: false,
      sourceId: "bevspot2016",
      evidence: "vendor_historical",
      qualifications: [
        "HISTORICAL (2016) and VENDOR-SPECIFIC: BevSpot's own customers only.",
        "Not a 2026 industry average and not comparable with NRA restaurant medians.",
        "Not used for any comparison in MarginLab.",
      ],
      explanation: "Middle cost for this beverage category among BevSpot customers in 2016.",
      operatorMeaning: "Historical context only. Ask for the operator's own current costs.",
      lastVerified: SUPPLIED,
    }),
  ),
  // ---------------- Illustrative planning guidelines (labeled, never measured)
  ...(
    [
      ["plan-fs-food", "food_cost", "Food cost planning range", "full_service", 28, 32],
      ["plan-fs-labor", "labor", "Labor planning range", "full_service", 30, 34],
      ["plan-fs-prime", "prime_cost", "Prime-cost planning range", "full_service", 60, 65],
      ["plan-ls-food", "food_cost", "Food cost planning range", "limited_service", 27, 32],
      ["plan-ls-labor", "labor", "Labor planning range", "limited_service", 25, 30],
      ["plan-ls-prime", "prime_cost", "Prime-cost planning range", "limited_service", 55, 60],
    ] as const
  ).map(
    ([id, metricKey, metric, segment, lo, hi]): Stat => ({
      id,
      metricKey,
      metric,
      value: lo,
      valueMax: hi,
      unit: "percent",
      segment,
      category: metricKey === "labor" ? "labor_profit" : metricKey === "food_cost" ? "food_beverage" : "financial",
      numerator: "As for the matching published metric",
      denominator: "Net sales",
      definitionConfirmed: true,
      sourceId: "marginlab",
      evidence: "illustrative_planning",
      qualifications: [
        "An illustrative management guideline shipped with MarginLab; editable by the operator.",
        "Not statistically measured and not a good/bad percentile boundary.",
      ],
      explanation: "A rule-of-thumb range some operators use for planning conversations.",
      operatorMeaning: "A starting point for discussion. Replace it with the operator's own target.",
      lastVerified: { status: "requester_supplied", on: "2026-11-16" },
    }),
  ),
];

/** MarginLab's own guideline record, kept in the same registry so every source resolves. */
SOURCES.marginlab = {
  id: "marginlab",
  organization: "MarginLab (SpotOn)",
  title: "Illustrative management planning ranges",
  url: null,
  urlStatus: "none",
  dataPeriod: "Not a measured dataset",
  publicationYear: null,
  publicationDate: null,
  sample: "Not a sample. Editable guidelines.",
  note: "Supplied with the application. Not published research.",
};

export const STAT_BY_ID: Record<string, Stat> = Object.fromEntries(STATS.map((s) => [s.id, s]));

export const metricLabel: Record<MetricKey, string> = {
  food_cost: "Food & nonalcoholic cost",
  labor: "Labor cost",
  prime_cost: "Prime cost",
  pretax_margin: "Pretax profit margin",
  labor_profitable: "Labor, profitable operators",
  labor_unprofitable: "Labor, unprofitable operators",
  beer_cost: "Beer cost",
  spirits_cost: "Spirits cost",
  wine_cost: "Wine cost",
};

export const SEGMENT_LABELS: Record<Segment, string> = {
  full_service: "Full-service",
  limited_service: "Limited-service",
  all: "Not segment-specific",
};

export const SUBSEGMENT_LABELS: Record<SubSegment, string> = {
  sales_below_2m: "Annual sales below $2M",
  sales_2m_plus: "Annual sales $2M or more",
};

/** Alcohol: there is no validated current benchmark. */
export const NO_ALCOHOL_BENCHMARK = "No verified current benchmark.";

/** How much a rep needs this number in a first conversation. */
export type Importance = "key" | "useful" | "reference";

const KEY_IDS = new Set(["nra-fs-food", "nra-fs-labor", "nra-fs-margin", "nra-ls-food", "nra-ls-labor", "nra-ls-margin", "nra-ls-prime"]);

/** key = know these; useful = good to know; reference = background (historical vendor data, planning guidelines). */
export function importanceOf(s: Stat): Importance {
  if (s.evidence !== "published_measured") return "reference";
  return KEY_IDS.has(s.id) ? "key" : "useful";
}

/** Published, measured statistics only (the ones usable for peer-median comparison). */
export const measuredStats = () => STATS.filter((s) => s.evidence === "published_measured");

export function statsBy(filter: Partial<Pick<Stat, "metricKey" | "segment" | "subSegment" | "evidence" | "condition">>): Stat[] {
  return STATS.filter((s) => Object.entries(filter).every(([k, v]) => (s as unknown as Record<string, unknown>)[k] === v));
}

/** Overall (not sub-segment, not conditional) published median for a metric and segment. */
export function overallMedian(metricKey: MetricKey, segment: "full_service" | "limited_service"): Stat | null {
  return (
    STATS.find(
      (s) => s.evidence === "published_measured" && s.metricKey === metricKey && s.segment === segment && !s.subSegment && !s.condition,
    ) ?? null
  );
}

export const BEVSPOT_BANNER =
  "Historical (2016), vendor-specific research from BevSpot's own customers. Not a 2026 industry average and not comparable with NRA restaurant medians.";

export const DEFINITIONS: Array<{ id: string; term: string; body: string; formula?: string }> = [
  { id: "def-net-sales", term: "Net sales", body: "Sales after discounts and comps, excluding sales tax and tips. Every percentage in MarginLab uses this one denominator." },
  { id: "def-cogs", term: "Cost of goods sold (COGS)", body: "What the restaurant paid for the food and beverages it sold, usually measured from invoices and inventory counts." },
  { id: "def-labor", term: "Fully loaded labor", body: "Wages plus employer payroll taxes and relevant benefits.", formula: "Labor % = fully loaded labor $ ÷ net sales $ × 100" },
  { id: "def-prime", term: "Prime cost", body: "Food and beverage COGS plus fully loaded labor, the two largest controllable costs.", formula: "Prime cost % = (F&B COGS $ + labor $) ÷ net sales $ × 100" },
  { id: "def-blended", term: "Blended food and beverage COGS", body: "Food and alcohol cost combined on the total net-sales base. Never add the two category percentages together.", formula: "Blended % = (food revenue × food rate + alcohol revenue × alcohol rate) ÷ total net sales × 100" },
  { id: "def-points", term: "Percentage points vs. percent", body: "Moving a cost from 32.0% to 31.0% of sales is one percentage point. It is about a 3% relative reduction. MarginLab models points of net sales.", formula: "Monthly savings = net sales × points ÷ 100" },
  { id: "def-margin", term: "Pretax profit margin", body: "Income before income taxes as a share of sales. It needs every cost, not only prime cost.", formula: "Pretax margin % = pretax income $ ÷ net sales $ × 100" },
  { id: "def-group", term: "Group ratio", body: "A multi-location group's ratio is total cost dollars divided by total net-sales dollars. Do not average or add the locations' percentages.", formula: "Group % = Σ cost $ ÷ Σ net sales $ × 100" },
  { id: "def-median", term: "Median", body: "The middle value: half of the reporting restaurants were below it and half above. It is not an average and not a target." },
];
