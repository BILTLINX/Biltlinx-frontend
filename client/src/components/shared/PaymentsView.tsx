"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { AppShell } from "@/components/shared/AppShell";
import { ArtisanRoleBar } from "@/components/shared/ArtisanRoleBar";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { INVOICE_FILTERS, matchesInvoiceFilter, type ArtisanInvoice, type InvoiceFilterKey, type InvoiceKind, type MANAGE_ROLES } from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<InvoiceKind, string> = {
  overdue: "bg-[#fee2e2] text-[#dc2626]",
  held: "bg-[#fef3c7] text-[#b45309]",
  payout: "bg-[#eff5ff] text-brand-900",
  paid: "bg-[#dcfce7] text-[#16a34a]",
};

const ghs = (amount: number) => `GHS ${amount.toLocaleString("en-US")}`;

interface PaymentsViewProps {
  role: (typeof MANAGE_ROLES)[number];
  /** The module tab row for this workspace. */
  tabs: ReactNode;
  available: number;
  /** The cards after "Available to pay out". */
  kpis: { id: string; label: string; icon: string; value: string; note?: string; tone?: string }[];
  payoutPlan: { next: string; account: string; schedule: string };
  invoices: ArtisanInvoice[];
}

/** The Payments page of an artisan or professional workspace: invoices, money held for work in progress and payouts. */
export function PaymentsView({ role, tabs, available: initialAvailable, kpis, payoutPlan, invoices: allInvoices }: PaymentsViewProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<InvoiceFilterKey>("All");
  const [available, setAvailable] = useState(initialAvailable);
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  const invoices = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return allInvoices.filter((invoice) => matchesInvoiceFilter(invoice, filter) && (!needle || `${invoice.id} ${invoice.client.name} ${invoice.job}`.toLowerCase().includes(needle)));
  }, [allInvoices, query, filter]);

  function payOut() {
    showSuccessToast(`${ghs(available)} is on its way to ${payoutPlan.account}`);
    setAvailable(0);
  }

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <ArtisanRoleBar page="Payments" role={role} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Payments</h1>
            <p className="text-sm leading-5 text-gray-500">Invoices, money held for jobs in progress and payouts to your mobile money.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" onClick={comingSoon("Payout settings")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              Payout settings
            </Button>
            <Button variant="primary" onClick={comingSoon("New invoice")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              + New invoice
            </Button>
          </div>
        </div>

        {tabs}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <div className="flex min-w-0 flex-col gap-1.5 rounded-2xl border border-gray-200 bg-white p-4">
            <p className="flex items-center gap-2 text-[13px] font-medium leading-[19px] text-gray-500">
              <NavIcon icon="/icons/wallet-01.svg" size={16} className="shrink-0 bg-gray-500" />
              Available to pay out
            </p>
            <p className="text-[22px] font-bold leading-[30px] text-[#0f172a]">{ghs(available)}</p>
          </div>
          {kpis.map((kpi) => (
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

        <div className="flex flex-col gap-4 rounded-2xl bg-[#eff5ff] p-5 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="text-[15px] font-bold leading-[22px] text-[#0f172a]">Next automatic payout: {payoutPlan.next}</p>
            <p className="text-[13px] leading-[19px] text-[#334155]">
              To {payoutPlan.account} · {payoutPlan.schedule}
            </p>
          </div>
          <Button variant="primary" onClick={payOut} disabled={available === 0} className="h-10 w-auto shrink-0 self-start whitespace-nowrap rounded-[10px] px-4 sm:self-auto lg:rounded-[10px]">
            {available === 0 ? "Nothing to pay out" : `Pay out ${ghs(available)} now`}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex h-10 w-full items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-3.5 focus-within:border-brand-900 sm:w-[280px]">
            <NavIcon icon="/icons/search-02.svg" size={16} className="shrink-0 bg-gray-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search invoices"
              aria-label="Search invoices"
              className="min-w-0 flex-1 bg-transparent text-[13px] leading-[19px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
            />
          </label>
          <div role="tablist" aria-label="Show" className="flex flex-wrap gap-2.5">
            {INVOICE_FILTERS.map((option) => {
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
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead className="bg-[#f8fafc]">
              <tr className="text-[11px] font-bold leading-4 text-gray-500">
                {["INVOICE", "CLIENT", "JOB", "AMOUNT", "DUE", "STATUS"].map((heading) => (
                  <th key={heading} scope="col" className="px-4 py-2.5 font-bold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id + invoice.job} className="border-t border-gray-200 text-[13px] leading-[19px] text-[#334155]">
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-[#0f172a]">{invoice.id}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2.5 whitespace-nowrap font-semibold text-[#0f172a]">
                      {invoice.client.avatar && (
                        <span className="relative block size-8 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
                          <Image src={invoice.client.avatar} alt="" fill className="object-cover" sizes="32px" />
                        </span>
                      )}
                      {invoice.client.name}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{invoice.job}</td>
                  <td className="whitespace-nowrap px-4 py-3">{ghs(invoice.amount)}</td>
                  <td className="whitespace-nowrap px-4 py-3">{invoice.due}</td>
                  <td className="px-4 py-3">
                    <span className={cn("whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", STATUS_TONE[invoice.status.kind])}>{invoice.status.label}</span>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr className="border-t border-gray-200">
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    No invoices match.
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
