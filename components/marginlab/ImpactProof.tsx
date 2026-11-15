"use client";
import { PROOF_DISCLAIMER } from "@/config/caseStudies";
import { bestProofFor } from "@/lib/matching";
import { buildProfile } from "@/lib/profile";
import { pct, pts, usd } from "@/lib/format";
import { Badge, Callout, ContentCard, SectionHeader } from "./Cards";
import { useScenario } from "./ScenarioProvider";

/** Connects the hypothetical scenario to published examples, side by side and never equated. */
export function ImpactProof() {
  const { scenario: s, result: r } = useScenario();
  const p = buildProfile(s, r);
  const food = p.foodPts > 0 ? bestProofFor("food", p) : null;
  const labor = p.laborPts > 0 ? bestProofFor("labor", p) : null;
  return (
    <ContentCard>
      <SectionHeader title="Financial impact and customer proof" />
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <h3 className="mb-1.5 text-sm font-semibold">Hypothetical opportunity (this model)</h3>
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
            <dt className="text-muted">Prospect</dt>
            <dd className="text-right font-semibold">
              {r.locations} location{r.locations > 1 ? "s" : ""} · {usd(r.sales.monthlyPerLocation)}/mo each
            </dd>
            <dt className="text-muted">Annual net sales</dt>
            <dd className="tabular text-right font-semibold">{usd(r.sales.annualGroup)}</dd>
            <dt className="text-muted">Selected improvement</dt>
            <dd className="tabular text-right font-semibold">
              {pts(r.improvement.foodPts)} food · {pts(r.improvement.laborPts)} labor
            </dd>
            <dt className="text-muted">Food</dt>
            <dd className="tabular text-right font-semibold">{usd(r.savings.annualFood)}/yr</dd>
            <dt className="text-muted">Labor</dt>
            <dd className="tabular text-right font-semibold">{usd(r.savings.annualLabor)}/yr</dd>
            <dt className="font-semibold">Illustrative annual opportunity</dt>
            <dd className="tabular text-right text-lg font-semibold text-brand">{usd(r.savings.annualTotal)}</dd>
          </dl>
        </div>
        <div>
          <h3 className="mb-1.5 text-sm font-semibold">Published examples from other restaurants</h3>
          <ul className="flex flex-col gap-2 text-sm">
            {[
              { lever: "Food", m: food },
              { lever: "Labor", m: labor },
            ].map(({ lever, m }) =>
              m ? (
                <li key={lever} className="rounded-ctl border border-rule bg-surface-2 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="brand">{lever}</Badge>
                    <strong>{m.study.name}</strong>
                  </div>
                  <p className="mt-1">{m.study.metric.wording}</p>
                  <p className="text-xs text-muted">
                    {m.study.verification.status === "verified" ? "Source verified" : "Source not yet verified"} ·{" "}
                    <a href={m.study.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-link underline">
                      source
                    </a>
                  </p>
                </li>
              ) : null,
            )}
            {!food && !labor && <li className="text-muted">Select a food or labor improvement to see a matching published example.</li>}
          </ul>
          <p className="mt-2 text-xs text-muted">
            Published figures are relative or dollar results at those restaurants. They are not applied to your {pct(r.current.prime)} prime-cost model.
          </p>
        </div>
      </div>
      <div className="mt-4">
        <Callout tone="info">{PROOF_DISCLAIMER}</Callout>
      </div>
    </ContentCard>
  );
}
