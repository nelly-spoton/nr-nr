"use client";
import { Callout, ContentCard, MetricCard } from "./Cards";
import { useScenario } from "./ScenarioProvider";
import { pct, pts, usd } from "@/lib/format";
import { requiredStatus } from "@/lib/steps";

/** Live result. Shows a dash until the required answers exist, then the opportunity and what it is made of. */
export function ResultsPanel() {
  const { result: r, scenario } = useScenario();
  const st = requiredStatus(scenario, r);
  if (!st.complete)
    return (
      <MetricCard
        tone="brand"
        size="lg"
        label="Your estimated annual opportunity"
        value="—"
        sub="Answer the required questions to see it."
      />
    );
  return (
    <div className="flex flex-col gap-3" aria-live="polite">
      <MetricCard
        tone="brand"
        size="lg"
        label="Your estimated annual opportunity"
        tooltip="A hypothetical yearly saving if costs improved by the points you chose. Not a guarantee."
        value={usd(r.savings.annualTotal)}
        sub={
          <>
            {usd(r.savings.monthlyTotal)} a month · {pts(r.improvement.totalPts)} lower cost
          </>
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Prime cost now" value={pct(r.current.prime)} sub="food + labor" />
        <MetricCard label="After improving" tone="good" value={pct(r.improved.prime)} sub={`${pts(r.improvement.totalPts)} lower`} />
      </div>
      <ContentCard className="!p-4">
        <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-muted">Food savings</dt>
          <dd className="tabular text-right font-semibold">{usd(r.savings.annualFood)}/yr</dd>
          <dt className="text-muted">Labor savings</dt>
          <dd className="tabular text-right font-semibold">{usd(r.savings.annualLabor)}/yr</dd>
          {r.locations > 1 && (
            <>
              <dt className="text-muted">Per location</dt>
              <dd className="tabular text-right font-semibold">{usd(r.savings.perLocationAnnual)}/yr</dd>
            </>
          )}
          <dt className="text-muted">Annual sales</dt>
          <dd className="tabular text-right font-semibold">{usd(r.sales.annualGroup)}</dd>
        </dl>
      </ContentCard>
      {r.sales.preliminary && <Callout>Preliminary: based on an estimated sales figure.</Callout>}
    </div>
  );
}
