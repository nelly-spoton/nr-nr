"use client";
import { useState } from "react";
import {
  OBJECTIVE_LABELS,
  OVERLAP_NOTE,
  SOLUTIONS_DISCLAIMER,
  solutionsFor,
  type Objective,
  type Solution,
} from "@/config/solutions";
import { Callout, ContentCard, PageHeader, SectionHeader } from "@/components/marginlab/Cards";
import { SegmentedControl } from "@/components/marginlab/Fields";
import { useScenario } from "@/components/marginlab/ScenarioProvider";
import { SolutionCard } from "@/components/marginlab/SolutionCard";

type Filter = "all" | Objective;
const OBJECTIVES: Objective[] = ["food", "labor", "visibility"];

export default function SolutionsPage() {
  const { scenario: s, result: r, update } = useScenario();
  const [filter, setFilter] = useState<Filter>("all");
  const toggle = (id: string) =>
    update((x) => ({
      ...x,
      selectedSolutionIds: x.selectedSolutionIds.includes(id)
        ? x.selectedSolutionIds.filter((y) => y !== id)
        : [...x.selectedSolutionIds, id],
    }));
  const relevant = (x: Solution) =>
    (r.improvement.foodPts > 0 && (x.influences === "food" || x.influences === "both")) ||
    (r.improvement.laborPts > 0 && (x.influences === "labor" || x.influences === "both")) ||
    x.influences === "insight";
  const shown = filter === "all" ? OBJECTIVES : [filter];

  return (
    <>
      <PageHeader
        title="SpotOn Solutions"
        description="Solutions and integration partners grouped by business objective. Each is a possible contributor to an improvement target — not a guaranteed result."
      />
      <div className="mb-6 flex flex-col gap-3">
        <Callout>{SOLUTIONS_DISCLAIMER}</Callout>
        <Callout tone="info">{OVERLAP_NOTE}</Callout>
        <SegmentedControl
          label="Filter by objective"
          value={filter}
          onChange={setFilter}
          className="sm:w-auto"
          options={[
            { value: "all", label: "All" },
            { value: "food", label: "Food cost" },
            { value: "labor", label: "Labor" },
            { value: "visibility", label: "Visibility" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-10">
        {shown.map((o) => (
          <section key={o} aria-labelledby={`obj-${o}`}>
            <SectionHeader
              title={OBJECTIVE_LABELS[o]}
              description={
                o === "visibility"
                  ? "Insight tools help management identify and measure opportunities; they do not themselves reduce cost."
                  : undefined
              }
            />
            <span id={`obj-${o}`} className="sr-only">{OBJECTIVE_LABELS[o]}</span>
            <div className="grid gap-4 lg:grid-cols-2">
              {solutionsFor(o).map((x) => (
                <SolutionCard
                  key={`${o}-${x.id}`}
                  solution={x}
                  currentObjective={o}
                  selected={s.selectedSolutionIds.includes(x.id)}
                  onToggle={() => toggle(x.id)}
                  relevant={relevant(x)}
                  concept={s.concept}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10">
        <ContentCard tone="muted">
          <SectionHeader title="Business impact & compatibility considerations" />
          <ul className="list-disc space-y-1.5 pl-5 text-sm">
            <li>Cost improvements depend on adoption, process change and data quality — not on purchase alone.</li>
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
