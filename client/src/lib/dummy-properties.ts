import type { ListingCardData } from "@/types/listing";

// Stand-ins for what the properties API will return until it exists.

export const PROPERTY_TABS = [
  { key: "buy", label: "Buy", resultNoun: "homes for sale" },
  { key: "rent", label: "Rent", resultNoun: "homes for rent" },
  { key: "land", label: "Land", resultNoun: "plots" },
  { key: "commercial", label: "Commercial", resultNoun: "commercial properties" },
  { key: "developments", label: "New developments", resultNoun: "new developments" },
] as const;

export type PropertyTabKey = (typeof PROPERTY_TABS)[number]["key"];

/** Amenity and trust filters; a listing matches when it carries every selected one. */
export const PROPERTY_FEATURE_CHIPS = [
  "Verified listing authority",
  "Title documents checked",
  "Gated",
  "Furnished",
  "Parking",
  "Borehole",
  "Solar",
] as const;

export interface PropertyListing extends ListingCardData {
  tab: PropertyTabKey;
  features: string[];
}

export const PROPERTY_LISTINGS: PropertyListing[] = [
  {
    id: "p1",
    href: "/properties/p1",
    tab: "buy",
    kind: "For sale",
    image: "/images/marketplace/property-sale.jpg",
    price: "GHS 1,850,000",
    title: "4-bed detached house with BQ",
    location: "East Legon Hills, Accra",
    detail: { icon: "bed", text: "4 beds · 4 baths · 420 m²" },
    badges: [{ label: "Title documents checked ✓", tone: "verified" }],
    cta: "Request viewing",
    secondaryCta: "Message",
    features: ["Title documents checked", "Parking", "Borehole"],
  },
  {
    id: "p2",
    href: "/properties/p2",
    tab: "buy",
    kind: "For sale",
    image: "/images/marketplace/property-tower.jpg",
    price: "GHS 6,500,000",
    title: "5-bed house, pool, gated estate",
    location: "Trasacco Valley, Accra",
    detail: { icon: "bed", text: "5 beds · 6 baths · 650 m²" },
    badges: [{ label: "Listing authority ✓", tone: "verified" }],
    cta: "Request viewing",
    secondaryCta: "Message",
    features: ["Verified listing authority", "Gated", "Parking", "Solar"],
  },
  {
    id: "p3",
    href: "/properties/p3",
    tab: "rent",
    kind: "For rent",
    image: "/images/marketplace/property-curved.jpg",
    price: "GHS 3,500",
    priceUnit: "month",
    title: "3-bed apartment, serviced",
    location: "Airport Residential, Accra",
    detail: { icon: "bed", text: "3 beds · 3 baths · 180 m²" },
    badges: [{ label: "Owner authority ✓", tone: "verified" }],
    cta: "Request viewing",
    secondaryCta: "Message",
    features: ["Verified listing authority", "Furnished", "Parking"],
  },
  {
    id: "p4",
    href: "/properties/p4",
    tab: "developments",
    kind: "New development",
    image: "/images/marketplace/development.jpg",
    price: "From GHS 600,000",
    title: "Adenta Heights Phase 2",
    location: "Adenta, Accra",
    detail: { icon: "bed", text: "2–3 beds · handover Q2 2027" },
    badges: [{ label: "Business verified ✓", tone: "verified" }],
    cta: "View project",
    secondaryCta: "Enquire",
    features: ["Verified listing authority", "Gated", "Parking", "Solar"],
  },
  {
    id: "p5",
    href: "/properties/p5",
    tab: "land",
    kind: "Land",
    image: "/images/marketplace/land.jpg",
    price: "GHS 500,000",
    priceUnit: "plot",
    title: "Half-acre residential plot",
    location: "Oyibi, Greater Accra",
    detail: { icon: "plot", text: "0.5 acre · leasehold 99 yrs" },
    badges: [{ label: "Land title documents ✓", tone: "verified" }],
    cta: "Enquire",
    secondaryCta: "Message",
    features: ["Title documents checked"],
  },
  {
    id: "p6",
    href: "/properties/p6",
    tab: "rent",
    kind: "For rent",
    image: "/images/marketplace/rental.jpg",
    price: "GHS 8,000",
    priceUnit: "month",
    title: "Furnished 2-bed penthouse",
    location: "Cantonments, Accra",
    detail: { icon: "bed", text: "2 beds · 2 baths · 140 m²" },
    cta: "Request viewing",
    secondaryCta: "Message",
    features: ["Furnished", "Gated", "Parking"],
  },
];
