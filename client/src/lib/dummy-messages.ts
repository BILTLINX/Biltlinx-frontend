// Stand-ins for what the messaging API will return until it exists.

export const MESSAGE_FILTERS = ["All", "Unread", "Enquiries", "Jobs"] as const;
export type MessageFilter = (typeof MESSAGE_FILTERS)[number];

export interface ThreadMessage {
  id: string;
  /** "me" bubbles are blue and right-aligned. */
  from: "me" | "them";
  text: string;
  time: string;
}

export interface ThreadAction {
  title: string;
  status: string;
  /** Button label; after pressing it the card shows `confirmedStatus`. */
  action: string;
  confirmedStatus: string;
}

export interface ListingContext {
  title: string;
  /** e.g. "GHS 1,850,000 · East Legon Hills · price when you enquired" */
  summary: string;
  image: string;
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  /** What the conversation is about, e.g. "Quote · House rewiring". */
  subject: string;
  /** Preview of the latest message. */
  preview: string;
  time: string;
  unread: boolean;
  category: Exclude<MessageFilter, "All" | "Unread">;
  /** Under the name in the thread header. */
  roleLine: string;
  listing?: ListingContext;
  /** Heading shown above the messages, e.g. "Today". */
  dayLabel: string;
  messages: ThreadMessage[];
  action?: ThreadAction;
}

export const CONVERSATIONS: Conversation[] = [
  {
    id: "andy",
    name: "Andy Ansong",
    avatar: "/images/messages/andy.png",
    subject: "4-bed detached · East Legon",
    preview: "Viewing Saturday 10 am works for me.",
    time: "2m",
    unread: true,
    category: "Enquiries",
    roleLine: "Real Estate Consultant · usually replies in 1 hr",
    listing: {
      title: "4-bed detached house with BQ",
      summary: "GHS 1,850,000 · East Legon Hills · price when you enquired",
      image: "/images/marketplace/property-sale.jpg",
    },
    dayLabel: "Today",
    messages: [
      { id: "m1", from: "me", text: "Hi Andy, is the East Legon house still available? I’d like to view it this week.", time: "9:12 am" },
      { id: "m2", from: "them", text: "Yes, it is. I can do Friday 4 pm or Saturday 10 am.", time: "9:20 am" },
      { id: "m3", from: "me", text: "Saturday 10 am, please. Are the title documents ready to see?", time: "9:22 am" },
      { id: "m4", from: "them", text: "Viewing Saturday 10 am works for me. I’ll bring the title documents.", time: "9:31 am" },
    ],
    action: {
      title: "Viewing request · Sat 25 Oct, 10:00",
      status: "Waiting for you to confirm",
      action: "Confirm viewing",
      confirmedStatus: "Viewing confirmed",
    },
  },
  {
    id: "yaw",
    name: "Yaw Osei",
    avatar: "/images/messages/yaw.png",
    subject: "Quote · House rewiring",
    preview: "I’ve sent the revised quote: GHS 4,500",
    time: "1h",
    unread: false,
    category: "Jobs",
    roleLine: "Electrician · usually replies in 1 hr",
    dayLabel: "Today",
    messages: [
      { id: "m1", from: "me", text: "Could you bring the wiring quote down a little? Budget is tight.", time: "8:05 am" },
      { id: "m2", from: "them", text: "I’ve sent the revised quote: GHS 4,500", time: "8:40 am" },
    ],
  },
  {
    id: "ama",
    name: "Ama Boatengmaa",
    avatar: "/images/messages/ama.png",
    subject: "Architectural drawings",
    preview: "Here are the first sketches for your review",
    time: "3h",
    unread: false,
    category: "Jobs",
    roleLine: "Architect · Studio Horizon",
    dayLabel: "Today",
    messages: [{ id: "m1", from: "them", text: "Here are the first sketches for your review", time: "6:50 am" }],
  },
  {
    id: "kofi",
    name: "Kofi Asante",
    avatar: "/images/messages/kofi.png",
    subject: "Leaking kitchen tap · Unit 1A",
    preview: "I can come Thursday morning.",
    time: "Yesterday",
    unread: false,
    category: "Jobs",
    roleLine: "Plumber · usually replies in 2 hrs",
    dayLabel: "Yesterday",
    messages: [
      { id: "m1", from: "me", text: "The kitchen tap in Unit 1A is leaking. When can you look at it?", time: "4:15 pm" },
      { id: "m2", from: "them", text: "I can come Thursday morning.", time: "4:48 pm" },
    ],
  },
  {
    id: "golden-palm",
    name: "Golden Palm Hotel",
    avatar: "/images/messages/golden-palm.png",
    subject: "Booking · 24–26 Oct",
    preview: "Your booking is confirmed.",
    time: "Mon",
    unread: false,
    category: "Enquiries",
    roleLine: "Hotel · Labadi, Accra",
    dayLabel: "Monday",
    messages: [{ id: "m1", from: "them", text: "Your booking is confirmed.", time: "11:02 am" }],
  },
];
