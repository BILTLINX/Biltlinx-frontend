"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PageContainer } from "@/components/shared/PageContainer";
import { RequestBoardRail } from "@/components/shared/RequestBoardRail";
import { RequestCard } from "@/components/shared/RequestCard";
import { Button } from "@/components/ui/Button";
import {
  REQUEST_CATEGORIES,
  REQUEST_TABS,
  REQUESTS,
  type JobRequest,
  type RequestCategory,
  type RequestTabKey,
} from "@/lib/dummy-requests";
import { loadPostedRequests } from "@/lib/posted-requests";
import { cn } from "@/lib/utils";

const TAB_FILTERS: Record<RequestTabKey, (request: JobRequest) => boolean> = {
  open: () => true,
  mine: (request) => request.owner === "me",
  quoted: (request) => Boolean(request.quotedByMe),
};

export default function RequestBoardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<RequestTabKey>("open");
  const [category, setCategory] = useState<RequestCategory>("All categories");
  const [postedRequests, setPostedRequests] = useState<JobRequest[]>([]);

  // Requests posted from /request-board/new live in local storage; "?tab=mine" is where posting sends you back to.
  useEffect(() => {
    setPostedRequests(loadPostedRequests());
    if (new URLSearchParams(window.location.search).get("tab") === "mine") setTab("mine");
  }, []);

  const requests = useMemo(
    () =>
      [...postedRequests, ...REQUESTS].filter(
        (request) => TAB_FILTERS[tab](request) && (category === "All categories" || request.category === category),
      ),
    [tab, category, postedRequests],
  );
  const emptyText = REQUEST_TABS.find((item) => item.key === tab)?.emptyText;

  return (
    <AppShell activeKey="services" activeChildKey="request-board" contentFullWidth rightRail={<RequestBoardRail />}>
      <PageContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Request Board</h1>
            <p className="text-sm leading-5 text-gray-500">
              Jobs people need done. Send a quote, or post your own request.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => router.push("/request-board/new")}
            className="h-10 w-auto shrink-0 self-start rounded-[10px] px-4 sm:self-auto lg:rounded-[10px]"
          >
            Post a request
          </Button>
        </div>

        <div
          role="tablist"
          aria-label="Requests"
          className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-1"
        >
          {REQUEST_TABS.map((item) => {
            const active = item.key === tab;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.key)}
                className={cn(
                  "min-w-fit flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm leading-5",
                  active ? "bg-white font-semibold text-brand-900" : "font-medium text-gray-500 hover:text-[#0f172a]",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div role="tablist" aria-label="Category" className="flex flex-wrap gap-2">
          {REQUEST_CATEGORIES.map((item) => {
            const active = item === category;
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(item)}
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

        {requests.length > 0 ? (
          <div className="flex flex-col gap-6">
            {requests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">{emptyText}</p>
        )}

        <div className="xl:hidden">
          <RequestBoardRail />
        </div>
      </PageContainer>
    </AppShell>
  );
}
