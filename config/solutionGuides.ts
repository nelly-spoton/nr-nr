/**
 * Training notes for each solution, written for people new to restaurant operations.
 *
 * What is here is GENERAL RESTAURANT KNOWLEDGE written for training (why a cost moves, what to look for, what to
 * ask). It is not a statement by SpotOn and makes no claim about results. How a product works is NOT repeated
 * here: it comes from the product's own record in config/solutions.ts. Public information only; no commercial
 * terms; nothing here promises a saving.
 */
export interface SolutionGuide {
  /** Why this cost moves, in plain words. */
  why: string;
  /** The number or sign that suggests the problem exists. */
  lookFor: string;
  /** Discovery questions for the owner. */
  questions: string[];
  /** Extra caution beyond the product's own requirements. */
  caution?: string;
}

export const PRIMER = {
  title: "Prime cost in one minute",
  points: [
    "Prime cost is food and drink cost plus labor cost, shown as a share of sales. If prime cost is 65%, then 65 cents of every sales dollar goes to ingredients, drinks and staff. The rest has to cover rent, utilities, marketing and everything else before anything is left as profit.",
    "Food & beverage cost (often called COGS) compares what the food and drinks cost with what was sold. It rises when a restaurant buys more than it uses, throws food away, makes mistakes, or pays suppliers more than before and doesn't adjust.",
    "Labor cost is wages plus payroll taxes and benefits. It rises when more people are scheduled than the sales need, when overtime builds up, or when staff clock in before they are needed.",
    "One point means one percentage point of sales. On $1,000,000 of yearly sales, one point is $10,000 a year.",
    "A published median is the middle of a set of restaurants. Use it to start a conversation, not as a target or a grade.",
    "Prime cost alone doesn't show whether a restaurant is profitable.",
    "A product only helps if the restaurant changes how it works. Buying software does not lower a cost by itself.",
  ],
};

