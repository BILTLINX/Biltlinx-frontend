// Stand-ins for what the communities API will return until it exists.

export const COMMUNITY_FILTERS = [
  "For you",
  "My communities",
  "Neighbourhoods",
  "Building & DIY",
  "Landlords",
  "Diaspora buyers",
  "Professionals",
] as const;

export type CommunityFilter = (typeof COMMUNITY_FILTERS)[number];

/** Community type for each filter chip that narrows by type. */
export const FILTER_TYPES: Partial<Record<CommunityFilter, string>> = {
  Neighbourhoods: "Neighbourhood",
  "Building & DIY": "Building & DIY",
  Landlords: "Landlords",
  "Diaspora buyers": "Diaspora buyers",
  Professionals: "Professionals",
};

/** The types a community can be, as offered when starting one. */
export const COMMUNITY_TYPES = Object.values(FILTER_TYPES);

export const COMMUNITY_PRIVACY = ["Public", "Private"] as const;

export type CommunityPrivacy = (typeof COMMUNITY_PRIVACY)[number];

export interface Community {
  id: string;
  name: string;
  type: string;
  members: string;
  description: string;
  image: string;
  /** Public when not set. */
  privacy?: CommunityPrivacy;
  /** Its own rules; the sample communities share the default ones. */
  rules?: string[];
  /** Started by the person looking at it. */
  mine?: boolean;
}

/** The cover a new community gets when no picture is uploaded for it. */
export const COMMUNITY_COVERS: Record<string, string> = {
  Neighbourhood: "/images/marketplace/property-sale.jpg",
  "Building & DIY": "/images/marketplace/equipment.jpg",
  Landlords: "/images/marketplace/rental.jpg",
  "Diaspora buyers": "/images/marketplace/land.jpg",
  Professionals: "/images/marketplace/property-tower.jpg",
};

export const DEFAULT_COMMUNITY_RULES = ["Be respectful", "No paid ads outside the Marketplace", "Report scams to moderators"];

/** "4.2k members", or "1 member" for a community that only has its founder. */
export function memberCount(community: Community) {
  return `${community.members} ${community.members === "1" ? "member" : "members"}`;
}

export const COMMUNITIES: Community[] = [
  {
    id: "east-legon-residents",
    name: "East Legon Residents",
    type: "Neighbourhood",
    members: "4.2k",
    description: "Water, roads, security and recommendations for East Legon.",
    image: "/images/marketplace/property-sale.jpg",
  },
  {
    id: "build-it-right",
    name: "Build It Right Ghana",
    type: "Building & DIY",
    members: "12.8k",
    description: "Ask builders, engineers and artisans before you pour concrete.",
    image: "/images/marketplace/equipment.jpg",
  },
  {
    id: "accra-landlords",
    name: "Accra Landlords Forum",
    type: "Landlords",
    members: "2.9k",
    description: "Tenancy, rent and maintenance questions from owners.",
    image: "/images/marketplace/rental.jpg",
  },
];

export interface Discussion {
  id: string;
  communityId: string;
  author: string;
  avatar: string;
  question: string;
  /** e.g. "38 answers · 2h" */
  meta: string;
}

export const DISCUSSIONS: Discussion[] = [
  {
    id: "d1",
    communityId: "build-it-right",
    author: "Kwame Mensah",
    avatar: "/images/communities/kwame.png",
    question: "What should a site plan from a licensed surveyor include before I buy land in Oyibi?",
    meta: "38 answers · 2h",
  },
  {
    id: "d2",
    communityId: "east-legon-residents",
    author: "Abena Owusu",
    avatar: "/images/communities/abena.png",
    question: "Recommendations for a reliable borehole driller near American House?",
    meta: "14 answers · 5h",
  },
  {
    id: "d3",
    communityId: "accra-landlords",
    author: "Andy Ansong",
    avatar: "/images/communities/andy.png",
    question: "How are you handling 1-year vs 2-year rent advances after the new guidance?",
    meta: "61 answers · yesterday",
  },
];

export interface JoinedCommunity {
  id: string;
  name: string;
  note: string;
  image: string;
}

export const JOINED_COMMUNITIES: JoinedCommunity[] = [
  { id: "j1", name: "Cantonments Owners", note: "3 new posts", image: "/images/marketplace/property-tower.jpg" },
  { id: "j2", name: "Oyibi Land Buyers", note: "12 new posts", image: "/images/marketplace/land.jpg" },
  { id: "j3", name: "Adenta Heights Buyers", note: "Event Sat 10 am", image: "/images/marketplace/development.jpg" },
];

