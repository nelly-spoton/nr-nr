"use client";
import Link from "next/link";
import { useState } from "react";
import { CONCEPT_LABELS } from "@/config/concepts";
import { FOCUS_OPTIONS } from "@/lib/focus";
import { CaseStudyGrid } from "@/components/marginlab/CaseStudyCard";
import { CoachingPanel } from "@/components/marginlab/CoachingPanel";
import { Badge } from "@/components/marginlab/Cards";
import { Collapsible } from "@/components/marginlab/Collapsible";
import { EmptyStep } from "@/components/marginlab/EmptyStep";
import { FinancialHealth } from "@/components/marginlab/FinancialHealth";
import { useScenario } from "@/components/marginlab/ScenarioProvider";
import { SamSpotlight } from "@/components/marginlab/SamSpotlight";
import { SolutionCard } from "@/components/marginlab/SolutionCard";
import { StepFooter } from "@/components/marginlab/StepFooter";
import { StepHeader } from "@/components/marginlab/StepHeader";
import { pts } from "@/lib/format";
import { buildReport } from "@/lib/report";
import { requiredStatus } from "@/lib/steps";

export default function Step2Page() {
  const { scenario: s, result: r } = useScenario();
  const [more, setMore] = useState(false);
  const [no, setNo] = useState(false);
  const [cmp, setCmp] = useState(false);
  const st = requiredStatus(s, r);

  if (!st.complete)
    return (
      <>
        <StepHeader step={2} title="Solutions that fit" subtitle="Recommendations built from your answers in Step 1." />
        <EmptyStep what="Recommendations" />
      </>
    );

  const rep = buildReport(s, r);
  const listed = rep.recs.filter((x) => !x.solution.featured);
  const best = listed.filter((x) => x.tier === "highest");
  const maybe = listed.filter((x) => x.tier === "additional" || x.tier === "visibility");
  const notFit = listed.filter((x) => x.tier === "not_recommended");
  const focus = FOCUS_OPTIONS.find((o) => o.value === s.focus)!.label;

  return (
    <>
      <StepHeader step={2} title="Solutions that fit" subtitle="Built from your answers. Change them in Step 1 and this page updates." />
      <div className="mb-5">
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <Badge tone="brand">{CONCEPT_LABELS[s.concept]}</Badge>
          <Badge>{r.locations} location{r.locations > 1 ? "s" : ""}</Badge>
          <Badge>Improving: {focus.toLowerCase()}</Badge>
          <Badge>{pts(r.improvement.totalPts)}</Badge>
          <Link href="/" className="text-xs font-semibold text-link underline">Change answers</Link>
        </p>
      </div>

      <SamSpotlight />

      <section aria-labelledby="best" className="mb-6">
        <h2 id="best" className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-accent">Best fit for you</h2>
        {best.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {best.map((x) => (
              <SolutionCard key={x.solution.id} rec={x} />
            ))}
          </div>
        ) : (
          <p className="rounded-ctl border border-rule bg-surface-2 p-4 text-sm text-muted">
            No product is a strong fit for these answers. See the others below.
          </p>
        )}
      </section>

      <div className="mb-6 flex flex-col gap-3">
        {maybe.length > 0 && (
          <Collapsible title="Also worth a look" tag="Optional" count={maybe.length} open={more} onToggle={() => setMore((o) => !o)}>
            <div className="grid gap-3 md:grid-cols-2">
              {maybe.map((x) => (
                <SolutionCard key={x.solution.id} rec={x} />
              ))}
            </div>
          </Collapsible>
        )}
        {notFit.length > 0 && (
          <Collapsible title="Not a fit for this restaurant" tag="Why not" count={notFit.length} open={no} onToggle={() => setNo((o) => !o)}>
            <ul className="divide-y divide-rule text-sm">
              {notFit.map((x) => (
                <li key={x.solution.id} className="py-2">
                  <strong>{x.solution.name}</strong> <span className="text-muted">— {x.exclusion}</span>
                </li>
              ))}
            </ul>
          </Collapsible>
        )}
      </div>

      <section aria-labelledby="proof" className="mb-6">
        <h2 id="proof" className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent">What similar restaurants reported</h2>
        <p className="mb-3 text-sm text-muted">Published results from other restaurants. Not predictions, and they don&apos;t change your numbers.</p>
        <CaseStudyGrid matches={rep.matches} compact />
      </section>

      <div className="mb-6">
        <Collapsible title="How you compare with industry medians" tag="Optional" open={cmp} onToggle={() => setCmp((o) => !o)}>
          <FinancialHealth embedded />
        </Collapsible>
      </div>

      <CoachingPanel />

      <p className="mt-4 text-xs text-muted">Possibilities, not guarantees. Confirm compatibility and availability with SpotOn before promising anything.</p>

      <StepFooter backHref="/" backLabel="Back: Your restaurant" nextHref="/summary" nextLabel="Next: Summary" />
    </>
  );
}
