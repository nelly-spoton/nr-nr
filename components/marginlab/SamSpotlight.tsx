"use client";
import { ExternalLink, Sparkles } from "lucide-react";
import { CASE_BY_ID, metricQualifier } from "@/config/caseStudies";
import { SOLUTION_BY_ID } from "@/config/solutions";
import { samFit } from "@/lib/sam";
import { useScenario } from "./ScenarioProvider";

/** New SpotOn product, shown first on the Solutions step with how it relates to the answers given. */
export function SamSpotlight() {
  const { scenario } = useScenario();
  const sam = SOLUTION_BY_ID["sam"];
  const proof = CASE_BY_ID["weinbergers-deli"];
  if (!sam) return null;
  const fit = samFit(scenario.focus);
  return (
    <section aria-labelledby="sam" className="mb-6 overflow-hidden rounded-hero bg-[image:var(--hero-gradient)] p-5 text-white sm:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-lime px-3 py-1 text-xs font-semibold text-ink">
          <Sparkles className="h-3.5 w-3.5" aria-hidden /> New
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-eyebrow-fg">SpotOn Assistant Manager</span>
      </div>
      <h2 id="sam" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Meet Sam: ask a question about your numbers, get an answer in seconds</h2>
      <p className="mt-1 max-w-3xl text-sm text-hero-sub sm:text-base">
        A chat assistant in the SpotOn Dashboard, and by text. Owners and managers ask about sales, labor, guests, reviews, the kitchen and menus,
        and build custom reports, without digging through screens or hiring an analyst.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-card bg-white/10 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-eyebrow-fg">Why it fits your answers</h3>
          <p className="mt-1 text-sm font-semibold">{fit.headline}</p>
          <p className="mt-1 text-sm text-hero-sub">{fit.detail}</p>
        </div>
        <div className="rounded-card bg-white/10 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-eyebrow-fg">Questions to try</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {fit.prompts.map((p) => (
              <li key={p}>“{p}”</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-hero-sub">Examples of the kind of question, not a guarantee of any answer.</p>
        </div>
        {proof && (
          <div className="rounded-card bg-white/10 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-eyebrow-fg">One restaurant&apos;s result</h3>
            <p className="mt-1 text-sm font-semibold">{proof.name}</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
              <li>{proof.metric.wording}</li>
              {proof.additionalMetrics?.map((m) => (
                <li key={m.wording}>{m.wording}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-hero-sub">{metricQualifier(proof.additionalMetrics?.[0] ?? proof.metric)} Not a prediction for your restaurant.</p>
            <a href={proof.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-lime underline">
              Read the announcement <ExternalLink className="h-3 w-3" aria-hidden />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-hero-sub">
        <p>
          <strong className="text-white">Check first:</strong> {sam.requirements[0]}. {sam.requirements[1]}. {sam.requirements[3]}.
        </p>
        <a href={sam.link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-lime underline">
          Help article <ExternalLink className="h-3 w-3" aria-hidden />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </section>
  );
}
