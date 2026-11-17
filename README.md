# MarginLab — Restaurant Profit Opportunity Calculator

A consultative prime-cost discovery tool for SpotOn Hospitality Specialists. It compares a restaurant's
food and labor cost ratios to benchmarks, models **percentage-point** improvements, and maps possible
SpotOn solutions. **All results are hypothetical estimates, not guaranteed savings.** No data leaves the
browser (state lives in `localStorage`); there is no backend, database, auth or paid API.

> **Design note:** styling follows a single Deal Prep home-page screenshot (desktop only). The live site, the
> `/releases` page, mobile and interactive states were not inspected, so the match is partial. See
> [DESIGN_REFERENCE.md](./DESIGN_REFERENCE.md).

## Run locally

Requires Node 20+.

```bash
npm install
npm run dev          # http://localhost:3000
```

| Command | Purpose |
|---|---|
| `npm run lint` | ESLint (next/core-web-vitals) |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm test` | Vitest unit tests for all formulas |
| `npm run build` | Production build |
| `npm run check` | All of the above |

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel: **Add New → Project**, import the repo. Framework preset **Next.js** is detected; leave
   build command (`next build`) and output defaults.
3. No environment variables are required. Click **Deploy**.

Or via CLI: `npx vercel` (preview) / `npx vercel --prod`.

## How it works (three steps)

1. **Your restaurant.** Six required answers: restaurant type, number of locations, monthly sales, food & beverage cost, labor cost, and what to
   improve (food, labor or both, and by how much). The estimated annual opportunity updates live. Everything else (names, tags, GPV,
   food/alcohol split, industry comparison) is optional and tucked away.
   Once those are answered, **Where you stand** shows food, labor and prime cost on a scale against the NRA medians (marker, median tick,
   shaded "typical" band), with a one-line headline of the largest difference.
   **Sam (SpotOn Assistant Manager)** is featured first on Step 2, using public information only (SpotOn's press release headline and help
   articles). The app carries no pricing for any solution and no internal launch material.
2. **Solutions.** Recommendations and similar-restaurant results are built from the Step 1 answers and change when they change.
3. **Summary.** A one-page summary to print, save as a PDF, or copy.

**Industry Stats** is a separate research reference. Steps 2 and 3 ask you to finish Step 1 first. The old Savings Calculator tab was merged
into Step 1 (`/calculator` redirects to it); Benchmarks was retired earlier (`/benchmarks` redirects to Industry Stats).

## V2: sales intelligence layer

- **Concepts:** ten primary concepts plus seven attributes (`config/concepts.ts`). Saved V1 scenarios migrate automatically
  (`bar` → Bar / Pub, `custom` → Multi-Concept Group).
- **Benchmarks:** four kinds of numbers are kept separate: A published medians, B illustrative ranges, C operator targets,
  D AI estimates (not enabled). Bars/breweries get no median; the food median is never applied to total COGS with alcohol.
  Optional food/beer/liquor/wine/other COGS blends onto one net-sales denominator (`lib/beverage.ts`).
- **Customer proof:** `config/caseStudies.ts` + `lib/matching.ts` rank up to three published examples by outcome fit, concept,
  attributes and evidence strength. Matching never touches the calculator; a published % is typed as a relative change and is
  never converted into percentage points.
- **Recommendations:** `lib/recommend.ts` ranks one record per product into Highest relevance / Additional consideration /
  Reporting / Not recommended.
- **Operator summary:** customer evidence is a Hospitality Specialist reference on screen only; it is excluded from the printed
  summary and the copied text.
- **Coaching + summary:** `lib/coaching.ts`, `lib/report.ts`; the one-page summary adds food-vs-labor contribution, two proof points,
  items to validate and sources.
- **Website research (future, not built):** `lib/research.ts` defines the contract and a pure adapter only. No scraper, no estimates.

### Case-study verification (optional hardening)

All eight records are marked **accepted by the SpotOn team, not independently checked**: the SpotOn pages could not be fetched
when they were written, so they hold only the requester's brief and unstated fields are empty. On a machine that can reach spoton.com run:

```bash
npm run verify:sources
```

It reports each URL's status and whether the metric figures appear on the page (it edits nothing). Then compare the exact wording by
hand and update `verification` and `metric.wordingStatus` in `config/caseStudies.ts` (set a `verifiedOn` date). Fill in the
challenge, what changed, products, locations and confirmed partners from the page. Solution links are vendor homepages until a
product page is checked; update `link` the same way.

## V3: financial health + industry stats

- **Central benchmark data:** `config/stats.ts` is the single source for every statistic (Benchmarks page, Overview dashboard, Industry
  Stats, summary). Each record carries metric, value, unit, segment, numerator/denominator, data period, source, evidence class,
  qualifications and last-verified status. Evidence classes (published measured, historical vendor, illustrative guideline, operator
  target, AI estimate) are always labeled and never mixed. There is no geographic data.
- **Statistics were supplied by the SpotOn team and are not independently checked.** Publication dates, deep source links and sample sizes
  were not supplied, so they are explicit "not captured" values; the NRA link is the publisher's home page, and BevSpot has no link.
  Numerator/denominator wording is marked unconfirmed (denominators are assumed to be total sales).
- **Cost entry modes:** Quick (combined F&B COGS %) or Detailed (food/alcohol revenue shares and category COGS rates, blended on total
  net sales, `lib/detailed.ts`). Category rates are never added; no alcohol means alcohol revenue and COGS are zero; Quick mode never
  invents a split. The percentage-point savings logic is unchanged.
- **Financial Health (Overview):** `lib/health.ts` compares food, alcohol, blended, labor, prime cost and (when determined) pretax margin
  with published medians only where definitions are compatible, using an adjustable ± "near" window (a display convention).
  `lib/profit.ts` estimates pretax income only when all 11 expense lines are addressed; results are labeled Verified, Estimated (with
  assumptions) or Not yet determined, and prime cost alone never implies profit.
- **Industry Stats (`/stats`):** an at-a-glance table of the key medians, three talking points, then collapsed sections (key-number details,
  good to know, historical alcohol, charts, definitions, sources). Search and filters; "Use in benchmark comparison" only for comparable
  statistics. Works without the calculator.

## Structure

```
app/                 routes: / (step 1), solutions (step 2), summary (step 3), stats
components/ui/       slider (Radix)
components/marginlab shared design-system + feature components
config/benchmarks.ts verified NRA medians, planning ranges, source/caveats
config/solutions.ts  editable SpotOn solution / partner mapping
lib/calc.ts          pure financial engine (no React)
lib/validate.ts      input validation      lib/summary.ts  summary text   lib/report.ts  assembled report
lib/matching.ts      case-study matching     lib/recommend.ts  ranked solutions
lib/coaching.ts      discovery panel         lib/beverage.ts   COGS blend
lib/research.ts      future research contract
lib/steps.ts         required answers + steps    lib/focus.ts  "what to improve" → points
scripts/             verify-sources.ts
lib/scenario.ts      example scenario      lib/storage.ts  localStorage
tests/calc.test.ts   unit tests
```

## Formulas (all in `lib/calc.ts`)

- Monthly group net sales = monthly net sales × locations (not multiplied again if volume is "entire group").
- Annual = monthly × 12. Prime cost % = food % + labor %.
- Improved % = current % − improvement **points**. Monthly savings = group sales × points / 100.
- Improvements are clamped to 0–5 pts and to the current cost (never below 0%). Zero sales → $0, no division.
- GPV is never treated as net sales: it needs a separate net-sales estimate or a user-supplied factor;
  otherwise results show "—". Any non-verified or GPV-derived sales figure is labeled **preliminary**.
- ROI: annual net = savings − ongoing costs; first-year net also subtracts one-time cost; payback is shown only
  when monthly net benefit is positive.

Default scenario (5 × $180k/mo, 32% food, 36% labor, 0.4 + 0.6 pts) → $9,000/mo, **$108,000/yr**.

## Benchmark & product caveats

- Medians (NRA, *2025 Restaurant Operations Data Abstract*, 2024 data) are medians, not targets; the food figure
  excludes alcoholic beverage cost; no median prime cost is published or shown; nothing is applied to bar concepts.
- Planning ranges are illustrative, editable, and not statistical boundaries.
- `sourceUrl`s in `config/solutions.ts` are vendor home pages (deep links unverified). Compatibility and
  availability of every product/integration must be confirmed before positioning.
