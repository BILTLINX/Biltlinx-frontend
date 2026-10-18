"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { comingSoonHref } from "@/lib/coming-soon";
import { BUSINESS_CHECK, VERIFICATION_CHECKS, type CheckStepState, type VerificationStatus } from "@/lib/dummy-verification";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<VerificationStatus, { tile: string; pill: string; icon: string }> = {
  verified: { tile: "bg-[#dcfce7]", pill: "bg-[#dcfce7] text-[#16a34a]", icon: "bg-[#16a34a]" },
  "not-started": { tile: "bg-[#f1f5f9]", pill: "bg-[#f1f5f9] text-[#334155]", icon: "bg-[#64748a]" },
  "in-review": { tile: "bg-[#fef3c7]", pill: "bg-[#fef3c7] text-[#b45309]", icon: "bg-[#d97706]" },
};

const STEP_BAR: Record<CheckStepState, string> = { done: "bg-[#16a34a]", current: "bg-brand-900", pending: "bg-[#e2e8f0]" };

/** You · Verification centre (Figma node 1087:37138): what Biltlinx has checked for the account, and the status of the business check. */
export default function VerificationCentrePage() {
  const router = useRouter();
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <AppShell contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "You" }, { label: "Verification centre" }]} />

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Verification centre</h1>
          <p className="text-sm leading-5 text-gray-500">Each badge says exactly what Biltlinx checked. Plans never add badges.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {VERIFICATION_CHECKS.map((check) => {
            const tone = STATUS_TONE[check.status];
            return (
              <div key={check.id} className="flex flex-col items-start gap-2.5 rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tone.tile)}>
                    <NavIcon icon={check.icon} size={20} className={tone.icon} />
                  </span>
                  <div className="flex flex-col items-start gap-0.5">
                    <h2 className="text-[15px] font-bold leading-[22px] text-[#0f172a]">{check.title}</h2>
                    <span className={cn("rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", tone.pill)}>{check.statusLabel}</span>
                  </div>
                </div>
                <p className="text-[13px] leading-[19px] text-gray-500">{check.description}</p>
                {check.action && (
                  <button
                    type="button"
                    onClick={comingSoon(check.action === "Start" ? `Verify ${check.title}` : `${check.title} verification`)}
                    className={cn(
                      "h-9 whitespace-nowrap rounded-[10px] px-4 text-sm font-medium",
                      check.action === "Start" ? "bg-brand-900 text-white hover:opacity-90" : "border border-gray-200 bg-white text-[#0f172a] hover:bg-gray-50",
                    )}
                  >
                    {check.action}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Business check · {BUSINESS_CHECK.company}</h2>
            <button type="button" onClick={comingSoon("Contact support")} className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900">
              Contact support ›
            </button>
          </div>
          <ol className="flex items-start">
            {BUSINESS_CHECK.steps.map((step) => (
              <li key={step.id} className="flex min-w-0 flex-1 flex-col gap-1.5" aria-current={step.state === "current" ? "step" : undefined}>
                <span className={cn("block h-1 w-full", STEP_BAR[step.state])} />
                <span className={cn("text-[13px] font-semibold leading-[19px]", step.state === "pending" ? "text-slate-400" : "text-[#0f172a]")}>{step.label}</span>
                <span className="text-xs leading-[17px] text-gray-500">{step.detail}</span>
              </li>
            ))}
          </ol>
          <p className="text-[13px] leading-[19px] text-[#334155]">{BUSINESS_CHECK.note}</p>
        </section>
      </PageContainer>
    </AppShell>
  );
}
