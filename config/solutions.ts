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
export type Influence = "food" | "labor" | "both" | "insight" | "efficiency" | "guest" | "admin";
export type Nature = "workflow" | "insight" | "efficiency";

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
  /** New product: always listed under "Best fit" on the Solutions step, in the same card format as the rest, with a "New" tag. */
  featured?: boolean;
  /** Example requests, shown under "More details". */
  examples?: string[];
  /** Figures SpotOn publishes about this product, shown with their source. Never fed into the calculator. */
  claims?: string[];
  /** Extra public links shown under "More details". */
  moreLinks?: { label: string; url: string }[];
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
  efficiency: "Time saved on menu changes (no direct cost lever)",
  guest: "Checkout speed and guest reviews (no direct cost lever)",
  admin: "Tip admin time and payout speed (no direct cost lever)",
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
      "Separate MarginEdge account and onboarding",
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
      "Separate Restaurant365 account; accounting migration effort",
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
      "Separate 7shifts account and onboarding",
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
    id: "spoton-profit-assist",
    name: "SpotOn Profit Assist",
    kind: "spoton",
    objectives: ["food"],
    problem: "Waste, cost spikes and errors hide in the P&L, and reviewing it line by line takes time.",
    mechanism: [
      "Connects to accounting software (QuickBooks Online, Restaurant365 or Xero) and pulls in the financial data",
      "Uses AI to scan the P&L for waste, spikes and errors, at one location or many",
      "A monthly email with the top takeaways and a link to suggested tasks in the dashboard",
      "Each task shows the issue, what it is costing and tips on how to fix it",
    ],
    costDriver: "Overbuying, cost spikes and bookkeeping errors found in the P&L",
    influences: "food",
    nature: "workflow",
    requirements: [
      "Needs an accounting system to connect (QuickBooks Online, Restaurant365 or Xero)",
      "Someone has to act on the suggested tasks",
      "SpotOn states setup takes about two minutes and the first report arrives in under a week",
      "Confirm availability for this merchant",
    ],
    // Public product page, text supplied by SpotOn; not opened from the build environment.
    link: { url: "https://www.spoton.com/solutions/profitability-analysis-software/", status: "provided_link" },
    serviceModels: ALL,
    poorFitReason: "",
    attributeBoost: ["multi_location"],
  },
  {
    id: "sam",
    name: "Sam (SpotOn Assistant Manager)",
    kind: "spoton",
    objectives: ["visibility"],
    problem: "Owners and managers need quick answers about sales, labor and costs without digging through reports.",
    mechanism: [
      "SpotOn's first AI agent, part of SpotOn Intelligence",
      "Ask questions about sales, labor, purchasing and costs in plain language and get answers in seconds",
      "Custom reports built on request, from the dashboard, the mobile app or by text",
      "Draws on SpotOn sales, labor, kitchen display and guest data plus third-party sources such as local events, weather and reviews",
    ],
    costDriver: "Seeing where costs are climbing and where schedules and purchasing don't match demand (insight, not a direct cost lever)",
    influences: "insight",
    nature: "insight",
    requirements: [
      "Used from the SpotOn dashboard, mobile app or by text",
      "Currently available in English and Spanish",
      "Confirm availability for this merchant",
    ],
    // Public help article, as provided by SpotOn; not opened from the build environment.
    link: { url: "https://help.spoton.com/space/SK/5631180809/Sam:+Your+Conversational+AI+Assistant+%7C+SpotOn+Dashboard", status: "provided_link" },
    examples: ["How are sales today?", "How did this weekend compare with last weekend?", "Who has the highest tip average by server?"],
    moreLinks: [
      { label: "SpotOn Intelligence", url: "https://www.spoton.com/ai/" },
      { label: "Maximize your insights with Sam", url: "https://help.spoton.com/space/SK/5774213606/Maximize+Your+Insights+with+Sam+%7C+SpotOn+Dashboard" },
    ],
    serviceModels: ALL,
    poorFitReason: "",
    attributeBoost: [],
    featured: true,
  },
  {
    id: "spoton-ai-menu-assistant",
    name: "SpotOn AI Menu Assistant",
    kind: "spoton",
    objectives: ["visibility"],
    problem: "Menu changes are made item by item, which is slow when a menu is large or changes often.",
    mechanism: [
      "Built-in AI assistant: type a request and it makes the change across many items",
      "Bulk changes to item amounts, for example “Increase all steak items by 5%”",
      "Bulk edits to names, descriptions and color labels, and finding items, for example everything that has wheat",
      "Changes to categories, modifier groups and discounts, and adding, moving or deleting items",
      "Confirms with you before publishing",
    ],
    costDriver: "Time spent editing the menu by hand (efficiency, not a direct cost lever)",
    influences: "efficiency",
    nature: "efficiency",
    requirements: ["Used inside the SpotOn menu setup", "Confirm availability for this merchant"],
    // Public product page, text supplied by SpotOn; not opened from the build environment.
    link: { url: "https://www.spoton.com/solutions/ai-menu-assistant/", status: "provided_link" },
    examples: ["Increase all steak items by 5%", "Mark all vegan items as olive green", "Merge beer and wine into a drinks category", "Find duplicate modifiers and delete them"],
    serviceModels: ALL,
    poorFitReason: "",
    attributeBoost: [],
  },
  {
    id: "spoton-mobile-pay-review",
    name: "SpotOn Mobile Pay & Review",
    kind: "spoton",
    objectives: ["visibility"],
    problem: "Guests wait for the check and the card, which slows table turns, and few of them leave a review.",
    mechanism: [
      "Guests scan a QR code on a branded table placard, or on the receipt, to open their check",
      "They can split the check, add digital rewards, and pay with Apple Pay, Google Pay or a card",
      "Tip presets or a custom tip; guest contact details are captured with their opt-in",
      "After paying, guests are invited to rate the visit and can post a public Google review",
      "Servers are notified when a payment happens",
    ],
    costDriver: "Slow checkout and table turns, and a thin review stream (guest experience, not a direct cost lever)",
    influences: "guest",
    nature: "efficiency",
    requirements: ["Table service with a check to settle (placards go on tables)", "Available with SpotOn's restaurant POS", "Confirm availability for this merchant"],
    claims: [
      "30% of guests chose to pay by QR code (SpotOn user data, as stated on the product page)",
      "“SpotOn helps us increase sales by 25%.” Breakfast Brothers, Dallas-Fort Worth, on the product page",
    ],
    // Public product page, text supplied by SpotOn; not opened from the build environment.
    link: { url: "https://www.spoton.com/solutions/mobile-pay-and-review/", status: "provided_link" },
    serviceModels: ["table", "bar", "mixed"],
    poorFitReason: "Built around a check settled at the table; counter-service concepts pay at a register.",
    attributeBoost: ["table_service"],
  },
  {
    id: "spoton-tip-management",
    name: "SpotOn Tip Management",
    kind: "spoton",
    objectives: ["labor"],
    problem: "Tip pooling and payouts are done by hand, which takes manager time and invites errors.",
    mechanism: [
      "Built-in tip pooling in the SpotOn POS dashboard, by hours worked, attendance or orders",
      "Tip calculations from the pool rules, and tip reporting kept in one place",
      "Earned tip access (DayCheck) lets employees reach approved tips after shifts",
      "SpotOn Teamwork adds custom tip rules, tip-out and approvals, and syncs tips to payroll",
    ],
    costDriver: "Manager time spent on tip math and payouts (admin work, not a direct cost lever)",
    influences: "admin",
    nature: "efficiency",
    requirements: [
      "Simple setups use the POS dashboard; advanced rules need SpotOn Teamwork",
      "Payouts go to a payroll provider or to employees' DayCheck accounts",
      "Confirm availability for this merchant",
    ],
    claims: [
      "5 days faster tip payout. Coco's Crush Bar, Clearwater, FL, on the product page",
      "2 hours a night saved on admin. The Mudpuppy, Vonore, TN, on the product page",
    ],
    // Public product page, text supplied by SpotOn; not opened from the build environment.
    link: { url: "https://www.spoton.com/solutions/tip-management/", status: "provided_link" },
    serviceModels: ALL,
    poorFitReason: "",
    attributeBoost: ["table_service"],
  },
  {
    id: "spoton-tip-access",
    name: "SpotOn Tip Access (DayCheck)",
    kind: "spoton",
    objectives: ["labor"],
    problem: "Staff wait for payday or for the end of a shift to get their tips, and managers spend time dividing them up.",
    mechanism: [
      "Once tips are approved, they go straight to each employee's DayCheck digital wallet",
      "Tips are calculated from the tip rules set in SpotOn Teamwork",
      "Employees track their tips in the DayCheck mobile app",
      "Employees can send tips to a SpotOn Card or move them to a bank account",
    ],
    costDriver: "Waiting on tip payouts and manager time dividing tips (staff experience and admin, not a direct cost lever)",
    influences: "admin",
    nature: "efficiency",
    requirements: [
      "Works with the tip rules in SpotOn Teamwork",
      "Subject to employer participation, individual eligibility and state availability",
      "Confirm availability for this merchant",
    ],
    claims: [
      "5 days faster tip payout. Coco's Crush Bar, Clearwater, FL, on the product page",
      "Admin time down 2 hours a day. The Mudpuppy, Vonore, TN, on the product page",
      "SpotOn says earned tip access helps with hiring and retention (product page)",
    ],
    // Public product page, text supplied by SpotOn; not opened from the build environment.
    link: { url: "https://www.spoton.com/solutions/earned-tip-access/", status: "provided_link" },
    serviceModels: ALL,
    poorFitReason: "",
    attributeBoost: ["table_service"],
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
