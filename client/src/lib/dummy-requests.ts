// Stand-ins for what the request board API will return until it exists.

export const REQUEST_TABS = [
  { key: "open", label: "Open requests", emptyText: "No open requests match your filters." },
  { key: "mine", label: "My requests", emptyText: "You haven’t posted any requests yet." },
  { key: "quoted", label: "Quotes I sent", emptyText: "You haven’t sent any quotes yet." },
] as const;

export type RequestTabKey = (typeof REQUEST_TABS)[number]["key"];

export const REQUEST_CATEGORIES = [
  "All categories",
  "Construction",
  "Repairs",
  "Design",
  "Survey",
  "Materials",
  "Equipment",
  "Cleaning",
] as const;

export type RequestCategory = (typeof REQUEST_CATEGORIES)[number];

export interface JobRequest {
  id: string;
  /** One of the board's filter categories, or a trade chosen when posting, e.g. "Plumbing". */
  category: string;
  /** Timing note shown beside the category, e.g. "Start within 1 month". */
  timing: string;
  /** Highlights the timing pill in red. */
  urgent?: boolean;
  quotes: number;
  title: string;
  location: string;
  budget: string;
  /** e.g. "Akua M." */
  poster: string;
  postedAgo: string;
  posterAvatar: string;
  /** Which tab lists it besides "Open requests": posted by me, or a request I've quoted. */
  owner?: "me";
  quotedByMe?: boolean;
}

export const REQUESTS: JobRequest[] = [
  {
    id: "r1",
    category: "Construction",
    timing: "Start within 1 month",
    quotes: 5,
    title: "Build a 2-bedroom boys’ quarters",
    location: "Oyibi, Greater Accra",
    budget: "GHS 60,000 – 80,000",
    poster: "Akua M.",
    postedAgo: "2h ago",
    posterAvatar: "/images/requests/akua.png",
  },
  {
    id: "r2",
    category: "Repairs",
    timing: "Urgent · this week",
    urgent: true,
    quotes: 2,
    title: "Fix leaking roof after rains",
    location: "Dansoman, Accra",
    budget: "GHS 1,500 – 3,000",
    poster: "Esi D.",
    postedAgo: "5h ago",
    posterAvatar: "/images/requests/esi.png",
  },
  {
    id: "r3",
    category: "Materials",
    timing: "Deliver by 30 Oct",
    quotes: 7,
    title: "Supply 400 bags of cement 42.5R",
    location: "Kasoa",
    budget: "Budget GHS 46,000",
    poster: "Yaw O.",
    postedAgo: "yesterday",
    posterAvatar: "/images/requests/yaw.png",
  },
  {
    id: "r4",
    category: "Survey",
    timing: "Within 2 weeks",
    quotes: 1,
    title: "Site plan and survey for 2 plots",
    location: "Dawhenya",
    budget: "GHS 1,500 – 2,000",
    poster: "Andy A.",
    postedAgo: "2 days ago",
    posterAvatar: "/images/requests/andy.png",
  },
];

// Stand-ins for the richer data a request's own API record will carry. Until it exists, every request shares these
// placeholder details and only the headline fields (title, category, location, budget, poster, quotes) come from the listing.

export interface RequestQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface RequestDetail {
  request: JobRequest;
  breadcrumbs: { label: string; href?: string }[];
  description: string;
  photos: string[];
  /** Shown as the "Materials" fact. */
  materials: string;
  questions: RequestQuestion[];
  similar: JobRequest[];
}

export function getRequestDetail(id: string, posted: JobRequest[] = []): RequestDetail | undefined {
  const request = [...posted, ...REQUESTS].find((candidate) => candidate.id === id);
  if (!request) return undefined;

  return {
    request,
    breadcrumbs: [{ label: "Request Board", href: "/request-board" }, { label: request.category, href: "/request-board" }, { label: request.title }],
    description:
      "Looking for a verified provider to take this on. Photos of the site are below. Ask any questions before you quote and I’ll answer them here.",
    photos: ["/images/request-board/photo-1.jpg", "/images/request-board/photo-2.jpg"],
    materials: "Provider supplies",
    questions: [
      { id: "q1", question: "Is the sink single or double bowl?", answer: "Single bowl, 80 cm." },
      { id: "q2", question: "Can I visit before quoting?", answer: "Yes, weekdays after 4 pm." },
    ],
    similar: [...posted, ...REQUESTS].filter((candidate) => candidate.id !== id).slice(0, 2),
  };
}
