/**
 * Restaurant financial-health comparison. Compares the restaurant's own ratios with published peer
 * medians ONLY where the metric, segment, numerator and denominator are compatible. No geographic
 * comparison, no healthy/unhealthy score, and prime cost alone never implies profitability.
 */
import { ALCOHOL_QUALIFICATION, medianApplicability } from "@/config/benchmarks";
import { CONCEPT_BY_ID } from "@/config/concepts";
import { NO_ALCOHOL_BENCHMARK, STAT_BY_ID, overallMedian, type MetricKey, type Stat } from "@/config/stats";
import type { ScenarioResult } from "./calc";
import { computeProfit, type ProfitResult } from "./profit";
import { buildProfile } from "./profile";
import type { Scenario } from "./types";

export type PeerStatus = "below" | "near" | "above" | "none";

export const PEER_LABEL: Record<PeerStatus, string> = {
  below: "Below peer median",
  near: "Near peer median",
  above: "Above peer median",
  none: "No comparable benchmark",
};

/** One short sentence; the window is a display setting, not an industry range. */
export const nearNote = (windowPts: number) => `“Near” = within ±${windowPts} pt of the median. A display setting, not an industry range.`;

/** Short labels for the full-service sales-band comparison. */
export const BAND_LABEL: Record<string, string> = { sales_below_2m: "under $2M sales", sales_2m_plus: "$2M+ sales" };

export function classify(valuePct: number, medianPct: number, windowPts: number): { status: Exclude<PeerStatus, "none">; deltaPts: number } {
  const deltaPts = Math.round((valuePct - medianPct) * 100) / 100;
  const w = Math.max(0, windowPts);
  if (Math.abs(deltaPts) <= w + 1e-9) return { status: "near", deltaPts };
  return { status: deltaPts < 0 ? "below" : "above", deltaPts };
}

export interface HealthRow {
  id: "combined" | "food" | "alcohol" | "blended" | "labor" | "prime" | "pretax";
  label: string;
  /** % of total net sales; null when unknown. */
  valuePct: number | null;
  monthly: number | null;
  detail: string | null;
  status: PeerStatus;
  deltaPts: number | null;
  stat: Stat | null;
  /** Statistics that could be used for this row (for "Use in benchmark comparison"). */
  candidates: Stat[];
  qualification: string | null;
  noBenchmarkReason: string | null;
  statsHref: string | null;
  /** Second comparison against the annual-sales-band median (full-service only). */
  band: { stat: Stat; status: PeerStatus; deltaPts: number } | null;
}

export interface HealthModel {
  rows: HealthRow[];
  profit: ProfitResult;
  windowPts: number;
  segment: "full_service" | "limited_service" | null;
  laborContext: { profitable: Stat; unprofitable: Stat } | null;
  /** Ids of every statistic currently comparable to this restaurant's inputs. */
  comparableIds: Set<string>;
}

const ALC_NOTE_SALES = "Shown as % of total sales (assumed basis); alcohol sales are in that total.";

