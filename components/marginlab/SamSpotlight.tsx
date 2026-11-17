"use client";
import { ExternalLink, Sparkles } from "lucide-react";
import { CASE_BY_ID } from "@/config/caseStudies";
import { SOLUTION_BY_ID } from "@/config/solutions";
import { SAM_EXAMPLE_QUESTIONS, samFit } from "@/lib/sam";
import { useScenario } from "./ScenarioProvider";

/** Public links only: SpotOn's press release, SpotOn Intelligence page and help articles, as provided. */
const SPOTON_INTELLIGENCE = "https://www.spoton.com/ai/";
const HELP_MAXIMIZE = "https://help.spoton.com/space/SK/5774213606/Maximize+Your+Insights+with+Sam+%7C+SpotOn+Dashboard";

const link = "inline-flex items-center gap-1 text-sm font-semibold text-lime underline";
const H = ({ children }: { children: string }) => (
  <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-eyebrow-fg">{children}</h3>
);
const Ext = () => (
  <>
    <ExternalLink className="h-3 w-3" aria-hidden />
    <span className="sr-only"> (opens in a new tab)</span>
  </>
);

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
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-eyebrow-fg">SpotOn Assistant Manager · part of SpotOn Intelligence</span>
      </div>
      <h2 id="sam" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Meet Sam, SpotOn&apos;s first AI agent</h2>
      <p className="mt-1 max-w-3xl text-sm text-hero-sub sm:text-base">
        Operators ask about sales, labor, purchasing and costs in plain language and get answers in seconds, and have custom reports built for them, from
        the dashboard, the mobile app or by text.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-card bg-white/10 p-4">
          <H>Why it fits your answers</H>
          <p className="mt-1 text-sm font-semibold">{fit.headline}</p>
          <p className="mt-1 text-sm text-hero-sub">{fit.detail}</p>
          <p className="mt-2 text-xs text-hero-sub">
            It draws on SpotOn sales, labor, kitchen display and guest data plus third-party sources such as local events, weather and reviews.
          </p>
        </div>

        <div className="rounded-card bg-white/10 p-4">
          <H>What operators ask</H>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {SAM_EXAMPLE_QUESTIONS.map((q) => (
              <li key={q}>“{q}”</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-hero-sub">Common requests listed in SpotOn&apos;s announcement. Not a promise of any particular answer.</p>
        </div>

        {proof && (
          <div className="rounded-card bg-white/10 p-4">
            <H>One restaurant&apos;s result</H>
            <p className="mt-1 text-sm font-semibold">
              {proof.name}, {proof.locationText}
            </p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
              <li>{proof.metric.wording}</li>
              {proof.additionalMetrics?.map((m) => (
                <li key={m.wording}>{m.wording}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-hero-sub">
              Started with labor at 44% of sales, food cost at 30% and prime cost at 74%, against a goal of 63%.
            </p>
            <p className="mt-2 text-xs text-hero-sub">
              From the announcement. It doesn&apos;t say what period the $124,000 covers, or whether the 3.5% is points of sales or a relative drop. One
              restaurant&apos;s result, not a prediction for yours.
            </p>
            <a href={proof.sourceUrl} target="_blank" rel="noopener noreferrer" className={link + " mt-1"}>
              Read the announcement <Ext />
            </a>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p className="text-xs text-hero-sub">
          <strong className="text-white">Check first:</strong> {sam.requirements.join(". ")}.
        </p>
        <p className="flex flex-wrap gap-x-5 gap-y-1">
          <a href={SPOTON_INTELLIGENCE} target="_blank" rel="noopener noreferrer" className={link}>
            SpotOn Intelligence <Ext />
          </a>
          <a href={sam.link.url} target="_blank" rel="noopener noreferrer" className={link}>
            Sam help article <Ext />
          </a>
          <a href={HELP_MAXIMIZE} target="_blank" rel="noopener noreferrer" className={link}>
            Maximize your insights with Sam <Ext />
          </a>
        </p>
      </div>
    </section>
  );
}
