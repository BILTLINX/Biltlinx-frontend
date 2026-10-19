"use client";

import Link from "next/link";
import { useActionNeeded } from "@/hooks/useActionNeeded";
import { toActionCard } from "@/lib/action-needed";
import { Skeleton } from "@/components/ui/Skeleton";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4";

/** Manage side card (Figma node 1044:22703): what needs your attention right now, straight from the Action Needed list. */
export function ManageRail() {
  const { data, isPending } = useActionNeeded();
  const cards = (data ?? []).slice(0, 5).map(toActionCard);

  return (
    <div className="flex w-full flex-col gap-4">
      <section className={CARD}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Needs your attention</h2>
        {isPending && <Skeleton className="h-16 w-full" />}
        {!isPending && cards.length === 0 && <p className="text-[13px] text-gray-500">Nothing needs you right now.</p>}
        {cards.map((item) => (
          <Link key={item.key} href={item.href} className="flex flex-col items-start gap-1.5 rounded-xl bg-[#f8fafc] p-3 text-left hover:bg-[#f1f5f9]">
            <span className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">{item.title}</span>
            <span className="text-xs leading-[17px] text-gray-500">{item.detail}</span>
            <span className="text-xs font-medium leading-[17px] text-brand-900">{item.label} ›</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
