"use client";
import { useState } from "react";
import { BeforeAfterChart } from "@/components/marginlab/BeforeAfterChart";
import { Callout, ContentCard, MetricCard, PageHeader, SectionHeader } from "@/components/marginlab/Cards";
import { DataTable } from "@/components/marginlab/DataTable";
import { FormField, NumberField, SegmentedControl } from "@/components/marginlab/Fields";
import { ImprovementControls } from "@/components/marginlab/ImprovementControls";
import { ResultsPanel } from "@/components/marginlab/ResultsPanel";
import { useScenario } from "@/components/marginlab/ScenarioProvider";
import { round2 } from "@/lib/calc";
import { pct, pts, usd } from "@/lib/format";
import { issueFor } from "@/lib/validate";

export default function CalculatorPage() {
  const { scenario: s, result: r, update, issues } = useScenario();
  const [view, setView] = useState<"group" | "perLocation">("group");
  const d = view === "perLocation" ? r.locations : 1;
  const per = (x: number) => usd(round2(x / d));

  const savingsRows = [
    { k: "food", label: "Food & beverage", m: r.savings.monthlyFood, a: r.savings.annualFood },
    { k: "labor", label: "Labor", m: r.savings.monthlyLabor, a: r.savings.annualLabor },
    { k: "total", label: "Total", m: r.savings.monthlyTotal, a: r.savings.annualTotal },
  ];
  const compareRows = [
    { k: "food", label: "Food & beverage", c: r.current.food, i: r.improved.food, cm: r.current.foodMonthly, im: r.improved.foodMonthly },
    { k: "labor", label: "Labor", c: r.current.labor, i: r.improved.labor, cm: r.current.laborMonthly, im: r.improved.laborMonthly },
    { k: "prime", label: "Prime cost", c: r.current.prime, i: r.improved.prime, cm: r.current.primeMonthly, im: r.improved.primeMonthly },
  ];
  const roi = r.roi;
  const roiErr = (f: string) => {
    const i = issueFor(issues, f);
    return i?.severity === "error" ? i.message : undefined;
  };

  return (
    <>
      <PageHeader
        title="Savings Calculator"
        description="Model prime-cost improvements in percentage points. Results stay visible while you adjust."
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="order-2 flex flex-col gap-6 lg:order-1">
          <ContentCard>
            <SectionHeader title="Improvement assumptions" />
            <ImprovementControls />
          </ContentCard>

          <ContentCard>
            <SectionHeader
              title="Current vs. improved"
              action={
                r.locations > 1 ? (
                  <SegmentedControl
                    label="Savings view"
                    className="w-56"
                    value={view}
                    onChange={setView}
                    options={[
                      { value: "group", label: "Entire group" },
                      { value: "perLocation", label: "Per location" },
                    ]}
                  />
                ) : undefined
              }
            />
            <BeforeAfterChart />
            <div className="mt-4 flex flex-col gap-4">
              <DataTable
                caption="Current versus improved cost"
                rowKey={(x) => x.k}
                rows={compareRows}
                columns={[
                  { key: "l", header: "Category", render: (x) => <span className="font-semibold">{x.label}</span> },
                  { key: "c", header: "Current", align: "right", render: (x) => pct(x.c) },
                  { key: "i", header: "Improved", align: "right", render: (x) => pct(x.i) },
                  { key: "cm", header: `Current $/mo${d > 1 ? " /loc" : ""}`, align: "right", render: (x) => per(x.cm) },
                  { key: "im", header: `Improved $/mo${d > 1 ? " /loc" : ""}`, align: "right", render: (x) => per(x.im) },
                ]}
              />
              <DataTable
                caption="Estimated savings"
                rowKey={(x) => x.k}
                rows={savingsRows}
                columns={[
                  { key: "l", header: `Est. savings${d > 1 ? " (per location)" : ""}`, render: (x) => <span className={x.k === "total" ? "font-extrabold" : "font-semibold"}>{x.label}</span> },
                  { key: "m", header: "Per month", align: "right", render: (x) => per(x.m) },
                  { key: "a", header: "Per year", align: "right", render: (x) => per(x.a) },
                ]}
              />
              <p className="text-xs text-muted">
                Prime cost improves by <strong>{pts(r.improvement.totalPts)}</strong> (percentage points, not a relative
                reduction). Food + labor savings sum to the total.
              </p>
            </div>
          </ContentCard>

          <ContentCard>
            <details>
              <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-muted">
                Advanced ROI (optional)
              </summary>
              <div className="mt-4 flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField label="Monthly incremental software cost" htmlFor="roi-sw" error={roiErr("roi.monthlySoftwareCost")}>
                    <NumberField id="roi-sw" prefix="$" value={s.roi.monthlySoftwareCost} onChange={(v) => update({ roi: { ...s.roi, monthlySoftwareCost: v } })} invalid={!!roiErr("roi.monthlySoftwareCost")} />
                  </FormField>
                  <FormField label="One-time implementation cost" htmlFor="roi-one" error={roiErr("roi.oneTimeCost")}>
                    <NumberField id="roi-one" prefix="$" value={s.roi.oneTimeCost} onChange={(v) => update({ roi: { ...s.roi, oneTimeCost: v } })} invalid={!!roiErr("roi.oneTimeCost")} />
                  </FormField>
                  <FormField label="Other ongoing costs (monthly)" htmlFor="roi-other" error={roiErr("roi.otherMonthlyCost")}>
                    <NumberField id="roi-other" prefix="$" value={s.roi.otherMonthlyCost} onChange={(v) => update({ roi: { ...s.roi, otherMonthlyCost: v } })} invalid={!!roiErr("roi.otherMonthlyCost")} />
                  </FormField>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <MetricCard label="Annual net benefit" value={usd(roi.annualNetBenefit)} sub="Savings minus ongoing costs" />
                  <MetricCard label="First-year net benefit" value={usd(roi.firstYearNetBenefit)} sub="Includes one-time cost" />
                  <MetricCard
                    label="Payback"
                    value={roi.paybackMonths === null ? "n/a" : roi.paybackMonths === 0 ? "Immediate" : `${roi.paybackMonths.toFixed(1)} mo`}
                    sub={roi.paybackMonths === null ? "Not meaningful: monthly net benefit is not positive" : undefined}
                  />
                </div>
                <p className="text-xs text-muted">
                  Payment processing, delivery-commission reduction and sales increases are not counted as prime-cost savings.
                </p>
              </div>
            </details>
          </ContentCard>
        </div>

        <aside className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-20">
            <ResultsPanel />
            <div className="mt-3">
              <Callout tone="info">
                All savings are hypothetical opportunities until supported by actual restaurant cost data and observed
                operational changes.
              </Callout>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
