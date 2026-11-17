/**
 * Structured SpotOn solution & integration-partner mapping. One record per product; a product
 * carries outcome tags (food/labor/visibility) instead of being duplicated across sections.
 * Everything here is a POSSIBILITY, never a guaranteed outcome.
 *
 * LINKS: deep product links could not be verified when this was written (network policy), so
 * `link.status` is "vendor_home". `npm run verify:sources` checks them where the network allows;
 * replace the URL and set status to "verified_product_page" only after checking.
 */
import type { AttributeId, ServiceModel } from "@/config/concepts";

export type Objective = "food" | "labor" | "visibility";
export type Influence = "food" | "labor" | "both" | "insight";
export type Nature = "workflow" | "insight";

export interface Solution {
  id: string;
  name: string;
  kind: "spoton" | "partner";
  /** Outcome tags (not separate cards). */
  objectives: Objective[];
  problem: string;
  mechanism: string[];
  /** The cost driver this may influence. */
  costDriver: string;
  influences: Influence;
  nature: Nature;
  requirements: string[];
  link: { url: string; status: "vendor_home" | "provided_link" | "verified_product_page" };
  /** Service models this is designed for. "mixed" concepts match any. */
  serviceModels: ServiceModel[];
  /** Why it is not recommended when the service model does not fit. */
  poorFitReason: string;
  /** Attributes that make it more relevant. */
  attributeBoost: AttributeId[];
  /** Shown as a spotlight on the Solutions step instead of in the ranked lists. */
  featured?: boolean;
  /** Set when the product is for merchants who already use it; the text says what to position instead. */
  existingOnly?: string;
}

export const SOLUTIONS_DISCLAIMER =
  "Exact compatibility and availability require verification. Product mappings are possibilities, not guaranteed outcomes; purchasing a product does not automatically produce savings.";

export const OVERLAP_NOTE =
  "Several products may contribute to the same improvement target. Do not attribute one cost improvement to multiple products and add the results together.";

export const OBJECTIVE_LABELS: Record<Objective, string> = {
  food: "Food & beverage cost",
  labor: "Labor cost",
  visibility: "Visibility",
};

export const INFLUENCE_LABELS: Record<Influence, string> = {
  food: "Food & beverage cost",
  labor: "Labor cost",
  both: "Food and labor cost",
  insight: "Visibility into both (no direct cost lever)",
};

const SPOTON = "https://www.spoton.com";
const ALL: ServiceModel[] = ["table", "counter", "bar", "mixed"];

