"use client";
import { EXPENSE_KEYS } from "@/lib/scenario";
import { computeProfit } from "@/lib/profit";
import { Callout } from "./Cards";
import { NumberField, SegmentedControl } from "./Fields";
import { useScenario } from "./ScenarioProvider";
import type { ExpenseKey, NumField } from "@/lib/types";

/** Optional expense lines used to estimate pretax income. Complete only when every line is addressed. */
export function ExpensesPanel() {
  const { scenario: s, result: r, update } = useScenario();
  const p = computeProfit(s, r);
  const set = (key: ExpenseKey, patch: { monthly?: NumField; excluded?: boolean }) =>
    update((x) => ({
      ...x,
      expenses: { ...x.expenses, lines: { ...x.expenses.lines, [key]: { ...x.expenses.lines[key], ...patch } } },
    }));
  const anyEntered = p.addressed > 0;
  return (
    <details className="rounded-ctl border border-rule bg-surface-2 p-4" open={anyEntered}>
      <summary className="cursor-pointer text-sm font-semibold">
        Optional: other expenses, to estimate pretax income{" "}
        <span className="font-normal text-muted">
          ({p.addressed} of {p.total} lines addressed)
        </span>
      </summary>
      <div className="mt-3 flex flex-col gap-4">
        <p className="text-sm text-muted">
          Enter monthly dollars for the whole group. Enter 0 for a cost that does not apply. If a cost is already inside food/beverage
          COGS or fully loaded labor, tick &quot;already counted&quot; so it is not counted twice. Pretax income is calculated only when every line is addressed.
        </p>
        <div>
          <p className="mb-1.5 text-sm font-semibold">Where do these figures come from?</p>
          <SegmentedControl
            label="Expense figure source"
            className="sm:w-96"
            value={s.expenses.basis}
            onChange={(v) => update((x) => ({ ...x, expenses: { ...x.expenses, basis: v } }))}
            options={[
              { value: "assumed", label: "Assumptions", sub: "estimates" },
              { value: "actual", label: "Actual financials", sub: "from statements" },
            ]}
          />
          <p className="mt-1 text-xs text-muted">
            A result counts as &quot;verified&quot; only if these come from actual financials <em>and</em> net sales is marked verified. Otherwise it is an estimate.
          </p>
        </div>
        <ul className="grid gap-3 md:grid-cols-2">
          {EXPENSE_KEYS.map((e) => {
            const l = s.expenses.lines[e.key];
            return (
              <li key={e.key} className="rounded-ctl bg-surface p-3">
                <label htmlFor={`exp-${e.key}`} className="text-sm font-semibold">
                  {e.label}
                </label>
                <NumberField
                  id={`exp-${e.key}`}
                  prefix="$"
                  suffix="/mo"
                  className="mt-1.5"
                  value={l.excluded ? null : l.monthly}
                  disabled={l.excluded}
                  onChange={(v) => set(e.key, { monthly: v })}
                />
                <label className="mt-2 flex min-h-9 cursor-pointer items-center gap-2 text-xs text-muted">
                  <input type="checkbox" checked={l.excluded} onChange={(ev) => set(e.key, { excluded: ev.target.checked })} className="h-4 w-4 accent-[var(--brand)]" />
                  Already counted in COGS or labor
                </label>
                <p className="text-[11px] text-muted">{e.hint}</p>
              </li>
            );
          })}
        </ul>
        {p.status === "unknown" && anyEntered && <Callout>{p.reason}</Callout>}
      </div>
    </details>
  );
}
