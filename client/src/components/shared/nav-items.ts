import { comingSoonHref } from "@/lib/coming-soon";

export interface NavChildItem {
  key: string;
  label: string;
  icon: string;
  href: string;
}

export interface NavItem {
  key: string;
  label: string;
  icon: string;
  /** Rendered glyph size in the sidebar's 20px icon slot, for icons exported cropped to their artwork. */
  iconSize?: number;
  href: string;
  children?: NavChildItem[];
}

function childComingSoon(label: string, navKey: string, navChildKey: string) {
  return comingSoonHref(label, { navKey, navChildKey });
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: "feed",
    label: "Explore Hub",
    icon: "/icons/grid-view.svg",
    href: "#",
    children: [
      { key: "home", label: "Home", icon: "/icons/home-03.svg", href: "/home" },
      { key: "feed-page", label: "Feed", icon: "/icons/article-document.svg", href: "/feed" },
      { key: "discover", label: "Discover", icon: "/icons/compass-01.svg", href: "/discover" },
      { key: "marketplace", label: "Marketplace", icon: "/icons/building-03.svg", href: "/marketplace" },
    ],
  },
  {
    key: "property",
    label: "Property",
    icon: "/icons/building-03.svg",
    href: "#",
    children: [
      { key: "properties", label: "Properties", icon: "/icons/building-03.svg", href: "/properties" },
      { key: "stay", label: "Stay", icon: "/icons/guest-house-sm.svg", href: "/stay" },
      { key: "projects", label: "Projects", icon: "/icons/folder-01.svg", href: "/projects" },
    ],
  },
  {
    key: "people",
    label: "People",
    icon: "/icons/user-star-01.svg",
    href: "#",
    children: [
      { key: "professionals", label: "Professionals", icon: "/icons/briefcase-09.svg", href: "/professionals" },
      { key: "artisans", label: "Artisans", icon: "/icons/hammer-01.svg", href: "/artisans" },
    ],
  },
  {
    key: "services",
    label: "Services",
    icon: "/icons/wrench-01.svg",
    iconSize: 17,
    href: "#",
    children: [
      { key: "services", label: "Services", icon: "/icons/settings-02.svg", href: "/services" },
      { key: "request-board", label: "Request Board", icon: "/icons/clipboard-list-01.svg", href: "/request-board" },
    ],
  },
  { key: "communities", label: "Communities", icon: "/icons/user-group.svg", href: "/communities" },
  {
    key: "concierge",
    label: "Concierge",
    icon: "/icons/customer-service.svg",
    iconSize: 17,
    href: "/concierge",
  },
  {
    key: "manage",
    label: "Manage",
    icon: "/icons/briefcase-01.svg",
    iconSize: 17,
    href: "/manage",
  },
  {
    key: "you",
    label: "You",
    icon: "/icons/user-circle.svg",
    iconSize: 17,
    href: "#",
    children: [
      { key: "saved", label: "Saved", icon: "/icons/archive-save.svg", href: "/saved" },
      { key: "workspace", label: "My Workspace", icon: "/icons/folder-01.svg", href: childComingSoon("My Workspace", "you", "workspace") },
    ],
  },
];

/** Every destination reachable from the nav, with childless items standing in as their own entry. */
export const NAV_DESTINATIONS = NAV_ITEMS.flatMap((item) =>
  (item.children ?? [{ key: item.key, label: item.label, icon: item.icon, href: item.href }]).map((child) => ({
    ...child,
    parentKey: item.key,
  })),
);
