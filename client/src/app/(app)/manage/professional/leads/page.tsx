"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { ArtisanRoleBar } from "@/components/shared/ArtisanRoleBar";
import { ProfessionalTabs } from "@/components/shared/ManageTabs";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { PROFESSIONAL_LEADS, PROFESSIONAL_LEAD_KPIS, PROFESSIONAL_LEAD_STAGES } from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";

/** Manage · Professional · Leads (Figma node 1083:34315): enquiries from the profile, services and posts, from first message to won. */
export default function ProfessionalLeadsPage() {
  const router = useRouter();
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <ArtisanRoleBar page="Leads" role="Professional" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Leads</h1>
            <p className="text-sm leading-5 text-gray-500">Enquiries from your profile, services and posts. Book a consultation to move them forward.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" onClick={comingSoon("Export leads")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              Export
            </Button>
            <Button variant="primary" onClick={comingSoon("Add lead")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              + Add lead
            </Button>
          </div>
        </div>

        <ProfessionalTabs active="leads" />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {PROFESSIONAL_LEAD_KPIS.map((kpi) => (
            <div key={kpi.id} className="flex min-w-0 flex-col gap-1.5 rounded-2xl border border-gray-200 bg-white p-4">
              <p className="flex items-center gap-2 text-[13px] font-medium leading-[19px] text-gray-500">
                <NavIcon icon={kpi.icon} size={16} className="shrink-0 bg-gray-500" />
                {kpi.label}
              </p>
              <p className="text-[22px] font-bold leading-[30px] text-[#0f172a]">{kpi.value}</p>
              {kpi.note && <p className={cn("text-xs font-medium leading-[17px]", kpi.tone)}>{kpi.note}</p>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {PROFESSIONAL_LEAD_STAGES.map((stage) => {
            const leads = PROFESSIONAL_LEADS.filter((lead) => lead.stage === stage.key);
            return (
              <section key={stage.key} aria-label={stage.label} className="flex min-w-0 flex-col gap-2.5 self-stretch rounded-2xl bg-[#f8fafc] p-3">
                <div className="flex items-center gap-2">
                  <h2 className="whitespace-nowrap text-[13px] font-bold leading-[19px] text-[#0f172a]">{stage.label}</h2>
                  <span className="rounded-full bg-[#f1f5f9] px-2.5 py-[3px] text-[11px] font-medium leading-4 text-[#334155]">{leads.length}</span>
                </div>
                {leads.map((lead) => (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={comingSoon("Lead details")}
                    className="flex flex-col items-start gap-1.5 rounded-2xl border border-gray-200 bg-white p-3 text-left hover:border-gray-300"
                  >
                    <span className="flex items-center gap-2">
                      <span className="relative block size-7 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
                        <Image src={lead.avatar} alt="" fill className="object-cover" sizes="28px" />
                      </span>
                      <span className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">{lead.name}</span>
                    </span>
                    <span className="text-xs font-medium leading-[17px] text-brand-900">{lead.subject}</span>
                    <span className="text-xs leading-[17px] text-[#334155]">{lead.note}</span>
                  </button>
                ))}
              </section>
            );
          })}
        </div>
      </PageContainer>
    </AppShell>
  );
}

