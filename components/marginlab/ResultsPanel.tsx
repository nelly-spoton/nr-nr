"use client";
import { Callout, ContentCard, MetricCard, Badge } from "./Cards";
import { useScenario } from "./ScenarioProvider";
import { pct, pts, usd } from "@/lib/format";
import { SALES_STATUS_LABEL } from "@/lib/summary";

/** Live financial result. Sticky on desktop beside the inputs; stacked on mobile. */
export function ResultsPanel({ compact = false }: { compact?: boolean }) {
  const { result: r, scenario } = useScenario();
  const ok = r.sales.resolved;
  return (
    <div className="flex flex-col gap-3" aria-live="polite">
      <MetricCard
        tone="brand"
        size="lg"
        label="Est. annual opportunity"
        tooltip="Hypothetical annual prime-cost reduction if the selected percentage-point improvements were achieved. Not a guarantee."
        value={ok ? usd(r.savings.annualTotal) : "—"}
        sub={
          ok ? (
            <>
              {usd(r.savings.monthlyTotal)} per month · {pts(r.improvement.totalPts)} improvement
            </>
          ) : (
            "Enter net sales (or a GPV conversion) to calculate"
          )
        }
      />
      {r.sales.preliminary && (
        <Callout>
          <strong>Preliminary.</strong> {SALES_STATUS_LABEL[r.sales.status]}. Treat all results as estimates until sales and
          costs are verified.
        </Callout>
      )}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Current prime cost" value={pct(r.current.prime)} sub={`${usd(r.current.primeMonthly)}/mo`} />
        <MetricCard
          label="Improved prime cost"
          tone="good"
          value={pct(r.improved.prime)}
          sub={`${pts(r.improvement.totalPts)} lower`}
        />
      </div>
      {!compact && (
        <ContentCard className="hidden !p-4 lg:block">
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-sm">
            <dt className="text-muted">Monthly group net sales</dt>
            <dd className="tabular text-right font-semibold">{usd(r.sales.monthlyGroup)}</dd>
            <dt className="text-muted">Annual group net sales</dt>
            <dd className="tabular text-right font-semibold">{usd(r.sales.annualGroup)}</dd>
            <dt className="text-muted">Food savings (mo / yr)</dt>
            <dd className="tabular text-right font-semibold">
              {usd(r.savings.monthlyFood)} / {usd(r.savings.annualFood)}
            </dd>
            <dt className="text-muted">Labor savings (mo / yr)</dt>
            <dd className="tabular text-right font-semibold">
              {usd(r.savings.monthlyLabor)} / {usd(r.savings.annualLabor)}
            </dd>
            {r.locations > 1 && (
              <>
                <dt className="text-muted">Per location (mo / yr)</dt>
                <dd className="tabular text-right font-semibold">
                  {usd(r.savings.perLocationMonthly)} / {usd(r.savings.perLocationAnnual)}
                </dd>
              </>
            )}
          </dl>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="neutral">{scenario.volumeScope === "group" ? "Group volume entered" : "Per-location volume entered"}</Badge>
            <Badge tone="neutral">Estimates only</Badge>
          </div>
        </ContentCard>
      )}
    </div>
  );
}
