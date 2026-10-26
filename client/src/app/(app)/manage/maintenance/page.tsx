"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ManageTabs } from "@/components/shared/ManageTabs";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import {
  FEATURED_WORK_ORDER,
  MAINTENANCE_FILTERS,
  MAINTENANCE_KPIS,
  WORK_ORDERS,
  WORK_ORDER_STAGES,
  matchesMaintenanceFilter,
  type MaintenanceFilterKey,
  type WorkOrder,
  type WorkOrderPriority,
} from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";

const PRIORITY_TONE: Record<WorkOrderPriority | "paid", string> = {
  Urgent: "bg-[#fee2e2] text-[#dc2626]",
  High: "bg-[#fef3c7] text-[#b45309]",
  Medium: "bg-[#eff5ff] text-brand-900",
  Low: "bg-[#f1f5f9] text-[#334155]",
  paid: "bg-[#dcfce7] text-[#16a34a]",
};

const SECTION_LINK = "shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900";

function WorkOrderCard({ order, onAssign }: { order: WorkOrder; onAssign: () => void }) {
  const pill = order.pill ?? { label: order.priority, kind: order.priority };
  return (
    <div className="flex flex-col items-start gap-2 rounded-2xl border border-gray-200 bg-white p-3.5">
      <span className={cn("rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", PRIORITY_TONE[pill.kind])}>{pill.label}</span>
      <p className="text-sm font-semibold leading-5 text-[#0f172a]">{order.title}</p>
      <p className="text-xs leading-[17px] text-gray-500">{order.place}</p>
      {order.artisan ? (
        <div className="flex w-full items-center gap-2">
          <span className="relative block size-6 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
            <Image src={order.artisan.avatar} alt="" fill className="object-cover" sizes="24px" />
          </span>
          <span className="min-w-0 flex-1 text-xs font-medium leading-[17px] text-[#334155]">{order.artisan.note}</span>
        </div>
      ) : (
        <button type="button" onClick={onAssign} className="h-[34px] w-full rounded-[10px] bg-[#eff5ff] px-4 text-sm font-medium text-brand-900 hover:bg-[#e2edff]">
          Assign artisan
        </button>
      )}
    </div>
  );
}

/** Manage · Maintenance (Figma node 1058:29006): tenant repair requests moving through to work orders sent to artisans. */
export default function ManageMaintenancePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MaintenanceFilterKey>("All properties");
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  const orders = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return WORK_ORDERS.filter((order) => matchesMaintenanceFilter(order, filter) && (!needle || `${order.title} ${order.place} ${order.artisan?.note ?? ""}`.toLowerCase().includes(needle)));
  }, [query, filter]);

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Maintenance" }]} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Maintenance</h1>
            <p className="text-sm leading-5 text-gray-500">Repair requests from tenants and work orders sent to artisans you trust.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" onClick={comingSoon("Preferred artisans")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              Preferred artisans
            </Button>
            <Button variant="primary" onClick={comingSoon("New work order")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              + New work order
            </Button>
          </div>
        </div>

        <ManageTabs active="maintenance" />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {MAINTENANCE_KPIS.map((kpi) => (
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

        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex h-10 w-full items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-3.5 focus-within:border-brand-900 sm:w-[300px]">
            <NavIcon icon="/icons/search-02.svg" size={16} className="shrink-0 bg-gray-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search work orders"
              aria-label="Search work orders"
              className="min-w-0 flex-1 bg-transparent text-[13px] leading-[19px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
            />
          </label>
          <div role="tablist" aria-label="Show" className="flex flex-wrap gap-2.5">
            {MAINTENANCE_FILTERS.map((option) => {
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WORK_ORDER_STAGES.map((stage) => {
            const items = orders.filter((order) => order.stage === stage.key);
            return (
              <section key={stage.key} aria-label={stage.label} className="flex min-w-0 flex-col gap-2.5 self-stretch rounded-2xl bg-[#f8fafc] p-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold leading-5 text-[#0f172a]">{stage.label}</h2>
                  <span className="rounded-full bg-[#f1f5f9] px-2.5 py-[3px] text-[11px] font-medium leading-4 text-[#334155]">{items.length}</span>
                </div>
                {items.map((order) => (
                  <WorkOrderCard key={order.id} order={order} onAssign={comingSoon("Assign artisan")} />
                ))}
              </section>
            );
          })}
        </div>

        <section className="flex min-w-0 flex-col gap-3.5 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">
              Work order {FEATURED_WORK_ORDER.id} · {FEATURED_WORK_ORDER.title}
            </h2>
            <button type="button" onClick={comingSoon("Work order details")} className={SECTION_LINK}>
              Open full view ›
            </button>
          </div>
          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <p className="text-sm leading-5 text-[#334155]">{FEATURED_WORK_ORDER.report}</p>
              <div className="flex gap-2">
                {FEATURED_WORK_ORDER.photos.map((photo, index) => (
                  <span key={photo} className="relative block h-[90px] w-[120px] shrink-0 overflow-hidden rounded-[10px] bg-[#eef2ff]">
                    <Image src={photo} alt={`Reported damage ${index + 1}`} fill className="object-cover" sizes="120px" />
                  </span>
                ))}
              </div>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-2.5 lg:w-[360px]">
              <p className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">Suggested artisans nearby</p>
              {FEATURED_WORK_ORDER.suggested.map((artisan) => (
                <div key={artisan.id} className="flex items-center gap-2.5 rounded-xl border border-gray-200 p-2.5">
                  <span className="relative block size-8 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
                    <Image src={artisan.avatar} alt="" fill className="object-cover" sizes="32px" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13px] font-semibold leading-[19px] text-[#0f172a]">{artisan.name}</span>
                    <span className="truncate text-[11px] font-medium leading-4 text-[#16a34a]">{artisan.meta}</span>
                  </span>
                  <span className="shrink-0 whitespace-nowrap text-xs font-medium leading-[17px] text-[#334155]">{artisan.price}</span>
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="primary" onClick={comingSoon("Request quotes")} className="h-[38px] min-w-0 flex-1 whitespace-nowrap rounded-[10px] px-3 lg:rounded-[10px]">
                  Request quotes
                </Button>
                <Button variant="outline" onClick={comingSoon("Assign my artisan")} className="h-[38px] min-w-0 flex-1 whitespace-nowrap rounded-[10px] px-3 lg:rounded-[10px]">
                  Assign my artisan
                </Button>
              </div>
            </div>
          </div>
        </section>
      </PageContainer>
    </AppShell>
  );
}

