import type { ListingCardData } from "@/types/listing";

// Stand-ins for what the stays API will return until it exists.

export const STAY_TYPE_CHIPS = ["All stays", "Apartments", "Guest houses", "Hotels", "Villas"] as const;
export type StayTypeChip = (typeof STAY_TYPE_CHIPS)[number];

/** Amenity and policy filters; a stay matches when it has every selected one. */
export const STAY_FEATURE_CHIPS = ["Business-ready", "Pool", "Free cancellation"] as const;

/** Stays shown in the header count when nothing is filtered; the sample below is a slice of them. */
export const STAY_TOTAL_LISTINGS = 186;

export interface StayListing extends ListingCardData {
  type: Exclude<StayTypeChip, "All stays">;
  features: string[];
}

const NIGHT = "night";
const CTA = "Check availability";

export const STAY_LISTINGS: StayListing[] = [
  {
    id: "s1",
    href: "/stay/s1",
    type: "Hotels",
    kind: "Hotel",
    image: "/images/marketplace/stay.jpg",
    price: "GHS 550",
    priceUnit: NIGHT,
    title: "Golden Palm Hotel · Deluxe room",
    location: "Labadi, Accra",
    detail: { icon: "bed", text: "2 guests · 1 bed · pool" },
    badges: [
      { label: "4.7 ★ · 212 reviews", tone: "neutral" },
      { label: "Business verified ✓", tone: "verified" },
    ],
    cta: CTA,
    features: ["Pool", "Free cancellation"],
  },
  {
    id: "s2",
    href: "/stay/s2",
    type: "Apartments",
    kind: "Apartment",
    image: "/images/marketplace/rental.jpg",
    price: "GHS 780",
    priceUnit: NIGHT,
    title: "Serviced 2-bed, Airport City",
    location: "Airport City, Accra",
    detail: { icon: "bed", text: "4 guests · 2 beds · wifi" },
    badges: [
      { label: "4.9 ★ · 88 reviews", tone: "neutral" },
      { label: "Host ID verified ✓", tone: "verified" },
    ],
    cta: CTA,
    features: ["Business-ready", "Free cancellation"],
  },
  {
    id: "s3",
    href: "/stay/s3",
    type: "Villas",
    kind: "Villa",
    image: "/images/marketplace/property-tower.jpg",
    price: "GHS 2,400",
    priceUnit: NIGHT,
    title: "Villa with pool, Trasacco",
    location: "Trasacco Valley, Accra",
    detail: { icon: "bed", text: "8 guests · 4 beds · pool" },
    badges: [{ label: "4.8 ★ · 41 reviews", tone: "neutral" }],
    cta: CTA,
    features: ["Pool"],
  },
  {
    id: "s4",
    href: "/stay/s4",
    type: "Guest houses",
    kind: "Guest house",
    image: "/images/marketplace/property-curved.jpg",
    price: "GHS 320",
    priceUnit: NIGHT,
    title: "Quiet guest house, Osu",
    location: "Osu, Accra",
    detail: { icon: "bed", text: "2 guests · 1 bed" },
    badges: [
      { label: "4.5 ★ · 133 reviews", tone: "neutral" },
      { label: "Host ID verified ✓", tone: "verified" },
    ],
    cta: CTA,
    features: ["Free cancellation"],
  },
  {
    id: "s5",
    href: "/stay/s5",
    type: "Apartments",
    kind: "Apartment",
    image: "/images/marketplace/property-sale.jpg",
    price: "GHS 950",
    priceUnit: NIGHT,
    title: "Design loft, East Legon",
    location: "East Legon, Accra",
    detail: { icon: "bed", text: "3 guests · 2 beds · workspace" },
    badges: [{ label: "4.9 ★ · 57 reviews", tone: "neutral" }],
    cta: CTA,
    features: ["Business-ready"],
  },
  {
    id: "s6",
    href: "/stay/s6",
    type: "Apartments",
    kind: "Apartment",
    image: "/images/marketplace/development.jpg",
    price: "GHS 600",
    priceUnit: NIGHT,
    title: "Poolside 1-bed, Adenta",
    location: "Adenta, Accra",
    detail: { icon: "bed", text: "2 guests · 1 bed · pool" },
    badges: [{ label: "4.6 ★ · 22 reviews", tone: "neutral" }],
    cta: CTA,
    features: ["Pool"],
  },
];
