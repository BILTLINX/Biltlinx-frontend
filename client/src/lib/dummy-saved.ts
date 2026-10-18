// Stand-ins for what the saved-items API will return until it exists.

export const SAVED_FILTERS = [
  "All",
  "Properties",
  "Stays",
  "Marketplace",
  "Professionals",
  "Artisans",
  "Services",
  "Projects",
  "Posts",
  "Reels",
  "Communities",
] as const;

export type SavedFilter = (typeof SAVED_FILTERS)[number];

export interface SavedCollection {
  id: string;
  name: string;
  /** e.g. "8 items · Private" */
  summary: string;
  image: string;
}

export const SAVED_COLLECTIONS: SavedCollection[] = [
  { id: "c1", name: "House hunt · East Legon", summary: "8 items · Private", image: "/images/marketplace/property-sale.jpg" },
  { id: "c2", name: "Land options", summary: "5 items · Private", image: "/images/marketplace/land.jpg" },
  { id: "c3", name: "Build team", summary: "6 people · Private", image: "/images/marketplace/professional.jpg" },
  { id: "c4", name: "Materials for BQ", summary: "4 items · Private", image: "/images/marketplace/material.jpg" },
];

export interface SavedItem {
  id: string;
  filter: Exclude<SavedFilter, "All">;
  /** Label on the item's pill, e.g. "Property". */
  kind: string;
  title: string;
  price: string;
  image: string;
  /** A change worth flagging, such as a price drop or the item going off the market. */
  status?: { label: string; tone: "good" | "bad" };
}

export const SAVED_ITEMS: SavedItem[] = [
  {
    id: "i1",
    filter: "Properties",
    kind: "Property",
    title: "4-bed detached house with BQ",
    price: "GHS 1,850,000",
    image: "/images/marketplace/property-sale.jpg",
    status: { label: "Price dropped GHS 50,000", tone: "good" },
  },
  {
    id: "i2",
    filter: "Stays",
    kind: "Stay",
    title: "Golden Palm Hotel · Deluxe room",
    price: "GHS 550 / night",
    image: "/images/marketplace/stay.jpg",
  },
  {
    id: "i3",
    filter: "Professionals",
    kind: "Professional",
    title: "Ama Boatengmaa · Architect",
    price: "From GHS 1,500",
    image: "/images/marketplace/professional.jpg",
  },
  {
    id: "i4",
    filter: "Marketplace",
    kind: "Equipment",
    title: "20-tonne excavator with operator",
    price: "GHS 2,500 / day",
    image: "/images/marketplace/equipment.jpg",
    status: { label: "No longer available", tone: "bad" },
  },
];

export const SAVED_SEARCHES = [
  { id: "s1", label: "4+ bed houses · East Legon", frequency: "Daily · 3 new" },
  { id: "s2", label: "2-bed rentals under GHS 4,000", frequency: "Instant · 6 new" },
  { id: "s3", label: "Land in Dawhenya under GHS 150k", frequency: "Weekly · 2 new" },
];
