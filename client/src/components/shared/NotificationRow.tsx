"use client";

import { NavIcon } from "@/components/shared/NavIcon";
import type { NotificationItem, NotificationTone } from "@/lib/dummy-notifications";
import { cn } from "@/lib/utils";

const TONE_CLASS: Record<NotificationTone, { tile: string; icon: string }> = {
  blue: { tile: "bg-[#eff5ff]", icon: "bg-brand-900" },
  green: { tile: "bg-[#dcfce7]", icon: "bg-[#16a34a]" },
  amber: { tile: "bg-[#fef3c7]", icon: "bg-[#b45309]" },
  red: { tile: "bg-[#fee2e2]", icon: "bg-[#dc2626]" },
  purple: { tile: "bg-[#f3e8ff]", icon: "bg-[#9333ea]" },
  slate: { tile: "bg-[#f1f5f9]", icon: "bg-[#334155]" },
};

interface NotificationRowProps {
  notification: NotificationItem;
  onAction: () => void;
}

/** One notification (Figma node 1046:23324): coloured icon tile, what happened, when, a follow-up action and an unread dot. */
export function NotificationRow({ notification, onAction }: NotificationRowProps) {
  const tone = TONE_CLASS[notification.tone];

  return (
    <li
      className={cn(
        "flex flex-wrap items-center gap-x-3.5 gap-y-2 border-b border-gray-200 px-4 py-3.5 last:border-b-0",
        notification.unread && "bg-[#f8fbff]",
      )}
    >
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tone.tile)}>
        <NavIcon icon={notification.icon} size={17} className={tone.icon} />
      </span>
      <div className="flex min-w-[180px] flex-1 flex-col gap-0.5">
        <p className={cn("text-sm leading-5 text-[#0f172a]", notification.unread ? "font-semibold" : "font-medium")}>
          {notification.title}
        </p>
        <p className="text-xs leading-[17px] text-gray-500">{notification.detail}</p>
      </div>
      <span className="shrink-0 text-xs leading-[17px] text-[#94a3b8]">{notification.time}</span>
      <button
        type="button"
        onClick={onAction}
        className="h-8 shrink-0 whitespace-nowrap rounded-[10px] border border-gray-200 bg-white px-4 text-sm font-medium text-[#0f172a] hover:bg-gray-50"
      >
        {notification.action}
      </button>
      <span
        aria-label={notification.unread ? "Unread" : undefined}
        className={cn("size-2 shrink-0 rounded-full", notification.unread ? "bg-brand-900" : "bg-transparent")}
      />
    </li>
  );
}
