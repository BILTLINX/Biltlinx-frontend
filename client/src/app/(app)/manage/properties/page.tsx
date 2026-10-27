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
  MANAGE_PROPERTIES,
  MANAGE_UNITS,
  PROPERTY_FILTERS,
  matchesPropertyFilter,
  type ManageUnit,
  type PropertyFilterKey,
  type PropertyFlag,
  type UnitStatus,
} from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";
import { useSearchTerm } from "@/context/SearchContext";

const FLAG_TONE: Record<PropertyFlag, string> = {
  overdue: "bg-[#fee2e2] text-[#dc2626]",
  vacant: "bg-[#fef3c7] text-[#b45309]",
  repair: "bg-[#f1f5f9] text-[#334155]",
};

const STATUS_TONE: Record<UnitStatus, string> = {
  paid: "bg-[#dcfce7] text-[#16a34a]",
  renewal: "bg-[#fef3c7] text-[#b45309]",
  overdue: "bg-[#fee2e2] text-[#dc2626]",
  listed: "bg-[#eff5ff] text-brand-900",
  repair: "bg-[#f1f5f9] text-[#334155]",
};

const ghs = (amount: number) => `GHS ${amount.toLocaleString("en-US")}`;

const KPIS = [
  { label: "Properties", icon: "/icons/building-03.svg", value: "6", note: "2 multi-unit blocks", tone: "text-gray-500" },
  { label: "Units", icon: "/icons/home-03.svg", value: "24", note: "21 occupied", tone: "text-gray-500" },
  { label: "Occupancy", icon: "/icons/analytics-01.svg", value: "88%", note: "+4% vs last quarter", tone: "text-[#16a34a]" },
  { label: "Monthly rent roll", icon: "/icons/wallet-01.svg", value: "GHS 68,400", note: "GHS 6,200 overdue", tone: "text-[#dc2626]" },
];

