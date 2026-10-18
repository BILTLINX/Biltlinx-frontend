"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PageContainer } from "@/components/shared/PageContainer";
import { NotificationRow } from "@/components/shared/NotificationRow";
import { NotificationsRail } from "@/components/shared/NotificationsRail";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import {
  NOTIFICATION_FILTERS,
  NOTIFICATION_GROUPS,
  NOTIFICATIONS,
  type NotificationFilter,
} from "@/lib/dummy-notifications";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<NotificationFilter>("All");
  const [readIds, setReadIds] = useState<string[]>([]);

  const notifications = useMemo(
    () =>
      NOTIFICATIONS.map((notification) => ({
        ...notification,
        unread: notification.unread && !readIds.includes(notification.id),
      })),
    [readIds],
  );
  const visible = notifications.filter(
    (notification) =>
      filter === "All" || (filter === "Unread" ? notification.unread : notification.category === filter),
  );
  const hasUnread = notifications.some((notification) => notification.unread);

  function markRead(ids: string[]) {
    setReadIds((current) => [...new Set([...current, ...ids])]);
  }

  return (
    <AppShell contentFullWidth rightRail={<NotificationsRail />}>
      <PageContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Notifications</h1>
            <p className="text-sm leading-5 text-gray-500">
              Updates on your listings, jobs, payments and network.
            </p>
          </div>
          <Button
            variant="outline"
            disabled={!hasUnread}
            onClick={() => markRead(notifications.map((notification) => notification.id))}
            className="h-10 w-auto shrink-0 self-start rounded-[10px] px-4 sm:self-auto lg:rounded-[10px]"
          >
            Mark all as read
          </Button>
        </div>

        <div role="tablist" aria-label="Notification filter" className="flex flex-wrap gap-2">
          {NOTIFICATION_FILTERS.map((item) => {
            const active = item === filter;
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(item)}
                className={cn(
                  "whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-medium leading-[18px]",
                  active ? "bg-brand-900 text-white" : "border border-gray-200 bg-white text-[#334155] hover:bg-gray-50",
                )}
              >
                {item}
              </button>
            );
          })}
        </div>

        {visible.length > 0 ? (
          NOTIFICATION_GROUPS.map((group) => {
            const items = visible.filter((notification) => notification.group === group);
            if (items.length === 0) return null;
            return (
              <section key={group} className="flex flex-col gap-3">
                <h2 className="text-[13px] font-medium leading-[19px] text-gray-500">{group}</h2>
                <ul className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                  {items.map((notification) => (
                    <NotificationRow
                      key={notification.id}
                      notification={notification}
                      onAction={() => {
                        markRead([notification.id]);
                        router.push(comingSoonHref(notification.action));
                      }}
                    />
                  ))}
                </ul>
              </section>
            );
          })
        ) : (
          <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            You’re all caught up.
          </p>
        )}

        <div className="xl:hidden">
          <NotificationsRail />
        </div>
      </PageContainer>
    </AppShell>
  );
}
