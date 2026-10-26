"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { AppShell } from "@/components/shared/AppShell";
import { ArtisanRoleBar } from "@/components/shared/ArtisanRoleBar";
import { ArtisanTabs } from "@/components/shared/ManageTabs";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import {
  ARTISAN_WORK_ORDERS,
  ARTISAN_WORK_ORDER_KPIS,
  FEATURED_WORK_ORDER_REQUEST,
  type OrderPriority,
  type OrderStatus,
} from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";

const PRIORITY_TONE: Record<OrderPriority, string> = {
  Urgent: "bg-[#fee2e2] text-[#dc2626]",
  High: "bg-[#fef3c7] text-[#b45309]",
  Medium: "bg-[#f1f5f9] text-[#334155]",
  Low: "bg-[#f1f5f9] text-[#334155]",
};

const STATUS: Record<Exclude<OrderStatus, "declined">, { label: string; tone: string; action: string }> = {
  new: { label: "New", tone: "bg-[#eff5ff] text-brand-900", action: "Accept · quote" },
  progress: { label: "In progress", tone: "bg-[#eff5ff] text-brand-900", action: "Update" },
  paid: { label: "Paid", tone: "bg-[#dcfce7] text-[#16a34a]", action: "Receipt" },
};

/** Manage · Artisan · Work orders (Figma node 1082:33388): jobs sent by landlords and property managers. */
export default function ArtisanWorkOrdersPage() {
  const router = useRouter();
  const [statuses, setStatuses] = useState<Record<string, OrderStatus>>(() => Object.fromEntries(ARTISAN_WORK_ORDERS.map((order) => [order.id, order.status])));
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  const request = FEATURED_WORK_ORDER_REQUEST;
  const requestStatus = statuses[request.id];
  const orders = ARTISAN_WORK_ORDERS.filter((order) => statuses[order.id] !== "declined");

  function setStatus(id: string, status: OrderStatus) {
    setStatuses((current) => ({ ...current, [id]: status }));
  }

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <ArtisanRoleBar page="Work orders" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Work orders</h1>
            <p className="text-sm leading-5 text-gray-500">Jobs sent to you by landlords and property managers you work with.</p>
          </div>
          <Button variant="outline" onClick={comingSoon("Clients I work for")} className="h-10 w-auto shrink-0 self-start whitespace-nowrap rounded-[10px] px-4 lg:self-auto lg:rounded-[10px]">
            Clients I work for
          </Button>
        </div>

        <ArtisanTabs active="workOrders" />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {ARTISAN_WORK_ORDER_KPIS.map((kpi) => (
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

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full min-w-[920px] border-collapse text-left">
            <thead className="bg-[#f8fafc]">
              <tr className="text-[11px] font-bold leading-4 text-gray-500">
                {["WORK ORDER", "FROM", "PROPERTY", "PRIORITY", "STATUS"].map((heading) => (
                  <th key={heading} scope="col" className="px-4 py-2.5 font-bold">
                    {heading}
                  </th>
                ))}
                <th scope="col" aria-label="Actions" className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const status = STATUS[statuses[order.id] as keyof typeof STATUS];
                return (
                  <tr key={order.id} className="border-t border-gray-200 text-[13px] leading-[19px] text-[#334155]">
                    <td className="px-4 py-3">
                      <span className="flex flex-col whitespace-nowrap">
                        <span className="font-semibold text-[#0f172a]">{order.title}</span>
                        <span className="text-xs leading-[17px] text-gray-500">{order.detail}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2.5 whitespace-nowrap">
                        <span className="relative block size-8 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
                          <Image src={order.from.avatar} alt="" fill className="object-cover" sizes="32px" />
                        </span>
                        <span className="flex flex-col">
                          <span className="font-semibold text-[#0f172a]">{order.from.name}</span>
                          <span className="text-xs leading-[17px] text-gray-500">{order.from.role}</span>
                        </span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{order.property}</td>
                    <td className="px-4 py-3">
                      <span className={cn("whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", PRIORITY_TONE[order.priority])}>{order.priority}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", status.tone)}>{status.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={comingSoon(status.action)} className="whitespace-nowrap text-[13px] font-medium text-brand-900">
                        {status.action}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {requestStatus === "new" && (
          <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="min-w-0 text-base font-bold leading-[23px] text-[#0f172a]">
                {request.id} · from {request.from}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setStatus(request.id, "declined");
                  showSuccessToast(`${request.id} declined`);
                }}
                className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900"
              >
                Decline ›
              </button>
            </div>
            <p className="text-sm leading-5 text-[#334155]">{request.message}</p>
            <div className="flex gap-2">
              {request.photos.map((photo, index) => (
                <span key={photo} className="relative block h-[90px] w-[120px] shrink-0 overflow-hidden rounded-[10px] bg-[#eef2ff]">
                  <Image src={photo} alt={`Attached photo ${index + 1}`} fill className="object-cover" sizes="120px" />
                </span>
              ))}
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={comingSoon("Ask a question")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
                Ask a question
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStatus(request.id, "progress");
                  showSuccessToast(`${request.id} accepted at ${request.callOut} call-out`);
                }}
                className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]"
              >
                Accept at {request.callOut} call-out
              </Button>
              <Button variant="primary" onClick={comingSoon("Send a quote")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
                Send a quote
              </Button>
            </div>
          </section>
        )}
      </PageContainer>
    </AppShell>
  );
}

