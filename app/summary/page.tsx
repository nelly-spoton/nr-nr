"use client";
import { Check, Copy, Printer, RotateCcw, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CONCEPT_LABELS, NRA_SOURCE, PLANNING_NOTE, medianSetFor } from "@/config/benchmarks";
import { OVERLAP_NOTE, SOLUTIONS_DISCLAIMER } from "@/config/solutions";
import { GhostButton, PrimaryButton, SecondaryButton } from "@/components/marginlab/Buttons";
import { Badge, ContentCard, PageHeader, SectionHeader } from "@/components/marginlab/Cards";
import { useScenario } from "@/components/marginlab/ScenarioProvider";
import { RANGE_STATUS_LABEL, compareAll } from "@/lib/calc";
import { pct, pts, usd } from "@/lib/format";
import {
  SALES_STATUS_LABEL,
  buildSummaryText,
  keyAssumptions,
  selectedSolutions,
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
  const cmp = compareAll(r, s.planning[s.concept]);
  const med = medianSetFor(s.concept);
  const sols = selectedSolutions(s);
  const cmpText = (k: "food" | "labor" | "prime") => (cmp[k] === "unset" ? "No range set" : RANGE_STATUS_LABEL[cmp[k]]);

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

  return (
    <>
      <PageHeader
        title="Operator Summary"
        description="A one-page financial snapshot to copy, print or save as PDF. Nothing is uploaded; inputs stay in this browser."
        actions={
          <>
            <PrimaryButton onClick={() => window.print()}>
              <Printer className="h-4 w-4" aria-hidden /> Print / Save PDF
            </PrimaryButton>
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
              Food {usd(r.savings.annualFood)}/yr · Labor {usd(r.savings.annualLabor)}/yr
              {r.locations > 1 && <> · {usd(r.savings.perLocationAnnual)}/yr per location</>}
            </p>
          </div>
        </section>

        <div className="mt-4 grid gap-5 text-sm md:grid-cols-2">
          <section className="print-avoid-break">
            <H>Benchmark context</H>
            <dl>
              <Row k="Food vs planning range" v={cmpText("food")} />
              <Row k="Labor vs planning range" v={cmpText("labor")} />
              <Row k="Prime vs planning range" v={cmpText("prime")} />
            </dl>
            <p className="mt-1 text-xs text-muted">
              {med
                ? `Published medians (${med.label}): food ${pct(med.foodPct)}, labor ${pct(med.laborPct)}. `
                : "No published benchmark applied to this concept. "}
              {NRA_SOURCE.publisher}, {NRA_SOURCE.title} ({NRA_SOURCE.dataPeriod}). Medians, not targets; food figure excludes
              alcoholic beverage cost.
            </p>
          </section>
          <section className="print-avoid-break">
            <H>Relevant solutions (possibilities)</H>
            {sols.length === 0 ? (
              <p className="text-xs text-muted">None selected.</p>
            ) : (
              <ul className="list-disc pl-5">
                {sols.map((x) => (
                  <li key={x.id}>
                    <strong>{x.name}</strong> <span className="text-muted">— {x.mechanism[0]}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-1 text-xs text-muted">{OVERLAP_NOTE}</p>
          </section>
        </div>

        <div className="mt-4 grid gap-5 text-sm md:grid-cols-2">
          <section className="print-avoid-break">
            <H>Key assumptions</H>
            <ul className="list-disc pl-5 text-xs">
              {keyAssumptions(s).map((x) => (
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
          {PLANNING_NOTE} {SOLUTIONS_DISCLAIMER} This is a consultative estimate, not a quote, proposal or guarantee of savings.
        </p>
      </article>

      <div className="no-print mt-8 grid gap-6 lg:grid-cols-2">
        <ContentCard>
          <SectionHeader title="Scenarios" description="Saved in this browser only (localStorage)." />
          <div className="flex flex-wrap gap-2">
            <SecondaryButton onClick={saveNamed}>
              <Save className="h-4 w-4" aria-hidden /> Save current scenario
            </SecondaryButton>
            <SecondaryButton onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden /> Reset to example
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
        <ContentCard tone="muted">
          <SectionHeader title="Plain-text version" description="This is what “Copy summary” places on the clipboard." />
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap text-xs leading-relaxed">{text}</pre>
        </ContentCard>
      </div>
    </>
  );
}
