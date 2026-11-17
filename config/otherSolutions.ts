/**
 * Other SpotOn solutions from SpotOn's public solutions menu that do not target food or labor cost. They are
 * listed by name only, under the menu's own headings, and are never ranked or matched to the numbers.
 * Product descriptions are not carried here until SpotOn's public page for each one is supplied.
 * Left out on purpose: payment processing and capital loans (fee and financing conversations, not prime cost).
 */
export interface OtherGroup {
  heading: string;
  items: string[];
}

export const OTHER_SOLUTIONS: OtherGroup[] = [
  { heading: "Guests and sales", items: ["Online ordering", "Ordering app", "Delivery"] },
  { heading: "Tables", items: ["Reservations", "Waitlist", "Experiences"] },
  { heading: "Engagement", items: ["Marketing", "Loyalty", "Websites", "Gift cards"] },
  { heading: "Point of sale", items: ["POS station", "Virtual terminal"] },
  { heading: "Team", items: ["Employee app"] },
];

export const OTHER_SOLUTIONS_NOTE =
  "These are on SpotOn's solutions menu but don't target food or labor cost, so the tool doesn't rank them. Raise them if the conversation goes there.";
