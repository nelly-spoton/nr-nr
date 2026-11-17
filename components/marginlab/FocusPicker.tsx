"use client";
import { FOCUS_OPTIONS, LEVELS } from "@/lib/focus";
import { round2 } from "@/lib/calc";
import { cn } from "@/lib/utils";
import { FormField, SegmentedControl } from "./Fields";
import { ImprovementControls } from "./ImprovementControls";
import { useScenario } from "./ScenarioProvider";

/** "What do you want to improve, and by how much?" Drives the savings and the recommendations. */
export function FocusPicker() {
  const { scenario: s, result: r, update } = useScenario();
  const total = round2(r.improvement.totalPts);
  const levelValue = String(LEVELS.find((l) => l === total) ?? "");
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-sm font-semibold">What do you want to improve?</p>
        <div role="radiogroup" aria-label="What do you want to improve?" className="grid gap-2 sm:grid-cols-3">
          {FOCUS_OPTIONS.map((o) => {
            const on = s.focus === o.value;
            return (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => update({ focus: o.value, improvementMode: "guided" })}
                className={cn(
                  "min-h-16 rounded-card border p-3 text-left transition-colors",
                  on ? "border-brand bg-brand-soft" : "border-rule bg-surface hover:bg-surface-2",
                )}
              >
                <span className={cn("block text-sm font-semibold", on && "text-brand")}>{o.label}</span>
                <span className="block text-xs text-muted">{o.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      <FormField
        label="By how much?"
        htmlFor="level-group"
        tooltip="Points of sales. 1 point is 1% of sales: for example, labor going from 36% to 35%. A planning assumption, not a promise."
      >
        <SegmentedControl
          label="Improvement in points of sales"
          value={levelValue}
          onChange={(v) => update({ level: Number(v), improvementMode: "guided" })}
          options={LEVELS.map((l) => ({ value: String(l), label: `${l}`, sub: l === 1 ? "point" : "points" }))}
        />
      </FormField>

      <details className="rounded-ctl border border-rule bg-surface-2 p-3 text-sm">
        <summary className="cursor-pointer font-semibold">
          Fine-tune food and labor separately <span className="font-normal text-muted">(optional)</span>
        </summary>
        <div className="mt-3">
          <ImprovementControls showPresets={false} />
          <p className="mt-2 text-xs text-muted">Changing these sets custom amounts. Pick an option above to go back to guided.</p>
        </div>
      </details>
    </div>
  );
}