/** Manage · Properties & units (Figma node 1057:28513): the landlord's properties with occupancy, and the units of the one picked. */
export default function ManagePropertiesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<PropertyFilterKey>("All");
  const [selectedId, setSelectedId] = useState(MANAGE_PROPERTIES[0].id);
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  const needle = useSearchTerm();
  const properties = useMemo(() => {
    return MANAGE_PROPERTIES.filter((property) => matchesPropertyFilter(property, filter) && (!needle || `${property.name} ${property.area}`.toLowerCase().includes(needle)));
  }, [needle, filter]);

  const selected = MANAGE_PROPERTIES.find((property) => property.id === selectedId) ?? MANAGE_PROPERTIES[0];
  const units = MANAGE_UNITS[selected.id] ?? [];

  function runUnitAction(unit: ManageUnit) {
    if (unit.action.kind === "remind" && unit.tenant) showSuccessToast(`Reminder sent to ${unit.tenant.name}`);
    else router.push(comingSoonHref(unit.action.label));
  }

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Properties & units" }]} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Properties &amp; units</h1>
            <p className="text-sm leading-5 text-gray-500">Every property and unit you own or manage, with occupancy and income at a glance.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" onClick={comingSoon("Import from Properties")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              Import from Properties
            </Button>
            <Button variant="primary" onClick={() => router.push("/manage/listings/new")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              + Add property
            </Button>
          </div>
        </div>

        <ManageTabs active="properties" />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {KPIS.map((kpi) => (
            <div key={kpi.label} className="flex min-w-0 flex-col gap-1.5 rounded-2xl border border-gray-200 bg-white p-4">
              <p className="flex items-center gap-2 text-[13px] font-medium leading-[19px] text-gray-500">
                <NavIcon icon={kpi.icon} size={16} className="shrink-0 bg-gray-500" />
                {kpi.label}
              </p>
              <p className="text-[22px] font-bold leading-[30px] text-[#0f172a]">{kpi.value}</p>
              <p className={cn("text-xs font-medium leading-[17px]", kpi.tone)}>{kpi.note}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div role="tablist" aria-label="Show" className="flex flex-wrap gap-2.5">
            {PROPERTY_FILTERS.map((option) => {
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
                  {option === "All" ? `All ${MANAGE_PROPERTIES.length}` : option}
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

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => {
              const picked = property.id === selected.id;
              return (
                <article
                  key={property.id}
                  className={cn("flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-white", picked ? "border-brand-900 ring-1 ring-brand-900" : "border-gray-200")}
                >
                  <button type="button" onClick={() => setSelectedId(property.id)} aria-pressed={picked} className="flex flex-col text-left">
                    <span className="relative block h-[150px] w-full bg-[#eef2ff]">
                      <Image src={property.image} alt="" fill className="object-cover" sizes="(min-width: 1280px) 354px, (min-width: 640px) 45vw, 100vw" />
                    </span>
                    <span className="flex flex-col gap-2 p-4">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[15px] font-bold leading-[22px] text-[#0f172a]">{property.name}</span>
                        <NavIcon icon="/icons/more-horizontal.svg" size={18} className="shrink-0 bg-gray-500" />
                      </span>
                      <span className="text-xs leading-[17px] text-gray-500">{property.area}</span>
                      <span className="h-1.5 w-full overflow-hidden rounded bg-[#e2e8f0]">
                        <span className="block h-full rounded bg-[#16a34a]" style={{ width: `${(property.occupied / property.units) * 100}%` }} />
                      </span>
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium leading-[17px] text-[#334155]">
                          {property.occupied} of {property.units} {property.units === 1 ? "unit" : "units"} occupied
                        </span>
                        <span className="shrink-0 whitespace-nowrap text-[13px] font-bold leading-[19px] text-[#0f172a]">
                          {property.rent === 0 ? `GHS 0 · ${property.rentNote}` : `${ghs(property.rent)}/mo`}
                        </span>
                      </span>
                      {property.flag && (
                        <span className={cn("self-start rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", FLAG_TONE[property.flag.kind])}>{property.flag.label}</span>
                      )}
                    </span>
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">No properties match your search.</p>
        )}

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Units · {selected.name}</h2>
            <button type="button" onClick={comingSoon("Open property")} className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900">
              Open property ›
            </button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead className="bg-[#f8fafc]">
                <tr className="text-[11px] font-bold leading-4 text-gray-500">
                  {["UNIT", "TENANT", "RENT", "LEASE ENDS", "STATUS"].map((heading) => (
                    <th key={heading} scope="col" className="px-4 py-2.5 font-bold">
                      {heading}
                    </th>
                  ))}
                  {/* aria-label rather than an `sr-only` span: that is absolutely positioned, so it escapes the shell's
                      overflow clipping and makes the whole document scroll. */}
                  <th scope="col" aria-label="Actions" className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr key={unit.id} className="border-t border-gray-200 text-[13px] leading-[19px]">
                    <td className="px-4 py-3 font-semibold text-[#0f172a]">{unit.unit}</td>
                    <td className="px-4 py-3">
                      {unit.tenant ? (
                        <span className="flex items-center gap-2.5">
                          <span className="relative block h-9 w-11 shrink-0 overflow-hidden rounded-lg bg-[#eef2ff]">
                            <Image src={unit.tenant.avatar} alt="" fill className="object-cover" sizes="44px" />
                          </span>
                          <span className="flex flex-col whitespace-nowrap">
                            <span className="font-semibold text-[#0f172a]">{unit.tenant.name}</span>
                            <span className="text-xs leading-[17px] text-gray-500">{unit.tenant.since}</span>
                          </span>
                        </span>
                      ) : (
                        <span className="text-gray-500">Vacant</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[#334155]">{ghs(unit.rent)}/mo</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[#334155]">{unit.leaseEnds ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={cn("whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", STATUS_TONE[unit.status.kind])}>{unit.status.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => runUnitAction(unit)} className="whitespace-nowrap font-medium text-brand-900">
                        {unit.action.label}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </PageContainer>
    </AppShell>
  );
}
