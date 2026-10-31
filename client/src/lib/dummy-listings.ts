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
