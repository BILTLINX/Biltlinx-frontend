import type { OfferDto } from "@/types/api/schema";

export const MARKET_CATEGORIES = ["Materials", "Equipment", "Land"] as const;

export type MarketCategory = (typeof MARKET_CATEGORIES)[number];

/** What each category is called on a card's pill. */
const PILL: Record<MarketCategory, string> = { Materials: "Material", Equipment: "Equipment", Land: "Land" };

/** What a price can be per, for each category. The values are the unit names the marketplace cards already understand. */
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

export const MARKET_DELIVERY = ["Pickup only", "I can deliver"] as const;

export type MarketDelivery = (typeof MARKET_DELIVERY)[number];

/** What stock is counted in, e.g. "bags" for something priced per bag. */
export function stockNoun(category: MarketCategory, unit: string) {
  if (category === "Equipment") return "units";
  if (category === "Land") return "plots";
  return unit === "PerBag" ? "bags" : unit === "PerTonne" ? "tonnes" : "items";
}

/** What the seller fills in. */
export interface MarketListingDraft {
  category: MarketCategory;
  title: string;
  description: string;
  /** Public photo links; the first is the cover. */
  photos: string[];
  price: number;
  unit: string;
  location: string;
  /** How many are for sale; null when not said. Land is a single plot, so it has none. */
  stock: number | null;
  minOrder: number | null;
  delivery: MarketDelivery;
}

export interface MarketListing extends MarketListingDraft {
  id: string;
  createdAt: string;
}

/** A listing in the shape the marketplace cards draw. It has no page of its own yet, so it has no route. */
export function listingToOffer(listing: MarketListingDraft & { id?: string; createdAt?: string }): OfferDto {
  return {
    kind: "Marketplace",
    id: listing.id ?? "preview",
    title: listing.title,
    city: listing.location,
    price: listing.price,
    currency: "GHS",
    unit: listing.unit,
    priceLabel: null,
    category: PILL[listing.category],
    negotiable: false,
    coverUrl: listing.photos[0] ?? null,
    detailRoute: null,
    actions: null,
    ownerAccountId: "",
    createdAt: listing.createdAt ?? new Date().toISOString(),
  };
}
