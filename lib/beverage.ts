import type { BevCategory, BeverageMix } from "./types";

export const BEV_CATEGORIES: Array<{ id: BevCategory; label: string }> = [
  { id: "food", label: "Food" },
  { id: "beer", label: "Beer" },
  { id: "liquor", label: "Liquor" },
  { id: "wine", label: "Wine" },
  { id: "other", label: "Other beverage" },
];

const n = (x: number | null) => (typeof x === "number" && Number.isFinite(x) && x >= 0 ? x : 0);
const round4 = (x: number) => Math.round(x * 1e4) / 1e4;

export interface BlendResult {
  /** Mix totals 100% (±0.05) and every populated cost is valid. */
  valid: boolean;
  mixTotal: number;
  /** Blended COGS as % of TOTAL net sales (one consistent denominator). */
  blendedPct: number;
  lines: Array<{ id: BevCategory; label: string; mixPct: number; costPct: number; contributionPct: number }>;
  problems: string[];
}

/**
 * Blended COGS % of total net sales = Σ (category share of net sales × category cost % of its own sales).
 * Using shares of the same net-sales total keeps every percentage on one denominator.
 */
export function blendCogs(m: BeverageMix): BlendResult {
  const problems: string[] = [];
  const lines = BEV_CATEGORIES.map(({ id, label }) => {
    const mixPct = n(m.mixPct[id]);
    const costPct = n(m.costPct[id]);
    if (mixPct > 0 && m.costPct[id] === null) problems.push(`${label}: enter a cost % for the share of sales it represents.`);
    if (costPct > 100) problems.push(`${label}: cost % cannot exceed 100% of that category's sales.`);
    return { id, label, mixPct, costPct, contributionPct: round4((mixPct * costPct) / 100) };
  });
  const mixTotal = round4(lines.reduce((s, l) => s + l.mixPct, 0));
  if (Math.abs(mixTotal - 100) > 0.05) problems.push(`Sales mix totals ${mixTotal.toFixed(2)}%; it must total 100% of net sales.`);
  const blendedPct = round4(lines.reduce((s, l) => s + l.contributionPct, 0));
  return { valid: problems.length === 0, mixTotal, blendedPct, lines, problems };
}
