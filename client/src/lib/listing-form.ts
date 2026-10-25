import type { PropertyDto } from "@/types/api/schema";

export const PURPOSES = [
  { value: "ForSale", label: "For sale", listingType: "Sale", propertyType: ["House", "Apartment", "Other"] },
  { value: "ForRent", label: "For rent", listingType: "Rent", propertyType: ["House", "Apartment", "Other"] },
  { value: "LandForSale", label: "Land for sale", listingType: "Sale", propertyType: ["Land"] },
  { value: "CommercialSale", label: "Commercial for sale", listingType: "Sale", propertyType: ["Commercial"] },
  { value: "CommercialLease", label: "Commercial to lease", listingType: "Rent", propertyType: ["Commercial"] },
] as const;

export type Purpose = (typeof PURPOSES)[number]["value"];

export const AUTHORITY_ROLES = ["Owner", "Agent", "Developer", "PropertyManager", "Other"] as const;

export const RENT_PERIODS = [
  { value: "PerMonth", label: "Month" },
  { value: "PerYear", label: "Year" },
] as const;

export interface FormMedia {
  path: string;
  contentType: string;
  name: string;
  url: string;
}

export interface ListingForm {
  purpose: Purpose;
  propertyType: string;
  name: string;
  description: string;
  price: string;
  pricePeriod: string;
  isNegotiable: boolean;
  deposit: string;
  serviceCharge: string;
  serviceChargePeriod: string;
  leaseTermMonths: string;
  paymentPlanNote: string;
  address: string;
  city: string;
  hideAddress: boolean;
  bedrooms: string;
  bathrooms: string;
  floorAreaSqm: string;
  landSizeSqm: string;
  useClass: string;
  powerCapacityKva: string;
  authorityRole: string;
  authorityDeclared: boolean;
  media: FormMedia[];
}

export const EMPTY_LISTING_FORM: ListingForm = {
  purpose: "ForRent",
  propertyType: "House",
  name: "",
  description: "",
  price: "",
  pricePeriod: "PerMonth",
  isNegotiable: false,
  deposit: "",
  serviceCharge: "",
  serviceChargePeriod: "PerMonth",
  leaseTermMonths: "",
  paymentPlanNote: "",
  address: "",
  city: "",
  hideAddress: true,
  bedrooms: "",
  bathrooms: "",
  floorAreaSqm: "",
  landSizeSqm: "",
  useClass: "",
  powerCapacityKva: "",
  authorityRole: "Owner",
  authorityDeclared: false,
  media: [],
};

export function purposeInfo(purpose: Purpose) {
  return PURPOSES.find((item) => item.value === purpose) ?? PURPOSES[0];
}

export function isRentalPurpose(purpose: Purpose) {
  return purposeInfo(purpose).listingType === "Rent";
}

export function defaultsForPurpose(purpose: Purpose): Pick<ListingForm, "purpose" | "propertyType" | "pricePeriod"> {
  const info = purposeInfo(purpose);
  return {
    purpose,
    propertyType: info.propertyType[0],
    pricePeriod: info.listingType === "Rent" ? "PerMonth" : "Total",
  };
}

