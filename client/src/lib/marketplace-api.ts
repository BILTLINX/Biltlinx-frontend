import { apiRequest, type QueryValue } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { ListingCardData } from "@/types/listing";
import type { MarketplaceFacetsDto, OfferDto, PagedOfOfferDto, PriceChangeDto } from "@/types/api/schema";

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

const KIND_PILL: Record<string, string> = {
  PropertySale: "For sale",
  PropertyRent: "For rent",
  Land: "Land",
  Stay: "Stay",
  Service: "Service",
};

const UNIT_SUFFIX: Record<string, string> = {
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

export function offerToCard(offer: OfferDto): ListingCardData {
  const kind = offer.kind ?? "";
  const route = offer.detailRoute ?? "/marketplace";
  return {
    id: `${kind}-${offer.id}`,
    kind: KIND_PILL[kind] ?? "Listing",
    image: offer.coverUrl ?? "/images/marketplace/property-sale.jpg",
    href: route,
    price: `${offer.priceLabel && offer.priceLabel !== "Asking price" ? `${offer.priceLabel} ` : ""}${formatMoney(offer.price, offer.currency ?? "GHS")}`,
    priceUnit: offer.unit ? UNIT_SUFFIX[offer.unit] : undefined,
    title: offer.title ?? "Listing",
    location: [offer.category, offer.city].filter(Boolean).join(" · ") || "Ghana",
    badges: offer.negotiable ? [{ label: "Negotiable", tone: "neutral" }] : undefined,
    cta: "View details",
    ctaHref: route,
    ownerId: offer.ownerAccountId,
  };
}
