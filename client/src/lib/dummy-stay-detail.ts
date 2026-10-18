import { STAY_LISTINGS, type StayListing } from "@/lib/dummy-stays";

// Stand-ins for the richer data a stay's own API record will carry. Until it exists, every stay shares these
// placeholder details and only the headline fields (title, price, area, badges, photo) come from the listing.

export const CALENDAR = {
  year: 2026,
  /** Zero-based month: 9 is October. */
  month: 9,
  monthLabel: "October 2026",
  /** Days up to and including this one have already passed. */
  pastUntil: 18,
  /** Days the host has already booked. */
  booked: [31],
};

export const STAY_EXTRAS = [
  { id: "pickup", label: "Airport pick-up", price: 180 },
  { id: "late", label: "Late check-out (2 pm)", price: 120 },
  { id: "dinner", label: "Dinner for two", price: 260 },
];

export const PAYMENT_METHODS = [
  { id: "momo", label: "MTN Mobile Money", note: "··· 0192 · you’ll approve on your phone" },
  { id: "visa", label: "Visa card", note: "··· 4421" },
  { id: "bank", label: "Bank transfer", note: "Booking held for 2 hours" },
];

export const NIGHTLY_FEE_RATE = 0.03;
export const TOURISM_LEVY_RATE = 0.01;

export interface StayReview {
  id: string;
  author: string;
  avatar: string;
  text: string;
}

export interface StayDetail {
  listing: StayListing;
  breadcrumbs: { label: string; href?: string }[];
  gallery: { main: string; side: [string, string]; moreLabel: string };
  ratingLabel: string;
  keyFacts: { value: string; label: string }[];
  description: string;
  amenities: string[];
  policies: string;
  reviewsHeading: string;
  reviews: StayReview[];
}

export function getStayDetail(id: string): StayDetail | undefined {
  const listing = STAY_LISTINGS.find((candidate) => candidate.id === id);
  if (!listing) return undefined;

  return {
    listing,
    breadcrumbs: [{ label: "Stay", href: "/stay" }, { label: "Accra", href: "/stay" }, { label: listing.title }],
    gallery: {
      main: listing.image,
      side: ["/images/marketplace/rental.jpg", "/images/marketplace/development.jpg"],
      moreLabel: "+ 12 photos",
    },
    ratingLabel: "4.7 ★ · 212 stays",
    keyFacts: [
      { value: "Up to 2", label: "Guests" },
      { value: "1 king", label: "Bed" },
      { value: "32 m²", label: "Size" },
      { value: "From 2 pm", label: "Check-in" },
      { value: "By 11 am", label: "Check-out" },
    ],
    description:
      "A quiet deluxe room overlooking the pool, with a work desk, fast Wi-Fi and a rain shower. Breakfast is served by the pool from 6:30 am. Airport pick-up can be added at checkout.",
    amenities: [
      "Breakfast included",
      "Pool",
      "Fast Wi-Fi · 50 Mbps",
      "Air conditioning",
      "24h power backup",
      "Free parking",
      "Airport pick-up (paid)",
      "Gym",
    ],
    policies:
      "Free cancellation until 48 hours before check-in. After that, the first night is charged. No smoking in rooms. ID required at check-in.",
    reviewsHeading: "Reviews · 4.7 ★ from 212 stays",
    reviews: [
      {
        id: "r1",
        author: "Abena O. · Stayed Sep 2026",
        avatar: "/images/reviews/abena.png",
        text: "Clean, quiet and the breakfast was great. Power never went off.",
      },
      {
        id: "r2",
        author: "Kwame A. · Stayed Aug 2026",
        avatar: "/images/reviews/kwame.png",
        text: "Easy airport pick-up. Pool view room is worth it.",
      },
    ],
  };
}
