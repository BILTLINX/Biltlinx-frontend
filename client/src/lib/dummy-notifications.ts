// Stand-ins for what the notifications API will return until it exists.

export const NOTIFICATION_FILTERS = [
  "All",
  "Unread",
  "Messages",
  "Marketplace",
  "Property operations",
  "Projects & jobs",
  "Social",
] as const;

export type NotificationFilter = (typeof NOTIFICATION_FILTERS)[number];

export type NotificationTone = "blue" | "green" | "amber" | "red" | "purple" | "slate";

export interface NotificationItem {
  id: string;
  group: "Today" | "This week";
  category: Exclude<NotificationFilter, "All" | "Unread">;
  /** Icon in the coloured tile; the tone picks the tile and icon colours. */
  icon: string;
  tone: NotificationTone;
  title: string;
  detail: string;
  /** e.g. "2m", "Mon". */
  time: string;
  action: string;
  unread: boolean;
}

export const NOTIFICATION_GROUPS = ["Today", "This week"] as const;

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    group: "Today",
    category: "Messages",
    icon: "/icons/post-options-who-can-comment.svg",
    tone: "blue",
    title: "Andy Ansong confirmed your viewing for Sat 25 Oct, 10:00",
    detail: "4-bed detached house · East Legon Hills",
    time: "2m",
    action: "View",
    unread: true,
  },
  {
    id: "n2",
    group: "Today",
    category: "Marketplace",
    icon: "/icons/wallet-01.svg",
    tone: "green",
    title: "Payment received: GHS 900 to Kwame Mensah",
    detail: "Boundary survey · receipt ready",
    time: "1h",
    action: "Receipt",
    unread: true,
  },
  {
    id: "n3",
    group: "Today",
    category: "Marketplace",
    icon: "/icons/post-options-report.svg",
    tone: "amber",
    title: "Price dropped on a home you saved",
    detail: "4-bed detached house · now GHS 1,850,000",
    time: "3h",
    action: "See home",
    unread: false,
  },
  {
    id: "n4",
    group: "This week",
    category: "Property operations",
    icon: "/icons/wrench-01.svg",
    tone: "red",
    title: "New work order: Leaking kitchen tap, Unit 1A",
    detail: "2 quotes received · GHS 280 and GHS 350",
    time: "Mon",
    action: "Compare",
    unread: false,
  },
  {
    id: "n5",
    group: "This week",
    category: "Property operations",
    icon: "/icons/post-options-compare.svg",
    tone: "purple",
    title: "Fire safety certificate expires in 17 days",
    detail: "Dzorwulu block · start renewal",
    time: "Mon",
    action: "Renew",
    unread: false,
  },
  {
    id: "n6",
    group: "This week",
    category: "Social",
    icon: "/icons/user-group.svg",
    tone: "slate",
    title: "Build It Right Ghana: 12 new answers to your question",
    detail: "“What should a site plan include…”",
    time: "Sun",
    action: "Open",
    unread: false,
  },
];

export const NOTIFICATION_SETTINGS = [
  { label: "Messages", channels: "Push + email" },
  { label: "Marketplace & alerts", channels: "Push" },
  { label: "Property operations", channels: "Push + email" },
  { label: "Projects & jobs", channels: "Push" },
  { label: "Social", channels: "Off" },
  { label: "Marketing", channels: "Off" },
];
