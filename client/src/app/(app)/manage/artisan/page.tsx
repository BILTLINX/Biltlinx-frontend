"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArtisanRoleBar } from "@/components/shared/ArtisanRoleBar";
import { AppShell } from "@/components/shared/AppShell";
import { ArtisanTabs } from "@/components/shared/ManageTabs";
import { ManageToolCards } from "@/components/shared/ManageToolCards";
import { ManageUpgradeBanner } from "@/components/shared/ManageUpgradeBanner";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import {
  ARTISAN_KPIS,
  ARTISAN_NEW_REQUESTS,
  ARTISAN_PROFILE,
  ARTISAN_TODAY,
  ARTISAN_TOOLS,
  type VisitKind,
} from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";

const VISIT_TONE: Record<VisitKind, string> = {
  progress: "bg-[#eff5ff] text-brand-900",
  confirmed: "bg-[#dcfce7] text-[#16a34a]",
  quote: "bg-[#fef3c7] text-[#b45309]",
};

const SECTION_LINK = "shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900";

/** Manage · Artisan overview (Figma node 1081:32631): today's visits, new requests and the artisan's tools. */
export default function ManageArtisanPage() {
  const router = useRouter();
  const [takingJobs, setTakingJobs] = useState(true);
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <ArtisanRoleBar page="Overview" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Overview</h1>
            <p className="text-sm leading-5 text-gray-500">
              {ARTISAN_PROFILE.name} · {ARTISAN_PROFILE.trade} · your jobs, quotes and money in one place.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" onClick={comingSoon("Set availability")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              Set availability
            </Button>
            <Button variant="primary" onClick={comingSoon("New quote")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              + New quote
            </Button>
          </div>
        </div>

        <ArtisanTabs active="overview" />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {ARTISAN_KPIS.map((kpi) => (
            <div key={kpi.id} className="flex min-w-0 flex-col gap-1.5 rounded-2xl border border-gray-200 bg-white p-4">
              <p className="flex items-center gap-2 text-[13px] font-medium leading-[19px] text-gray-500">
                <NavIcon icon={kpi.icon} size={16} className="shrink-0 bg-gray-500" />
                {kpi.label}
              </p>
              <p className="text-[22px] font-bold leading-[30px] text-[#0f172a]">{kpi.value}</p>
              <p className={cn("text-xs font-medium leading-[17px]", kpi.tone)}>{kpi.note}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <section className="flex min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">{ARTISAN_TODAY.heading}</h2>
              <Link href="/manage/artisan/schedule" className={SECTION_LINK}>
                Open schedule ›
              </Link>
            </div>
            {ARTISAN_TODAY.visits.map((visit) => (
              <div key={visit.id} className="flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-xl border border-gray-200 p-3">
                <span className="w-[70px] shrink-0 text-[13px] font-bold leading-[19px] text-[#0f172a]">{visit.time}</span>
                <span className="flex min-w-0 flex-1 basis-40 flex-col gap-0.5">
                  <span className="text-sm font-semibold leading-5 text-[#0f172a]">{visit.title}</span>
                  <span className="text-xs leading-[17px] text-gray-500">{visit.place}</span>
                </span>
                <span className={cn("shrink-0 whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", VISIT_TONE[visit.status.kind])}>{visit.status.label}</span>
                <Button variant="outline" onClick={comingSoon("Directions")} className="h-[34px] w-auto shrink-0 rounded-[10px] px-4 lg:rounded-[10px]">
                  Directions
                </Button>
              </div>
            ))}
          </section>

          <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[360px]">
            <section className="flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Taking new jobs</h2>
                <button
                  type="button"
                  role="switch"
                  aria-checked={takingJobs}
                  aria-label="Taking new jobs"
                  onClick={() => setTakingJobs((on) => !on)}
                  className={cn("flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors", takingJobs ? "bg-brand-900" : "bg-[#cbd5e1]")}
                >
                  <span className={cn("size-4 rounded-full bg-white transition-transform", takingJobs && "translate-x-4")} />
                </button>
              </div>
              <p className="text-xs leading-[17px] text-gray-500">You show up in Artisans search and the Request Board. Turn off when you’re fully booked.</p>
            </section>

            <section className="flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">New requests near you</h2>
                <Link href="/request-board" className={SECTION_LINK}>
                  Request Board ›
                </Link>
              </div>
              {ARTISAN_NEW_REQUESTS.map((request) => (
                <Link key={request.id} href="/request-board" className="flex flex-col gap-0.5 border-t border-gray-200 py-2">
                  <span className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">{request.title}</span>
                  <span className="text-xs leading-[17px] text-gray-500">{request.detail}</span>
                </Link>
              ))}
            </section>
          </div>
        </div>

        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Your tools</h2>
        <ManageToolCards tools={ARTISAN_TOOLS} />

        <ManageUpgradeBanner title="Growing a team?" text="Business lets you set up your company, add technicians and assign jobs to them." />
      </PageContainer>

    </AppShell>
  );
}

