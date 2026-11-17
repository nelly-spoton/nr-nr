/**
 * Guided improvement: "what do you want to improve, and by how much?" becomes the food/labor points.
 * Pure functions; the percentage-point savings logic in calc.ts is unchanged.
 */
import { MAX_IMPROVEMENT_PTS, PRESET_TOTALS, round2, safe, splitPreset } from "./calc";
import type { Focus, Scenario } from "./types";

export const LEVELS = PRESET_TOTALS;

export const FOCUS_OPTIONS: Array<{ value: Focus; label: string; sub: string }> = [
  { value: "food", label: "Food & beverage cost", sub: "waste, purchasing, order errors" },
  { value: "labor", label: "Labor cost", sub: "scheduling, hours, productivity" },
  { value: "both", label: "Both", sub: "split by current cost" },
];

/** Food/labor points for a focus and total level. Never exceeds 5 points or the current cost. */
export function pointsFor(focus: Focus, level: number, foodPct: number | null, laborPct: number | null): { food: number; labor: number } {
  const f = safe(foodPct);
  const l = safe(laborPct);
  const cap = (x: number, cost: number) => round2(Math.min(x, MAX_IMPROVEMENT_PTS, cost > 0 ? cost : MAX_IMPROVEMENT_PTS));
  if (focus === "food") return { food: cap(level, f), labor: 0 };
  if (focus === "labor") return { food: 0, labor: cap(level, l) };
  return splitPreset(level, f, l);
}

/** Effective food cost % used for the split (detailed mode derives it; quick mode is what was typed). */
function effectiveFoodPct(s: Scenario): number | null {
  if (s.costMode !== "detailed") return s.foodPct;
  const d = s.detailed;
  const share = safe(d.foodSharePct);
  const alc = safe(d.alcoholSharePct);
  const blended = (share * safe(d.foodCogsRatePct) + alc * safe(d.alcoholCogsRatePct)) / 100;
  return Math.abs(share + alc - 100) < 0.01 ? round2(blended) : null;
}

/** When improvement is guided, keep the points in step with focus, level and the cost inputs. */
export function applyGuided(s: Scenario): Scenario {
  if (s.improvementMode !== "guided") return s;
  const p = pointsFor(s.focus, s.level, effectiveFoodPct(s), s.laborPct);
  if (s.foodImprovementPts === p.food && s.laborImprovementPts === p.labor) return s;
  return { ...s, foodImprovementPts: p.food, laborImprovementPts: p.labor };
}
