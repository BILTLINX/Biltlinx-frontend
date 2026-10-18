import { comingSoonHref } from "@/lib/coming-soon";
import type { ActionNeededItem } from "@/types/api/common";

interface ActionTarget {
  label: string;
  href: string;
}

const MODULE_ICONS: Record<string, string> = {
  Identity: "/icons/user-circle.svg",
  Verification: "/icons/checkmark-badge-01.svg",
  Listings: "/icons/building-03.svg",
  Leads: "/icons/message-01.svg",
  Services: "/icons/settings-02.svg",
  Stay: "/icons/guest-house-sm.svg",
};

const DEFAULT_ICON = "/icons/clipboard-list-01.svg";

const TARGETS: Record<string, ActionTarget> = {
  "verification-more-info": { label: "Respond", href: "/verification" },
  "verification-rejected": { label: "Review", href: "/verification" },
  "verification-expired": { label: "Renew", href: "/verification" },
  "verification-expiring": { label: "Renew", href: "/verification" },
  "verification-reviews": { label: "Review queue", href: comingSoonHref("Verification review") },
  "new-leads": { label: "View enquiries", href: "/manage/enquiries" },
  "follow-ups-due": { label: "Follow up", href: "/manage/enquiries" },
  "listing-reported": { label: "Confirm listing", href: "/manage/listings" },
  "listing-stale": { label: "Confirm listing", href: "/manage/listings" },
  "viewing-requests": { label: "Reply", href: comingSoonHref("Viewings") },
  "viewing-proposal": { label: "View time", href: comingSoonHref("Viewings") },
  "booking-requests": { label: "Open bookings", href: "/manage/artisan/jobs" },
  "quote-invites": { label: "Send quote", href: "/manage/artisan/quotes" },
  "inspection-proposals": { label: "Respond", href: "/request-board" },
  "quotes-received": { label: "Compare quotes", href: "/request-board" },
  "booking-hold": { label: "Finish booking", href: comingSoonHref("Manage booking") },
  "arriving-soon": { label: "View stay", href: comingSoonHref("Manage booking") },
  reservations: { label: "View reservations", href: comingSoonHref("Stay reservations") },
  "enable-two-factor": { label: "Turn on", href: "/account-settings" },
  "contact-change": { label: "Confirm", href: "/account-settings" },
  "organization-invitation": { label: "Accept", href: comingSoonHref("Organizations") },
  "capability-rejected": { label: "View", href: comingSoonHref("Capabilities") },
  "capability-reviews": { label: "Review", href: comingSoonHref("Capability review") },
};

export interface ActionCardData {
  key: string;
  icon: string;
  module: string;
  title: string;
  detail: string;
  label: string;
  href: string;
}

export function toActionCard(item: ActionNeededItem, index: number): ActionCardData {
  const target = TARGETS[item.type] ?? { label: "Open", href: comingSoonHref(item.title) };
  return {
    key: `${item.type}-${index}`,
    icon: MODULE_ICONS[item.module] ?? DEFAULT_ICON,
    module: item.module,
    title: item.title,
    detail: item.description,
    label: target.label,
    href: target.href,
  };
}
