import type { CaseStudy } from "@/config/caseStudies";

/** Numbers/phrases that must appear on a source page for it to support the record's metric. */
export function expectedTokens(c: CaseStudy): string[] {
  const m = c.metric;
  const toks: string[] = [];
  if (m.unit === "percent_relative") toks.push(`${m.min}%`);
  else if (m.unit === "usd_per_week") toks.push(`$${m.min}`, ...(m.max ? [`$${m.max}`] : []));
  else if (m.unit === "days") toks.push(String(m.min), "day");
  return toks;
}

const norm = (t: string) => t.replace(/&nbsp;| /g, " ").replace(/[–—]/g, "-").toLowerCase();

/** Pure check used by scripts/verify-sources.ts; does not decide verification by itself. */
export function pageSupportsMetric(pageText: string, c: CaseStudy): { ok: boolean; missing: string[] } {
  const text = norm(pageText);
  const missing = expectedTokens(c).filter((t) => !text.includes(norm(t)));
  return { ok: missing.length === 0, missing };
}
