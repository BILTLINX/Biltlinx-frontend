"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ManageTabs } from "@/components/shared/ManageTabs";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import {
  INSPECTIONS,
  INSPECTION_FILTERS,
  INSPECTION_KPIS,
  INSPECTION_REPORT,
  matchesInspectionFilter,
  type InspectionFilterKey,
  type InspectionKind,
  type RoomCondition,
} from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";
import { useSearchTerm } from "@/context/SearchContext";

const STATUS_TONE: Record<InspectionKind, string> = {
  scheduled: "bg-[#eff5ff] text-brand-900",
  overdue: "bg-[#fee2e2] text-[#dc2626]",
  signature: "bg-[#fef3c7] text-[#b45309]",
  signed: "bg-[#dcfce7] text-[#16a34a]",
};

const CONDITION_TONE: Record<RoomCondition, string> = {
  Good: "bg-[#dcfce7] text-[#16a34a]",
  Fair: "bg-[#fef3c7] text-[#b45309]",
  "Needs repair": "bg-[#fee2e2] text-[#dc2626]",
};

/** Manage · Inspections (Figma node 1058:29335): move-in, routine and move-out inspections with a signable report. */
export default function ManageInspectionsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<InspectionFilterKey>("Upcoming");
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  const needle = useSearchTerm();
  const inspections = useMemo(() => {
    return INSPECTIONS.filter(
      (inspection) => matchesInspectionFilter(inspection, filter) && (!needle || `${inspection.when} ${inspection.unit} ${inspection.type} ${inspection.inspector.name}`.toLowerCase().includes(needle)),
    );
  }, [needle, filter]);

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Inspections" }]} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Inspections</h1>
            <p className="text-sm leading-5 text-gray-500">Move-in, routine and move-out inspections with photo evidence both sides can sign.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" onClick={comingSoon("Inspection templates")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              Templates
            </Button>
            <Button variant="primary" onClick={comingSoon("Schedule inspection")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              + Schedule inspection
            </Button>
          </div>
        </div>

        <ManageTabs active="inspections" />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {INSPECTION_KPIS.map((kpi) => (
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

        <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div role="tablist" aria-label="Show" className="flex flex-wrap gap-2.5">
                {INSPECTION_FILTERS.map((option) => {
                  const active = option === filter;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setFilter(option)}
                      className={cn(
                        "rounded-full border px-3.5 py-2 text-[13px] font-medium leading-[19px]",
                        active ? "border-[#0f172a] bg-[#0f172a] text-white" : "border-gray-200 bg-white text-[#334155] hover:bg-gray-50",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={comingSoon("Filters")}
                className="ml-auto flex h-10 items-center gap-1.5 rounded-[10px] border border-gray-200 bg-white px-3.5 text-[13px] font-medium leading-[19px] text-[#334155] hover:bg-gray-50"
              >
                <NavIcon icon="/icons/list-bullet.svg" size={16} className="bg-[#334155]" />
                Filters
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead className="bg-[#f8fafc]">
                  <tr className="text-[11px] font-bold leading-4 text-gray-500">
                    {["WHEN", "PROPERTY · UNIT", "TYPE", "INSPECTOR", "STATUS"].map((heading) => (
                      <th key={heading} scope="col" className="px-4 py-2.5 font-bold">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inspections.map((inspection) => (
                    <tr key={inspection.id} className="border-t border-gray-200 text-[13px] leading-[19px] text-[#334155]">
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-[#0f172a]">{inspection.when}</td>
                      <td className="whitespace-nowrap px-4 py-3">{inspection.unit}</td>
                      <td className="whitespace-nowrap px-4 py-3">{inspection.type}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2.5 whitespace-nowrap font-semibold text-[#0f172a]">
                          {inspection.inspector.avatar && (
                            <span className="relative block size-8 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
                              <Image src={inspection.inspector.avatar} alt="" fill className="object-cover" sizes="32px" />
                            </span>
                          )}
                          {inspection.inspector.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", STATUS_TONE[inspection.status.kind])}>{inspection.status.label}</span>
                      </td>
                    </tr>
                  ))}
                  {inspections.length === 0 && (
                    <tr className="border-t border-gray-200">
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                        No inspections match.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <section className="flex w-full shrink-0 flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 xl:w-[420px]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">{INSPECTION_REPORT.title}</h2>
              <button type="button" onClick={comingSoon("Download report")} className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900">
                PDF ›
              </button>
            </div>
            <p className="text-xs leading-[17px] text-gray-500">{INSPECTION_REPORT.meta}</p>
            <ul>
              {INSPECTION_REPORT.rooms.map((room) => (
                <li key={room.name} className="flex items-center gap-2.5 border-t border-gray-200 py-2">
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">{room.name}</span>
                    {room.note && <span className="text-xs leading-[17px] text-gray-500">{room.note}</span>}
                  </span>
                  <span className={cn("shrink-0 whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", CONDITION_TONE[room.condition])}>{room.condition}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              {INSPECTION_REPORT.photos.map((photo, index) => (
                <span key={photo} className="relative block h-[70px] min-w-0 flex-1 overflow-hidden rounded-lg bg-[#eef2ff]">
                  <Image src={photo} alt={`Inspection photo ${index + 1}`} fill className="object-cover" sizes="140px" />
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-[10px] bg-[#dcfce7] p-2.5">
                <span className="text-xs font-medium leading-[17px] text-[#334155]">Landlord</span>
                <span className="text-[13px] font-semibold leading-[19px] text-[#16a34a]">Signed ✓</span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-[10px] bg-[#fef3c7] p-2.5">
                <span className="text-xs font-medium leading-[17px] text-[#334155]">Tenant</span>
                <span className="text-[13px] font-semibold leading-[19px] text-[#b45309]">Waiting</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" onClick={comingSoon("Create work order")} className="h-[38px] min-w-0 flex-1 whitespace-nowrap rounded-[10px] px-3 lg:rounded-[10px]">
                Create work order
              </Button>
              <Button variant="outline" onClick={() => showSuccessToast("Reminder sent to the tenant")} className="h-[38px] min-w-0 flex-1 whitespace-nowrap rounded-[10px] px-3 lg:rounded-[10px]">
                Remind tenant
              </Button>
            </div>
          </section>
        </div>
      </PageContainer>
    </AppShell>
  );
}

