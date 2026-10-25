"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PageContainer } from "@/components/shared/PageContainer";
import { RequestBoardRail } from "@/components/shared/RequestBoardRail";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useIncomingQuoteRequests, useMyQuoteRequests } from "@/hooks/useServices";
import { errorMessage } from "@/lib/errors";
import { formatDate, formatRelative } from "@/lib/format";
import { QUOTE_REQUEST_TONE } from "@/lib/services-labels";
import type { QuoteRequestDto } from "@/types/api/schema";
import { cn } from "@/lib/utils";

type Tab = "mine" | "incoming";

const TABS: { key: Tab; label: string; empty: string }[] = [
  { key: "mine", label: "My requests", empty: "You have not asked anyone for a quote yet. Post a request and invite up to five providers." },
  { key: "incoming", label: "Invited to quote", empty: "Nobody has invited you to quote yet. Complete your provider profile so people can find you." },
];

function RequestRow({ request, mine }: { request: QuoteRequestDto; mine: boolean }) {
  return (
    <Link href={`/request-board/${request.id}`} className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 hover:border-brand-900">
      <div className="flex flex-wrap items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-[15px] font-bold text-[#0f172a]">{request.title}</p>
        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", QUOTE_REQUEST_TONE[request.status ?? ""])}>{request.status}</span>
      </div>
      <p className="line-clamp-2 text-[13px] text-[#334155]">{request.description}</p>
      <p className="flex flex-wrap gap-x-3 text-xs text-gray-500">
        <span>{request.category}</span>
        <span>{request.city}</span>
        {request.budget !== null && <span>Budget {request.currency} {request.budget.toLocaleString("en-GH")}</span>}
        {request.preferredStart && <span>Start {formatDate(request.preferredStart)}</span>}
        <span>{mine ? `${request.quoteCount} ${request.quoteCount === 1 ? "quote" : "quotes"}` : `from ${request.requester.username}`}</span>
        <span>{formatRelative(request.createdAt)} ago</span>
      </p>
      {request.requiresInspection && <p className="text-xs font-medium text-[#b45309]">Needs a site inspection before quoting</p>}
    </Link>
  );
}

export default function RequestBoardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("mine");
  const mine = useMyQuoteRequests();
  const incoming = useIncomingQuoteRequests();
  const active = tab === "mine" ? mine : incoming;
  const empty = TABS.find((item) => item.key === tab)?.empty;

  return (
    <AppShell activeKey="services" activeChildKey="request-board" contentFullWidth rightRail={<RequestBoardRail />}>
      <PageContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Requests and quotes</h1>
            <p className="text-sm leading-5 text-gray-500">Ask up to five providers to quote a job, compare their prices side by side, then pick one.</p>
          </div>
          <Button variant="primary" onClick={() => router.push("/request-board/new")} className="h-10 w-auto shrink-0 self-start rounded-[10px] px-4 sm:self-auto lg:rounded-[10px]">
            Post a request
          </Button>
        </div>

        <div role="tablist" aria-label="Requests" className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-1">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={item.key === tab}
              onClick={() => setTab(item.key)}
              className={cn("min-w-fit flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm leading-5", item.key === tab ? "bg-white font-semibold text-brand-900" : "font-medium text-gray-500 hover:text-[#0f172a]")}
            >
              {item.label}
              {item.key === "incoming" && (incoming.data?.length ?? 0) > 0 ? ` (${incoming.data?.length})` : ""}
            </button>
          ))}
        </div>

        {active.isPending && <Skeleton className="h-24 w-full rounded-2xl" />}
        {active.isError && <p className="text-sm text-[#dc2626]">{errorMessage(active.error)}</p>}
        {active.data?.length === 0 && <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">{empty}</p>}
        <div className="flex flex-col gap-3">
          {active.data?.map((request) => (
            <RequestRow key={request.id} request={request} mine={tab === "mine"} />
          ))}
        </div>

        <div className="xl:hidden">
          <RequestBoardRail />
        </div>
      </PageContainer>
    </AppShell>
  );
}
