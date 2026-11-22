import type { MarketCategory, MarketListingStatus, MarketOffer, MarketOrderStatus } from "@/types/api/marketplace";

export const MARKET_CATEGORIES: MarketCategory[] = ["Materials", "Equipment", "Land"];

export const CATEGORY_PILL: Record<MarketCategory, string> = { Materials: "Material", Equipment: "Equipment", Land: "Land" };

export const CATEGORY_PLACEHOLDER: Record<MarketCategory, string> = {
  Materials: "e.g. Dangote cement 42.5R, 50 kg",
  Equipment: "e.g. 20-tonne excavator with operator",
  Land: "e.g. Serviced plot, 70 x 100 ft, Dawhenya",
};

export const UNIT_SUFFIX: Record<string, string> = {
  PerBag: "bag",
  PerUnit: "item",
  PerTonne: "tonne",
  PerDay: "day",
  PerWeek: "week",
  PerHour: "hour",
  PerPlot: "plot",
  PerAcre: "acre",
};

export const UNIT_LABEL: Record<string, string> = {
  PerBag: "per bag",
  PerUnit: "per item",
  PerTonne: "per tonne",
  PerDay: "per day",
  PerWeek: "per week",
  PerHour: "per hour",
  PerPlot: "per plot",
  PerAcre: "per acre",
};

export const MARKET_UNITS: Record<MarketCategory, { value: string; label: string }[]> = {
  Materials: [
    { value: "PerBag", label: "per bag" },
    { value: "PerUnit", label: "per item" },
    { value: "PerTonne", label: "per tonne" },
  ],
  Equipment: [
    { value: "PerDay", label: "per day" },
    { value: "PerWeek", label: "per week" },
    { value: "PerHour", label: "per hour" },
  ],
  Land: [
    { value: "PerPlot", label: "per plot" },
    { value: "PerAcre", label: "per acre" },
  ],
};

export const LISTING_STATUS_LABEL: Record<MarketListingStatus, string> = {
  PendingReview: "Pending review",
  Live: "Live",
  Rejected: "Not approved",
  Paused: "Paused",
  Removed: "Removed",
};

export const ORDER_STATUS_LABEL: Record<MarketOrderStatus, string> = {
  Requested: "Waiting for seller",
  Accepted: "Accepted, awaiting payment",
  Paid: "Paid, money held",
  Dispatched: "On the way",
  Completed: "Completed",
  Declined: "Declined",
  Cancelled: "Cancelled",
  Disputed: "In dispute",
  Refunded: "Refunded",
};

export const ORDER_STATUS_TONE: Record<MarketOrderStatus, string> = {
  Requested: "bg-[#fef3c7] text-[#b45309]",
  Accepted: "bg-[#eff5ff] text-brand-900",
  Paid: "bg-[#eff5ff] text-brand-900",
  Dispatched: "bg-[#eff5ff] text-brand-900",
  Completed: "bg-[#dcfce7] text-[#16a34a]",
  Declined: "bg-[#f1f5f9] text-[#475569]",
  Cancelled: "bg-[#f1f5f9] text-[#475569]",
  Disputed: "bg-[#fee2e2] text-[#b91c1c]",
  Refunded: "bg-[#f1f5f9] text-[#475569]",
};

export function isCounted(category: MarketCategory) {
  return category !== "Land";
}

export function stockNoun(category: MarketCategory, unit: string) {
  if (category === "Equipment") return "units";
  if (category === "Land") return "plots";
  return unit === "PerBag" ? "bags" : unit === "PerTonne" ? "tonnes" : "items";
}

export function unitSuffix(unit: string | null | undefined) {
  return unit ? UNIT_SUFFIX[unit] : undefined;
}

export function unitPriceFor(listing: { price: number; bulk: { minQuantity: number; price: number } | null }, quantity: number) {
  return listing.bulk && quantity >= listing.bulk.minQuantity ? listing.bulk.price : listing.price;
}

export function offerCategoryPill(offer: MarketOffer) {
  return CATEGORY_PILL[offer.category] ?? offer.category;
}
