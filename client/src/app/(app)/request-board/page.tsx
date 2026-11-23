"use client";

import { useSearchTerm } from "@/context/SearchContext";
import { SearchEmpty } from "@/components/shared/SearchEmpty";
import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageContainer } from "@/components/shared/PageContainer";
import { RequestCard } from "@/components/shared/RequestCard";
import { RequestBoardRail } from "@/components/shared/RequestBoardRail";
import { Skeleton } from "@/components/ui/Skeleton";
import { openRequestModal } from "@/hooks/useRequestModal";
import { useIncomingQuoteRequests, useMyQuoteRequests } from "@/hooks/useServices";
import { comingSoonHref } from "@/lib/coming-soon";
import { errorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";

type Tab = "mine" | "incoming";

const TABS: { key: Tab; label: string; empty: string }[] = [
  { key: "mine", label: "My requests", empty: "You have not asked anyone for a quote yet. Post a request and invite up to five providers." },
  { key: "incoming", label: "Invited to quote", empty: "Nobody has invited you to quote yet. Complete your provider profile so people can find you." },
];

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
            <EmptyState icon="requests" title="No requests yet" body={empty ?? ""} primary={{ label: "Post a request", onClick: openRequestModal }} />
          ) : (
            <EmptyState
              icon="requests"
              title="No open requests right now"
              body="When someone nearby needs a builder, a survey or a truck of sand, their request shows up here."
              primary={{ label: "Post a request", onClick: openRequestModal }}
              secondary={{ label: "Turn on alerts", href: comingSoonHref("Request alerts") }}
            />
          ))}
        <div className="flex flex-col gap-4">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} mine={tab === "mine"} />
          ))}
        </div>

        <div className="xl:hidden">
          <RequestBoardRail />
        </div>
      </PageContainer>
    </AppShell>
  );
}