export interface CommunityEvent {
  id: string;
  weekday: string;
  date: string;
  title: string;
  community: string;
}

export const COMMUNITY_EVENTS: CommunityEvent[] = [
  { id: "e1", weekday: "Sat", date: "25 Oct", title: "Adenta Heights show-unit tour", community: "Adenta Heights Buyers" },
  { id: "e2", weekday: "Thu", date: "30 Oct", title: "Webinar: buying land safely", community: "Build It Right Ghana" },
];

// Stand-ins for the richer data a community's own API record will carry. Until it exists, every community shares
// these placeholder details and only the headline fields (name, type, size, cover) come from the listing.

export const COMMUNITY_TABS = [
  { key: "posts", label: "Posts" },
  { key: "events", label: "Events" },
  { key: "members", label: "Members" },
  { key: "about", label: "About" },
] as const;

export interface CommunityPost {
  id: string;
  author: string;
  avatar: string;
  postedAgo: string;
  text: string;
  /** e.g. "12 replies" */
  stat: string;
}

export interface CommunityDetailEvent {
  id: string;
  day: string;
  month: string;
  title: string;
  meta: string;
  /** Only on an event someone started here; the sample events share placeholder details instead. */
  hostName?: string;
  kind?: string;
  when?: string;
  where?: string;
  about?: string;
  capacity?: number;
}

export const EVENT_KINDS = ["Meetup", "Open house", "Webinar", "Site visit"] as const;

/** An event started from the "Create event" form, kept in this browser until the events API exists. */
export interface StartedEvent {
  id: string;
  communityId: string;
  title: string;
  kind: string;
  /** yyyy-mm-dd */
  date: string;
  /** hh:mm, 24-hour */
  time: string;
  place: string;
  about: string;
  /** Unlimited when not set. */
  capacity?: number;
  hostName: string;
}

/** "14:30" → "2:30 pm" */
function clockLabel(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return `${hours % 12 || 12}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""} ${hours < 12 ? "am" : "pm"}`;
}

/** A started event as the community page lists it. */
export function eventSummary(event: StartedEvent): CommunityDetailEvent {
  const [year, month, day] = event.date.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return {
    id: event.id,
    day: String(day),
    month: date.toLocaleDateString("en-GB", { month: "short" }),
    title: event.title,
    meta: `${event.place} · ${clockLabel(event.time)}`,
    hostName: event.hostName,
    kind: event.kind,
    when: `${date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).replace(",", "")} · ${clockLabel(event.time)}`,
    where: event.place,
    about: event.about,
    capacity: event.capacity,
  };
}

export interface CommunityDetail {
  community: Community;
  breadcrumbs: { label: string; href?: string }[];
  activity: string;
  viewerAvatar: string;
  posts: CommunityPost[];
  events: CommunityDetailEvent[];
  rules: string[];
  moderators: { id: string; avatar: string }[];
}

export function getCommunityDetail(id: string): CommunityDetail | undefined {
  const community = COMMUNITIES.find((candidate) => candidate.id === id);
  if (!community) return undefined;

  return {
    community,
    breadcrumbs: [{ label: "Communities", href: "/communities" }, { label: community.name }],
    activity: "36 posts this week",
    viewerAvatar: "/images/communities/detail-viewer.png",
    posts: [
      {
        id: "p1",
        author: "Abena Owusu",
        avatar: "/images/communities/detail-post-1.png",
        postedAgo: "2h ago",
        text: "Anyone know a reliable borehole driller around Adjiringanor? Need one before December.",
        stat: "12 replies",
      },
      {
        id: "p2",
        author: "Kwame Asare",
        avatar: "/images/communities/detail-post-2.png",
        postedAgo: "2h ago",
        text: "Reminder: ECG maintenance on Saturday, 9 am – 3 pm, Lagos Ave and surrounding streets.",
        stat: "31 likes",
      },
    ],
    events: [
      { id: "e1", day: "1", month: "Nov", title: "Homeowners meeting", meta: "Lizzie’s Place · 10 am" },
      { id: "e2", day: "15", month: "Nov", title: "Open house tour", meta: "6 homes · 2 pm" },
    ],
    rules: DEFAULT_COMMUNITY_RULES,
    moderators: [
      { id: "m1", avatar: "/images/communities/detail-mod-1.png" },
      { id: "m2", avatar: "/images/communities/detail-mod-2.png" },
      { id: "m3", avatar: "/images/communities/detail-mod-3.png" },
    ],
  };
}

