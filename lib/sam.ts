/**
 * Content for the Sam (SpotOn Assistant Manager) spotlight, tied to what was entered in Step 1.
 * Example questions only use the data Sam is described as covering (sales, labor, guests, reviews,
 * kitchen and menus). Nothing here is a promise about what an answer will show.
 */
import type { Focus } from "./types";

export interface SamFit {
  headline: string;
  detail: string;
  prompts: string[];
}

export function samFit(focus: Focus): SamFit {
  const labor = [
    "How has my labor cost trended week by week?",
    "Which days have the highest labor compared with sales?",
  ];
  const food = [
    "What were my best- and worst-selling menu items last month?",
    "How many of a specific item did I sell last week?",
  ];
  const reviews = ["What are guests saying in my recent reviews?"];

  if (focus === "labor")
    return {
      headline: "You are looking at labor.",
      detail: "Sam can answer labor questions from the POS and from Teamwork or 7shifts, so a manager can see what changed without building a report.",
      prompts: [...labor, ...reviews],
    };
  if (focus === "food")
    return {
      headline: "You are looking at food & beverage cost.",
      detail: "Sam covers sales and menu questions today. Questions about cost of goods depend on inventory and accounting data being connected; confirm what is live.",
      prompts: [...food, ...reviews],
    };
  return {
    headline: "You are looking at both food and labor.",
    detail: "Sam answers across sales, labor, guests and menus in one place. Cost-of-goods questions depend on inventory and accounting data being connected; confirm what is live.",
    prompts: [labor[0]!, food[0]!, ...reviews],
  };
}
