import type { ListingCardData } from "@/types/listing";

// Stand-ins for what the marketplace API will return until it exists.

export const MARKETPLACE_CATEGORIES = [
  "All",
  "Properties",
  "Land",
  "Rentals",
  "Stay",
  "Professional services",
  "Artisan services",
  "Property services",
  "Materials",
  "Equipment",
  "Developments",
] as const;

export type MarketplaceCategory = (typeof MARKETPLACE_CATEGORIES)[number];

export interface CatalogListing extends ListingCardData {
  /** Filter chip this listing belongs to. */
  category: Exclude<MarketplaceCategory, "All">;
}

/** Live listings shown for "All" in the header count; the dummy catalog below is just a sample of them. */
export const MARKETPLACE_TOTAL_LISTINGS = 2481;

export const CATALOG_LISTINGS: CatalogListing[] = [
  {
    id: "m1",
    href: "/marketplace/m1",
    category: "Land",
    kind: "Land",
    image: "/images/marketplace/land.jpg",
    price: "GHS 120,000",
    priceUnit: "plot",
    title: "Serviced plot, 70×100 ft",
    location: "Dawhenya, Greater Accra",
    badges: [{ label: "Land title documents ✓", tone: "verified" }],
    cta: "Enquire",
  },
  {
    id: "m2",
    href: "/marketplace/m2",
    category: "Rentals",
    kind: "Rental",
    image: "/images/marketplace/rental.jpg",
    price: "GHS 3,500",
    priceUnit: "month",
    title: "2-bed apartment, gated",
    location: "Airport Residential, Accra",
    badges: [{ label: "Owner authority ✓", tone: "verified" }],
    cta: "Request viewing",
  },
  {
    id: "m3",
    href: "/marketplace/m3",
    category: "Properties",
    kind: "Property sale",
    image: "/images/marketplace/property-sale.jpg",
    price: "GHS 850,000",
    title: "4-bed detached house",
    location: "East Legon Hills, Accra",
    badges: [{ label: "Listing authority ✓", tone: "verified" }],
    cta: "Request viewing",
  },
  {
    id: "m4",
    href: "/marketplace/m4",
    category: "Stay",
    kind: "Stay",
    image: "/images/marketplace/stay.jpg",
    price: "GHS 450",
    priceUnit: "night",
    title: "Deluxe room, pool access",
    location: "Labadi, Accra",
    badges: [{ label: "4.8 ★ · 120 stays", tone: "neutral" }],
    cta: "Check availability",
  },
  {
    id: "m5",
    href: "/marketplace/m5",
    category: "Materials",
    kind: "Material",
    image: "/images/marketplace/material.jpg",
    price: "GHS 115",
    priceUnit: "bag",
    title: "Cement 42.5R, 50kg",
    location: "Kasoa Building Supplies",
    badges: [{ label: "Business verified ✓", tone: "verified" }],
    cta: "Order",
  },
  {
    id: "m6",
    href: "/marketplace/m6",
    category: "Equipment",
    kind: "Equipment hire",
    image: "/images/marketplace/equipment.jpg",
    price: "GHS 2,500",
    priceUnit: "day",
    title: "20-tonne excavator with operator",
    location: "Tema · delivers within 40 km",
    badges: [{ label: "Business verified ✓", tone: "verified" }],
    cta: "Request hire",
  },
  {
    id: "m7",
    href: "/marketplace/m7",
    category: "Professional services",
    kind: "Professional service",
    image: "/images/marketplace/professional.jpg",
    price: "From GHS 1,500",
    title: "Architectural drawings & permit pack",
    location: "Ama Boatengmaa · Architect",
    badges: [{ label: "Credential verified ✓", tone: "verified" }],
    cta: "Request quote",
  },
  {
    id: "m8",
    href: "/marketplace/m8",
    category: "Artisan services",
    kind: "Artisan service",
    image: "/images/marketplace/artisan.jpg",
    price: "From GHS 250",
    priceUnit: "job",
    title: "Electrical wiring & fault repair",
    location: "Yaw Osei · Electrician",
    badges: [{ label: "ID verified ✓", tone: "verified" }],
    cta: "Request quote",
  },
  {
    id: "m9",
    href: "/marketplace/m9",
    category: "Developments",
    kind: "Development unit",
    image: "/images/marketplace/development.jpg",
    price: "From GHS 600,000",
    title: "Adenta Heights Phase 2 · 2–3 bed",
    location: "Dzorwulu Developments",
    badges: [{ label: "Business verified ✓", tone: "verified" }],
    cta: "Enquire",
  },
];

export const SAVED_SEARCHES = [
  { id: "s1", label: "2-bed rentals under GHS 4,000 · Airport", status: "6 new", hasNew: true },
  { id: "s2", label: "Land in Dawhenya under GHS 150k", status: "2 new", hasNew: true },
  { id: "s3", label: "Excavator hire · Tema", status: "No change", hasNew: false },
];
