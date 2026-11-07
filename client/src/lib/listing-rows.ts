import { propertyListingStatus, publishedListingStatus, type ListingKind, type ListingStatus } from "@/lib/listing-status";
import { FALLBACK_PROPERTY_IMAGE, propertyKind, propertyPrice, propertyPriceUnit } from "@/lib/property-mapper";
import { FALLBACK_STAY_IMAGE, SHAPE_LABEL, STAY_TYPE_LABEL } from "@/lib/stay-mapper";
import { SERVICE_MODE_LABEL } from "@/lib/services-labels";
import type { OfferingDto, PropertyDto, StayCardDto } from "@/types/api/schema";

/** A property, stay or service reduced to what the My listings table shows. */
export interface ListingRow {
  key: string;
  kind: ListingKind;
  id: string;
  title: string;
  meta: string;
  /** The specifics a post of this listing leads with: beds and area, amenities, how a service sells. */
  details: string[];
  image: string;
  price: string;
  status: ListingStatus;
  /** Where the listing is seen by the public. */
  href: string;
}

const join = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(" · ");
const compact = (parts: (string | false | null | undefined)[]) => parts.filter((part): part is string => Boolean(part));

export function propertyRow(property: PropertyDto): ListingRow {
  const unit = propertyPriceUnit(property);
  return {
    key: `property-${property.id}`,
    kind: "property",
    id: property.id,
    title: property.name ?? "Untitled listing",
    meta: join("Property", propertyKind(property), property.city),
    details: compact([
      property.bedrooms ? `${property.bedrooms} bed` : null,
      property.bathrooms ? `${property.bathrooms} bath` : null,
      property.floorAreaSqm ? `${property.floorAreaSqm} m²` : property.landSizeSqm ? `${property.landSizeSqm} m² plot` : null,
      property.isNegotiable && "Negotiable",
      property.addressVisibility === "Hidden" && "Address hidden",
    ]),
    image: property.media?.[0]?.url ?? FALLBACK_PROPERTY_IMAGE,
    price: `${propertyPrice(property)}${unit ? ` / ${unit}` : ""}`,
    status: propertyListingStatus(property.status),
    href: `/properties/${property.id}`,
  };
}

export function stayRow(stay: StayCardDto): ListingRow {
  return {
    key: `stay-${stay.id}`,
    kind: "stay",
    id: stay.id,
    title: stay.name ?? "Untitled stay",
    meta: join("Stay", STAY_TYPE_LABEL[stay.type ?? ""] ?? stay.type, stay.area, stay.city),
    details: compact([
      ...(stay.shapes ?? []).map((shape) => SHAPE_LABEL[shape] ?? shape),
      (stay.amenities?.length ?? 0) > 0 && `${stay.amenities?.slice(0, 3).join(", ")}${(stay.amenities?.length ?? 0) > 3 ? ` +${(stay.amenities?.length ?? 0) - 3}` : ""}`,
    ]),
    image: stay.coverUrl ?? FALLBACK_STAY_IMAGE,
    price: stay.priceLabel ?? "Add a rate",
    status: publishedListingStatus(stay.status),
    href: `/stay/${stay.id}`,
  };
}

export function serviceRow(offering: OfferingDto): ListingRow {
  return {
    key: `service-${offering.id}`,
    kind: "service",
    id: offering.id,
    title: offering.title ?? "Untitled service",
    meta: join("Service", offering.category),
    details: compact([
      offering.mode && (SERVICE_MODE_LABEL[offering.mode] ?? offering.mode),
      (offering.serviceAreas?.length ?? 0) > 0 && `Serves ${offering.serviceAreas?.join(", ")}`,
      offering.maxBookingsPerDay ? `${offering.maxBookingsPerDay} bookings a day` : null,
    ]),
    image: offering.media?.[0]?.url ?? "/images/services/surveyor.jpg",
    price: offering.priceLabel ?? "Quote on request",
    status: publishedListingStatus(offering.status),
    href: `/services/${offering.id}`,
  };
}
