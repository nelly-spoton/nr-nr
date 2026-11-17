"use client";
import { Check, Copy, Printer, RotateCcw, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CONCEPT_LABELS } from "@/config/concepts";
import { NRA_SOURCE } from "@/config/benchmarks";
import { PROOF_DISCLAIMER } from "@/config/caseStudies";
import { CaseStudyGrid } from "@/components/marginlab/CaseStudyCard";
import { OVERLAP_NOTE, SOLUTIONS_DISCLAIMER } from "@/config/solutions";
import { GhostButton, LimeButton, SecondaryButton } from "@/components/marginlab/Buttons";
import { Badge, ContentCard, SectionHeader } from "@/components/marginlab/Cards";
import { EmptyStep } from "@/components/marginlab/EmptyStep";
import { StepFooter } from "@/components/marginlab/StepFooter";
import { StepHeader } from "@/components/marginlab/StepHeader";
import { requiredStatus } from "@/lib/steps";
import { useScenario } from "@/components/marginlab/ScenarioProvider";
import { BAND_LABEL, buildHealth, nearNote, PEER_LABEL } from "@/lib/health";
import { buildReport } from "@/lib/report";
import { pct, pts, usd } from "@/lib/format";
import {
  SALES_STATUS_LABEL,
  buildSummaryText,
  keyAssumptions,
  validationItems,
} from "@/lib/summary";

function H({ children }: { children: string }) {
  return <h3 className="mb-1.5 border-b border-rule pb-1 text-[11px] font-bold uppercase tracking-wider text-muted">{children}</h3>;
}
function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3 py-0.5">
      <dt className="text-muted">{k}</dt>
      <dd className={`tabular text-right ${strong ? "font-extrabold" : "font-semibold"}`}>{v}</dd>
    </div>
  );
}

