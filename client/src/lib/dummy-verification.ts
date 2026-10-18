export type VerificationStatus = "verified" | "not-started" | "in-review";

export interface VerificationCheck {
  id: string;
  title: string;
  status: VerificationStatus;
  statusLabel: string;
  description: string;
  icon: string;
  /** Label of the card's action; cards without one have nothing left to do. */
  action?: string;
}

export const VERIFICATION_CHECKS: VerificationCheck[] = [
  { id: "identity", title: "Identity", status: "verified", statusLabel: "Verified", description: "Ghana Card checked against NIA", icon: "/icons/user-circle.svg", action: "View" },
  { id: "credential", title: "Professional credential", status: "not-started", statusLabel: "Not started", description: "GIA, ARC, Energy Commission, etc.", icon: "/icons/briefcase-01.svg", action: "Start" },
  { id: "business", title: "Business", status: "in-review", statusLabel: "In review", description: "Company registration and TIN", icon: "/icons/building-03.svg", action: "View status" },
  { id: "authority", title: "Property / listing authority", status: "verified", statusLabel: "Verified · 2 listings", description: "Title, indenture or letting authority", icon: "/icons/house-03-listing.svg", action: "Add listing" },
  { id: "address", title: "Address", status: "not-started", statusLabel: "Not started", description: "Utility bill or GPS address", icon: "/icons/location-01.svg", action: "Start" },
  { id: "contact", title: "Phone & email", status: "verified", statusLabel: "Verified", description: "One-time codes", icon: "/icons/message-lock-02.svg" },
];

export type CheckStepState = "done" | "current" | "pending";

export const BUSINESS_CHECK = {
  company: "Kasapa Properties Ltd",
  note: "We’re matching your registration with the Registrar-General’s records. You’ll get a notification when it’s done.",
  steps: [
    { id: "submitted", label: "Submitted", detail: "17 Oct", state: "done" as CheckStepState },
    { id: "documents", label: "Documents checked", detail: "18 Oct", state: "done" as CheckStepState },
    { id: "registry", label: "Registry match", detail: "In progress", state: "current" as CheckStepState },
    { id: "badge", label: "Badge issued", detail: "—", state: "pending" as CheckStepState },
  ],
};
