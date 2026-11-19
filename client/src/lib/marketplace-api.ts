import { apiRequest, type QueryValue } from "@/lib/api";
import type { MarketplaceFacetsDto, PagedOfOfferDto, PriceChangeDto } from "@/types/api/schema";

export interface MarketplaceQuery {
  page?: number;
  results?: number;
  q?: string;
  kind?: string;
  category?: string;
  city?: string;
  unit?: string;
  currency?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export const KIND_LABEL: Record<string, string> = {
  PropertySale: "Properties for sale",
  PropertyRent: "To rent",
  Land: "Land",
  Stay: "Stays",
  Service: "Services",
};

/** The short label on a card's category pill. */
export const KIND_PILL: Record<string, string> = {
  PropertySale: "Property sale",
  PropertyRent: "Rental",
  Land: "Land",
  Stay: "Stay",
  Service: "Service",
};

export const UNIT_SUFFIX: Record<string, string> = {
  PerNight: "night",
  PerDay: "day",
  PerWeek: "week",
  PerMonth: "month",
  PerYear: "year",
  PerJob: "job",
  PerHour: "hour",
  PerSqm: "sqm",
  PerUnit: "unit",
};

export function searchMarketplace(query: MarketplaceQuery, signal?: AbortSignal) {
  return apiRequest<PagedOfOfferDto>("/marketplace", { query: query as Record<string, QueryValue>, signal });
}

export function getFacets() {
  return apiRequest<MarketplaceFacetsDto>("/marketplace/facets");
}

export function getPriceHistory(listingId: string) {
  return apiRequest<PriceChangeDto[]>(`/marketplace/listings/${listingId}/price-history`);
}
