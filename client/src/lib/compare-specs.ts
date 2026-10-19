import { formatMoney, formatPricePeriod } from "@/lib/format";
import { SHAPE_LABEL, STAY_TYPE_LABEL } from "@/lib/stay-mapper";
import type { PropertyDto, ProviderDto, StayDetailDto } from "@/types/api/schema";

export interface SpecCell {
  text: string;
  /** Higher is better. Leave out for facts that are not better or worse, such as the number of bedrooms. */
  rank?: number;
}

export interface SpecRow {
  label: string;
  cells: SpecCell[];
}

const DASH: SpecCell = { text: "–" };

function numeric(values: (number | null | undefined)[], format: (value: number) => string, better: "higher" | "lower" | "none"): SpecCell[] {
  return values.map((value) => {
    if (value === null || value === undefined) return DASH;
    const rank = better === "none" ? undefined : better === "higher" ? value : -value;
    return { text: format(value), rank };
  });
}

function labels(values: (string | null | undefined)[]): SpecCell[] {
  return values.map((value) => (value ? { text: value } : DASH));
}

function flag(values: boolean[], yes: string, no: string, goodIsYes = true): SpecCell[] {
  return values.map((value) => ({ text: value ? yes : no, rank: (value === goodIsYes ? 1 : 0) }));
}

function withRanks(cells: SpecCell[]): SpecCell[] {
  return cells.map((cell) => (cell.rank === undefined ? cell : { ...cell, rank: cell.text === DASH.text ? undefined : cell.rank }));
}

export function homeRows(properties: PropertyDto[]): SpecRow[] {
  const money = (property: PropertyDto) => (property.price > 0 ? property.price : null);
  return [
    { label: "Price", cells: properties.map((property) => ({ text: `${formatMoney(property.price, property.currency ?? "GHS")} ${formatPricePeriod(property.pricePeriod)}`.trim(), rank: -property.price })) },
    { label: "Listing", cells: labels(properties.map((property) => `${property.listingType === "Rent" ? "For rent" : "For sale"} · ${property.propertyType}`)) },
    { label: "Location", cells: labels(properties.map((property) => property.city)) },
    { label: "Bedrooms", cells: numeric(properties.map((property) => property.bedrooms), String, "none") },
    { label: "Bathrooms", cells: numeric(properties.map((property) => property.bathrooms), String, "none") },
    { label: "Floor area", cells: numeric(properties.map((property) => property.floorAreaSqm), (value) => `${value.toLocaleString("en-GH")} m²`, "higher") },
    { label: "Plot size", cells: numeric(properties.map((property) => property.landSizeSqm), (value) => `${value.toLocaleString("en-GH")} m²`, "higher") },
    { label: "Price per m²", cells: numeric(properties.map((property) => (money(property) && property.floorAreaSqm ? Math.round(property.price / property.floorAreaSqm) : null)), (value) => `GHS ${value.toLocaleString("en-GH")}`, "lower") },
    { label: "Deposit", cells: numeric(properties.map((property) => property.deposit), (value) => formatMoney(value), "lower") },
    { label: "Service charge", cells: numeric(properties.map((property) => property.serviceCharge), (value) => formatMoney(value), "lower") },
    { label: "Lease term", cells: numeric(properties.map((property) => property.leaseTermMonths), (value) => `${value} months`, "none") },
    { label: "Negotiable", cells: properties.map((property) => (property.isNegotiable === null ? DASH : { text: property.isNegotiable ? "Yes" : "No" })) },
    { label: "Listed by", cells: properties.map((property) => ({ text: `${property.owner.username ?? ""}${property.owner.isVerified ? " · verified ✓" : ""}`, rank: property.owner.isVerified ? 1 : 0 })) },
    { label: "Last confirmed available", cells: properties.map((property) => ({ text: property.isStale ? "Over 30 days ago" : "Within 30 days", rank: property.isStale ? 0 : 1 })) },
  ].map((row) => ({ ...row, cells: withRanks(row.cells) }));
}

