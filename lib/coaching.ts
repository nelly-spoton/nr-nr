/**
 * "What this means for your discovery" content. Built from the scenario and structured evidence;
 * it poses questions and names what to validate rather than scripting a pitch.
 */
import type { ScenarioResult } from "./calc";
import { CONCEPT_BY_ID } from "@/config/concepts";
import { metricQualifier } from "@/config/caseStudies";
import type { CaseMatch } from "./matching";
import type { Profile } from "./profile";
import type { Recommendation } from "./recommend";
import type { Scenario } from "./types";

export const COACHING_PRINCIPLES = [
  "Outcomes Before Products",
  "Profitability Before POS",
  "Questions Before Suggestions",
  "Proof Before Persuasion",
] as const;

export interface Coaching {
  challenge: string;
  missing: string[];
  validate: string[];
  questions: string[];
  changes: string[];
  proof: { text: string; link: string; qualifier: string } | null;
}

export function buildCoaching(
  s: Scenario,
  r: ScenarioResult,
  p: Profile,
  recs: Recommendation[],
  matches: CaseMatch[],
): Coaching {
  const food = r.savings.annualFood;
  const labor = r.savings.annualLabor;
  const total = food + labor;
  const laborShare = total > 0 ? labor / total : 0.5;
  const lean: "labor" | "food" | "balanced" = laborShare > 0.6 ? "labor" : laborShare < 0.4 ? "food" : "balanced";


  const challenge =
    lean === "labor"
      ? "The scenario leans on labor. The open question is whether scheduled hours track expected demand, and whether actual hours match the schedule."
      : lean === "food"
        ? "The scenario leans on food cost. The open question is whether actual food cost tracks what the menu should cost given what is selling."
        : "The scenario splits between food and labor. Establish which lever the operator feels is looser before assuming both.";

  const missing: string[] = [];
  if (r.sales.preliminary) missing.push("A verified monthly net-sales figure (POS report or financial statement).");
  missing.push("Where the food and labor percentages came from (invoices and inventory counts; payroll including taxes and benefits).");
  if (p.locations > 1) missing.push("Whether locations differ; this model assumes equal sales and costs across them.");
  if (CONCEPT_BY_ID[s.concept].alcoholLed && !s.beverageMix.enabled)
    missing.push("Sales mix across food, beer, liquor, wine and other beverage, and the cost of each.");
  if (p.attributes.includes("seasonal")) missing.push("Peak versus off-peak sales and staffing.");
  if (p.attributes.includes("high_delivery")) missing.push("Delivery share of sales. Commission and fee effects are not prime-cost savings here.");

  const validate: string[] = [];
  const questions: string[] = [];
  if (food > 0) {
    validate.push("Actual versus theoretical food cost, and waste, voids and remakes.");
    questions.push("How do you find out today when food cost drifts, and how quickly?");
  }
  if (labor > 0) {
    validate.push("Scheduled versus actual hours, overtime, and sales per labor hour.");
    questions.push("How is the schedule built, and how is it compared with what actually happened?");
  }
  if (!validate.length) validate.push("Choose an improvement on the calculator to see which metric to validate.");
  questions.push("What would you want to measure first to know a change is working?");

  const changes = recs
    .filter((x) => x.tier === "highest")
    .slice(0, 3)
    .map((x) => `${x.solution.name}: ${x.solution.mechanism[0] ?? x.solution.problem}`);

  const top = matches[0];
  const proof = top
    ? {
        text: `${top.study.name} (${top.study.conceptLabel}) published: ${top.study.metric.wording}. ${top.indirect ? "This is indirect evidence, not a cost saving." : ""}`.trim(),
        link: top.study.sourceUrl,
        qualifier: metricQualifier(top.study.metric),
      }
    : null;

  return { challenge, missing, validate, questions, changes, proof };
}
