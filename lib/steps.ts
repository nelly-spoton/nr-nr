/** The three guided steps, and which Step 1 answers are required before Steps 2 and 3 can work. */
import { computeScenario, type ScenarioResult } from "./calc";
import type { Scenario } from "./types";
import { validateScenario } from "./validate";

export const STEPS = [
  { id: "restaurant", href: "/", n: 1, label: "Your restaurant" },
  { id: "solutions", href: "/solutions", n: 2, label: "Solutions" },
  { id: "summary", href: "/summary", n: 3, label: "Summary" },
] as const;

export interface RequiredItem {
  id: "concept" | "locations" | "sales" | "food" | "labor" | "focus";
  label: string;
  done: boolean;
}

export interface RequiredStatus {
  items: RequiredItem[];
  doneCount: number;
  complete: boolean;
}

const num = (x: number | null) => typeof x === "number" && Number.isFinite(x);

/**
 * Required answers: restaurant type, locations, monthly sales, food & beverage cost, labor cost, and what to improve.
 * Concept, locations and focus drive the recommendations; sales and costs drive the dollar opportunity.
 */
export function requiredStatus(s: Scenario, r: ScenarioResult = computeScenario(s)): RequiredStatus {
  const errors = new Set(validateScenario(s).filter((i) => i.severity === "error").map((i) => i.field));
  const bad = (...fields: string[]) => fields.some((f) => errors.has(f));
  const foodDone =
    s.costMode === "detailed"
      ? r.cogs.valid
      : num(s.foodPct) && !bad("foodPct");
  const items: RequiredItem[] = [
    { id: "concept", label: "Restaurant type", done: s.conceptConfirmed },
    { id: "locations", label: "Number of locations", done: num(s.locations) && !bad("locations") },
    { id: "sales", label: "Monthly sales", done: r.sales.resolved && r.sales.monthlyGroup > 0 && !bad("amount", "gpv.netEstimate", "gpv.conversionFactor") },
    { id: "food", label: "Food & beverage cost", done: !!foodDone },
    { id: "labor", label: "Labor cost", done: num(s.laborPct) && !bad("laborPct") },
    { id: "focus", label: "What to improve", done: s.focus === "food" || s.focus === "labor" || s.focus === "both" },
  ];
  const doneCount = items.filter((i) => i.done).length;
  return { items, doneCount, complete: doneCount === items.length };
}
