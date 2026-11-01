import { formatMoney } from "@/lib/format";
import { FALLBACK_STAY_IMAGE, STAY_TYPE_LABEL } from "@/lib/stay-mapper";
import type { OfferingDto, StayCardDto } from "@/types/api/schema";

/** What the post modals show for a listing, built from the user's own verified listings. */
export interface StayListing {
  id: string;
  title: string;
  priceLine: string;
  priceSuffix?: string;
  subLine: string;
  location: string;
  image: string;
}

export interface ServiceListing {
  id: string;
  title: string;
  category: string;
  /** Headline rate, e.g. "GHS 80 per hour". */
  rate: string;
  location: string;
}

export function toPostStay(stay: StayCardDto): StayListing {
  const currency = stay.currency ?? "GHS";
  return {
    id: stay.id,
    title: stay.name ?? "Stay",
    priceLine: stay.fromNightly !== null ? formatMoney(stay.fromNightly, currency) : "Price on request",
    priceSuffix: stay.fromNightly !== null ? " / night" : undefined,
    subLine: STAY_TYPE_LABEL[stay.type ?? ""] ?? "Stay",
    location: [stay.area, stay.city].filter(Boolean).join(", ") || "Ghana",
    image: stay.coverUrl ?? FALLBACK_STAY_IMAGE,
  };
}

export function toPostService(offering: OfferingDto): ServiceListing {
  return {
    id: offering.id,
    title: offering.title ?? "Untitled service",
    category: offering.category ?? "",
    rate: offering.priceLabel ?? (offering.price !== null ? formatMoney(offering.price, offering.currency ?? "GHS") : "Quote on request"),
    location: offering.serviceAreas?.[0] ?? "",
  };
}