export function buildHealth(s: Scenario, r: ScenarioResult): HealthModel {
  const profile = buildProfile(s, r);
  const def = CONCEPT_BY_ID[s.concept];
  const appl = medianApplicability(s.concept, profile.attributes);
  const seg = appl.set ? (appl.set.id as "full_service" | "limited_service") : null;
  const win = s.nearWindowPts;
  const detail = r.cogs.detail;
  const profit = computeProfit(s, r);
  const sellsAlcohol = !!detail?.sellsAlcohol;
  const bevHeavy = profile.attributes.includes("beverage_heavy") || (s.costMode === "quick" && s.sellsAlcohol);
  const annualPerLoc = r.sales.annualPerLocation;
  const comparable = new Set<string>();

  const pick = (key: MetricKey, candidates: Stat[]): Stat | null => {
    const picked = STAT_BY_ID[s.benchmarkPick[key] ?? ""];
    if (picked && candidates.some((c) => c.id === picked.id)) return picked;
    return candidates[0] ?? null;
  };

  const build = (
    base: Pick<HealthRow, "id" | "label" | "valuePct" | "monthly" | "detail">,
    key: MetricKey | null,
    candidates: Stat[],
    qualification: string | null,
    reason: string | null,
    bandStat: Stat | null,
  ): HealthRow => {
    const stat = key && base.valuePct !== null ? pick(key, candidates) : null;
    candidates.forEach((c) => comparable.add(c.id));
    let status: PeerStatus = "none";
    let deltaPts: number | null = null;
    if (stat && base.valuePct !== null) ({ status, deltaPts } = classify(base.valuePct, stat.value, win));
    let band: HealthRow["band"] = null;
    if (bandStat && base.valuePct !== null && bandStat.id !== stat?.id) {
      const c = classify(base.valuePct, bandStat.value, win);
      band = { stat: bandStat, status: c.status, deltaPts: c.deltaPts };
    }
    return {
      ...base,
      status,
      deltaPts,
      stat,
      candidates,
      qualification: stat ? qualification : null,
      noBenchmarkReason: stat ? null : reason ?? "No comparable benchmark.",
      statsHref: stat ? `/stats#${stat.id}` : null,
      band,
    };
  };

  const fsBand = (metric: MetricKey): Stat | null =>
    seg === "full_service" && r.sales.resolved
      ? (STAT_BY_ID[
          metric === "food_cost"
            ? annualPerLoc < 2_000_000 ? "nra-fs-food-below2m" : "nra-fs-food-2m"
            : annualPerLoc < 2_000_000 ? "nra-fs-margin-below2m" : "nra-fs-margin-2m"
        ] ?? null)
      : null;

  const foodCandidates = (): Stat[] => {
    if (!seg) return [];
    const o = overallMedian("food_cost", seg);
    const b = fsBand("food_cost");
    return [o, b].filter((x): x is Stat => !!x);
  };
  const noSegReason = def.alcoholLed
    ? "No published median applies to bar-led concepts."
    : appl.qualification ?? "No published median applies to this concept.";

  const rows: HealthRow[] = [];

  if (r.cogs.mode === "quick") {
    const q = def.alcoholLed ? null : bevHeavy ? ALCOHOL_QUALIFICATION : null;
    rows.push(
      build(
        { id: "combined", label: "Food & beverage COGS (combined)", valuePct: r.current.food, monthly: r.current.foodMonthly, detail: "Combined; no food/alcohol split." },
        "food_cost",
        foodCandidates(),
        q ?? (appl.qualification ?? null),
        noSegReason,
        null,
      ),
    );
    if (rows[0]!.stat && fsBand("food_cost") && rows[0]!.band === null) {
      // add the band comparison for the chosen primary
      const b = fsBand("food_cost")!;
      if (b.id !== rows[0]!.stat.id) {
        const c = classify(rows[0]!.valuePct!, b.value, win);
        rows[0]!.band = { stat: b, status: c.status, deltaPts: c.deltaPts };
      }
    }
  } else {
    const ok = !!detail && detail.valid;
    rows.push(
      build(
        {
          id: "food",
          label: "Food & nonalcoholic COGS",
          valuePct: ok ? detail!.foodCogsPctOfSales : null,
          monthly: ok ? detail!.foodCogs : null,
          detail: ok ? `${s.detailed.foodCogsRatePct ?? 0}% of food & nonalcoholic sales` : "Complete the detailed inputs",
        },
        "food_cost",
        foodCandidates(),
        sellsAlcohol ? ALC_NOTE_SALES + " " + ALCOHOL_QUALIFICATION : appl.qualification,
        noSegReason,
        null,
      ),
    );
    const f = rows[0]!;
    if (f.stat && fsBand("food_cost") && f.valuePct !== null) {
      const b = fsBand("food_cost")!;
      if (b.id !== f.stat.id) {
        const c = classify(f.valuePct, b.value, win);
        f.band = { stat: b, status: c.status, deltaPts: c.deltaPts };
      }
    }
    rows.push(
      build(
        {
          id: "alcohol",
          label: "Alcoholic beverage COGS",
          valuePct: ok ? detail!.alcoholCogsPctOfSales : null,
          monthly: ok ? detail!.alcoholCogs : null,
          detail: ok ? (sellsAlcohol ? `${s.detailed.alcoholCogsRatePct ?? 0}% of alcohol sales` : "No alcohol sales") : null,
        },
        null,
        [],
        null,
        NO_ALCOHOL_BENCHMARK + " (BevSpot 2016 is historical; not used.)",
        null,
      ),
    );
    rows.push(
      build(
        {
          id: "blended",
          label: "Blended F&B COGS",
          valuePct: ok ? detail!.blendedPct : null,
          monthly: ok ? detail!.totalCogs : null,
          detail: ok ? "Total F&B COGS $ ÷ total net sales $" : null,
        },
        sellsAlcohol ? null : "food_cost",
        sellsAlcohol ? [] : foodCandidates(),
        appl.qualification,
        sellsAlcohol
          ? "Published medians exclude alcoholic beverage cost, so there is no comparison."
          : noSegReason,
        null,
      ),
    );
  }

  // Labor
  const laborC = seg ? [overallMedian("labor", seg)].filter((x): x is Stat => !!x) : [];
  rows.push(
    build(
      { id: "labor", label: "Fully loaded labor", valuePct: r.current.labor, monthly: r.current.laborMonthly, detail: "Labor $ ÷ total net sales $" },
      "labor",
      laborC,
      null,
      noSegReason,
      null,
    ),
  );

  // Prime cost
  const primeStat = seg === "limited_service" ? overallMedian("prime_cost", "limited_service") : null;
  const alcInPrime = sellsAlcohol || bevHeavy;
  rows.push(
    build(
      { id: "prime", label: "Total prime cost", valuePct: r.current.prime, monthly: r.current.primeMonthly, detail: "(F&B COGS $ + labor $) ÷ total net sales $" },
      "prime_cost",
      primeStat ? [primeStat] : [],
      alcInPrime ? "Your prime cost includes alcohol; the median may not." : null,
      seg === "full_service"
        ? "No measured full-service prime-cost median is published."
        : noSegReason,
      null,
    ),
  );

  // Pretax margin (only when profitability is determined)
  const marginCandidates = (): Stat[] =>
    seg ? [overallMedian("pretax_margin", seg), fsBand("pretax_margin")].filter((x): x is Stat => !!x) : [];
  const pretaxRow = build(
    { id: "pretax", label: "Pretax profit margin", valuePct: profit.status === "unknown" ? null : profit.marginPct, monthly: profit.status === "unknown" ? null : profit.pretaxMonthly, detail: profit.status === "unknown" ? null : profit.label },
    "pretax_margin",
    profit.status === "unknown" ? [] : marginCandidates(),
    profit.status === "verified"
      ? "Income and sales definitions unconfirmed."
      : "Estimated from assumptions; definitions unconfirmed.",
    profit.status === "unknown" ? "Profitability not yet determined." : noSegReason,
    null,
  );
  if (pretaxRow.stat && fsBand("pretax_margin") && pretaxRow.valuePct !== null) {
    const b = fsBand("pretax_margin")!;
    if (b.id !== pretaxRow.stat.id) {
      const c = classify(pretaxRow.valuePct, b.value, win);
      pretaxRow.band = { stat: b, status: c.status, deltaPts: c.deltaPts };
    }
  }
  rows.push(pretaxRow);

  const laborContext = seg
    ? {
        profitable: STAT_BY_ID[seg === "full_service" ? "nra-fs-labor-profitable" : "nra-ls-labor-profitable"]!,
        unprofitable: STAT_BY_ID[seg === "full_service" ? "nra-fs-labor-unprofitable" : "nra-ls-labor-unprofitable"]!,
      }
    : null;

  return { rows, profit, windowPts: win, segment: seg, laborContext, comparableIds: comparable };
}
