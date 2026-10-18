"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { ManageRail } from "@/components/shared/ManageRail";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { AnchoredPanel } from "@/components/shared/AnchoredPanel";
import { VisibilityRow } from "@/components/shared/VisibilityRow";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import {
  CURRENT_PLAN,
  MANAGE_MODULES,
  MANAGE_ROLES,
  MANAGE_STATS,
  ROLE_HOMES,
  PREMIUM_TOOLS,
  isUnlocked,
  type ManageStat,
  type PlanTier,
} from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";

const PILL_TONE: Record<ManageStat["tone"], string> = {
  green: "bg-[#dcfce7] text-[#16a34a]",
  blue: "bg-[#eff5ff] text-brand-900",
  amber: "bg-[#fef3c7] text-[#b45309]",
  red: "bg-[#fee2e2] text-[#dc2626]",
};

const TIER_PILL: Record<PlanTier, string> = {
  Pro: "bg-[#eff5ff] text-brand-900",
  Business: "bg-[#f3e8ff] text-[#7e22ce]",
  Enterprise: "bg-[#0f172a] text-white",
};

/** Modules that have their own page; the rest go to the coming-soon page. */
const MODULE_ROUTES: Record<string, string> = { properties: "/manage/properties", tenancies: "/manage/tenancies", rent: "/manage/rent", maintenance: "/manage/maintenance", inspections: "/manage/inspections", documents: "/manage/documents", listings: "/manage/listings", enquiries: "/manage/enquiries", analytics: "/manage/analytics" };

const SECTION_LINK = "shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900";

/** Manage (Figma node 1044:22523): the private workspace for landlords, hosts, agents and developers. */
export default function ManagePage() {
  const router = useRouter();
  const [role, setRole] = useState<(typeof MANAGE_ROLES)[number]>("Landlord");
  const [roleOpen, setRoleOpen] = useState(false);
  const roleRef = useRef<HTMLButtonElement | null>(null);
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <AppShell activeKey="manage" contentFullWidth rightRail={<ManageRail />}>
      <PageContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Manage</h1>
            <p className="text-sm leading-5 text-gray-500">Your private workspace. Only you and people you add can see this.</p>
          </div>
          <div className="flex shrink-0 items-start gap-2">
            <button
              ref={roleRef}
              type="button"
              aria-haspopup="listbox"
              aria-expanded={roleOpen}
              onClick={() => setRoleOpen((open) => !open)}
              className="flex h-10 items-center gap-2 whitespace-nowrap rounded-[10px] border border-gray-200 bg-white px-3 text-[13px] font-medium leading-[19px] text-[#0f172a] hover:bg-gray-50"
            >
              Viewing as: {role}
              <NavIcon icon="/icons/poll-chevron-down.svg" size={14} className={cn("bg-gray-500 transition-transform duration-150", roleOpen && "rotate-180")} />
            </button>
            <Button variant="primary" onClick={() => router.push("/manage/listings/new")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              Add property
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {MANAGE_STATS.map((stat) => (
            <div key={stat.id} className="flex min-w-0 flex-col items-start gap-1.5 rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-medium leading-[17px] text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold leading-8 text-[#0f172a]">{stat.value}</p>
              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium leading-4", PILL_TONE[stat.tone])}>{stat.pill}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Your modules</h2>
          <button type="button" onClick={comingSoon("Customise modules")} className={SECTION_LINK}>
            Customise ›
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {MANAGE_MODULES.map((module) => (
            <button
              key={module.id}
              type="button"
              onClick={MODULE_ROUTES[module.id] ? () => router.push(MODULE_ROUTES[module.id]) : comingSoon(module.title)}
              className="flex min-w-0 items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left hover:bg-gray-50"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eff5ff]">
                <NavIcon icon={module.icon} size={20} className="bg-brand-900" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-semibold leading-5 text-[#0f172a]">{module.title}</span>
                <span className="text-xs leading-[17px] text-gray-500">{module.note}</span>
              </span>
              <NavIcon icon="/icons/chevron-right-gray.svg" size={18} className="shrink-0 bg-gray-400" />
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Premium Tools</h2>
            <span className="rounded-full bg-[#eff5ff] px-2.5 py-1 text-[11px] font-medium leading-4 text-brand-900">Your plan: {CURRENT_PLAN}</span>
          </div>
          <button type="button" onClick={comingSoon("Compare plans")} className={SECTION_LINK}>
            Compare plans ›
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {PREMIUM_TOOLS.map((tool) => {
            const unlocked = isUnlocked(tool.tier);
            return (
              <div
                key={tool.id}
                className={cn("flex min-w-0 flex-col items-start gap-2 rounded-2xl border p-3.5", unlocked ? "border-gray-200 bg-white" : "border-gray-200 bg-[#f8fafc]")}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-medium leading-4", TIER_PILL[tool.tier])}>{tool.tier}</span>
                  {!unlocked && <NavIcon icon="/icons/message-lock-02.svg" size={14} className="shrink-0 bg-gray-500" />}
                </div>
                <p className={cn("text-[13px] font-semibold leading-[19px]", unlocked ? "text-[#0f172a]" : "text-gray-500")}>{tool.title}</p>
                <button
                  type="button"
                  onClick={comingSoon(unlocked ? tool.title : "Upgrade plan")}
                  className={cn("text-xs font-medium leading-[17px]", unlocked ? "text-brand-900" : "text-gray-500")}
                >
                  {unlocked ? "Open ›" : "Upgrade to unlock"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="xl:hidden">
          <ManageRail />
        </div>
      </PageContainer>

      <AnchoredPanel open={roleOpen} onClose={() => setRoleOpen(false)} triggerRef={roleRef} estimatedHeight={40 + MANAGE_ROLES.length * 40} minWidth={200}>
        {MANAGE_ROLES.map((option) => (
          <VisibilityRow
            key={option}
            label={option}
            selected={option === role}
            onClick={() => {
              setRoleOpen(false);
              const home = ROLE_HOMES[option];
              if (home) {
                router.push(home);
                return;
              }
              setRole(option);
            }}
          />
        ))}
      </AnchoredPanel>
    </AppShell>
  );
}
