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
  COLLECTION_CHART,
  OVERDUE_TENANTS,
  PAYMENTS,
  PAYMENT_FILTERS,
  RENT_KPIS,
  matchesPaymentFilter,
  type PaymentFilterKey,
  type PaymentKind,
} from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<PaymentKind, string> = {
  received: "bg-[#dcfce7] text-[#16a34a]",
  overdue: "bg-[#fee2e2] text-[#dc2626]",
  payout: "bg-[#eff5ff] text-brand-900",
};

const ghs = (amount: number) => `GHS ${amount.toLocaleString("en-US")}`;
/** Pixels of bar height per thousand cedis, so the tallest bar (68k) is 150px. */
const PX_PER_THOUSAND = 150 / 68;

/** Manage · Rent & payments (Figma node 1057:29330): what was collected, who is late, and every payment and payout. */
export default function ManageRentPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PaymentFilterKey>("All");
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  const payments = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return PAYMENTS.filter(
      (payment) =>
        matchesPaymentFilter(payment, filter) &&
        (!needle || `${payment.tenant?.name ?? payment.label} ${payment.unit} ${payment.method} ${payment.date}`.toLowerCase().includes(needle)),
    );
  }, [query, filter]);

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Rent & payments" }]} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Rent &amp; payments</h1>
            <p className="text-sm leading-5 text-gray-500">Rent collected through Biltlinx, overdue balances and payouts to your bank or mobile money.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" onClick={comingSoon("Payout settings")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              Payout settings
            </Button>
            <Button variant="primary" onClick={comingSoon("Record payment")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              Record payment
            </Button>
          </div>
        </div>

        <ManageTabs active="rent" />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {RENT_KPIS.map((kpi) => (
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

        <div className="flex flex-col gap-4 lg:flex-row">
          <section className="flex min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Collected vs expected · 2026</h2>
              <button type="button" onClick={comingSoon("Download report")} className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900">
                Download ›
              </button>
            </div>
            <div role="img" aria-label="Expected and collected rent for May to October 2026" className="flex h-[180px] items-end gap-2 sm:gap-3.5">
              {COLLECTION_CHART.map((month) => (
                <div key={month.month} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                  <div className="flex items-end gap-1">
                    <span className="block w-[14px] rounded bg-[#dbeafe] sm:w-[18px]" style={{ height: month.expected * PX_PER_THOUSAND }} title={`Expected ${ghs(month.expected * 1000)}`} />
                    <span className="block w-[14px] rounded bg-brand-900 sm:w-[18px]" style={{ height: month.collected * PX_PER_THOUSAND }} title={`Collected ${ghs(month.collected * 1000)}`} />
                  </div>
                  <span className="text-xs font-medium leading-[17px] text-gray-500">{month.month}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 text-xs font-medium leading-[17px] text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-[#dbeafe]" />
                Expected
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-brand-900" />
                Collected
              </span>
            </div>
          </section>

          <section className="flex w-full shrink-0 flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 lg:w-[380px]">
            <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Overdue</h2>
            {OVERDUE_TENANTS.map((tenant) => (
              <div key={tenant.id} className="flex items-center gap-2.5">
                <span className="relative block size-9 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
                  <Image src={tenant.avatar} alt="" fill className="object-cover" sizes="36px" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[13px] font-semibold leading-[19px] text-[#0f172a]">{tenant.name}</span>
                  <span className="truncate text-xs leading-[17px] text-[#dc2626]">{tenant.note}</span>
                </span>
                <span className="shrink-0 whitespace-nowrap text-[13px] font-bold leading-[19px] text-[#0f172a]">{ghs(tenant.amount)}</span>
              </div>
            ))}
            <button
              type="button"
              onClick={() => showSuccessToast(`Reminders sent to ${OVERDUE_TENANTS.length} tenants`)}
              className="h-[38px] rounded-[10px] bg-[#eff5ff] px-4 text-sm font-medium text-brand-900 hover:bg-[#e2edff]"
            >
              Send reminders
            </button>
            <p className="text-xs leading-[17px] text-gray-500">Reminders go by SMS and in-app. Late fees follow the terms in each tenancy.</p>
          </section>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex h-10 w-full items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-3.5 focus-within:border-brand-900 sm:w-[300px]">
            <NavIcon icon="/icons/search-02.svg" size={16} className="shrink-0 bg-gray-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search payments"
              aria-label="Search payments"
              className="min-w-0 flex-1 bg-transparent text-[13px] leading-[19px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
            />
          </label>
          <div role="tablist" aria-label="Show" className="flex flex-wrap gap-2.5">
            {PAYMENT_FILTERS.map((option) => {
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
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="bg-[#f8fafc]">
              <tr className="text-[11px] font-bold leading-4 text-gray-500">
                {["DATE", "TENANT", "UNIT", "METHOD", "AMOUNT", "STATUS"].map((heading) => (
                  <th key={heading} scope="col" className="px-4 py-2.5 font-bold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t border-gray-200 text-[13px] leading-[19px] text-[#334155]">
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-[#0f172a]">{payment.date}</td>
                  <td className="px-4 py-3">
                    {payment.tenant ? (
                      <span className="flex items-center gap-2.5">
                        <span className="relative block h-9 w-11 shrink-0 overflow-hidden rounded-lg bg-[#eef2ff]">
                          <Image src={payment.tenant.avatar} alt="" fill className="object-cover" sizes="44px" />
                        </span>
                        <span className="whitespace-nowrap font-semibold text-[#0f172a]">{payment.tenant.name}</span>
                      </span>
                    ) : (
                      <span className="whitespace-nowrap font-semibold text-[#0f172a]">{payment.label}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{payment.unit}</td>
                  <td className="whitespace-nowrap px-4 py-3">{payment.method}</td>
                  <td className="whitespace-nowrap px-4 py-3">{ghs(payment.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", STATUS_TONE[payment.status.kind])}>{payment.status.label}</span>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr className="border-t border-gray-200">
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    No payments match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PageContainer>
    </AppShell>
  );
}
