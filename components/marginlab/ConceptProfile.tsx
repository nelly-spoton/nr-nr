"use client";
import { ATTRIBUTES, CONCEPT_BY_ID, effectiveAttributes, type AttributeId } from "@/config/concepts";
import { safeLocations } from "@/lib/calc";
import { cn } from "@/lib/utils";
import { useScenario } from "./ScenarioProvider";

/** Optional details that sharpen the recommendations. Multi-location is derived from the location count. */
export function AttributeChips() {
  const { scenario: s, update } = useScenario();
  const locations = safeLocations(s.locations);
  const active = effectiveAttributes(s.attributes, locations);
  const derivedMulti = locations > 1;
  const mixed = CONCEPT_BY_ID[s.concept].serviceModel === "mixed";
  const ordering = active.includes("table_service") || active.includes("counter_service");
  const toggle = (id: AttributeId) =>
    update((x) => ({
      ...x,
      attributes: x.attributes.includes(id) ? x.attributes.filter((a) => a !== id) : [...x.attributes, id],
    }));
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-semibold">Anything that describes the restaurant?</legend>
      <p className="mb-2 text-xs text-muted">
        {mixed && s.conceptConfirmed && !ordering
          ? "Tip: choose how guests order (table or counter service). It changes which products fit."
          : "Optional. These sharpen the product recommendations."}
      </p>
      <div className="flex flex-wrap gap-2">
        {ATTRIBUTES.map((a) => {
          const on = active.includes(a.id);
          const locked = a.id === "multi_location" && derivedMulti;
          return (
            <button
              key={a.id}
              type="button"
              aria-pressed={on}
              disabled={locked}
              title={locked ? "Set automatically: more than one location" : undefined}
              onClick={() => toggle(a.id)}
              className={cn(
                "min-h-10 rounded-full border px-3 text-sm font-medium transition-colors",
                on ? "border-brand bg-brand-soft text-brand" : "border-rule bg-surface text-muted hover:text-ink",
                locked && "cursor-default opacity-80",
              )}
            >
              {a.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
