import { formatDate, formatMoney, formatPricePeriod, formatRelative } from "@/lib/format";
import type { KeyFact } from "@/components/shared/KeyFacts";
import type { ListingCardData } from "@/types/listing";
import type { ListingDocumentDto, PropertyDto } from "@/types/api/schema";

export const FALLBACK_PROPERTY_IMAGE = "/images/marketplace/property-sale.jpg";

const PERIOD_UNIT: Record<string, string> = {
  PerNight: "night",
  PerDay: "day",
  PerWeek: "week",
  PerMonth: "month",
  PerYear: "year",
  PerSqm: "sqm",
};

export function propertyKind(property: PropertyDto): string {
  if (property.propertyType === "Land") return "Land";
  if (property.propertyType === "Commercial") return property.listingType === "Rent" ? "Commercial lease" : "Commercial";
  return property.listingType === "Rent" ? "For rent" : "For sale";
}

export function propertyLocation(property: PropertyDto): string {
  const address = property.addressVisibility === "Public" ? property.address : null;
  return [address, property.city].filter(Boolean).join(", ") || "Ghana";
}

export function propertyPrice(property: PropertyDto): string {
  return formatMoney(property.price, property.currency ?? "GHS");
}

export function propertyPriceUnit(property: PropertyDto): string | undefined {
  return property.pricePeriod ? PERIOD_UNIT[property.pricePeriod] : undefined;
}

function detailLine(property: PropertyDto): ListingCardData["detail"] {
  if (property.propertyType === "Land") {
    return property.landSizeSqm ? { icon: "plot", text: `${property.landSizeSqm.toLocaleString("en-GH")} m² plot` } : undefined;
  }
  const parts: string[] = [];
  if (property.bedrooms !== null) parts.push(`${property.bedrooms} ${property.bedrooms === 1 ? "bed" : "beds"}`);
  if (property.bathrooms !== null) parts.push(`${property.bathrooms} ${property.bathrooms === 1 ? "bath" : "baths"}`);
  if (property.floorAreaSqm) parts.push(`${property.floorAreaSqm.toLocaleString("en-GH")} m²`);
  return parts.length > 0 ? { icon: "bed", text: parts.join(" · ") } : undefined;
}

export function toListingCard(property: PropertyDto): ListingCardData {
  const badges: NonNullable<ListingCardData["badges"]> = [];
  if (property.owner.isVerified) badges.push({ label: "Verified lister ✓", tone: "verified" });
  if (property.isStale) badges.push({ label: "May be out of date", tone: "neutral" });
  return {
    id: property.id,
    kind: propertyKind(property),
    image: property.media?.[0]?.url ?? FALLBACK_PROPERTY_IMAGE,
    href: `/properties/${property.id}`,
    price: propertyPrice(property),
    priceUnit: propertyPriceUnit(property),
    title: property.name ?? "Property",
    location: propertyLocation(property),
    detail: detailLine(property),
    badges: badges.length > 0 ? badges : undefined,
    ownerId: property.owner.id,
    ownerName: property.owner.username ?? undefined,
    cta: "Request viewing",
    secondaryCta: "Message",
  };
}

export interface PropertyDocumentView {
  id: string;
  title: string;
  note: string;
  isPublic: boolean;
  url: string | null;
}

export interface PropertyDetailView {
  property: PropertyDto;
  card: ListingCardData;
  breadcrumbs: { label: string; href?: string }[];
  gallery: { main: string; side: [string | null, string | null]; moreLabel: string | null };
  updated: string;
  priceNote: string;
  keyFacts: KeyFact[];
  terms: KeyFact[];
  description: string;
  documents: PropertyDocumentView[];
}

const DOCUMENT_LABELS: Record<string, string> = {
  FloorPlan: "Floor plan",
  SitePlan: "Site plan",
  Brochure: "Brochure",
  TitleDeed: "Title deed",
  SurveyPlan: "Survey plan",
  Other: "Document",
};

export function toDocumentView(document: ListingDocumentDto): PropertyDocumentView {
  return {
    id: document.id,
    title: DOCUMENT_LABELS[document.kind ?? ""] ?? document.fileName ?? "Document",
    note: document.isPublic ? "Public document" : "Private · shared by the owner on request",
    isPublic: document.isPublic,
    url: document.url,
  };
}

function priceNote(property: PropertyDto): string {
  const parts = [property.listingType === "Rent" ? "Rent" : "Asking price"];
  if (property.isNegotiable) parts.push("negotiable");
  return parts.join(" · ");
}

export function toPropertyDetail(property: PropertyDto, documents: ListingDocumentDto[] = property.documents ?? []): PropertyDetailView {
  const card = toListingCard(property);
  const media = property.media ?? [];
  const facts: KeyFact[] = [];
  if (property.bedrooms !== null) facts.push({ value: String(property.bedrooms), label: "Bedrooms" });
  if (property.bathrooms !== null) facts.push({ value: String(property.bathrooms), label: "Bathrooms" });
  if (property.floorAreaSqm) facts.push({ value: `${property.floorAreaSqm.toLocaleString("en-GH")} m²`, label: "Floor area" });
  if (property.landSizeSqm) facts.push({ value: `${property.landSizeSqm.toLocaleString("en-GH")} m²`, label: "Plot" });
  if (property.propertyType) facts.push({ value: property.propertyType, label: "Type" });
  if (property.powerCapacityKva) facts.push({ value: `${property.powerCapacityKva} kVA`, label: "Power" });
  if (property.useClass) facts.push({ value: property.useClass, label: "Use" });

  const terms: KeyFact[] = [];
  const currency = property.currency ?? "GHS";
  if (property.deposit !== null) terms.push({ value: formatMoney(property.deposit, currency), label: "Deposit" });
  if (property.serviceCharge !== null) {
    const period = formatPricePeriod(property.serviceChargePeriod);
    terms.push({ value: `${formatMoney(property.serviceCharge, currency)} ${period}`.trim(), label: "Service charge" });
  }
  if (property.leaseTermMonths !== null) terms.push({ value: `${property.leaseTermMonths} months`, label: "Lease term" });
  if (property.isNegotiable !== null) terms.push({ value: property.isNegotiable ? "Yes" : "No", label: "Negotiable" });
  if (property.paymentPlanNote) terms.push({ value: property.paymentPlanNote, label: "Payment plan" });

  const area = property.city ?? "Ghana";
  return {
    property,
    card,
    breadcrumbs: [
      { label: "Properties", href: "/properties" },
      { label: card.kind, href: "/properties" },
      { label: area },
      { label: card.title },
    ],
    gallery: {
      main: media[0]?.url ?? FALLBACK_PROPERTY_IMAGE,
      side: [media[1]?.url ?? null, media[2]?.url ?? null],
      moreLabel: media.length > 3 ? `+ ${media.length - 3} photos` : null,
    },
    updated: property.isStale ? `Last confirmed ${formatDate(property.lastConfirmedAt)}` : `Confirmed ${formatRelative(property.lastConfirmedAt)} ago`,
    priceNote: priceNote(property),
    keyFacts: facts,
    terms,
    description: property.description ?? "",
    documents: documents.map(toDocumentView),
  };
}
