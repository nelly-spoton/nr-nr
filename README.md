# MarginLab — Restaurant Profit Opportunity Calculator

A consultative prime-cost discovery tool for SpotOn Hospitality Specialists. It compares a restaurant's
food and labor cost ratios to benchmarks, models **percentage-point** improvements, and maps possible
SpotOn solutions. **All results are hypothetical estimates, not guaranteed savings.** No data leaves the
browser (state lives in `localStorage`); there is no backend, database, auth or paid API.

> **Design note:** the Deal Prep visual reference could not be accessed when this was built, so the styling is
> provisional and not verified against it. See [DESIGN_REFERENCE.md](./DESIGN_REFERENCE.md).

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

## Sections

Overview (live calculator: inputs beside results) · Benchmarks · Savings Calculator · SpotOn Solutions ·
Operator Summary (print / save PDF, copy, save/load scenarios, reset to example).

## Structure

```
app/                 routes: / (overview), benchmarks, calculator, solutions, summary
components/ui/       slider (Radix)
components/marginlab shared design-system + feature components
config/benchmarks.ts verified NRA medians, planning ranges, source/caveats
config/solutions.ts  editable SpotOn solution / partner mapping
lib/calc.ts          pure financial engine (no React)
lib/validate.ts      input validation      lib/summary.ts  summary text
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
