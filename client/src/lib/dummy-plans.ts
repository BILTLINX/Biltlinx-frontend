export type PlanId = "free" | "pro" | "business" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  audience: string;
  action: string;
  badge?: string;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Connect & Explore",
    price: "GHS 0",
    priceNote: "forever",
    audience: "For seekers, owners and new providers",
    action: "Switch to Free",
    features: ["Profile, feed, communities", "Browse and save everything", "Up to 3 active listings or services", "Basic Manage: 1 property, basic enquiries", "Request quotes and bookings"],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Work & Grow",
    price: "GHS 149",
    priceNote: "per month",
    audience: "For agents, landlords, artisans and professionals",
    action: "Your current plan",
    badge: "Current",
    features: ["Everything in Free", "Up to 25 active listings or services", "Lead pipeline (CRM) for one person", "Quotes, appointments, jobs and invoicing", "Tenancies, rent, maintenance, inspections", "Enhanced analytics"],
  },
  {
    id: "business",
    name: "Business",
    tagline: "Operate & Scale",
    price: "GHS 599",
    priceNote: "per month",
    audience: "For agencies, developers, firms and property managers",
    action: "Upgrade to Business",
    badge: "Best for teams",
    features: ["Everything in Pro", "Up to 5 team seats, roles and permissions", "Shared pipeline and team inbox", "Workflow automation", "Portfolio, procurement and vendor tools", "Advanced reports and exports"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Control & Integrate",
    price: "Custom",
    priceNote: "talk to sales",
    audience: "For large developers and institutions",
    action: "Contact sales",
    features: ["Everything in Business", "Unlimited seats, branches and business units", "Custom roles and central admin", "API and integrations, SSO", "Audit and compliance controls", "Dedicated onboarding and support"],
  },
];

/** A cell is a label, "✓" for included or "—" for not included. Values follow the order of PLANS. */
export const PLAN_COMPARISON: { group: string; rows: { label: string; values: [string, string, string, string] }[] }[] = [
  {
    group: "Sell & grow",
    rows: [
      { label: "Lead pipeline (CRM)", values: ["Basic", "Individual", "Team", "Custom"] },
      { label: "Quotes & proposals", values: ["3 / month", "Unlimited", "Unlimited", "Unlimited"] },
      { label: "Appointments & calendar", values: ["—", "✓", "✓", "✓"] },
      { label: "Bulk listing tools", values: ["—", "—", "✓", "✓"] },
      { label: "Storefront & catalogue", values: ["Basic", "Enhanced", "✓", "✓"] },
    ],
  },
  {
    group: "Operate",
    rows: [
      { label: "Properties & units", values: ["1 property", "Up to 30 units", "Up to 500 units", "Custom"] },
      { label: "Tenancies & rent collection", values: ["Basic", "✓", "✓", "✓"] },
      { label: "Maintenance & work orders", values: ["Basic", "✓", "Team assign", "✓"] },
      { label: "Inspections", values: ["—", "✓", "✓", "✓"] },
      { label: "Documents & e-sign", values: ["Limited", "Selected", "✓", "Governance"] },
      { label: "Jobs & scheduling", values: ["Limited", "✓", "✓", "✓"] },
      { label: "Procurement & vendors", values: ["—", "Limited", "✓", "Integrated"] },
      { label: "Project tracking", values: ["Basic", "Individual", "Advanced", "Multi-project"] },
    ],
  },
  {
    group: "Team & control",
    rows: [
      { label: "Team seats", values: ["1", "1 + 1 assistant", "5 included", "Unlimited"] },
      { label: "Roles & permissions", values: ["—", "Limited", "✓", "Custom"] },
      { label: "Workflow automation", values: ["—", "Selected", "✓", "Custom"] },
      { label: "Audit logs", values: ["—", "—", "✓", "✓"] },
      { label: "API & integrations", values: ["—", "—", "Limited", "✓"] },
      { label: "SSO", values: ["—", "—", "—", "✓"] },
    ],
  },
  {
    group: "Insight",
    rows: [
      { label: "Analytics", values: ["Basic", "Enhanced", "Advanced", "Custom"] },
      { label: "Reports & exports", values: ["—", "CSV", "Scheduled", "Custom"] },
    ],
  },
];

export const PLAN_FAQS = [
  { id: "change", question: "Can I change plans later?", answer: "Yes. Upgrades apply now with a pro-rated charge; downgrades apply at the end of your billing period." },
  { id: "downgrade", question: "What happens to my data if I downgrade?", answer: "Nothing is deleted. Tools above your plan become read-only and you can export everything." },
  { id: "badge", question: "Do plans give me a verified badge?", answer: "No. Badges only show checks like ID, business or credentials. Anyone can apply on any plan." },
];
