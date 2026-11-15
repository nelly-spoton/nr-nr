"use client";
import { ATTRIBUTES, CONCEPTS, effectiveAttributes, type AttributeId, type ConceptId } from "@/config/concepts";
import { cn } from "@/lib/utils";
import { safeLocations } from "@/lib/calc";
import { FormField, SelectField } from "./Fields";
import { useScenario } from "./ScenarioProvider";

/** Primary concept + optional secondary attributes. Multi-location is derived from the location count. */
export function ConceptProfile() {
  const { scenario: s, update } = useScenario();
  const active = effectiveAttributes(s.attributes, safeLocations(s.locations));
  const derivedMulti = safeLocations(s.locations) > 1;
  const toggle = (id: AttributeId) =>
    update((x) => ({
      ...x,
      attributes: x.attributes.includes(id) ? x.attributes.filter((a) => a !== id) : [...x.attributes, id],
    }));
  return (
    <div className="flex flex-col gap-4 sm:col-span-2">
      <FormField label="Primary concept" htmlFor="concept" tooltip="Tailors benchmarks, recommendations and customer proof. Restaurants within one concept do not share identical economics.">
        <SelectField
          id="concept"
          value={s.concept}
          onChange={(v) => update({ concept: v as ConceptId })}
          options={CONCEPTS.map((c) => ({ value: c.id, label: c.label }))}
        />
      </FormField>
      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold">Attributes (optional)</legend>
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
    </div>
  );
}
