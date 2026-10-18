import { PROPERTY_LISTINGS, PROPERTY_TABS, type PropertyListing } from "@/lib/dummy-properties";
import type { KeyFact } from "@/components/shared/KeyFacts";
import type { PostCardData } from "@/types/post";

// Stand-ins for the richer data a property's own API record will carry. Until it exists, every property shares
// these placeholder details and only the headline fields (title, price, area, badges, photo) come from the listing.

export interface PropertyDocument {
  id: string;
  title: string;
  note: string;
  status: "Checked" | "Pending";
}

export interface SimilarHome {
  id: string;
  image: string;
  price: string;
  summary: string;
}

export interface PropertyDetail {
  listing: PropertyListing;
  /** "Properties / Buy / East Legon Hills / title" */
  breadcrumbs: { label: string; href?: string }[];
  /** Large photo first, then the two stacked beside it. */
  gallery: { main: string; side: [string, string]; moreLabel: string };
  updated: string;
  priceNote: string;
  keyFacts: KeyFact[];
  description: string;
  features: string[];
  documents: PropertyDocument[];
  mapImage: string;
  nearby: string[];
  similar: SimilarHome[];
  agent: { name: string; role: string; avatar: string; badges: string[]; stats: string };
}

const DOCUMENT_NOTE_CHECKED = "Checked by Biltlinx · 10 Oct 2026";

/** A property post from the feed, shaped like a listing so it can share the detail page. */
function listingFromPost(post: PostCardData): PropertyListing {
  const photos = post.images ?? (post.image ? [post.image] : []);
  return {
    id: post.id,
    tab: "buy",
    kind: "For sale",
    image: photos[0] ?? "/images/marketplace/property-sale.jpg",
    price: `${post.priceLine ?? ""}${post.priceSuffix ?? ""}`,
    title: post.subLine ?? "Property",
    location: "Accra, Ghana",
    badges: post.verified === "organization" ? [{ label: "Listing authority ✓", tone: "verified" }] : undefined,
    cta: "Request viewing",
    features: [],
  };
}

export function getPropertyDetail(id: string, posts: PostCardData[] = []): PropertyDetail | undefined {
  const post = posts.find((candidate) => candidate.id === id && candidate.variant === "property");
  const listing = PROPERTY_LISTINGS.find((candidate) => candidate.id === id) ?? (post ? listingFromPost(post) : undefined);
  if (!listing) return undefined;

  const tab = PROPERTY_TABS.find((item) => item.key === listing.tab);
  const area = listing.location.split(",")[0];
  const photos = post?.images ?? [];

  return {
    listing,
    breadcrumbs: [
      { label: "Properties", href: "/properties" },
      { label: tab?.label ?? "Buy", href: "/properties" },
      { label: area },
      { label: listing.title },
    ],
    gallery: {
      main: listing.image,
      side: [photos[1] ?? "/images/marketplace/rental.jpg", photos[2] ?? "/images/marketplace/property-curved.jpg"],
      moreLabel: photos.length > 3 ? `+ ${photos.length - 3} photos` : "+ 18 photos · Video tour",
    },
    updated: post ? `Posted ${post.postedAt}` : "Updated 2 days ago",
    priceNote: post ? "Asking price" : "Negotiable · ≈ GHS 4,405 / m²",
    keyFacts: [
      { value: String(post?.beds ?? 4), label: "Bedrooms" },
      { value: String(post?.baths ?? 4), label: "Bathrooms" },
      { value: "420 m²", label: "Floor area" },
      { value: "0.25 acre", label: "Plot" },
      { value: "Leasehold · 99 yrs", label: "Title" },
      { value: "2023", label: "Built" },
    ],
    description:
      post?.text ??
      "A modern 4-bedroom detached house on a quiet, gated street in East Legon Hills. All rooms are en-suite, with a fitted kitchen, a family lounge and a 1-bed boys’ quarters. The compound has a borehole, a 10,000-litre poly tank, a backup generator and parking for 4 cars.",
    features: [
      "All bedrooms en-suite",
      "Boys’ quarters (1 bed)",
      "Borehole + poly tank",
      "Backup generator",
      "Fitted kitchen",
      "Gated street, 24h security",
      "Parking for 4 cars",
      "Prepaid ECG meter",
    ],
    documents: [
      { id: "doc1", title: "Land title certificate", note: DOCUMENT_NOTE_CHECKED, status: "Checked" },
      { id: "doc2", title: "Building permit", note: "Provided by owner · not yet checked", status: "Pending" },
      { id: "doc3", title: "Site plan", note: DOCUMENT_NOTE_CHECKED, status: "Checked" },
    ],
    mapImage: "/images/properties-map.jpg",
    nearby: ["A&C Mall · 6 min", "American House · 8 min", "Lincoln School · 10 min", "Kotoka Airport · 25 min"],
    similar: [
      { id: "sim1", image: "/images/marketplace/property-tower.jpg", price: "GHS 2,100,000", summary: "4-bed townhouse · Adjiringanor" },
      { id: "sim2", image: "/images/marketplace/development.jpg", price: "GHS 1,650,000", summary: "4-bed · East Legon" },
      { id: "sim3", image: "/images/marketplace/property-curved.jpg", price: "GHS 1,900,000", summary: "5-bed · Trasacco" },
    ],
    agent: post
      ? {
          name: post.authorName,
          role: post.roleLine.replace(/\s*\|\s*$/, ""),
          avatar: post.avatar,
          badges: post.verified === "organization" ? ["Business verified ✓"] : ["ID verified ✓"],
          stats: "Replies in about 1 hour",
        }
      : {
          name: "Andy Ansong",
          role: "Agent · Kasapa Properties Ltd",
          avatar: "/images/professionals/andy-ansong.png",
          badges: ["ID verified ✓", "Listing authority ✓"],
          stats: "Replies in about 1 hour · 120 sales",
        },
  };
}
