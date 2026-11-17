"use client";
import { Minus, Plus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { CONCEPTS, type ConceptId } from "@/config/concepts";
import { AttributeChips } from "@/components/marginlab/ConceptProfile";
import { Badge, Callout, ContentCard } from "@/components/marginlab/Cards";
import { FocusPicker } from "@/components/marginlab/FocusPicker";
import { FormField, NumberField, SegmentedControl, SelectField } from "@/components/marginlab/Fields";
import { RequiredChecklist } from "@/components/marginlab/RequiredChecklist";
import { ResultsPanel } from "@/components/marginlab/ResultsPanel";
import { useScenario } from "@/components/marginlab/ScenarioProvider";
import { StepFooter } from "@/components/marginlab/StepFooter";
import { StepHeader } from "@/components/marginlab/StepHeader";
import { WhereYouStand } from "@/components/marginlab/WhereYouStand";
import { AlcoholQuestion } from "@/components/marginlab/AlcoholQuestion";
import { SecondaryButton } from "@/components/marginlab/Buttons";
import { safeLocations } from "@/lib/calc";
import { requiredStatus } from "@/lib/steps";
import { issueFor } from "@/lib/validate";

function Section({ title, required, children }: { title: string; required?: boolean; children: ReactNode }) {
  return (
    <ContentCard>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{title}</h2>
        {required && <Badge tone="brand">Required</Badge>}
      </div>
      {children}
    </ContentCard>
  );
}

export default function Step1Page() {
  const { scenario: s, result: r, update, issues, reset, loadExample } = useScenario();
  const st = requiredStatus(s, r);
  // A missing required answer is shown by the checklist; only real errors (e.g. 120%) show on the field.
  const err = (f: string) => {
    const i = issueFor(issues, f);
    return i?.severity === "error" && !/is required/.test(i.message) ? i.message : undefined;
  };
  const isGpv = s.salesMode === "gpv";
  const group = s.volumeScope === "group";
  const salesLabel = isGpv
    ? group ? "Total monthly GPV (all locations)" : "Monthly GPV per location"
    : group ? "Total monthly sales (all locations)" : "Average monthly sales per location";

  return (
    <>
      <StepHeader
        step={1}
        title="Tell us about the restaurant"
        subtitle="Answer the six questions marked Required. Your estimated yearly opportunity builds as you go."
        actions={
          <>
            <SecondaryButton size="sm" onClick={loadExample}>Try an example</SecondaryButton>
            <SecondaryButton size="sm" onClick={reset}>Start over</SecondaryButton>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-5">
          <Section title="The restaurant" required>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="What type of restaurant?" htmlFor="concept" tooltip="This shapes which solutions and customer examples we show.">
                <SelectField
                  id="concept"
                  value={s.conceptConfirmed ? s.concept : ""}
                  onChange={(v) => v && update({ concept: v as ConceptId, conceptConfirmed: true })}
                  options={[{ value: "", label: "Choose a type…" }, ...CONCEPTS.map((c) => ({ value: c.id, label: c.label }))]}
                />
              </FormField>
              <FormField label="How many locations? (1–10)" htmlFor="locations" error={err("locations")}>
                <div className="flex gap-2">
                  <SecondaryButton aria-label="Fewer locations" className="w-11 shrink-0 !px-0" onClick={() => update({ locations: Math.max(1, safeLocations(s.locations) - 1) })}>
                    <Minus className="h-4 w-4" aria-hidden />
                  </SecondaryButton>
                  <NumberField id="locations" value={s.locations} onChange={(v) => update({ locations: v })} invalid={!!err("locations")} className="flex-1" />
                  <SecondaryButton aria-label="More locations" className="w-11 shrink-0 !px-0" onClick={() => update({ locations: Math.min(10, safeLocations(s.locations) + 1) })}>
                    <Plus className="h-4 w-4" aria-hidden />
                  </SecondaryButton>
                </div>
              </FormField>
              <details className="rounded-ctl border border-rule bg-surface-2 p-3 text-sm sm:col-span-2" open={s.attributes.length > 0 ? true : undefined}>
                <summary className="cursor-pointer font-semibold text-link">Describe it for sharper recommendations (optional)</summary>
                <div className="mt-3">
                  <AttributeChips />
                </div>
              </details>
            </div>
          </Section>

          <Section title="Sales and costs" required>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label={salesLabel}
                htmlFor="amount"
                tooltip={isGpv ? "Card volume. It may include tax and tip, so it is not net sales. Add a net-sales estimate under More details." : "Sales after discounts, before sales tax and tips."}
                hint={isGpv ? "Add a net-sales estimate under More details." : "After discounts, before tax and tips."}
                error={err("amount")}
              >
                <NumberField id="amount" value={s.amount} onChange={(v) => update({ amount: v })} prefix="$" invalid={!!err("amount")} />
              </FormField>

              <FormField label="Labor cost" htmlFor="labor" tooltip="Wages plus employer payroll taxes and benefits, as a % of sales." hint="Wages + taxes + benefits, as a % of sales" error={err("laborPct")}>
                <NumberField id="labor" value={s.laborPct} onChange={(v) => update({ laborPct: v })} suffix="%" invalid={!!err("laborPct")} />
              </FormField>

              <details className="rounded-ctl border border-rule bg-surface-2 p-3 text-sm sm:col-span-2" open={isGpv || group ? true : undefined}>
                <summary className="cursor-pointer font-semibold text-link">Only know card volume (GPV) or a group total?</summary>
                <div className="mt-3 flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="The sales figure above covers" htmlFor="scope-group">
                      <SegmentedControl
                        label="Volume applies to"
                        value={s.volumeScope}
                        onChange={(v) => update({ volumeScope: v })}
                        options={[
                          { value: "perLocation", label: "Each location" },
                          { value: "group", label: "The whole group" },
                        ]}
                      />
                    </FormField>
                    <FormField label="The figure is" htmlFor="mode-group">
                      <SegmentedControl
                        label="Sales figure type"
                        value={s.salesMode}
                        onChange={(v) => update({ salesMode: v })}
                        options={[
                          { value: "net", label: "Net sales", sub: "preferred" },
                          { value: "gpv", label: "GPV", sub: "card volume" },
                        ]}
                      />
                    </FormField>
                    {!isGpv && (
                      <FormField label="How sure are you of it?" htmlFor="conf-group">
                        <SegmentedControl
                          label="Confidence in the sales figure"
                          value={s.salesConfidence}
                          onChange={(v) => update({ salesConfidence: v })}
                          options={[
                            { value: "estimated", label: "Estimate" },
                            { value: "verified", label: "Verified" },
                          ]}
                        />
                      </FormField>
                    )}
                  </div>
                  {isGpv && (
                    <div className="flex flex-col gap-4">
                      <Callout>GPV can include tax and tip and leave out cash, so it isn&apos;t net sales. Give a net-sales estimate or your own conversion factor. Results stay preliminary.</Callout>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField label="Convert GPV using" htmlFor="basis-group">
                          <SegmentedControl
                            label="Convert GPV using"
                            value={s.gpv.basis}
                            onChange={(v) => update({ gpv: { ...s.gpv, basis: v } })}
                            options={[
                              { value: "netEstimate", label: "Net-sales estimate" },
                              { value: "factor", label: "Conversion factor" },
                            ]}
                          />
                        </FormField>
                        {s.gpv.basis === "netEstimate" ? (
                          <FormField label="Net-sales estimate ($/month)" htmlFor="gpv-net" error={err("gpv.netEstimate")} hint="Same coverage as the GPV above.">
                            <NumberField id="gpv-net" value={s.gpv.netEstimate} prefix="$" invalid={!!err("gpv.netEstimate")} onChange={(v) => update({ gpv: { ...s.gpv, netEstimate: v } })} />
                          </FormField>
                        ) : (
                          <FormField label="GPV-to-net-sales factor" htmlFor="gpv-factor" error={err("gpv.conversionFactor")} hint="Your assumption, e.g. 0.85.">
                            <NumberField id="gpv-factor" value={s.gpv.conversionFactor} invalid={!!err("gpv.conversionFactor")} onChange={(v) => update({ gpv: { ...s.gpv, conversionFactor: v } })} />
                          </FormField>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </details>

              <AlcoholQuestion />
            </div>
          </Section>

          <Section title="What to improve" required>
            <FocusPicker />
          </Section>

          {st.complete && <WhereYouStand />}

          <div className="flex flex-col gap-3 lg:hidden">
            <ResultsPanel />
            <RequiredChecklist />
            <StepFooter nextHref="/solutions" nextLabel="Next: Solutions" disabled={!st.complete} hint="Finish the required questions first." />
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="flex flex-col gap-3 lg:sticky lg:top-[72px]">
            <ResultsPanel />
            <div className="hidden lg:block">
              <RequiredChecklist />
              <StepFooter nextHref="/solutions" nextLabel="Next: Solutions" disabled={!st.complete} hint="Finish the required questions first." />
            </div>
            {st.complete && (
              <p className="no-print text-xs text-muted">
                Changes here update the solutions in Step 2. <Link href="/stats" className="font-semibold text-link underline">Industry Stats</Link> has the research behind the comparisons.
              </p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
