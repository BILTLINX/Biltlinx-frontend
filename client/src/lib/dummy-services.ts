// Stand-ins for what the services API will return until it exists.

export const SERVICE_CATEGORIES = [
  "All",
  "Design & drawings",
  "Surveys & valuation",
  "Construction",
  "Repairs & maintenance",
  "Cleaning",
  "Legal & documents",
  "Moving",
  "Security & CCTV",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export interface ServiceListing {
  id: string;
  category: Exclude<ServiceCategory, "All">;
  title: string;
  /** Provider name, optionally with their trade, e.g. "Ama Boatengmaa · Architect". */
  provider: string;
  image: string;
  badge: string;
  /** e.g. "From GHS 1,500" */
  price: string;
  /** e.g. "Fixed price · 3 weeks" */
  priceNote: string;
  cta: string;
}

export const SERVICES: ServiceListing[] = [
  {
    id: "sv1",
    category: "Design & drawings",
    title: "Architectural drawings & permit pack",
    provider: "Ama Boatengmaa · Architect",
    image: "/images/marketplace/professional.jpg",
    badge: "Credential verified ✓",
    price: "From GHS 1,500",
    priceNote: "Fixed price · 3 weeks",
    cta: "Request quote",
  },
  {
    id: "sv2",
    category: "Surveys & valuation",
    title: "Boundary survey & site plan",
    provider: "Kwame Mensah · Surveyor",
    image: "/images/services/surveyor.jpg",
    badge: "Credential verified ✓",
    price: "GHS 900",
    priceNote: "per plot · 5 days",
    cta: "Book",
  },
  {
    id: "sv3",
    category: "Repairs & maintenance",
    title: "Full house rewiring (3-bed)",
    provider: "Yaw Osei · Electrician",
    image: "/images/marketplace/artisan.jpg",
    badge: "Trade certificate checked ✓",
    price: "From GHS 4,800",
    priceNote: "Quote after visit",
    cta: "Request quote",
  },
  {
    id: "sv4",
    category: "Construction",
    title: "Site clearing with excavator",
    provider: "Tema Plant Hire Ltd",
    image: "/images/marketplace/equipment.jpg",
    badge: "Business verified ✓",
    price: "GHS 2,500",
    priceNote: "per day · operator included",
    cta: "Request hire",
  },
  {
    id: "sv5",
    category: "Cleaning",
    title: "Post-construction deep clean",
    provider: "SparkleHomes GH",
    image: "/images/marketplace/rental.jpg",
    badge: "Business verified ✓",
    price: "GHS 1,200",
    priceNote: "per 3-bed house",
    cta: "Book",
  },
  {
    id: "sv6",
    category: "Surveys & valuation",
    title: "Property valuation report",
    provider: "Andy Ansong · Valuer",
    image: "/images/services/valuer.jpg",
    badge: "Business verified ✓",
    price: "GHS 1,800",
    priceNote: "per property · 7 days",
    cta: "Book",
  },
];
