/**
 * Text for the Sam (SpotOn Assistant Manager) solution card, tied to the Step 1 focus.
 * Public-facing only: it uses statements from SpotOn's press release, makes no claim about plans, users
 * or commercial terms, and never promises what an answer will show. Sam is described as an insight tool.
 */
import { SOLUTION_BY_ID } from "@/config/solutions";
import type { Focus } from "./types";

export interface SamFit {
  headline: string;
  detail: string;
}

/** Questions the announcement lists as common requests. */
export const SAM_EXAMPLE_QUESTIONS = SOLUTION_BY_ID["sam"]!.examples ?? [];

export function samFit(focus: Focus): SamFit {
  const labor = "SpotOn describes Sam as showing where schedules don't match demand";
  const food = "SpotOn describes Sam as showing where costs are climbing and where purchasing doesn't match demand";
  const what = focus === "labor" ? "labor" : focus === "food" ? "food & beverage cost" : "food and labor";
  const claim = focus === "labor" ? labor : focus === "food" ? food : `${food}, and where schedules don't match demand`;
  return {
    headline: `You are looking at ${what}.`,
    detail: `${claim}. It is an insight tool: it helps you see, and does not cut cost by itself.`,
  };
}
