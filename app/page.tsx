"use client";
import { Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { CONCEPTS, type ConceptId } from "@/config/concepts";
import { AttributeChips } from "@/components/marginlab/ConceptProfile";
import { Badge, Callout, ContentCard } from "@/components/marginlab/Cards";
import { Collapsible } from "@/components/marginlab/Collapsible";
import { DetailedSplit } from "@/components/marginlab/DetailedSplit";
import { FinancialHealth } from "@/components/marginlab/FinancialHealth";
import { FocusPicker } from "@/components/marginlab/FocusPicker";
import { FormField, NumberField, SegmentedControl, SelectField, TextField } from "@/components/marginlab/Fields";
import { RequiredChecklist } from "@/components/marginlab/RequiredChecklist";
import { ResultsPanel } from "@/components/marginlab/ResultsPanel";
import { useScenario } from "@/components/marginlab/ScenarioProvider";
import { StepFooter } from "@/components/marginlab/StepFooter";
import { StepProgress } from "@/components/marginlab/StepProgress";
import { SecondaryButton } from "@/components/marginlab/Buttons";
import { safeLocations } from "@/lib/calc";
import { pct } from "@/lib/format";
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
  const [moreOpen, setMoreOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
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
      <StepProgress />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Tell us about the restaurant</h1>
          <p className="mt-1 text-sm text-muted">Answer the questions marked Required. Everything else is optional.</p>
        </div>
        <div className="no-print flex gap-2">
          <SecondaryButton size="sm" onClick={loadExample}>Try an example</SecondaryButton>
          <SecondaryButton size="sm" onClick={reset}>Start over</SecondaryButton>
        </div>
      </div>

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
            </div>
          </Section>

          <Section title="Sales and costs" required>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                label={salesLabel}
                htmlFor="amount"
                tooltip={isGpv ? "Card volume. It may include tax and tip, so it is not net sales. Add a net-sales estimate under More details." : "Sales after discounts, before sales tax and tips."}
                hint={isGpv ? "Add a net-sales estimate under More details." : "After discounts, before tax and tips."}
                error={err("amount")}
              >
                <NumberField id="amount" value={s.amount} onChange={(v) => update({ amount: v })} prefix="$" invalid={!!err("amount")} />
              </FormField>

              {s.costMode === "detailed" ? (
                <FormField label="Food & beverage cost" htmlFor="food-derived" hint="From your food/alcohol split (More details).">
                  <p id="food-derived" className="tabular flex min-h-11 items-center rounded-ctl bg-surface-2 px-3 font-semibold">
                    {r.cogs.valid ? pct(r.current.food) : "Complete the split"}
                  </p>
                </FormField>
              ) : (
                <FormField label="Food & beverage cost" htmlFor="food" tooltip="What you pay for the food and drinks you sell, as a % of sales." hint="% of sales" error={err("foodPct")}>
                  <NumberField id="food" value={s.foodPct} onChange={(v) => update({ foodPct: v })} suffix="%" invalid={!!err("foodPct")} />
                </FormField>
              )}

              <FormField label="Labor cost" htmlFor="labor" tooltip="Wages plus employer payroll taxes and benefits, as a % of sales." hint="Wages + taxes + benefits, % of sales" error={err("laborPct")}>
                <NumberField id="labor" value={s.laborPct} onChange={(v) => update({ laborPct: v })} suffix="%" invalid={!!err("laborPct")} />
              </FormField>
            </div>
          </Section>

          <Section title="What to improve" required>
            <FocusPicker />
          </Section>

          <Collapsible title="More details" tag="Optional" open={moreOpen} onToggle={() => setMoreOpen((o) => !o)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Restaurant name" htmlFor="name">
                  <TextField id="name" value={s.restaurantName} onChange={(v) => update({ restaurantName: v })} placeholder="e.g. Harbor Grill" />
                </FormField>
                <FormField label="Scenario name" htmlFor="scenario">
                  <TextField id="scenario" value={s.scenarioName} onChange={(v) => update({ scenarioName: v })} placeholder="e.g. Conservative case" />
                </FormField>
              </div>

              <AttributeChips />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Sales figure is" htmlFor="mode-group">
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
                <FormField label="The figure covers" htmlFor="scope-group">
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

              <div>
                <h3 className="mb-2 text-sm font-semibold">Food and alcohol split</h3>
                <DetailedSplit />
              </div>
            </div>
          </Collapsible>

          <Collapsible title="See how you compare with industry medians" tag="Optional" open={compareOpen} onToggle={() => setCompareOpen((o) => !o)}>
            <FinancialHealth embedded />
          </Collapsible>

          <div className="lg:hidden">
            <RequiredChecklist className="mb-3" />
            <StepFooter nextHref="/solutions" nextLabel="Next: Solutions" disabled={!st.complete} hint="Finish the required questions first." />
          </div>
        </div>

        <aside>
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
