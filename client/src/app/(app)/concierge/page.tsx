"use client";

import { useRouter } from "next/navigation";
import { ActionPlan } from "@/components/shared/ActionPlan";
import { AppShell } from "@/components/shared/AppShell";
import { PageContainer } from "@/components/shared/PageContainer";
import { ConciergeHero } from "@/components/shared/ConciergeHero";
import { ConciergeRail } from "@/components/shared/ConciergeRail";
import { NavIcon } from "@/components/shared/NavIcon";
import { comingSoonHref } from "@/lib/coming-soon";
import { ACTIVE_PLAN } from "@/lib/dummy-concierge";

export default function ConciergePage() {
  const router = useRouter();

  return (
    <AppShell activeKey="concierge" contentFullWidth rightRail={<ConciergeRail />}>
      <PageContainer>
        <ConciergeHero />

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Your active plan · {ACTIVE_PLAN.title}</h2>
            <button
              type="button"
              onClick={() => router.push(comingSoonHref("All plans"))}
              className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900"
            >
              All plans ›
            </button>
          </div>
          <ActionPlan steps={ACTIVE_PLAN.steps} />
        </section>

        <p className="flex items-center gap-2.5 rounded-xl bg-gray-50 p-4 text-xs leading-[17px] text-[#475569]">
          <NavIcon icon="/icons/post-options-not-interested.svg" size={15} className="shrink-0 bg-[#475569]" />
          Concierge never books, pays or signs for you. Each step opens the real quote, booking or payment screen for you
          to confirm.
        </p>

        <div className="xl:hidden">
          <ConciergeRail />
        </div>
      </PageContainer>
    </AppShell>
  );
}