function parseNumber(value: string): number | undefined {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return undefined;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function text(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

export function toDraftData(form: ListingForm): Record<string, unknown> {
  const rental = isRentalPurpose(form.purpose);
  const home = form.propertyType === "House" || form.propertyType === "Apartment" || form.propertyType === "Other";
  const data: Record<string, unknown> = {
    purpose: form.purpose,
    propertyType: form.propertyType,
    name: text(form.name),
    description: text(form.description),
    price: parseNumber(form.price),
    currency: "GHS",
    pricePeriod: form.pricePeriod,
    isNegotiable: form.isNegotiable,
    address: text(form.address),
    addressVisibility: form.hideAddress ? "Hidden" : "Public",
    city: text(form.city),
    bedrooms: home ? parseNumber(form.bedrooms) : undefined,
    bathrooms: home ? parseNumber(form.bathrooms) : undefined,
    floorAreaSqm: parseNumber(form.floorAreaSqm),
    landSizeSqm: form.propertyType === "Land" ? parseNumber(form.landSizeSqm) : undefined,
    useClass: form.propertyType === "Commercial" ? text(form.useClass) : undefined,
    powerCapacityKva: form.propertyType === "Commercial" ? parseNumber(form.powerCapacityKva) : undefined,
    deposit: rental ? parseNumber(form.deposit) : undefined,
    serviceCharge: parseNumber(form.serviceCharge),
    serviceChargePeriod: parseNumber(form.serviceCharge) !== undefined ? form.serviceChargePeriod : undefined,
    leaseTermMonths: rental ? parseNumber(form.leaseTermMonths) : undefined,
    paymentPlanNote: rental ? undefined : text(form.paymentPlanNote),
    authorityRole: form.authorityRole,
    authorityDeclared: form.authorityDeclared,
    media: form.media.map(({ path, contentType, name }) => ({ path, contentType, name })),
  };
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
}

function str(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

export function fromDraftData(data: Record<string, unknown> | null | undefined, previewUrls: Record<string, string> = {}): ListingForm {
  const source = data ?? {};
  const purpose = PURPOSES.some((item) => item.value === source.purpose) ? (source.purpose as Purpose) : EMPTY_LISTING_FORM.purpose;
  const media = Array.isArray(source.media)
    ? (source.media as { path?: string; contentType?: string; name?: string }[])
        .filter((item) => item.path)
        .map((item) => ({
          path: item.path as string,
          contentType: item.contentType ?? "image/jpeg",
          name: item.name ?? "",
          url: previewUrls[item.path as string] ?? "",
        }))
    : [];
  return {
    ...EMPTY_LISTING_FORM,
    ...defaultsForPurpose(purpose),
    propertyType: str(source.propertyType) || defaultsForPurpose(purpose).propertyType,
    pricePeriod: str(source.pricePeriod) || defaultsForPurpose(purpose).pricePeriod,
    name: str(source.name),
    description: str(source.description),
    price: str(source.price),
    isNegotiable: source.isNegotiable === true,
    address: str(source.address),
    city: str(source.city),
    hideAddress: source.addressVisibility !== "Public",
    bedrooms: str(source.bedrooms),
    bathrooms: str(source.bathrooms),
    floorAreaSqm: str(source.floorAreaSqm),
    landSizeSqm: str(source.landSizeSqm),
    useClass: str(source.useClass),
    powerCapacityKva: str(source.powerCapacityKva),
    deposit: str(source.deposit),
    serviceCharge: str(source.serviceCharge),
    serviceChargePeriod: str(source.serviceChargePeriod) || "PerMonth",
    leaseTermMonths: str(source.leaseTermMonths),
    paymentPlanNote: str(source.paymentPlanNote),
    authorityRole: str(source.authorityRole) || "Owner",
    authorityDeclared: source.authorityDeclared === true,
    media,
  };
}

export function purposeFromProperty(property: PropertyDto): Purpose {
  const rental = property.listingType === "Rent";
  if (property.propertyType === "Land") return "LandForSale";
  if (property.propertyType === "Commercial") return rental ? "CommercialLease" : "CommercialSale";
  return rental ? "ForRent" : "ForSale";
}

export function fromProperty(property: PropertyDto): ListingForm {
  return fromDraftData({
    purpose: purposeFromProperty(property),
    propertyType: property.propertyType,
    name: property.name,
    description: property.description,
    price: property.price,
    pricePeriod: property.pricePeriod,
    isNegotiable: property.isNegotiable,
    address: property.address,
    addressVisibility: property.addressVisibility,
    city: property.city,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    floorAreaSqm: property.floorAreaSqm,
    landSizeSqm: property.landSizeSqm,
    useClass: property.useClass,
    powerCapacityKva: property.powerCapacityKva,
    deposit: property.deposit,
    serviceCharge: property.serviceCharge,
    serviceChargePeriod: property.serviceChargePeriod,
    leaseTermMonths: property.leaseTermMonths,
    paymentPlanNote: property.paymentPlanNote,
    authorityDeclared: true,
    media: (property.media ?? []).map((item) => ({ path: item.url, contentType: item.contentType, name: item.name })),
  });
}

export function toUpdateRequest(form: ListingForm, availability: string | null, confirmMaterialChange: boolean) {
  const data = toDraftData(form);
  const info = purposeInfo(form.purpose);
  return {
    name: data.name ?? null,
    description: data.description ?? null,
    price: (data.price as number | undefined) ?? 0,
    currency: "GHS",
    address: data.address ?? null,
    city: data.city ?? null,
    listingType: info.listingType,
    propertyType: form.propertyType,
    bedrooms: data.bedrooms ?? null,
    bathrooms: data.bathrooms ?? null,
    availability,
    media: form.media.map(({ path, contentType, name }) => ({ path, contentType, name })),
    pricePeriod: form.pricePeriod,
    addressVisibility: data.addressVisibility,
    floorAreaSqm: data.floorAreaSqm ?? null,
    landSizeSqm: data.landSizeSqm ?? null,
    useClass: data.useClass ?? null,
    powerCapacityKva: data.powerCapacityKva ?? null,
    deposit: data.deposit ?? null,
    serviceCharge: data.serviceCharge ?? null,
    serviceChargePeriod: data.serviceChargePeriod ?? null,
    isNegotiable: form.isNegotiable,
    paymentPlanNote: data.paymentPlanNote ?? null,
    leaseTermMonths: data.leaseTermMonths ?? null,
    confirmMaterialChange,
  };
}
