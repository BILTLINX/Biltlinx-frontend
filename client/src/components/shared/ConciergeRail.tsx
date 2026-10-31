"use client";

import Link from "next/link";
import { useMyConciergeRequests } from "@/hooks/useConcierge";
import { cn } from "@/lib/utils";
import type { ConciergeStatus } from "@/types/api/concierge";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4";

const STATUS_LABEL: Record<ConciergeStatus, string> = {
  New: "Waiting for a plan",
  InProgress: "In progress",
  Completed: "Completed",
  Cancelled: "Cancelled",
};

export function ConciergeRail({ selectedId }: { selectedId?: string }) {
  const requests = useMyConciergeRequests();
  const items = requests.data?.items ?? [];

  return (
    <div className="flex w-full flex-col gap-4">
      <section className={`${CARD} gap-2.5`}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Prefer to talk it through?</h2>
        <p className="text-xs leading-[17px] text-gray-500">Every request opens a conversation with the Concierge desk. Reply there to add details or ask about a step.</p>
        <Link href="/messages" className="flex h-11 items-center justify-center rounded-[10px] border border-gray-200 text-sm font-medium text-[#0f172a] hover:bg-gray-50">
          Open messages
        </Link>
      </section>

      <section className={CARD}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Your requests</h2>
        {requests.isPending ? (
          <p className="text-xs text-gray-500">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-xs leading-[17px] text-gray-500">Nothing yet. Describe what you need and Concierge will build a plan.</p>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={`/concierge?id=${item.id}`}
              className={cn("flex flex-col gap-0.5 rounded-lg px-2 py-1.5 hover:bg-gray-50", item.id === selectedId && "bg-[#eff5ff]")}
            >
              <p className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">{item.title}</p>
              <p className="text-xs leading-[17px] text-gray-500">
                {STATUS_LABEL[item.status]}
                {item.stepsTotal > 0 && ` · ${item.stepsDone} of ${item.stepsTotal} steps`}
              </p>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