export default function SummaryPage() {
  const { scenario: s, result: r, reset, saved, saveNamed, loadSavedScenario, deleteSaved } = useScenario();
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");
  const [today, setToday] = useState("");
  useEffect(() => setToday(new Date().toLocaleDateString("en-US", { dateStyle: "long" })), []);

  const text = buildSummaryText(s, r);
  const rep = buildReport(s, r);
  const health = buildHealth(s, r);
  const hp = health.profit;
  const sols = rep.included;
  const foodPct = Math.round(rep.contribution.foodShare * 100);
  const laborPct = Math.round(rep.contribution.laborShare * 100);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied("ok");
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        setCopied(ok ? "ok" : "fail");
      } catch {
        setCopied("fail");
      }
    }
    setTimeout(() => setCopied("idle"), 2500);
  }

  if (!requiredStatus(s, r).complete)
    return (
      <>
        <StepHeader step={3} title="Your summary" subtitle="A one-page summary of the restaurant and the opportunity." />
        <EmptyStep what="The summary" />
      </>
    );

  return (
    <>
      <StepHeader
        step={3}
        title="Your summary"
        subtitle="One page to print, save as a PDF, or copy. Nothing is uploaded."
        actions={
          <>
            <LimeButton onClick={() => window.print()}>
              <Printer className="h-4 w-4" aria-hidden /> Print / Save PDF
            </LimeButton>
            <SecondaryButton onClick={copy}>
              {copied === "ok" ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copied === "ok" ? "Copied" : copied === "fail" ? "Copy failed" : "Copy summary"}
            </SecondaryButton>
          </>
        }
      />
      <span aria-live="polite" className="sr-only">
        {copied === "ok" ? "Summary copied to clipboard" : copied === "fail" ? "Could not copy" : ""}
      </span>

      <article className="print-page rounded-card border border-rule bg-surface p-5 shadow-card sm:p-8" aria-label="Printable operator summary">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-ink pb-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">MarginLab · Operator Summary</p>
            <h2 className="text-2xl font-extrabold tracking-tight">{s.restaurantName || "Restaurant"}</h2>
            <p className="text-sm text-muted">
              {CONCEPT_LABELS[s.concept]} · {r.locations} location{r.locations > 1 ? "s" : ""}
              {s.scenarioName ? ` · ${s.scenarioName}` : ""}
            </p>
          </div>
          <div className="text-right text-xs text-muted">
            <Badge tone={r.sales.preliminary ? "warn" : "neutral"}>{r.sales.preliminary ? "Preliminary estimate" : "Estimate"}</Badge>
            <p className="mt-1">{today}</p>
          </div>
        </header>

        <div className="mt-4 grid gap-5 text-sm md:grid-cols-2">
          <section className="print-avoid-break">
            <H>Financial snapshot</H>
            <dl>
              <Row k="Monthly group net sales" v={usd(r.sales.monthlyGroup)} />
              <Row k="Annual group net sales" v={usd(r.sales.annualGroup)} />
              <Row k="Food & beverage cost" v={pct(r.current.food)} />
              <Row k="Labor cost (fully loaded)" v={pct(r.current.labor)} />
              <Row k="Current prime cost" v={pct(r.current.prime)} strong />
            </dl>
            <p className="mt-1 text-xs text-muted">Sales basis: {SALES_STATUS_LABEL[r.sales.status]}</p>
          </section>
          <section className="print-avoid-break">
            <H>Selected improvement scenario</H>
            <dl>
              <Row k="Food improvement" v={`${pts(r.improvement.foodPts)} → ${pct(r.improved.food)}`} />
              <Row k="Labor improvement" v={`${pts(r.improvement.laborPts)} → ${pct(r.improved.labor)}`} />
              <Row k="Proposed prime cost" v={pct(r.improved.prime)} strong />
              <Row k="Prime-cost improvement" v={pts(r.improvement.totalPts)} />
            </dl>
          </section>
        </div>

        <section className="print-avoid-break mt-4 rounded-ctl bg-brand-soft p-4">
          <H>Potential cost reduction (hypothetical estimate)</H>
          <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
            <div>
              <p className="tabular text-3xl font-extrabold text-brand">{r.sales.resolved ? usd(r.savings.annualTotal) : "—"}</p>
              <p className="text-xs text-muted">per year</p>
            </div>
            <div>
              <p className="tabular text-xl font-extrabold">{r.sales.resolved ? usd(r.savings.monthlyTotal) : "—"}</p>
              <p className="text-xs text-muted">per month</p>
            </div>
            <p className="tabular text-xs text-muted">
              {r.locations > 1 && <>{usd(r.savings.perLocationAnnual)}/yr per location</>}
            </p>
          </div>
          <div className="mt-3">
            <div
              role="img"
              aria-label={`Food ${foodPct} percent, labor ${laborPct} percent of the modeled opportunity`}
              className="flex h-2.5 overflow-hidden rounded-full bg-rule"
            >
              <div className="bg-brand" style={{ width: `${foodPct}%` }} />
              <div className="bg-teal" style={{ width: `${laborPct}%` }} />
            </div>
            <p className="tabular mt-1 text-xs">
              <span className="font-semibold">Food</span> {usd(r.savings.annualFood)}/yr ({foodPct}%) ·{" "}
              <span className="font-semibold">Labor</span> {usd(r.savings.annualLabor)}/yr ({laborPct}%)
            </p>
          </div>
        </section>

        <section className="print-avoid-break mt-4 text-sm">
          <H>Financial health vs. published peer medians</H>
          <ul className="grid gap-x-6 gap-y-1 md:grid-cols-2">
            {health.rows
              .filter((x) => !(x.id === "pretax" && hp.status === "unknown"))
              .map((x) => (
                <li key={x.id} className="flex justify-between gap-3 text-xs">
                  <span>
                    <span className="font-semibold">{x.label}</span>{" "}
                    <span className="tabular">{x.valuePct === null ? "not entered" : pct(x.valuePct)}</span>
                  </span>
                  <span className="text-right text-muted">
                    {PEER_LABEL[x.status]}
                    {x.stat && x.deltaPts !== null && (
                      <span className="tabular">
                        {" "}
                        ({x.deltaPts >= 0 ? "+" : "−"}
                        {Math.abs(x.deltaPts).toFixed(1)} pts vs. {x.stat.value.toFixed(1)}%{x.stat.subSegment ? ", " + BAND_LABEL[x.stat.subSegment] : ""})
                      </span>
                    )}
                  </span>
                </li>
              ))}
          </ul>
          <p className="mt-1 text-xs">
            <span className="font-semibold">Profitability:</span> {hp.label}
            {hp.status !== "unknown" && (
              <span className="tabular">
                {" "}
                — pretax {hp.direction === "loss" ? "loss" : hp.direction === "profit" ? "profit" : "break-even"} {usd(hp.pretaxAnnual)}/yr ({pct(hp.marginPct ?? 0)} of net sales)
              </span>
            )}
            . Prime cost alone does not show profitability.
          </p>
          {hp.status !== "unknown" && (
            <p className="text-[11px] text-muted">Assumptions: {hp.assumptions.join(" ")}</p>
          )}
          <p className="mt-1 text-[11px] text-muted">
            {nearNote(health.windowPts)} Medians: {NRA_SOURCE.publisher} 2025 abstract ({NRA_SOURCE.dataPeriod}); not targets; the food median covers food and nonalcoholic beverage cost only; supplied by the SpotOn team, not independently checked.
            {health.rows.some((x) => x.qualification) && " " + [...new Set(health.rows.map((x) => x.qualification).filter(Boolean))].join(" ")}
          </p>
        </section>

        <div className="mt-4 grid gap-5 text-sm md:grid-cols-2">
          <section className="print-avoid-break">
            <H>Operational improvements to validate</H>
            <ul className="list-disc pl-5 text-xs">
              {rep.coaching.validate.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </section>
          <section className="print-avoid-break">
            <H>Relevant solutions (possibilities)</H>
            {sols.length === 0 ? (
              <p className="text-xs text-muted">None selected.</p>
            ) : (
              <ul className="list-disc pl-5 text-xs">
                {sols.map((x) => (
                  <li key={x.solution.id}>
                    <strong>{x.solution.name}</strong> <span className="text-muted">— {x.solution.costDriver}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-1 text-[11px] text-muted">{OVERLAP_NOTE}</p>
          </section>
        </div>

        <div className="mt-4 grid gap-5 text-sm md:grid-cols-2">
          <section className="print-avoid-break">
            <H>Key assumptions</H>
            <ul className="list-disc pl-5 text-xs">
              {keyAssumptions(s, r).map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </section>
          <section className="print-avoid-break">
            <H>Requires validation</H>
            <ul className="list-disc pl-5 text-xs">
              {validationItems(s, r).map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </section>
        </div>
        <p className="mt-4 border-t border-rule pt-2 text-[11px] leading-snug text-muted">
          {SOLUTIONS_DISCLAIMER} This is a consultative estimate, not a quote, proposal or guarantee of savings.
        </p>
      </article>

      <section className="no-print mt-8" aria-labelledby="hs-ref">
        <h2 id="hs-ref" className="sr-only">Customer proof, Hospitality Specialist reference</h2>
        <SectionHeader
          title="Customer proof · Hospitality Specialist reference"
          description="For your own preparation. Not included in the printed summary or the copied text."
        />
        <CaseStudyGrid matches={rep.proofPoints} />
        <p className="mt-2 text-xs text-muted">{PROOF_DISCLAIMER}</p>
      </section>

      <div className="no-print mt-8 grid gap-6">
        <ContentCard>
          <SectionHeader title="Scenarios" description="Saved in this browser only (localStorage)." />
          <div className="flex flex-wrap gap-2">
            <SecondaryButton onClick={saveNamed}>
              <Save className="h-4 w-4" aria-hidden /> Save current scenario
            </SecondaryButton>
            <SecondaryButton onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden /> Start over
            </SecondaryButton>
          </div>
          {saved.length > 0 ? (
            <ul className="mt-4 divide-y divide-rule rounded-ctl border border-rule">
              {saved.map((x) => (
                <li key={x.id} className="flex items-center justify-between gap-2 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{x.scenario.scenarioName || "Untitled"}</p>
                    <p className="truncate text-xs text-muted">
                      {x.scenario.restaurantName || "Unnamed"} · {new Date(x.savedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <SecondaryButton size="sm" onClick={() => loadSavedScenario(x.id)}>
                      Load
                    </SecondaryButton>
                    <GhostButton size="sm" aria-label={`Delete ${x.scenario.scenarioName || "scenario"}`} onClick={() => deleteSaved(x.id)}>
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </GhostButton>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">No saved scenarios yet.</p>
          )}
        </ContentCard>
      </div>
      <StepFooter backHref="/solutions" backLabel="Back: Solutions" />
    </>
  );
}
