"use client";
import { ArrowRight, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { isAlcoholLed } from "@/lib/report";
import { BeverageMixPanel } from "@/components/marginlab/BeverageMixPanel";
import { CoachingPanel } from "@/components/marginlab/CoachingPanel";
import { ConceptProfile } from "@/components/marginlab/ConceptProfile";
import { ContentCard, HeroBanner, SectionHeader, Callout } from "@/components/marginlab/Cards";
import { CostModeInputs } from "@/components/marginlab/CostModeInputs";
import { FinancialHealth } from "@/components/marginlab/FinancialHealth";
import { FormField, NumberField, SegmentedControl, TextField } from "@/components/marginlab/Fields";
import { ImprovementControls } from "@/components/marginlab/ImprovementControls";
import { ResultsPanel } from "@/components/marginlab/ResultsPanel";
import { useScenario } from "@/components/marginlab/ScenarioProvider";
import { LimeButton, SecondaryButton, buttonStyles } from "@/components/marginlab/Buttons";
import { safeLocations } from "@/lib/calc";
import { usd } from "@/lib/format";
import { issueFor } from "@/lib/validate";

export default function OverviewPage() {
  const { scenario: s, result: r, update, issues, reset } = useScenario();
  const err = (f: string) => {
    const i = issueFor(issues, f);
    return i?.severity === "error" ? i.message : undefined;
  };
  const warn = (f: string) => {
    const i = issueFor(issues, f);
    return i?.severity === "warning" ? i.message : undefined;
  };
  const isGpv = s.salesMode === "gpv";

  return (
    <>
      <HeroBanner
        eyebrow="Live discovery calculator"
        title="Find the margin hiding in prime cost."
        subtitle="Enter volume and costs, set the improvement assumptions, and watch the opportunity update."
        action={<LimeButton onClick={reset}>Reset to example</LimeButton>}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="order-2 flex flex-col gap-6 lg:order-1">
          <ContentCard>
            <SectionHeader title="Restaurant" />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Restaurant / group name (optional)" htmlFor="name">
                <TextField id="name" value={s.restaurantName} onChange={(v) => update({ restaurantName: v })} placeholder="e.g. Harbor Grill Group" />
              </FormField>
              <FormField label="Scenario name" htmlFor="scenario">
                <TextField id="scenario" value={s.scenarioName} onChange={(v) => update({ scenarioName: v })} placeholder="e.g. Conservative case" />
              </FormField>
              <ConceptProfile />
              <FormField label="Number of locations (1–10)" htmlFor="locations" error={err("locations")}>
                <div className="flex gap-2">
                  <SecondaryButton
                    aria-label="Fewer locations"
                    className="w-11 shrink-0 !px-0"
                    onClick={() => update({ locations: Math.max(1, safeLocations(s.locations) - 1) })}
                  >
                    <Minus className="h-4 w-4" aria-hidden />
                  </SecondaryButton>
                  <NumberField id="locations" value={s.locations} onChange={(v) => update({ locations: v })} invalid={!!err("locations")} className="flex-1" />
                  <SecondaryButton
                    aria-label="More locations"
                    className="w-11 shrink-0 !px-0"
                    onClick={() => update({ locations: Math.min(10, safeLocations(s.locations) + 1) })}
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                  </SecondaryButton>
                </div>
              </FormField>
            </div>
          </ContentCard>

          <ContentCard>
            <SectionHeader
              title="Sales"
              tooltip="One consistent net-sales denominator is used for every prime-cost calculation. Equal sales across locations are assumed in V1."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Input mode" htmlFor="mode-group">
                <SegmentedControl
                  label="Input mode"
                  value={s.salesMode}
                  onChange={(v) => update({ salesMode: v })}
                  options={[
                    { value: "net", label: "Monthly net sales", sub: "preferred" },
                    { value: "gpv", label: "Monthly GPV", sub: "estimate" },
                  ]}
                />
              </FormField>
              <FormField label="Volume applies to" htmlFor="scope-group">
                <SegmentedControl
                  label="Volume applies to"
                  value={s.volumeScope}
                  onChange={(v) => update({ volumeScope: v })}
                  options={[
                    { value: "perLocation", label: "Per location" },
                    { value: "group", label: "Entire group" },
                  ]}
                />
              </FormField>
              <FormField
                label={isGpv ? "Monthly GPV ($)" : "Monthly net sales ($)"}
                htmlFor="amount"
                tooltip={
                  isGpv
                    ? "Gross payment volume. May include taxes and tips and exclude cash sales, so it is not net sales."
                    : "Sales after discounts and comps, excluding sales tax and tips."
                }
                error={err("amount")}
                warning={warn("amount")}
              >
                <NumberField id="amount" value={s.amount} onChange={(v) => update({ amount: v })} prefix="$" invalid={!!err("amount")} />
              </FormField>
              {!isGpv && (
                <FormField label="Confidence in this figure" htmlFor="conf-group">
                  <SegmentedControl
                    label="Confidence in this figure"
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
              <div className="mt-4 flex flex-col gap-4">
                <Callout>
                  GPV may include taxes and tips and exclude cash sales. MarginLab does <strong>not</strong> treat GPV as net
                  sales: provide a separate net-sales estimate or your own conversion factor. Results stay preliminary.
                </Callout>
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
                    <FormField label="Monthly net-sales estimate ($)" htmlFor="gpv-net" error={err("gpv.netEstimate")} hint="Same scope as the GPV above.">
                      <NumberField id="gpv-net" value={s.gpv.netEstimate} prefix="$" invalid={!!err("gpv.netEstimate")} onChange={(v) => update({ gpv: { ...s.gpv, netEstimate: v } })} />
                    </FormField>
                  ) : (
                    <FormField label="GPV-to-net-sales factor" htmlFor="gpv-factor" error={err("gpv.conversionFactor")} hint="Your assumption, e.g. 0.85. Not a published figure.">
                      <NumberField id="gpv-factor" value={s.gpv.conversionFactor} invalid={!!err("gpv.conversionFactor")} onChange={(v) => update({ gpv: { ...s.gpv, conversionFactor: v } })} />
                    </FormField>
                  )}
                </div>
              </div>
            )}
            <p className="mt-4 text-sm text-muted">
              Monthly group net sales:{" "}
              <strong className="tabular text-ink">{r.sales.resolved ? usd(r.sales.monthlyGroup) : "not yet established"}</strong>
              {r.locations > 1 && r.sales.resolved && <> · {usd(r.sales.monthlyPerLocation)} per location</>}
            </p>
          </ContentCard>

          <ContentCard>
            <SectionHeader
              title="Current costs"
              tooltip="Both costs are % of net sales on the same denominator. Prime cost = food & beverage COGS + fully loaded labor."
            />
            <CostModeInputs />
            {s.costMode === "quick" && (isAlcoholLed(s) || s.attributes.includes("beverage_heavy") || s.beverageMix.enabled) && <BeverageMixPanel />}
          </ContentCard>

          <FinancialHealth />

          <ContentCard>
            <SectionHeader title="Improvement assumptions" description="Percentage points of net sales — hypothetical until supported by actual cost data." />
            <ImprovementControls showPresets={false} />
          </ContentCard>
          <CoachingPanel />
          <div className="no-print flex flex-col gap-2 lg:hidden">
            <Link href="/solutions" className={buttonStyles({ variant: "primary" })}>
              Show relevant SpotOn solutions <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/summary" className={buttonStyles({ variant: "secondary" })}>
              Copy or print summary
            </Link>
          </div>
        </div>

        <aside className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-[72px]">
            <ResultsPanel />
            <div className="no-print mt-3 hidden flex-col gap-2 lg:flex">
              <Link href="/solutions" className={buttonStyles({ variant: "primary" })}>
                Show relevant SpotOn solutions <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/summary" className={buttonStyles({ variant: "secondary" })}>
                Copy or print summary
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
