import { defaultPlanning, defaultPlanningFor } from "@/config/benchmarks";
import { LEGACY_CONCEPT_MAP, isConceptId, ATTRIBUTES, type ConceptId } from "@/config/concepts";
import type { BeverageMix, DetailedCogs, ExpenseKey, Expenses, PlanningRanges, Scenario } from "./types";

export const emptyBeverageMix = (): BeverageMix => ({
  enabled: false,
  mixPct: { food: null, beer: null, liquor: null, wine: null, other: null },
  costPct: { food: null, beer: null, liquor: null, wine: null, other: null },
});

export const EXPENSE_KEYS: Array<{ key: ExpenseKey; label: string; hint: string }> = [
  { key: "occupancy", label: "Occupancy (rent, CAM, property tax)", hint: "Rent and related occupancy costs." },
  { key: "utilities", label: "Utilities", hint: "Electricity, gas, water, internet." },
  { key: "marketing", label: "Marketing", hint: "Advertising and promotions." },
  { key: "repairs", label: "Repairs & maintenance", hint: "Equipment and facility upkeep." },
  { key: "admin", label: "Administrative expenses", hint: "Insurance, licenses, software, professional fees. Exclude payroll already in labor." },
  { key: "processing", label: "Processing fees", hint: "Card processing. Not a prime-cost saving in MarginLab." },
  { key: "delivery", label: "Delivery fees", hint: "Third-party commissions. Not a prime-cost saving in MarginLab." },
  { key: "corporate", label: "Corporate overhead", hint: "Allocated overhead. Exclude payroll already in labor." },
  { key: "otherOpex", label: "Other operating expenses", hint: "Anything operating not listed above." },
  { key: "depreciation", label: "Depreciation & amortization", hint: "Non-cash charge from the financial statements." },
  { key: "interestOther", label: "Interest & other non-operating", hint: "Interest and other non-operating items." },
];

export const emptyExpenses = (): Expenses => ({
  basis: "assumed",
  lines: Object.fromEntries(EXPENSE_KEYS.map((e) => [e.key, { monthly: null, excluded: false }])) as Expenses["lines"],
});

export const emptyDetailed = (): DetailedCogs => ({
  foodSharePct: null,
  alcoholSharePct: null,
  foodCogsRatePct: null,
  alcoholCogsRatePct: null,
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
    costMode: "quick",
    detailed: emptyDetailed(),
    nearWindowPts: 1,
    expenses: emptyExpenses(),
    benchmarkPick: {},
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

  const exp = (r.expenses ?? {}) as Partial<Expenses>;
  const expBase = emptyExpenses();
  const lines = { ...expBase.lines };
  for (const k of Object.keys(lines) as ExpenseKey[]) {
    const l = exp.lines?.[k];
    if (l) lines[k] = { monthly: typeof l.monthly === "number" ? l.monthly : null, excluded: !!l.excluded };
  }
  const nw = typeof r.nearWindowPts === "number" && Number.isFinite(r.nearWindowPts) ? Math.min(Math.max(r.nearWindowPts, 0), 5) : 1;
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
    costMode: r.costMode === "detailed" ? "detailed" : "quick",
    detailed: { ...emptyDetailed(), ...(r.detailed ?? {}) },
    nearWindowPts: nw,
    expenses: { basis: exp.basis === "actual" ? "actual" : "assumed", lines },
    benchmarkPick: r.benchmarkPick && typeof r.benchmarkPick === "object" ? (r.benchmarkPick as Record<string, string>) : {},
    planning,
    solutionOverrides:
      r.solutionOverrides && typeof r.solutionOverrides === "object" ? (r.solutionOverrides as Record<string, boolean>) : {},
  };
}