export function stayRows(stays: StayDetailDto[]): SpecRow[] {
  const cheapest = (stay: StayDetailDto) => {
    const rates = (stay.rooms ?? []).flatMap((room) => room.ratePlans ?? []);
    return rates.length > 0 ? Math.min(...rates.map((rate) => rate.nightly)) : null;
  };
  return [
    { label: "From per night", cells: numeric(stays.map(cheapest), (value) => formatMoney(value), "lower") },
    { label: "Type", cells: labels(stays.map((stay) => STAY_TYPE_LABEL[stay.type ?? ""] ?? stay.type)) },
    { label: "Location", cells: labels(stays.map((stay) => [stay.area, stay.city].filter(Boolean).join(", "))) },
    { label: "Room types", cells: labels(stays.map((stay) => [...new Set((stay.rooms ?? []).map((room) => SHAPE_LABEL[room.shape ?? ""] ?? room.shape))].join(", "))) },
    { label: "Amenities", cells: numeric(stays.map((stay) => stay.amenities?.length ?? 0), (value) => `${value} listed`, "higher") },
    { label: "Cancellation", cells: stays.map((stay) => ({ text: stay.cancellationPolicy ?? "–", rank: stay.cancellationPolicy === "Flexible" ? 2 : stay.cancellationPolicy === "Moderate" ? 1 : 0 })) },
    { label: "Cleaning fee", cells: numeric(stays.map((stay) => stay.cleaningFee), (value) => formatMoney(value, "GHS"), "lower") },
    { label: "Security deposit", cells: numeric(stays.map((stay) => stay.securityDeposit), (value) => formatMoney(value, "GHS"), "lower") },
    { label: "Check in", cells: labels(stays.map((stay) => stay.checkInFrom)) },
    { label: "Check out", cells: labels(stays.map((stay) => stay.checkOutBy)) },
    { label: "Host", cells: stays.map((stay) => ({ text: `${stay.operator.name ?? ""}${stay.operator.isVerified ? " · verified ✓" : ""}`, rank: stay.operator.isVerified ? 1 : 0 })) },
  ].map((row) => ({ ...row, cells: withRanks(row.cells) }));
}

export function providerRows(providers: ProviderDto[]): SpecRow[] {
  return [
    { label: "Works as", cells: labels(providers.map((provider) => provider.professional.profession ?? provider.artisan.trade)) },
    { label: "Based in", cells: labels(providers.map((provider) => provider.city)) },
    { label: "Also serves", cells: labels(providers.map((provider) => (provider.serviceAreas ?? []).join(", "))) },
    { label: "Experience", cells: numeric(providers.map((provider) => provider.professional.yearsExperience ?? provider.artisan.yearsExperience), (value) => `${value} years`, "higher") },
    { label: "Credential", cells: flag(providers.map((provider) => provider.credentialVerified), "Verified ✓", "Not verified") },
    { label: "Identity", cells: flag(providers.map((provider) => provider.owner.isVerified), "Verified ✓", "Not verified") },
    { label: "Urgent jobs", cells: providers.map((provider) => ({ text: provider.urgentAvailable ? "Yes" : "No" })) },
    { label: "Services listed", cells: numeric(providers.map((provider) => provider.publishedServices), String, "higher") },
    { label: "Past work", cells: numeric(providers.map((provider) => provider.portfolio?.length ?? 0), (value) => `${value} projects`, "higher") },
  ].map((row) => ({ ...row, cells: withRanks(row.cells) }));
}

export function bestCells(row: SpecRow): Set<number> {
  const ranks = row.cells.map((cell) => cell.rank);
  if (ranks.some((rank) => rank === undefined)) return new Set();
  const top = Math.max(...(ranks as number[]));
  if (ranks.every((rank) => rank === top)) return new Set();
  return new Set(ranks.flatMap((rank, index) => (rank === top ? [index] : [])));
}

export function rowDiffers(row: SpecRow): boolean {
  return new Set(row.cells.map((cell) => cell.text)).size > 1;
}
