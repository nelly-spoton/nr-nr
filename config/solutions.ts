/**
 * Structured SpotOn solution & integration-partner mapping. Edit this file to change
 * what the app shows. Everything here is a POSSIBILITY, never a guaranteed outcome.
 *
 * NOTE: `sourceUrl` values point to vendor home pages because deep links could not be
 * verified when this file was written. Replace with product pages after confirming.
 */
export type Objective = "food" | "labor" | "visibility";
export type Influence = "food" | "labor" | "both" | "insight";
export type Nature = "workflow" | "insight";

export interface Solution {
  id: string;
  name: string;
  kind: "spoton" | "partner";
  /** Business objectives it appears under (a product may appear under more than one). */
  objectives: Objective[];
  problem: string;
  mechanism: string[];
  influences: Influence;
  nature: Nature;
  /** Eligibility / integration requirements to confirm before positioning. */
  requirements: string[];
  sourceUrl: string;
  /** Concept types where this is typically relevant; empty = all. */
  conceptFit?: Array<"full_service" | "quick_service" | "bar" | "custom">;
}

export const SOLUTIONS_DISCLAIMER =
  "Exact compatibility and availability require verification. Product mappings are possibilities, not guaranteed outcomes; purchasing a product does not automatically produce savings.";

export const OVERLAP_NOTE =
  "Several products may contribute to the same improvement target. Do not attribute one cost improvement to multiple products and add the results together.";

export const OBJECTIVE_LABELS: Record<Objective, string> = {
  food: "Food & Beverage Cost Control",
  labor: "Labor Cost Control",
  visibility: "Financial Visibility",
};

export const INFLUENCE_LABELS: Record<Influence, string> = {
  food: "Food & beverage cost",
  labor: "Labor cost",
  both: "Food and labor cost",
  insight: "Visibility into both (no direct cost lever)",
};

const SPOTON = "https://www.spoton.com";

