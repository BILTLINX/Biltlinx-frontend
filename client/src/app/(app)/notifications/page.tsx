"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterDropdown } from "@/components/shared/FilterDropdown";
import { NavIcon } from "@/components/shared/NavIcon";
import { NotificationsRail } from "@/components/shared/NotificationsRail";
import { PageContainer } from "@/components/shared/PageContainer";
import { SearchEmpty } from "@/components/shared/SearchEmpty";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSearchTerm } from "@/context/SearchContext";
import { useActionNeeded } from "@/hooks/useActionNeeded";
import { toActionCard } from "@/lib/action-needed";
import { errorMessage } from "@/lib/errors";

/** The icon tile for each kind of notification: a pale background with a matching icon colour. */
const TONES: Record<string, { tile: string; icon: string }> = {
  Identity: { tile: "bg-[#eff5ff]", icon: "bg-brand-900" },
  Verification: { tile: "bg-[#dcfce7]", icon: "bg-[#16a34a]" },
  Listings: { tile: "bg-[#fef3c7]", icon: "bg-[#d97706]" },
  Leads: { tile: "bg-[#eff5ff]", icon: "bg-brand-900" },
  Services: { tile: "bg-[#fee2e2]", icon: "bg-[#dc2626]" },
  Stay: { tile: "bg-[#f3e8ff]", icon: "bg-[#9333ea]" },
};
const DEFAULT_TONE = { tile: "bg-[#f1f5f9]", icon: "bg-[#475569]" };

export default function NotificationsPage() {
  const { data, isPending, error } = useActionNeeded();
  const term = useSearchTerm();
  const [module, setModule] = useState("all");
  const all = useMemo(() => (data ?? []).map(toActionCard), [data]);
  const modules = useMemo(() => [...new Set(all.map((card) => card.module))], [all]);
  const cards = all.filter((card) => (module === "all" || card.module === module) && (!term || `${card.title} ${card.detail}`.toLowerCase().includes(term)));

  return (
    <AppShell contentFullWidth rightRail={<NotificationsRail />}>
      <PageContainer>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Notifications</h1>
          <p className="text-sm leading-5 text-gray-500">Updates on your listings, jobs, payments and network.</p>
        </div>

        {modules.length > 1 && (
          <FilterDropdown label="Show" value={module} onChange={setModule} options={[{ value: "all", label: "All" }, ...modules.map((name) => ({ value: name, label: name }))]} />
        )}

        {isPending && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}
        {error && <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">{errorMessage(error)}</p>}
        {!isPending && !error && all.length > 0 && cards.length === 0 && <SearchEmpty noun="notifications" />}
        {!isPending && !error && all.length === 0 && (
          <EmptyState
            mood="celebrate"
            icon="bell-celebrate"
            title="You’re all caught up"
            body="Nothing new. We’ll let you know about messages, viewings, payments and jobs as they happen."
            primary={{ label: "Notification settings", href: "/account-settings" }}
          />
        )}
        {cards.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-[13px] font-semibold leading-[19px] text-gray-500">Needs your attention</h2>
            <ul className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {cards.map((card) => {
                const tone = TONES[card.module] ?? DEFAULT_TONE;
                return (
                  <li key={card.key} className="flex items-center gap-3.5 border-b border-gray-200 px-4 py-3.5 last:border-b-0">
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone.tile}`}>
                      <NavIcon icon={card.icon} size={20} className={tone.icon} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-sm font-semibold leading-5 text-[#0f172a]">{card.title}</span>
                      <span className="text-xs leading-[17px] text-gray-500">{card.detail}</span>
                    </span>
                    <Link href={card.href} className="flex h-8 shrink-0 items-center rounded-[10px] border border-gray-200 bg-white px-4 text-sm font-medium text-[#0f172a] hover:bg-gray-50">
                      {card.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </PageContainer>
    </AppShell>
  );
}
