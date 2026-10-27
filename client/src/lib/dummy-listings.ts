export interface PropertyListing {
  id: string;
  /** Shown in the "Choose from My Listings" dropdown. */
  title: string;
  priceLine: string;
  priceSuffix?: string;
  /** Short listing type, e.g. "4 Bedroom Detached House". */
  subLine: string;
  location: string;
  beds: number;
  baths: number;
  /** Full photo set for the resulting post; first image doubles as the listing's cover. */
  images: string[];
}

// Reuses this app's existing high-resolution property photography (the
// post-property-*.jpg set) rather than sourcing new stock photos, since
// there's no real listings backend yet — the goal here is a believable
// "My Listings" picker, not real inventory.
const GALLERY = [
  "/images/post-property-exterior.jpg",
  "/images/post-property-living-room.jpg",
  "/images/post-property-kitchen.jpg",
  "/images/post-property-bedroom.jpg",
];

export interface StayListing {
  id: string;
  /** Shown in the "Choose room / unit type" dropdown. */
  title: string;
  priceLine: string;
  priceSuffix?: string;
  /** e.g. "Golden Palm Hotel — Deluxe Room". */
  subLine: string;
  location: string;
  beds: number;
  baths: number;
  rating?: string;
  /** Cover photo for the resulting post. */
  image: string;
}

export const DUMMY_STAYS: StayListing[] = [
  {
    id: "stay-1",
    title: "Deluxe Room - Golden Palm Hotel",
    priceLine: "GHS 1000",
    priceSuffix: "/night",
    subLine: "Golden Palm Hotel — Deluxe Room",
    location: "Labadi Accra",
    beds: 4,
    baths: 2,
    rating: "4.7 ratings (312)",
    image: "/images/post-hotel-pool.jpg",
  },
  {
    id: "stay-2",
    title: "Executive Suite - Golden Palm Hotel",
    priceLine: "GHS 1,650",
    priceSuffix: "/night",
    subLine: "Golden Palm Hotel — Executive Suite",
    location: "Labadi Accra",
    beds: 2,
    baths: 1,
    rating: "4.9 ratings (128)",
    image: "/images/post-property-living-room.jpg",
  },
  {
    id: "stay-3",
    title: "Studio Guest House - East Legon",
    priceLine: "GHS 450",
    priceSuffix: "/night",
    subLine: "East Legon Guest House — Studio",
    location: "East Legon",
    beds: 1,
    baths: 1,
    rating: "4.5 ratings (64)",
    image: "/images/post-property-bedroom.jpg",
  },
];

export interface ServicePriceItem {
  label: string;
  price: string;
}

export interface ServiceListing {
  id: string;
  /** Shown in the "Choose a service listings" dropdown. */
  title: string;
  category: string;
  /** Headline rate, e.g. "From GHS 250" or "GHS 80/hr". */
  rate: string;
  priceList: ServicePriceItem[];
  location: string;
}

export const DUMMY_SERVICES: ServiceListing[] = [
  {
    id: "service-1",
    title: "Full House Rewiring - Electrical Works",
    category: "Electrical Works",
    rate: "From GHS 1,200",
    priceList: [
      { label: "Callout / Inspection", price: "GHS 50" },
      { label: "Full House Rewiring", price: "GHS 1,200" },
      { label: "Socket / Switch Replacement", price: "GHS 80" },
    ],
    location: "Accra",
  },
  {
    id: "service-2",
    title: "AC Installation & Repair - Cooling Services",
    category: "Cooling Services",
    rate: "From GHS 350",
    priceList: [
      { label: "AC Servicing", price: "GHS 150" },
      { label: "New Unit Installation", price: "GHS 450" },
      { label: "Gas Refill & Repair", price: "GHS 350" },
    ],
    location: "Tema",
  },
  {
    id: "service-3",
    title: "Plumbing Repairs - Plumbing Works",
    category: "Plumbing Works",
    rate: "GHS 80/hr",
    priceList: [
      { label: "Callout / Inspection", price: "GHS 40" },
      { label: "Leak Repair", price: "GHS 120" },
      { label: "Pipe Installation", price: "GHS 80/hr" },
    ],
    location: "Kumasi",
  },
];

export const DUMMY_LISTINGS: PropertyListing[] = [
  {
    id: "listing-1",
    title: "4-Bedroom Detached House - East Legon",
    priceLine: "GHS 1,850.00",
    subLine: "4 Bedroom Detached House",
    location: "East Legon",
    beds: 4,
    baths: 2,
    images: GALLERY,
  },
  {
    id: "listing-2",
    title: "3-Bedroom Townhouse - Cantonments",
    priceLine: "GHS 1,250.00",
    subLine: "3 Bedroom Townhouse",
    location: "Cantonments",
    beds: 3,
    baths: 3,
    images: [GALLERY[1], GALLERY[0], GALLERY[3], GALLERY[2]],
  },
  {
    id: "listing-3",
    title: "2-Bedroom Apartment - Airport Residential",
    priceLine: "GHS 890.00",
    subLine: "2 Bedroom Apartment",
    location: "Airport Residential",
    beds: 2,
    baths: 2,
    images: [GALLERY[2], GALLERY[1], GALLERY[0], GALLERY[3]],
  },
  {
    id: "listing-4",
    title: "5-Bedroom Executive Villa - Trasacco Valley",
    priceLine: "GHS 3,200.00",
    subLine: "5 Bedroom Executive Villa",
    location: "Trasacco Valley",
    beds: 5,
    baths: 4,
    images: [GALLERY[3], GALLERY[0], GALLERY[1], GALLERY[2]],
  },
];