/** The page of a community the viewer has just started: its own details, the viewer as its only moderator, and nothing posted or planned yet. */
export function startedCommunityDetail(community: Community, viewerAvatar: string): CommunityDetail {
  return {
    community,
    breadcrumbs: [{ label: "Communities", href: "/communities" }, { label: community.name }],
    activity: "Started by you",
    viewerAvatar,
    posts: [],
    events: [],
    rules: community.rules ?? DEFAULT_COMMUNITY_RULES,
    moderators: [{ id: "you", avatar: viewerAvatar }],
  };
}

// Stand-ins for an event's own API record. Until it exists, every event shares these placeholder details and only
// the headline fields (title, day, month, place) come from the community's event list.

export interface EventHome {
  id: string;
  price: string;
  note: string;
  image: string;
}

export interface EventDetail {
  event: CommunityDetailEvent;
  community: Community;
  breadcrumbs: { label: string; href?: string }[];
  cover: string;
  kind: string;
  when: string;
  where: string;
  about: string;
  homes: EventHome[];
  homesTotal: number;
  /** Both null when there is no limit on who can come. */
  spotsLeft: number | null;
  capacity: number | null;
  host: { name: string; avatar: string; verified: boolean };
  going: { total: number; avatars: string[] };
}

export const RSVP_OPTIONS = ["Going", "Maybe", "Can’t go"] as const;

export type RsvpOption = (typeof RSVP_OPTIONS)[number];

export function getEventDetail(detail: CommunityDetail | undefined, eventId: string): EventDetail | undefined {
  const event = detail?.events.find((candidate) => candidate.id === eventId);
  if (!detail || !event) return undefined;

  if (event.hostName) {
    return {
      event,
      community: detail.community,
      breadcrumbs: [
        { label: "Communities", href: "/communities" },
        { label: detail.community.name, href: `/communities/${detail.community.id}` },
        { label: "Events" },
        { label: event.title },
      ],
      cover: detail.community.image,
      kind: event.kind ?? "Event",
      when: event.when ?? "",
      where: event.where ?? "",
      about: event.about ?? "",
      homes: [],
      homesTotal: 0,
      spotsLeft: event.capacity ? event.capacity - 1 : null,
      capacity: event.capacity ?? null,
      host: { name: event.hostName, avatar: detail.viewerAvatar, verified: false },
      going: { total: 1, avatars: [detail.viewerAvatar] },
    };
  }

  const weekday = new Date(`${event.day} ${event.month} 2026`).toLocaleDateString("en-GB", { weekday: "short" });

  return {
    event,
    community: detail.community,
    breadcrumbs: [
      { label: "Communities", href: "/communities" },
      { label: detail.community.name, href: `/communities/${detail.community.id}` },
      { label: "Events" },
      { label: event.title },
    ],
    cover: "/images/communities/event-cover.jpg",
    kind: "Open house · free",
    when: `${weekday} ${event.day} ${event.month} 2026 · 2:00 – 5:00 pm`,
    where: `${event.meta.split(" · ")[0]} · hosted for ${detail.community.name}`,
    about: "Tour 6 homes for sale with the listing agents. Documents for each home will be available to view on the day.",
    homes: [
      { id: "h1", price: "GHS 1,850,000", note: "4-bed · East Legon Hills", image: "/images/communities/event-cover.jpg" },
      { id: "h2", price: "GHS 2,100,000", note: "4-bed · Adjiringanor", image: "/images/communities/event-home-2.jpg" },
      { id: "h3", price: "GHS 1,650,000", note: "4-bed · East Legon", image: "/images/communities/event-home-3.jpg" },
    ],
    homesTotal: 6,
    spotsLeft: 38,
    capacity: 60,
    host: { name: "Kasapa Properties Ltd", avatar: "/images/communities/event-host.png", verified: true },
    going: {
      total: 22,
      avatars: [1, 2, 3, 4, 5, 6].map((index) => `/images/communities/event-going-${index}.png`),
    },
  };
}
