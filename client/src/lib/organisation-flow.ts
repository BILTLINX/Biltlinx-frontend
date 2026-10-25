/** Mock constants for the in-app Create organisation flow (plan pricing and option lists are placeholders until the API provides them). */
export const CREATE_ORGANISATION_HREF = "/manage/organisation/new";

export const CREATE_ORGANISATION_STEPS = [
  { title: "Organisation details", note: "Name, type and contact" },
  { title: "Verification", note: "Prove the business is real" },
  { title: "Structure", note: "Branches and locations (optional)" },
  { title: "Plan & confirm", note: "Business plan, review and create" },
];

export const ORGANISATION_KINDS = ["Real estate agency", "Property manager", "Developer", "Contractor", "Professional firm", "Supplier", "Hotel / Stay"];

export const ORGANISATION_PLAN = {
  name: "Biltlinx Business",
  badge: "Required for organisations",
  features: "Operate & Scale · 5 team seats included · roles & permissions · branches · shared pipeline · audit logs",
  monthly: "GHS 599",
  annual: "GHS 5,990",
  trialDays: 14,
};

export const ORGANISATION_PAY_METHODS = ["Mobile Money", "Card", "Bank transfer"];
