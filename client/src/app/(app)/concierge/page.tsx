"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ActionPlan } from "@/components/shared/ActionPlan";
import { AppShell } from "@/components/shared/AppShell";
import { ConciergeFeeCard, ConciergeShortlist, ConciergeUpdates } from "@/components/shared/ConciergeExtras";
import { ConciergeHero } from "@/components/shared/ConciergeHero";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConciergeRail } from "@/components/shared/ConciergeRail";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useConciergeMutations, useMyConciergeRequest, useMyConciergeRequests } from "@/hooks/useConcierge";

function ConciergeContent() {
  const requested = useSearchParams().get("id") ?? undefined;
  const requests = useMyConciergeRequests();
  const items = requests.data?.items ?? [];
  const activeId = requested ?? items.find((item) => item.status === "New" || item.status === "InProgress")?.id ?? items[0]?.id;
  const detail = useMyConciergeRequest(activeId);
  const { cancel } = useConciergeMutations();
  const request = detail.data;
  const open = request && (request.status === "New" || request.status === "InProgress");
  const heading = request?.status === "Completed" ? "Completed plan" : request?.status === "Cancelled" ? "Cancelled request" : "Your active plan";

  return (
    <AppShell activeKey="concierge" contentFullWidth rightRail={<ConciergeRail selectedId={activeId} />}>
      <PageContainer>
        <ConciergeHero />

        {requests.isPending || (activeId && detail.isPending) ? (
          <Skeleton className="h-48 w-full rounded-2xl" />
        ) : request ? (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">
                {heading} · {request.title}
              </h2>
              {open && (
                <Button variant="outline" disabled={cancel.isPending} onClick={() => cancel.mutate(request.id)} className="h-9 w-auto shrink-0 rounded-[10px] px-4 lg:rounded-[10px]">
                  Cancel request
                </Button>
              )}
            </div>
            {request.steps.length > 0 ? (
              <ActionPlan steps={request.steps} />
            ) : request.status === "Cancelled" ? (
              <p className="rounded-2xl border border-gray-200 bg-white p-5 text-sm leading-5 text-gray-500">This request was cancelled.</p>
            ) : (
              <p className="rounded-2xl border border-gray-200 bg-white p-5 text-sm leading-5 text-gray-500">
                A Biltlinx specialist is reviewing your request and will add your step-by-step plan here. You will also hear from them in{" "}
                <Link href="/messages" className="font-medium text-brand-900">
                  Messages
                </Link>
                .
              </p>
            )}
            <ConciergeFeeCard request={request} />
            <ConciergeShortlist request={request} />
            <ConciergeUpdates request={request} />
          </section>
        ) : (
          <EmptyState
            icon="concierge"
            title="No Concierge requests yet"
            body="Tell Concierge what you need above, like building on your land, fixing something at home or finding a place to rent. It turns that into a step-by-step plan with real providers and prices."
            primary={{ label: "Start a request", href: "/concierge/new" }}
            secondary={{ label: "Open messages", href: "/messages" }}
          />
        )}

        <p className="flex items-center gap-2.5 rounded-xl bg-gray-50 p-4 text-xs leading-[17px] text-[#475569]">
          <NavIcon icon="/icons/post-options-not-interested.svg" size={15} className="shrink-0 bg-[#475569]" />
          Concierge never books, pays or signs for you. Each step opens the real quote, booking or payment screen for you to confirm.
        </p>

        <div className="xl:hidden">
          <ConciergeRail selectedId={activeId} />
        </div>
      </PageContainer>
    </AppShell>
  );
}

export default function ConciergePage() {
  return (
    <Suspense>
      <ConciergeContent />
    </Suspense>
  );
}
