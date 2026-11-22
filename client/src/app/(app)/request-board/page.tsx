"use client";

import { useSearchTerm } from "@/context/SearchContext";
import { SearchEmpty } from "@/components/shared/SearchEmpty";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { RequestBoardRail } from "@/components/shared/RequestBoardRail";
import { Skeleton } from "@/components/ui/Skeleton";
import { useIncomingQuoteRequests, useMyQuoteRequests } from "@/hooks/useServices";
import { comingSoonHref } from "@/lib/coming-soon";
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

const PILL = "rounded-full px-2.5 py-1 text-xs font-medium leading-4";
const FACT = "flex items-center gap-1.5 text-xs leading-[17px] text-[#64748a]";
const ACTION = "flex h-10 items-center justify-center rounded-[10px] px-4 text-sm font-medium leading-5";

/** One request on the board (Figma node 1043:22444): category and timing pills, quote count, title, place and budget, who posted it, and the actions. */
function RequestRow({ request, mine }: { request: QuoteRequestDto; mine: boolean }) {
  const href = `/request-board/${request.id}`;
  const quotes = `${request.quoteCount} ${request.quoteCount === 1 ? "quote" : "quotes"}`;
  const status = request.status && request.status !== "Open" ? request.status : null;
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-[#e2e8f0] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {request.category && <span className={cn(PILL, "bg-[#eff5ff] text-brand-900")}>{request.category}</span>}
          {request.preferredStart && <span className={cn(PILL, "bg-[#f1f5f9] text-[#334155]")}>Start {formatDate(request.preferredStart)}</span>}
          {request.requiresInspection && <span className={cn(PILL, "bg-[#fef3c7] text-[#b45309]")}>Site inspection first</span>}
          {status && <span className={cn(PILL, QUOTE_REQUEST_TONE[status])}>{status}</span>}
        </div>
        <p className="shrink-0 text-[13px] font-medium leading-[19px] text-[#64748a]">{quotes}</p>
      </div>

      <h2 className="text-[17px] font-bold leading-[25px] text-[#0f172a]">{request.title}</h2>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {request.city && (
          <p className={FACT}>
            <NavIcon icon="/icons/location-01.svg" size={14} className="shrink-0 bg-[#64748a]" />
            {request.city}
          </p>
        )}
        {request.budget !== null && (
          <p className={FACT}>
            <NavIcon icon="/icons/wallet-01.svg" size={14} className="shrink-0 bg-[#64748a]" />
            Budget {request.currency} {request.budget.toLocaleString("en-GH")}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative size-7 shrink-0 overflow-hidden rounded-full bg-gray-100">
            <Image src={request.requester.profilePicUrl ?? "/icons/avatar-placeholder-user.svg"} alt="" fill className="object-cover" sizes="28px" />
          </span>
          <p className="min-w-0 truncate text-xs leading-[17px] text-[#64748a]">
            {mine ? "Posted by you" : `Posted by ${request.requester.username ?? "a member"}`} · {formatRelative(request.createdAt)} ago
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={href} className={cn(ACTION, "border border-[#e2e8f0] bg-white text-[#0f172a] hover:bg-gray-50")}>
            View details
          </Link>
          {!mine && request.status === "Open" && (
            <Link href={href} className={cn(ACTION, "bg-brand-900 text-white hover:opacity-90")}>
              Send quote
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default function RequestBoardPage() {
  const [tab, setTab] = useState<Tab>("mine");
  const mine = useMyQuoteRequests();
  const incoming = useIncomingQuoteRequests();
  const active = tab === "mine" ? mine : incoming;
  const term = useSearchTerm();
  const requests = (active.data ?? []).filter((request) => !term || `${request.title} ${request.description} ${request.category} ${request.city}`.toLowerCase().includes(term));
  const empty = TABS.find((item) => item.key === tab)?.empty;

  return (
    <AppShell activeKey="services" activeChildKey="request-board" contentFullWidth rightRail={<RequestBoardRail />}>
      <PageContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Requests and quotes</h1>
            <p className="text-sm leading-5 text-gray-500">Ask up to five providers to quote a job, compare their prices side by side, then pick one.</p>
          </div>
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
        {active.data && active.data.length > 0 && requests.length === 0 && <SearchEmpty noun="requests" />}
        {active.data?.length === 0 &&
          (tab === "mine" ? (
            <EmptyState icon="requests" title="No requests yet" body={empty ?? ""} primary={{ label: "Post a request", href: "/request-board/new" }} />
          ) : (
            <EmptyState
              icon="requests"
              title="No open requests right now"
              body="When someone nearby needs a builder, a survey or a truck of sand, their request shows up here."
              primary={{ label: "Post a request", href: "/request-board/new" }}
              secondary={{ label: "Turn on alerts", href: comingSoonHref("Request alerts") }}
            />
          ))}
        <div className="flex flex-col gap-4">
          {requests.map((request) => (
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
