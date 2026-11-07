/** One status vocabulary for everything a lister owns, whatever the backend calls it for properties, stays and services. */
export type ListingStatus = "Pending" | "Approved" | "Rejected" | "Paused" | "Draft";

export const LISTING_STATUS_LABEL: Record<ListingStatus, string> = {
  Pending: "Pending approval",
  Approved: "Approved",
  Rejected: "Rejected",
  Paused: "Paused",
  Draft: "Draft",
};

export const LISTING_STATUS_TONE: Record<ListingStatus, string> = {
  Approved: "bg-[#dcfce7] text-[#16a34a]",
  Pending: "bg-[#fef3c7] text-[#b45309]",
  Rejected: "bg-[#fee2e2] text-[#dc2626]",
  Paused: "bg-[#f1f5f9] text-[#334155]",
  Draft: "bg-[#eff5ff] text-brand-900",
};

export type ListingKind = "property" | "stay" | "service";

export const LISTING_KIND_LABEL: Record<ListingKind, string> = { property: "Property", stay: "Stay", service: "Service" };

/** Properties go through review. */
export function propertyListingStatus(status: string | null | undefined): ListingStatus {
  if (status === "Approved") return "Approved";
  if (status === "PendingReview") return "Pending";
  if (status === "Rejected") return "Rejected";
  return "Paused";
}

/** Stays and services have no review step in the API: published means live, so it reads as approved. */
export function publishedListingStatus(status: string | null | undefined): ListingStatus {
  if (status === "Published") return "Approved";
  if (status === "Paused") return "Paused";
  return "Draft";
}