export const SOLUTION_GUIDES: Record<string, SolutionGuide> = {
  "spoton-profit-assist": {
    why: "Food cost creeps up when a restaurant buys more than it uses, wastes food, pays suppliers more than before, or when bookkeeping mistakes hide the real numbers. Many owners only see their profit and loss statement (the P&L, a monthly report of money in and out) at month-end, if at all, and rarely read it line by line.",
    lookFor: "Food cost above the median, or food cost that jumps from one month to the next with no menu change.",
    questions: [
      "How often do you look at your P&L, and who reads it?",
      "When food cost moved last month, could you say why?",
      "How do you notice when a supplier's costs go up?",
    ],
    caution: "A report only helps if someone acts on it. Ask who would own the suggested tasks.",
  },
  marginedge: {
    why: "Restaurants often don't know what a plate should cost, or how much food was really used. 'Theoretical' food cost is what the recipes say the food should cost; 'actual' is what was really used. The gap between them is usually waste, oversized portions, mistakes or missing stock.",
    lookFor: "Food cost above the median together with no regular inventory count, or invoices that are entered late or not at all.",
    questions: [
      "How often do you count inventory, and who does it?",
      "Do you know what a typical plate costs to make?",
      "Who checks supplier invoices, and when?",
    ],
    caution: "This depends on steady invoice and recipe entry. Ask whether the team has time for it.",
  },
  restaurant365: {
    why: "When purchasing, inventory and accounting sit in separate tools, nobody sees the whole cost picture, and each location may do things differently. That makes it hard to spot which location is overspending and why.",
    lookFor: "Several locations with food costs that differ a lot, or an owner who waits for the accountant to learn last month's numbers.",
    questions: [
      "How do you compare food cost between locations?",
      "How long after month-end do you see your numbers?",
      "Who orders for each location, and how do they decide how much?",
    ],
    caution: "This can mean moving accounting systems, which is a big step. Check how ready the team is for that.",
  },
  "spoton-kds": {
    why: "When a kitchen ticket is unclear, late or lost, the dish is made wrong or twice. Every remake uses ingredients that are thrown away and cook time that is paid for twice. A KDS (kitchen display system) is a screen in the kitchen that replaces printed tickets.",
    lookFor: "Frequent remakes or comped dishes, kitchen and servers blaming each other, or tickets that get lost at busy times.",
    questions: [
      "How often does the kitchen remake an order, and why?",
      "When a dish is wrong, what happens to it?",
      "How do orders reach the cooks today?",
    ],
  },
  "spoton-handhelds": {
    why: "When servers write orders by hand or walk to a terminal, mistakes creep in, such as wrong items, forgotten modifiers and voided orders. Each mistake can mean a remake and wasted food, and the walking back and forth costs server time.",
    lookFor: "Many voids or comps, orders that arrive in the kitchen wrong, or servers spending time at the terminal instead of with guests.",
    questions: [
      "How many steps are there between a guest ordering and the kitchen seeing it?",
      "How often is an item entered wrong?",
      "How much time do servers spend walking to a terminal?",
    ],
  },
  "spoton-teamwork": {
    why: "Labor drifts above plan when the schedule is built from habit instead of expected sales. Too many people on a slow shift costs money; too few on a busy one hurts service. Overtime and early clock-ins add cost quietly.",
    lookFor: "Labor above the median, labor that swings a lot from week to week, or overtime that shows up only after payroll is run.",
    questions: [
      "How do you build the schedule: from last week's, or from expected sales?",
      "How do you learn about overtime, before or after payroll?",
      "Who approves an early clock-in?",
    ],
    caution: "Managers have to actually use the scheduling tool. Ask who would run it.",
  },
  "7shifts": {
    why: "Same driver as scheduling in general: when the schedule isn't informed by expected demand, hours are over- or under-scheduled. Forecasting from sales history is a way to plan hours more deliberately.",
    lookFor: "Labor above the median, schedules built on paper or in a spreadsheet, or managers who spend hours each week on scheduling.",
    questions: [
      "What do you use to schedule today?",
      "How far ahead do you post the schedule, and how often does it change?",
      "How do you decide how many people a shift needs?",
    ],
    caution: "If a scheduling tool is already in place, the question is what's missing, not whether to schedule.",
  },
  "spoton-kiosk": {
    why: "At a counter, taking orders takes staff time, and the line gets longest at peak. Self-service ordering moves some of that work to the guest, so staff can be placed elsewhere.",
    lookFor: "Long lines at peak, several people taking orders at the same time, or a simple menu that guests could order from alone.",
    questions: [
      "What does the line look like at your busiest hour?",
      "How many people take orders then?",
      "How complicated is the menu for a first-time guest?",
    ],
    caution: "It needs space and hardware, and works best for simple, counter-style menus.",
  },
  sam: {
    why: "You can't fix a cost you can't see. Owners and managers are busy, and digging through reports takes time they often don't have, so a cost can climb for weeks before anyone notices.",
    lookFor: "An owner who says they don't have time for reports, or who finds out about a problem only from the monthly numbers.",
    questions: [
      "Who looks at sales and labor numbers, and how often?",
      "What question do you wish you could answer quickly?",
      "When did you last find a cost problem late?",
    ],
    caution: "Sam is for insight. It helps people see; it doesn't lower a cost by itself.",
  },
  "spoton-pos-reporting": {
    why: "A menu has some items that sell a lot and others that sell little. Without seeing the mix, a restaurant can keep buying and prepping for items that don't move, and miss the ones that do.",
    lookFor: "Owners who aren't sure which items sell best, or who prep and order by habit.",
    questions: [
      "Which items sell the most, and which the least?",
      "How do you decide how much to order and prep?",
      "How often do you change the menu, and what do you base it on?",
    ],
    caution: "Visibility only. It helps people decide; it doesn't lower a cost by itself.",
  },
  "spoton-reporting": {
    why: "When sales and operations trends are spread across places, problems are found late. With several locations, it also gets hard to see which one is drifting.",
    lookFor: "Multiple locations compared by gut feel, or numbers that are only checked monthly.",
    questions: [
      "How do you compare your locations?",
      "How do you know early when a week is off?",
      "What do you check daily, and what only monthly?",
    ],
    caution: "Visibility only. It helps people decide; it doesn't lower a cost by itself.",
  },
  "spoton-ai-menu-assistant": {
    why: "Changing menu items, categories and modifiers one at a time takes a lot of manager time. This is about time saved on menu changes, so it is not a food or labor cost lever.",
    lookFor: "A large menu, frequent menu changes, or seasonal and event menus that take hours to update.",
    questions: [
      "How long does a menu change take you now?",
      "How often does the menu change?",
      "Who makes the changes, and what else could they be doing?",
    ],
    caution: "Don't present it as a way to lower prime cost. Raise it only if menu changes are a real time drain.",
  },
  "spoton-mobile-pay-review": {
    why: "Waiting for the check and the card slows table turns, so tables sit when they could be reset. This is about checkout speed and guest reviews, not a food or labor cost lever.",
    lookFor: "Guests who wait for the check, tables that are slow to turn at peak, or few online reviews.",
    questions: [
      "How long do guests usually wait for the check?",
      "How do you collect reviews today?",
      "How much do slow table turns matter at your busiest times?",
    ],
    caution: "Don't present it as a way to lower prime cost. It fits places that settle checks at the table.",
  },
  "spoton-tip-management": {
    why: "Dividing tips by hand takes manager time and invites mistakes. This is about admin time and accuracy, so it is not a direct food or labor cost lever.",
    lookFor: "Managers doing tip math on spreadsheets, staff waiting on tips, or disputes about how tips were split.",
    questions: [
      "Who divides tips, and how long does it take?",
      "What are your tip pooling rules?",
      "How often are tips corrected after the fact?",
    ],
    caution: "Don't present it as a way to lower prime cost. Tip rules also have legal and payroll requirements, so keep the conversation about the process.",
  },
  "spoton-tip-access": {
    why: "Staff usually wait until payday for tips. Earlier access is mainly about staff experience and how much time managers spend on payouts, not a direct cost lever.",
    lookFor: "Hiring and retention trouble, or complaints about waiting for pay.",
    questions: [
      "How do staff get their tips today, and when?",
      "How hard is it to hire and keep servers?",
      "How much manager time goes to cash tip-outs?",
    ],
    caution: "Don't present it as a way to lower prime cost. It depends on employer participation, staff eligibility and state availability.",
  },
};
