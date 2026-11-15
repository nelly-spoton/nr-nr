"use client";
import { CONCEPT_LABELS } from "@/config/concepts";
import { OVERLAP_NOTE, SOLUTIONS_DISCLAIMER } from "@/config/solutions";
import { Callout, ContentCard, PageHeader, SectionHeader } from "@/components/marginlab/Cards";
import { CaseStudyGrid } from "@/components/marginlab/CaseStudyCard";
import { useScenario } from "@/components/marginlab/ScenarioProvider";
import { SolutionCard } from "@/components/marginlab/SolutionCard";
import { pts } from "@/lib/format";
import { buildReport } from "@/lib/report";
import { TIER_LABELS, type Tier } from "@/lib/recommend";

const TIER_NOTE: Record<Tier, string> = {
  highest: "Workflow products whose cost driver matches the improvement selected and that fit this service model.",
  additional: "Plausible for this concept, but the lever is not selected or the evidence is weaker.",
  visibility: "Insight tools help management find and measure opportunities; they are not direct cost levers.",
  not_recommended: "Not a fit for this concept or service model as currently profiled.",
};

export default function SolutionsPage() {
  const { scenario: s, result: r, update } = useScenario();
  const rep = buildReport(s, r);
  const tiers: Tier[] = ["highest", "additional", "visibility", "not_recommended"];
  const toggle = (id: string, included: boolean) => update((x) => ({ ...x, solutionOverrides: { ...x.solutionOverrides, [id]: included } }));

  return (
    <>
      <PageHeader
        title="SpotOn Solutions"
        description="Ranked for this restaurant's profile. Each product appears once; outcome tags show what it may influence. Possibilities, not guaranteed results."
      />
      <div className="mb-6 flex flex-col gap-3">
        <ContentCard tone="muted">
          <p className="text-sm">
            <strong>Profile:</strong> {CONCEPT_LABELS[s.concept]}
            {rep.profile.attributes.length > 0 && <> · {rep.profile.attributes.map((a) => a.replace(/_/g, " ")).join(", ")}</>} ·{" "}
            {r.locations} location{r.locations > 1 ? "s" : ""} · improvement {pts(r.improvement.foodPts)} food, {pts(r.improvement.laborPts)} labor. Change these on the Overview page.
          </p>
        </ContentCard>
        <Callout>{SOLUTIONS_DISCLAIMER}</Callout>
        <Callout tone="info">{OVERLAP_NOTE}</Callout>
      </div>

      <div className="flex flex-col gap-10">
        {tiers.map((t) => {
          const items = rep.recs.filter((x) => x.tier === t);
          if (!items.length) return null;
          return (
            <section key={t} aria-labelledby={`tier-${t}`}>
              <h2 id={`tier-${t}`} className="sr-only">{TIER_LABELS[t]}</h2>
              <SectionHeader title={TIER_LABELS[t]} description={TIER_NOTE[t]} />
              {t === "not_recommended" ? (
                <ul className="divide-y divide-rule rounded-card border border-rule bg-surface">
                  {items.map((x) => (
                    <li key={x.solution.id} className="p-4 text-sm">
                      <strong>{x.solution.name}</strong>
                      <span className="text-muted"> — {x.exclusion}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {items.map((x) => (
                    <SolutionCard key={x.solution.id} rec={x} overrides={s.solutionOverrides} onToggle={(inc) => toggle(x.solution.id, inc)} />
                  ))}
                </div>
              )}
            </section>
          );
        })}

        <section aria-labelledby="proof">
          <h2 id="proof" className="sr-only">Customer proof</h2>
          <SectionHeader title="Customer proof for this profile" description="Published examples from other restaurants. They do not change the financial model." />
          <CaseStudyGrid matches={rep.matches} />
        </section>

        <ContentCard tone="muted">
          <SectionHeader title="Business impact & compatibility considerations" />
          <ul className="list-disc space-y-1.5 pl-5 text-sm">
            <li>Cost improvements depend on adoption, process change and data quality, not on purchase alone.</li>
            <li>Not every solution works independently of SpotOn POS, and not every integration is available to every merchant.</li>
            <li>Partner products carry their own subscriptions, onboarding and support.</li>
            <li>Payment-processing, delivery-commission and sales-lift effects are excluded from prime-cost savings here.</li>
            <li>Validate any improvement assumption against the restaurant&apos;s actual invoices, schedules and POS data.</li>
          </ul>
        </ContentCard>
      </div>
    </>
  );
}
