# DESIGN_REFERENCE.md — MarginLab vs. Deal Prep

## Status: reference NOT inspected — visual fidelity is unverified

The brief asked MarginLab to match <https://dealprep.vercel.app/releases>. When this was built, the
sandbox's egress policy refused the connection (`CONNECT` → `403`, host `dealprep.vercel.app:443`), so:

- No Deal Prep page was opened; no desktop (1440px) or mobile (390px) reference screenshots exist.
- **No Deal Prep design token (color, font, size, radius, shadow, spacing, nav pattern) was observed.**
- **MarginLab makes no claim of visual consistency with Deal Prep.** Do not treat any value below as
  extracted from it.

The repo's existing `index.html` ("SpotOn Intelligence V2") is a *different* SpotOn page, not Deal Prep.
Its palette/typography was borrowed as a **provisional stand-in** so the app has a coherent SpotOn-flavored
look. That is a guess about family resemblance, not a verified match.

## What is provisional (all of it)

All styling is routed through one token layer, `app/globals.css` (`:root`), exposed to Tailwind in
`tailwind.config.ts`. Components never hard-code colors, so re-skinning is a token edit.

| Token | Provisional value | Source |
|---|---|---|
| `--canvas` | `#faf8f3` | repo `index.html` (`--cream`) |
| `--surface` / `--surface-2` | `#ffffff` / `#f7f5f0` | repo `index.html` |
| `--ink` / `--muted` / `--rule` | `#1a1714` / `#6b6560` / `#e4e0d8` | repo `index.html` |
| `--brand` / `--brand-soft` | `#1d3fbe` / `#eef2ff` | repo `index.html` (`--blue`) |
| good / warn / bad (+soft) | greens / ambers / reds | repo `index.html` |
| `--font-sans` | Poppins → system stack | repo `index.html` |
| `--radius-card` / `--radius-ctl` | 12px / 8px | **chosen by me** |
| `--shadow-card` | `0 1px 2px rgba(26,23,20,.05)` | **chosen by me** |
| `--page-max` | 1200px | **chosen by me** |

Layout/interaction choices that are also **my own, not observed**: left sidebar nav on ≥1024px, fixed
5-tab bottom bar on phones, sticky 2px-ink-bordered header with circular brand mark, sticky results rail
on desktop, sticky annual-opportunity bar on phones.

## To complete the visual-consistency pass (needs reference access)

1. Allow `dealprep.vercel.app` in the environment's network policy, or supply screenshots at 1440px and 390px.
2. Record the observed values for each item in the checklist: page structure/nav; header, sidebar, page title;
   background/surface colors; type scale and weights; cards (border, shadow, radius); buttons and states;
   tabs/filters/inputs/dropdowns; icons; spacing and max widths; mobile nav.
3. Replace the `:root` block in `app/globals.css`; adjust `AppShell`/`Navigation` if the nav pattern differs.
4. Capture MarginLab at the same widths and compare side by side; update this file with real findings.

## Shared components (spec name → file)

| Spec | File |
|---|---|
| AppShell, Header | `components/marginlab/AppShell.tsx` |
| Navigation | `components/marginlab/Navigation.tsx` |
| PageHeader, SectionHeader, ContentCard, MetricCard (+Badge, Callout) | `components/marginlab/Cards.tsx` |
| FormField, SegmentedControl, SelectField, TextField, NumberField, SliderField | `components/marginlab/Fields.tsx` |
| Slider | `components/ui/slider.tsx` (Radix) |
| DataTable | `components/marginlab/DataTable.tsx` |
| PrimaryButton, SecondaryButton | `components/marginlab/Buttons.tsx` |
| InfoTooltip | `components/marginlab/InfoTooltip.tsx` |

No Deal Prep release content, data or product functionality was copied (none was seen).

## Implementation decisions (design-independent)

- Results stay visible while inputs change: sticky rail on desktop; headline + sticky bar on phones.
- Tooltips are tap/click toggles (hover also works) because hover-only fails on touch.
- Controls ≥44px tall on touch; 16px input font on small screens (prevents iOS zoom).
- Status never relies on color alone (text labels on every benchmark badge).
- Print stylesheet hides chrome; the printed Operator Summary fits one US Letter page with the example scenario.
