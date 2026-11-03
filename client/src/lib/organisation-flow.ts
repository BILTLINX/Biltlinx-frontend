export const CREATE_ORGANISATION_HREF = "/manage/organisation/new";

export const CREATE_ORGANISATION_STEPS = [
  { title: "Organisation details", note: "Name, type and contact" },
  { title: "Verification", note: "Prove the business is real" },
  { title: "Structure", note: "Branches and locations (optional)" },
  { title: "Plan & confirm", note: "Business plan, review and create" },
];

export const ORGANISATION_KINDS = ["Real estate agency", "Property manager", "Developer", "Contractor", "Professional firm", "Supplier", "Hotel / Stay"];

export const ORGANISATION_KIND_CODES: Record<string, string> = {
  "Real estate agency": "RealEstateAgency",
  "Property manager": "PropertyManager",
  Developer: "Developer",
  Contractor: "Contractor",
  "Professional firm": "ProfessionalFirm",
  Supplier: "Supplier",
  "Hotel / Stay": "HotelStay",
};

export const ORGANISATION_ROLES = ["Agent", "Developer", "PropertyManager", "StayOperator"];

export const ORGANISATION_DOCUMENT_SLOTS = {
  logo: "organisation:logo",
  certificate: "organisation:certificate",
  form3: "organisation:form3",
  licence: "organisation:licence",
} as const;

export function formatPlanPrice(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString("en-GH", { maximumFractionDigits: 2 })}`;
}
