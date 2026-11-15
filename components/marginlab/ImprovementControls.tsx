"use client";
import { PRESET_TOTALS, round2, splitPreset } from "@/lib/calc";
import { issueFor } from "@/lib/validate";
import { cn } from "@/lib/utils";
import { SliderField } from "./Fields";
import { useScenario } from "./ScenarioProvider";

/** Independent food / labor sliders (+ numeric entry) and optional total-improvement presets. */
export function ImprovementControls({ showPresets = true }: { showPresets?: boolean }) {
  const { scenario, result, update, issues } = useScenario();
  const total = result.improvement.totalPts;
  return (
    <div className="flex flex-col gap-5">
      <SliderField
        label="Food & beverage cost improvement"
        tooltip="Percentage POINTS of net sales removed from food & beverage cost (e.g. 32.00% → 31.60% is 0.40 pts). Not a relative reduction."
        value={scenario.foodImprovementPts}
        onChange={(v) => update({ foodImprovementPts: v })}
        error={issueFor(issues, "foodImprovementPts")?.severity === "error" ? issueFor(issues, "foodImprovementPts")?.message : undefined}
        warning={result.improvement.foodClamped ? "Capped: food cost cannot go below 0%." : undefined}
      />
      <SliderField
        label="Labor cost improvement"
        tooltip="Percentage POINTS of net sales removed from fully loaded labor cost. 0–5 pts."
        value={scenario.laborImprovementPts}
        onChange={(v) => update({ laborImprovementPts: v })}
        error={issueFor(issues, "laborImprovementPts")?.severity === "error" ? issueFor(issues, "laborImprovementPts")?.message : undefined}
        warning={result.improvement.laborClamped ? "Capped: labor cost cannot go below 0%." : undefined}
      />
      <div className="flex items-baseline justify-between rounded-ctl bg-surface-2 px-3 py-2 text-sm">
        <span className="font-semibold">Combined prime-cost improvement</span>
        <span className="tabular text-base font-extrabold text-brand">{total.toFixed(2)} pts</span>
      </div>
      {showPresets && (
        <div>
          <p className="mb-2 text-sm font-semibold">Total-improvement preset</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Total improvement presets">
            {PRESET_TOTALS.map((t) => {
              const on = round2(total) === t;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    const s = splitPreset(t, result.current.food, result.current.labor);
                    update({ foodImprovementPts: s.food, laborImprovementPts: s.labor });
                  }}
                  className={cn(
                    "min-h-11 min-w-16 rounded-ctl border px-3 text-sm font-semibold",
                    on ? "border-brand bg-brand text-white" : "border-rule bg-surface hover:bg-surface-2",
                  )}
                >
                  {t.toFixed(1)}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted">
            Presets split the total between food and labor in proportion to current cost; adjust either slider afterward.
          </p>
        </div>
      )}
    </div>
  );
}
