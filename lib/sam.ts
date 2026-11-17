/**
 * Text for the Sam (SpotOn Assistant Manager) spotlight, tied to the Step 1 focus.
 * Public-facing only: it makes no claim about data sources, plans, users or commercial terms, and it never
 * promises what an answer will show. Sam is described as an insight tool, not a cost lever.
 */
import type { Focus } from "./types";

export interface SamFit {
  headline: string;
  detail: string;
}

export function samFit(focus: Focus): SamFit {
  const what = focus === "labor" ? "labor" : focus === "food" ? "food & beverage cost" : "food and labor";
  return {
    headline: `You are looking at ${what}.`,
    detail: `Sam can help an owner or manager see what is changing in the numbers behind ${focus === "both" ? "them" : "it"} by asking in plain language. It is an insight tool: it helps you see, and does not cut cost by itself.`,
  };
}
