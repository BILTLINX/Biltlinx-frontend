import type { DetailComment } from "@/types/comment";

// Stand-ins for data the post detail page will get from the API: the author's
// profile summary, their other listings, and the comment thread.

export const DETAIL_AUTHOR_PROFILE = {
  subtitle: "Real estate agency · Accra",
  stats: "48 active listings · 2.3k followers",
  badges: ["Business verified ✓", "Licensed agent ✓"],
};

export interface AuthorListing {
  id: string;
  image: string;
  price: string;
  summary: string;
}

export const DETAIL_AUTHOR_LISTINGS: AuthorListing[] = [
  { id: "l1", image: "/images/trending-property-1.jpg", price: "GHS 2,100,000", summary: "4-bed townhouse · Adjiringanor" },
  { id: "l2", image: "/images/trending-property-2.jpg", price: "GHS 3,400 / month", summary: "3-bed apartment · Airport Res." },
  { id: "l3", image: "/images/trending-property-3.jpg", price: "GHS 950,000", summary: "3-bed · Oyarifa" },
];

export const DETAIL_COMMENTS: DetailComment[] = [
  {
    id: "d1",
    authorName: "Abena Owusu",
    avatar: "/images/avatar-generic.png",
    postedAt: "5h",
    text: "Is the price negotiable? And is the title leasehold or freehold?",
    likes: 8,
    replies: [
      {
        id: "d1-1",
        authorName: "Andy Ansong",
        badge: "Author · Agent",
        avatar: "/icons/avatar-andy.png",
        postedAt: "4h",
        text: "Leasehold, 99 years from 2019. Price is open to serious offers. Request a viewing and I’ll bring the documents.",
        likes: 12,
      },
    ],
  },
  {
    id: "d2",
    authorName: "Kofi Mensah",
    avatar: "/icons/avatar-sample.jpg",
    postedAt: "2h",
    text: "Does the estate have its own water supply? Water in that area is a real issue.",
    likes: 3,
  },
];