export const SOLUTIONS: Solution[] = [
  {
    id: "spoton-pos-reporting",
    name: "SpotOn POS Reporting",
    kind: "spoton",
    objectives: ["food", "visibility"],
    problem: "Operators lack clear visibility into what is selling and at what mix.",
    mechanism: ["Sales and product-mix visibility", "Helps operators understand what is selling"],
    costDriver: "Menu mix and purchasing decisions (insight only)",
    influences: "insight",
    nature: "insight",
    requirements: ["Merchant runs SpotOn POS", "Confirm report availability by plan"],
    link: { url: SPOTON, status: "vendor_home" },
    serviceModels: ALL,
    poorFitReason: "",
    attributeBoost: [],
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
    costDriver: "Purchasing, waste and recipe-cost variance",
    influences: "food",
    nature: "workflow",
    requirements: [
      "Confirm SpotOn POS integration is available for this merchant",
      "Separate MarginEdge subscription and onboarding",
      "Requires consistent invoice and recipe data entry",
    ],
    link: { url: "https://www.marginedge.com", status: "vendor_home" },
    serviceModels: ALL,
    poorFitReason: "",
    attributeBoost: [],
  },
  {
    id: "restaurant365",
    name: "Restaurant365",
    kind: "partner",
    objectives: ["food", "visibility"],
    problem: "Purchasing, inventory and accounting live in disconnected systems.",
    mechanism: ["Inventory and purchasing workflows", "Accounting and financial reporting", "Multi-location cost visibility"],
    costDriver: "Purchasing and inventory control across locations",
    influences: "food",
    nature: "workflow",
    requirements: [
      "Confirm SpotOn POS integration availability and scope",
      "Separate Restaurant365 subscription; accounting migration effort",
    ],
    link: { url: "https://www.restaurant365.com", status: "vendor_home" },
    serviceModels: ALL,
    poorFitReason: "",
    attributeBoost: ["multi_location"],
  },
  {
    id: "spoton-kds",
    name: "SpotOn KDS / compatible kitchen integrations",
    kind: "spoton",
    objectives: ["food"],
    problem: "Kitchen ticket errors cause remakes and wasted ingredients.",
    mechanism: ["Kitchen ticket accuracy", "Order routing", "Potential reduction of remakes and wasted ingredients"],
    costDriver: "Remakes and ingredient waste",
    influences: "food",
    nature: "workflow",
    requirements: ["Kitchen hardware and screen placement", "Confirm compatibility with existing kitchen equipment"],
    link: { url: SPOTON, status: "vendor_home" },
    serviceModels: ["table", "counter", "mixed"],
    poorFitReason: "Built around a kitchen line; bar-led concepts without a kitchen program have little to route.",
    attributeBoost: ["high_delivery"],
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
    costDriver: "Order errors, voids and remakes; server time per table",
    influences: "both",
    nature: "workflow",
    requirements: ["Best suited to table or bar-side ordering", "Confirm device availability and Wi-Fi coverage"],
    link: { url: SPOTON, status: "vendor_home" },
    serviceModels: ["table", "bar", "mixed"],
    poorFitReason: "Designed for ordering at the guest; counter-service concepts take orders at a register.",
    attributeBoost: ["table_service", "catering_events"],
  },
  {
    id: "spoton-teamwork",
    name: "SpotOn Teamwork",
    kind: "spoton",
    objectives: ["labor"],
    problem: "Schedules are not tied to expected sales, so labor drifts above plan.",
    mechanism: ["Employee scheduling", "Sales-based labor planning", "Time tracking", "Labor cost monitoring"],
    costDriver: "Scheduled versus actual hours, overtime and early clock-ins",
    influences: "labor",
    nature: "workflow",
    requirements: ["Confirm payroll and POS time-clock setup", "Manager adoption of scheduling workflow"],
    link: { url: SPOTON, status: "vendor_home" },
    serviceModels: ALL,
    poorFitReason: "",
    attributeBoost: ["seasonal", "multi_location"],
  },
  {
    id: "7shifts",
    name: "7shifts",
    kind: "partner",
    objectives: ["labor"],
    problem: "Scheduling is manual and not informed by forecasted demand.",
    mechanism: ["Scheduling and labor forecasting", "Sales-data integration with SpotOn", "Labor management workflows"],
    costDriver: "Over- and under-scheduling against forecast demand",
    influences: "labor",
    nature: "workflow",
    requirements: [
      "Confirm SpotOn sales-data integration is available for this merchant",
      "Separate 7shifts subscription",
    ],
    link: { url: "https://www.7shifts.com", status: "vendor_home" },
    serviceModels: ALL,
    poorFitReason: "",
    attributeBoost: ["multi_location", "seasonal"],
  },
  {
    id: "spoton-kiosk",
    name: "SpotOn Kiosk",
    kind: "spoton",
    objectives: ["labor"],
    problem: "Counter staff time is consumed by order-taking at peak.",
    mechanism: ["Self-service ordering for appropriate concepts", "Potential labor redeployment and ordering efficiency"],
    costDriver: "Counter labor at peak order-taking",
    influences: "labor",
    nature: "workflow",
    requirements: ["Appropriate for counter-service formats", "Hardware, space and menu-complexity fit"],
    link: { url: SPOTON, status: "vendor_home" },
    serviceModels: ["counter", "mixed"],
    poorFitReason: "Self-service ordering suits counter formats; table-service and bar-led concepts rarely use it.",
    attributeBoost: ["counter_service"],
  },
  {
    id: "sam",
    name: "Sam (SpotOn Assistant Manager)",
    kind: "spoton",
    objectives: ["visibility"],
    problem: "Owners have no analyst. It takes digging through reports to see what changed and where the money went.",
    mechanism: [
      "A chat assistant in the Dashboard, and by text message",
      "Ask about sales, labor, guests, reviews, kitchen (KDS) and menus; get a plain-language answer in seconds",
      "Saved custom reports, scheduled text recaps and CSV downloads",
      "Answers in the language the question is asked in",
    ],
    costDriver: "Spotting margin leaks sooner: what changed and where the money went (insight, not a direct cost lever)",
    influences: "insight",
    nature: "insight",
    requirements: [
      "SpotOn Restaurant POS or Express, using the SpotOn Dashboard",
      "Used by owners and managers (not shift leads or staff)",
      "Inventory and accounting data may not be connected yet; confirm what is live",
      "Confirm current pricing and availability",
    ],
    // Public help article for Sam, as provided by SpotOn staff; not opened from the build environment.
    link: { url: "https://help.spoton.com/space/SK/5631180809/Sam:+Your+Conversational+AI+Assistant+%7C+SpotOn+Dashboard", status: "provided_link" },
    serviceModels: ALL,
    poorFitReason: "",
    attributeBoost: [],
    featured: true,
  },
  {
    id: "spoton-profit-ai",
    name: "SpotOn Profit AI",
    kind: "spoton",
    objectives: ["visibility"],
    problem: "Management cannot see what changed in profit from week to week.",
    mechanism: [
      "Weekly insight cards on the Dashboard homepage that show what changed and why",
      "Works alongside Sam, so answers sit next to the insights",
      "Accounting analysis with QuickBooks Online, Xero and Restaurant365",
    ],
    costDriver: "Week-to-week changes in the drivers of profit (insight only)",
    influences: "insight",
    nature: "insight",
    requirements: [
      "SpotOn Restaurant POS or Express",
      "Offered in beta; confirm availability and terms",
      "Accounting analysis needs a connected accounting system",
    ],
    link: { url: SPOTON, status: "vendor_home" },
    serviceModels: ALL,
    poorFitReason: "",
    attributeBoost: ["multi_location"],
  },
  {
    id: "spoton-profit-assist",
    name: "SpotOn Profit Assist",
    kind: "spoton",
    objectives: ["visibility", "food"],
    problem: "Management cannot quickly see where P&L opportunities sit across locations.",
    mechanism: [
      "P&L analysis",
      "Accounting integrations with QuickBooks Online, Xero and Restaurant365",
      "Cost anomaly identification",
      "Multi-location performance comparisons",
      "Helps management identify and measure opportunities; does not itself guarantee cost reductions",
    ],
    costDriver: "Cost anomalies visible in the P&L (insight only)",
    existingOnly: "For merchants already using it. For new merchants, position Profit AI and Sam instead.",
    influences: "insight",
    nature: "insight",
    requirements: ["Connected accounting system (QuickBooks Online, Xero or Restaurant365)", "Confirm availability"],
    link: { url: SPOTON, status: "vendor_home" },
    serviceModels: ALL,
    poorFitReason: "",
    attributeBoost: ["multi_location"],
  },
  {
    id: "spoton-reporting",
    name: "SpotOn Reporting",
    kind: "spoton",
    objectives: ["visibility"],
    problem: "Sales and operations trends are not visible in one place.",
    mechanism: ["Sales and operations visibility", "Trend monitoring", "Location comparison where supported"],
    costDriver: "Trend and location variance (insight only)",
    influences: "insight",
    nature: "insight",
    requirements: ["Merchant runs SpotOn POS", "Confirm multi-location comparison support"],
    link: { url: SPOTON, status: "vendor_home" },
    serviceModels: ALL,
    poorFitReason: "",
    attributeBoost: ["multi_location"],
  },
];

export const SOLUTION_BY_ID: Record<string, Solution> = Object.fromEntries(SOLUTIONS.map((s) => [s.id, s]));
