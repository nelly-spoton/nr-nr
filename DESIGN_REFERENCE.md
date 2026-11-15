# DESIGN_REFERENCE.md — MarginLab vs. Deal Prep

## What was actually inspected

The live site (`dealprep.vercel.app`) is blocked by this sandbox's network policy, so it was **never opened**.
The only reference material is **one desktop screenshot of the Deal Prep home page** supplied by the user
(2000×1181 px). Colors below were sampled from that file's pixels.

**Not observed — so not matched, and no fidelity is claimed for them:**
the `/releases` page (the URL named in the brief), any mobile (390px) view, hover/focus/active/disabled states,
tabs, filters, dropdowns, tables, form inputs, sliders, tooltips, the Products/Which POS? menus, and the typeface
(Poppins is a guess at a geometric sans).

Each token in `app/globals.css` is tagged **[S]** sampled, **[I]** inferred, or **[U]** unobserved/own choice.

## Observed patterns from the screenshot and how MarginLab uses them

| Observed in screenshot | MarginLab |
|---|---|
| Dark indigo top bar (`#0e0a2d`), logo left, text nav links, no sidebar | Same: top nav on desktop (replaced my earlier sidebar) |
| Nav link text `#a6a5c5`, brand text white | `--nav-fg`, white brand |
| Lime accent button (`#bee67b`), lime status dot (`#d1fe84`) | `LimeButton`, eyebrow dot, preliminary badge, mobile result figure |
| Blue avatar circle (`#2f6ee4`) | Brand blue (also my choice for primary buttons) |
| Page bg `#f5f7fb`, white cards, 1px `#e5e7eb` border | `--canvas`, `--surface`, `--rule` |
| Large gradient hero (`#0c1d5c` → `#1b4282` → `#0a4158`), eyebrow pill, big headline | `HeroBanner` on Overview; headline result card reuses the gradient |
| Card with tinted header band (`#eff3ff`) | `--surface-2` (used for controls/tables) |
| Wide-tracked uppercase section labels in dark green (`#305315`) | `SectionHeader` |
| Muted blue-gray body text (`#657592`), near-black headings (`#000511`) | `--muted`, `--ink` |
| Blue text link ("View all") `#3969bb` | `--link` |
| Rounded geometry: hero ~28px, cards ~24px (inferred assuming 1440px @ ~1.39x) | `--radius-hero/card/ctl` |
| Header ~56px, content ~1240px wide (same assumption) | `--header-h`, `--page-max` |

## Still my own choices (unobserved)

Bottom 5-tab bar and sticky annual-savings bar on phones; status colors (good/warn/bad); the primary-button
treatment; segmented controls, sliders, tables and chart styling; header active-link pill; hero copy.
The hero is shortened on phones (subtitle/action hidden) to keep inputs near the top.

## To finish the consistency pass

1. Provide `/releases` at 1440px and 390px (or allow `dealprep.vercel.app` in the network policy).
2. Check the unobserved items above against it: form controls, buttons and states, tabs/filters, tables, mobile nav.
3. Confirm the typeface and the scale assumption (viewport/DPR) behind the **[I]** values.
4. Capture MarginLab at the same widths, compare side by side, and update this file.

## Shared components (spec name → file)

| Spec | File |
|---|---|
| AppShell, Header | `components/marginlab/AppShell.tsx` |
| Navigation (top bar / mobile tabs) | `components/marginlab/Navigation.tsx` |
| PageHeader, SectionHeader, ContentCard, MetricCard, HeroBanner, Badge, Callout | `components/marginlab/Cards.tsx` |
| FormField, SegmentedControl, SelectField, TextField, NumberField, SliderField | `components/marginlab/Fields.tsx` |
| Slider | `components/ui/slider.tsx` (Radix) |
| DataTable | `components/marginlab/DataTable.tsx` |
| PrimaryButton, SecondaryButton, LimeButton | `components/marginlab/Buttons.tsx` |
| InfoTooltip | `components/marginlab/InfoTooltip.tsx` |

No Deal Prep content, data or product functionality was copied; only generic visual patterns were reused.

## Implementation decisions (design-independent)

- Results stay visible while inputs change: sticky rail on desktop; headline + sticky bar on phones.
- Tooltips are tap/click toggles (hover also works) because hover-only fails on touch.
- Controls are at least 44px tall on touch; inputs use 16px text on small screens (prevents iOS zoom).
- Status never relies on color alone (every benchmark badge has a text label).
- Print stylesheet hides chrome; the printed Operator Summary fits one US Letter page with the example scenario.