export const SOLUTIONS: Solution[] = [
  {
    id: "spoton-pos-reporting",
    name: "SpotOn POS Reporting",
    kind: "spoton",
    objectives: ["food"],
    problem: "Operators lack clear visibility into what is selling and at what mix.",
    mechanism: ["Sales and product-mix visibility", "Helps operators understand what is selling"],
    influences: "food",
    nature: "insight",
    requirements: ["Merchant runs SpotOn POS", "Confirm report availability by plan"],
    sourceUrl: SPOTON,
  },
  {
    id: "marginedge",
    name: "MarginEdge",
    kind: "partner",
    objectives: ["food"],
    problem: "Invoice handling and food-cost variance are hard to see until month-end.",
    mechanism: [
      "Invoice processing",
      "Inventory and recipe costing",
      "Actual versus theoretical food cost",
      "Potential identification of waste and cost variance",
    ],
    influences: "food",
    nature: "workflow",
    requirements: [
      "Confirm SpotOn POS integration is available for this merchant",
      "Separate MarginEdge subscription and onboarding",
      "Requires consistent invoice and recipe data entry",
    ],
    sourceUrl: "https://www.marginedge.com",
  },
  {
    id: "restaurant365",
    name: "Restaurant365",
    kind: "partner",
    objectives: ["food", "visibility"],
    problem: "Purchasing, inventory and accounting live in disconnected systems.",
    mechanism: [
      "Inventory and purchasing workflows",
      "Accounting and financial reporting",
      "Multi-location cost visibility",
    ],
    influences: "food",
    nature: "workflow",
    requirements: [
      "Confirm SpotOn POS integration availability and scope",
      "Separate Restaurant365 subscription; accounting migration effort",
    ],
    sourceUrl: "https://www.restaurant365.com",
  },
  {
    id: "spoton-kds",
    name: "SpotOn KDS / compatible kitchen integrations",
    kind: "spoton",
    objectives: ["food"],
    problem: "Kitchen ticket errors cause remakes and wasted ingredients.",
    mechanism: ["Kitchen ticket accuracy", "Order routing", "Potential reduction of remakes and wasted ingredients"],
    influences: "food",
    nature: "workflow",
    requirements: ["Kitchen hardware and screen placement", "Confirm compatibility with existing kitchen equipment"],
    sourceUrl: SPOTON,
  },
  {
    id: "spoton-handhelds",
    name: "SpotOn Handhelds",
    kind: "spoton",
    objectives: ["food", "labor"],
    problem: "Manual order entry slows service and introduces errors, voids and remakes.",
    mechanism: [
      "Tableside order accuracy",
      "Reduced manual order-entry steps",
      "Potential reduction in errors, voids and remakes",
      "More productive use of staff time",
    ],
    influences: "both",
    nature: "workflow",
    requirements: ["Best suited to table-service workflows", "Confirm device availability and Wi-Fi coverage"],
    sourceUrl: SPOTON,
    conceptFit: ["full_service", "bar", "custom"],
  },
  {
    id: "spoton-teamwork",
    name: "SpotOn Teamwork",
    kind: "spoton",
    objectives: ["labor"],
    problem: "Schedules are not tied to expected sales, so labor drifts above plan.",
    mechanism: ["Employee scheduling", "Sales-based labor planning", "Time tracking", "Labor cost monitoring"],
    influences: "labor",
    nature: "workflow",
    requirements: ["Confirm payroll and POS time-clock setup", "Manager adoption of scheduling workflow"],
    sourceUrl: SPOTON,
  },
  {
    id: "7shifts",
    name: "7shifts",
    kind: "partner",
    objectives: ["labor"],
    problem: "Scheduling is manual and not informed by forecasted demand.",
    mechanism: ["Scheduling and labor forecasting", "Sales-data integration with SpotOn", "Labor management workflows"],
    influences: "labor",
    nature: "workflow",
    requirements: [
      "Confirm SpotOn sales-data integration is available for this merchant",
      "Separate 7shifts subscription",
    ],
    sourceUrl: "https://www.7shifts.com",
  },
  {
    id: "spoton-kiosk",
    name: "SpotOn Kiosk",
    kind: "spoton",
    objectives: ["labor"],
    problem: "Counter staff time is consumed by order-taking at peak.",
    mechanism: ["Self-service ordering for appropriate concepts", "Potential labor redeployment and ordering efficiency"],
    influences: "labor",
    nature: "workflow",
    requirements: ["Appropriate for counter-service / fast-casual formats", "Hardware, space and menu-complexity fit"],
    sourceUrl: SPOTON,
    conceptFit: ["quick_service", "custom"],
  },
  {
    id: "spoton-profit-assist",
    name: "SpotOn Profit Assist",
    kind: "spoton",
    objectives: ["visibility"],
    problem: "Management cannot quickly see where P&L opportunities sit across locations.",
    mechanism: [
      "P&L analysis",
      "Accounting integrations with QuickBooks Online, Xero and Restaurant365",
      "Cost anomaly identification",
      "Multi-location performance comparisons",
      "Helps management identify and measure opportunities; does not itself guarantee cost reductions",
    ],
    influences: "insight",
    nature: "insight",
    requirements: ["Connected accounting system (QuickBooks Online, Xero or Restaurant365)", "Confirm availability"],
    sourceUrl: SPOTON,
  },
  {
    id: "spoton-reporting",
    name: "SpotOn Reporting",
    kind: "spoton",
    objectives: ["visibility"],
    problem: "Sales and operations trends are not visible in one place.",
    mechanism: ["Sales and operations visibility", "Trend monitoring", "Location comparison where supported"],
    influences: "insight",
    nature: "insight",
    requirements: ["Merchant runs SpotOn POS", "Confirm multi-location comparison support"],
    sourceUrl: SPOTON,
  },
];

/** Default solution selection for new scenarios. */
export const DEFAULT_SELECTED_IDS = [
  "marginedge",
  "spoton-handhelds",
  "spoton-teamwork",
  "7shifts",
  "spoton-profit-assist",
];

export function solutionsFor(objective: Objective): Solution[] {
  return SOLUTIONS.filter((s) => s.objectives.includes(objective));
}
