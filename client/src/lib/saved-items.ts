import type { DiscoverReel } from "@/types/reel";
import type { ListingCardData } from "@/types/listing";
import type { PostCardData } from "@/types/post";

export const SAVED_FILTERS = ["All", "Properties", "Stays", "Marketplace", "Services", "Professionals", "Artisans", "Posts", "Reels"] as const;

export type SavedFilter = (typeof SAVED_FILTERS)[number];
export type SavedType = Exclude<SavedFilter, "All">;

/** What the Saved screen keeps about something the user saved: enough to show and open it without fetching it again. */
export interface SavedItem {
  /** Unique per saved thing, so saving it twice is a toggle. */
  key: string;
  type: SavedType;
  /** The pill on the item, e.g. "Apartment" or "Poll". */
  kind: string;
  title: string;
  subtitle?: string;
  price?: string;
  image: string;
  href: string;
  savedAt: string;
}

export type SavedDraft = Omit<SavedItem, "savedAt">;

const LISTING_ROUTES: [prefix: string, type: SavedType][] = [
  ["/properties/", "Properties"],
  ["/stay/", "Stays"],
  ["/marketplace/", "Marketplace"],
  ["/services/", "Services"],
  ["/professionals/", "Professionals"],
  ["/artisans/", "Artisans"],
];

const AVATAR_PLACEHOLDER = "/icons/avatar-placeholder-user.svg";
const SNIPPET_LENGTH = 90;

function snippet(text: string | undefined) {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  return clean.length > SNIPPET_LENGTH ? `${clean.slice(0, SNIPPET_LENGTH).trimEnd()}…` : clean;
}

/** A listing card as a saved item, or null when the card has no page of its own to come back to (a preview). */
export function savedListing(listing: ListingCardData): SavedDraft | null {
  const href = (listing.href ?? listing.ctaHref)?.split("?")[0];
  const type = href ? LISTING_ROUTES.find(([prefix]) => href.startsWith(prefix))?.[1] : undefined;
  if (!href || !type) return null;
  return {
    key: href,
    type,
    kind: listing.kind,
    title: listing.title,
    subtitle: listing.location,
    price: listing.priceUnit ? `${listing.price} / ${listing.priceUnit}` : listing.price,
    image: listing.image,
    href,
  };
}

export function savedPost(post: PostCardData): SavedDraft {
  const picture = post.media?.find((item) => !item.isVideo)?.url ?? post.images?.[0] ?? post.image;
  return {
    key: `post:${post.id}`,
    type: "Posts",
    kind: post.variant === "poll" ? "Poll" : post.priceLine ? "Listing post" : "Post",
    title: snippet(post.variant === "poll" ? post.question : post.text) || `${post.authorName}'s post`,
    subtitle: post.authorName,
    price: post.priceLine ? `${post.priceLine}${post.priceSuffix ? ` ${post.priceSuffix}` : ""}` : undefined,
    image: picture ?? (post.avatarPlaceholder ? AVATAR_PLACEHOLDER : post.avatar),
    href: `/post/${post.id}`,
  };
}

export function savedReel(reel: DiscoverReel): SavedDraft {
  return {
    key: `reel:${reel.id}`,
    type: "Reels",
    kind: "Reel",
    title: snippet(reel.caption) || `${reel.authorName}'s reel`,
    subtitle: reel.authorName,
    image: reel.poster,
    href: `/discover#reel-${reel.id}`,
  };
}
