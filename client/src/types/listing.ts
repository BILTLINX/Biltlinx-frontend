export interface ListingBadge {
  label: string;
  /** "verified" is the green trust badge; "neutral" is a plain grey pill such as a rating. */
  tone: "verified" | "neutral";
}

/** What a listing card (marketplace, properties) needs to render. */
export interface ListingCardData {
  id: string;
  /** Pill over the image's top-left corner. */
  kind: string;
  image: string;
  /** When set, the card's image and title link to the listing's own page. */
  href?: string;
  price: string;
  priceUnit?: string;
  title: string;
  /** Location, seller or provider line beside the pin icon. */
  location: string;
  /** Optional extra line, e.g. bedrooms or plot size. */
  detail?: { icon: "bed" | "plot"; text: string };
  badges?: ListingBadge[];
  cta: string;
  /** Renders a second, outlined button beside the main one. */
  secondaryCta?: string;
}
