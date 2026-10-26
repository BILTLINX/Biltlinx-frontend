"use client";

import { useRouter } from "next/navigation";
import { ArtisanRoleBar } from "@/components/shared/ArtisanRoleBar";
import { AppShell } from "@/components/shared/AppShell";
import { ProfessionalTabs } from "@/components/shared/ManageTabs";
import { ManageToolCards } from "@/components/shared/ManageToolCards";
import { ManageUpgradeBanner } from "@/components/shared/ManageUpgradeBanner";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import {
  PROFESSIONAL_APPOINTMENTS,
  PROFESSIONAL_KPIS,
  PROFESSIONAL_PIPELINE,
  PROFESSIONAL_PROFILE,
  PROFESSIONAL_PROFILE_STRENGTH,
  PROFESSIONAL_TOOLS,
  type AppointmentKind,
} from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";

const TAG_TONE: Record<AppointmentKind, string> = {
  video: "bg-[#eff5ff] text-brand-900",
  site: "bg-[#dcfce7] text-[#16a34a]",
  paid: "bg-[#fef3c7] text-[#b45309]",
};

const SECTION_LINK = "shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900";

/** Manage · Professional overview (Figma node 1083:33644): next appointments, the leads pipeline and the professional's tools. */
export default function ManageProfessionalPage() {
  const router = useRouter();
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <ArtisanRoleBar page="Overview" role="Professional" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Overview</h1>
            <p className="text-sm leading-5 text-gray-500">
              {PROFESSIONAL_PROFILE.name} · {PROFESSIONAL_PROFILE.trade} · your clients, appointments and fees in one place.
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

        <ProfessionalTabs active="overview" />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {PROFESSIONAL_KPIS.map((kpi) => (
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
              <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Next appointments</h2>
              <button type="button" onClick={comingSoon("Calendar")} className={SECTION_LINK}>
                Open calendar ›
              </button>
            </div>
            {PROFESSIONAL_APPOINTMENTS.map((appointment) => (
              <div key={appointment.id} className="flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-xl border border-gray-200 p-3">
                <span className="w-[90px] shrink-0 whitespace-nowrap text-[13px] font-bold leading-[19px] text-[#0f172a]">{appointment.when}</span>
                <span className="flex min-w-0 flex-1 basis-44 flex-col gap-0.5">
                  <span className="text-sm font-semibold leading-5 text-[#0f172a]">{appointment.title}</span>
                  <span className="text-xs leading-[17px] text-gray-500">{appointment.who}</span>
                </span>
                <span className={cn("shrink-0 whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", TAG_TONE[appointment.tag.kind])}>{appointment.tag.label}</span>
                <Button variant="outline" onClick={comingSoon(appointment.action === "Join" ? "Join call" : "Appointment details")} className="h-[34px] w-auto shrink-0 rounded-[10px] px-4 lg:rounded-[10px]">
                  {appointment.action}
                </Button>
              </div>
            ))}
          </section>

          <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[360px]">
            <section className="flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Leads pipeline</h2>
                <button type="button" onClick={comingSoon("Leads")} className={SECTION_LINK}>
                  Open ›
                </button>
              </div>
              {PROFESSIONAL_PIPELINE.map((stage) => (
                <div key={stage.label} className="flex items-start justify-between text-[13px] leading-[19px]">
                  <span className="text-gray-500">{stage.label}</span>
                  <span className="font-medium text-[#0f172a]">{stage.count}</span>
                </div>
              ))}
            </section>

            <section className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Profile strength · {PROFESSIONAL_PROFILE_STRENGTH.percent}%</h2>
              <div
                role="progressbar"
                aria-valuenow={PROFESSIONAL_PROFILE_STRENGTH.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Profile strength"
                className="h-2 overflow-hidden rounded bg-[#e2e8f0]"
              >
                <div className="h-2 bg-[#16a34a]" style={{ width: `${PROFESSIONAL_PROFILE_STRENGTH.percent}%` }} />
              </div>
              <p className="text-xs leading-[17px] text-gray-500">{PROFESSIONAL_PROFILE_STRENGTH.hint}</p>
            </section>
          </div>
        </div>

        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Your tools</h2>
        <ManageToolCards tools={PROFESSIONAL_TOOLS} />

        <ManageUpgradeBanner title="Running a studio?" text="Business lets you set up Studio Horizon as an organisation, add staff and share clients." />
      </PageContainer>
    </AppShell>
  );
}


