"use client";

import Link from "next/link";
import { AppShell } from "@/components/shared/AppShell";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { useActionNeeded } from "@/hooks/useActionNeeded";
import { toActionCard } from "@/lib/action-needed";
import { errorMessage } from "@/lib/errors";

export default function NotificationsPage() {
  const { data, isPending, error } = useActionNeeded();
  const cards = (data ?? []).map(toActionCard);

  return (
    <AppShell contentFullWidth>
      <PageContainer>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Notifications</h1>
          <p className="text-sm leading-5 text-gray-500">Things that need you right now. A full history of updates is coming soon.</p>
        </div>

        {isPending && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}
        {error && <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">{errorMessage(error)}</p>}
        {!isPending && !error && cards.length === 0 && (
          <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">You’re all caught up.</p>
        )}
        {cards.length > 0 && (
          <ul className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {cards.map((card) => (
              <li key={card.key} className="border-b border-gray-100 last:border-b-0">
                <Link href={card.href} className="flex items-center gap-3 p-4 hover:bg-gray-50">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eff5ff]">
                    <NavIcon icon={card.icon} size={20} className="bg-brand-900" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-sm font-semibold leading-5 text-[#0f172a]">{card.title}</span>
                    <span className="text-xs leading-[17px] text-gray-500">{card.detail}</span>
                  </span>
                  <span className="shrink-0 text-xs font-medium text-brand-900">{card.label} ›</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </AppShell>
  );
}
