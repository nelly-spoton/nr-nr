"use client";
import { ExternalLink, Sparkles } from "lucide-react";
import { SOLUTION_BY_ID } from "@/config/solutions";
import { samFit } from "@/lib/sam";
import { useScenario } from "./ScenarioProvider";

/** Public links only: SpotOn's press release and help articles, as provided. */
const ANNOUNCEMENT =
  "https://www.businesswire.com/news/home/20261117137877/en/SpotOn-Introduces-SpotOn-Assistant-Manager-an-AI-Agent-that-Helped-a-Texas-Restaurant-Save-More-than-%24124000";
const HELP_MAXIMIZE = "https://help.spoton.com/space/SK/5774213606/Maximize+Your+Insights+with+Sam+%7C+SpotOn+Dashboard";

const link = "inline-flex items-center gap-1 text-sm font-semibold text-lime underline";

/** New SpotOn product, shown first on the Solutions step with how it relates to the answers given. */
export function SamSpotlight() {
  const { scenario } = useScenario();
  const sam = SOLUTION_BY_ID["sam"];
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
      <h2 id="sam" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Meet Sam, SpotOn&apos;s AI assistant manager</h2>
      <p className="mt-1 max-w-3xl text-sm text-hero-sub sm:text-base">
        An AI assistant in the SpotOn Dashboard. Ask about your restaurant&apos;s numbers in plain language and get an answer, instead of digging through reports.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-card bg-white/10 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-eyebrow-fg">Why it fits your answers</h3>
          <p className="mt-1 text-sm font-semibold">{fit.headline}</p>
          <p className="mt-1 text-sm text-hero-sub">{fit.detail}</p>
        </div>
        <div className="rounded-card bg-white/10 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-eyebrow-fg">Learn more</h3>
          <ul className="mt-2 grid gap-2">
            <li>
              <a href={sam.link.url} target="_blank" rel="noopener noreferrer" className={link}>
                Sam: Your Conversational AI Assistant <ExternalLink className="h-3 w-3" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a href={HELP_MAXIMIZE} target="_blank" rel="noopener noreferrer" className={link}>
                Maximize Your Insights with Sam <ExternalLink className="h-3 w-3" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
          <p className="mt-2 text-xs text-hero-sub">SpotOn Dashboard help articles.</p>
        </div>
        <div className="rounded-card bg-white/10 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-eyebrow-fg">In the announcement</h3>
          <p className="mt-1 text-sm font-semibold">An AI agent that helped a Texas restaurant save more than $124,000</p>
          <p className="mt-1 text-xs text-hero-sub">
            From the announcement&apos;s headline. What was saved, over what period, and how it was measured are not captured here. One restaurant&apos;s result,
            not a prediction for yours.
          </p>
          <a href={ANNOUNCEMENT} target="_blank" rel="noopener noreferrer" className={link + " mt-1"}>
            Read the announcement <ExternalLink className="h-3 w-3" aria-hidden />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>

      <p className="mt-4 text-xs text-hero-sub">
        <strong className="text-white">Check first:</strong> {sam.requirements.join(". ")}.
      </p>
    </section>
  );
}
