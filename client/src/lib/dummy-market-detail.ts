import { CATALOG_LISTINGS, type CatalogListing } from "@/lib/dummy-marketplace-catalog";

// Stand-ins for the richer data a marketplace item's own API record will carry. Until it exists, every item shares
// these placeholder details and only the headline fields (title, price, unit, seller, badges, photo) come from the listing.

export const BULK_THRESHOLD = 100;
export const DELIVERY_FEE = 250;
export const BILTLINX_FEE = 0;

export interface MarketItemDetail {
  listing: CatalogListing;
  breadcrumbs: { label: string; href?: string }[];
  /** First is the large photo; all of them are selectable thumbnails. */
  gallery: string[];
  stockLabel: string;
  /** Per-unit price (number) for single orders and for orders of BULK_THRESHOLD or more. */
  unitPrice: number;
  bulkPrice: number;
  unit: string;
  defaultQuantity: number;
  specs: { label: string; value: string }[];
  defaultDeliverTo: string;
  deliveryNote: string;
  seller: { name: string; stats: string; avatar: string };
}

export function getMarketItemDetail(id: string): MarketItemDetail | undefined {
  const listing = CATALOG_LISTINGS.find((candidate) => candidate.id === id);
  if (!listing) return undefined;

  const unitPrice = Number(listing.price.replace(/\D/g, ""));
  const unit = listing.priceUnit ?? "item";

  return {
    listing,
    breadcrumbs: [
      { label: "Marketplace", href: "/marketplace" },
      { label: listing.category, href: "/marketplace" },
      { label: listing.title },
    ],
    gallery: [listing.image, "/images/marketplace/equipment.jpg", "/images/marketplace/property-curved.jpg"],
    stockLabel: "In stock · 1,200 bags",
    unitPrice,
    bulkPrice: Math.round(unitPrice * 0.96),
    unit,
    defaultQuantity: unit === "bag" ? 120 : 1,
    specs: [
      { label: "Grade", value: "42.5R · Ghana Standards Authority certified" },
      { label: "Use", value: "Blocks, plastering, concrete" },
      { label: "Pickup", value: "Kpone warehouse, Tema" },
      { label: "Delivery", value: "Accra & Tema, next day · from GHS 250 per trip" },
    ],
    defaultDeliverTo: "Oyarifa, Accra",
    deliveryNote: "Truck carries up to 600 bags. Offloading is included. Delivery Tue 28 Oct if you order today.",
    seller: {
      name: "Tema Build Supplies",
      stats: "4.8 ★ (310 orders) · replies in 30 min",
      avatar: "/images/sellers/tema-build-supplies.png",
    },
  };
}
