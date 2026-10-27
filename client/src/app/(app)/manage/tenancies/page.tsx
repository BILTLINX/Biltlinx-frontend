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
import { MOVE_OUT_CHECKLIST, TENANCIES, TENANCY_FILTERS, matchesTenancyFilter, type TenancyFilterKey, type TenancyKind } from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";
import { useSearchTerm } from "@/context/SearchContext";

const STATUS_TONE: Record<TenancyKind, string> = {
  active: "bg-[#dcfce7] text-[#16a34a]",
  renewal: "bg-[#fef3c7] text-[#b45309]",
  ending: "bg-[#fee2e2] text-[#dc2626]",
  signing: "bg-[#eff5ff] text-brand-900",
};

const ghs = (amount: number) => `GHS ${amount.toLocaleString("en-US")}`;
const CARD = "flex min-w-0 flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5";

const KPIS = [
  { label: "Active tenancies", icon: "/icons/user-group.svg", value: "21" },
  { label: "Renewals in 60 days", icon: "/icons/calendar-03.svg", value: "4", note: "Send offers now", tone: "text-[#dc2626]" },
  { label: "Move-outs this month", icon: "/icons/home-03.svg", value: "1" },
  { label: "Deposits held", icon: "/icons/wallet-01.svg", value: "GHS 82,000", note: "In Biltlinx escrow", tone: "text-gray-500" },
];

const RENEWAL_ROWS = [
  { label: "Current rent", value: "GHS 2,800 / month" },
  { label: "Proposed rent", value: "GHS 3,000 / month (+7%)" },
  { label: "New term", value: "12 months · Jan – Dec 2027" },
  { label: "Advance requested", value: "6 months (GHS 18,000)" },
];

/** Manage · Tenancies (Figma node 1057:28936): leases, renewals and move-outs across all of a landlord's units. */
export default function ManageTenanciesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<TenancyFilterKey>("active");
  const [checked, setChecked] = useState<string[]>(() => MOVE_OUT_CHECKLIST.filter((item) => item.done).map((item) => item.id));
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  const needle = useSearchTerm();
  const tenancies = useMemo(() => {
    return TENANCIES.filter((tenancy) => matchesTenancyFilter(tenancy, filter) && (!needle || `${tenancy.tenant} ${tenancy.unit} ${tenancy.term}`.toLowerCase().includes(needle)));
  }, [needle, filter]);

  function toggleChecklist(id: string) {
    setChecked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Tenancies" }]} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Tenancies</h1>
            <p className="text-sm leading-5 text-gray-500">Leases, renewals and move-ins and outs across all your units.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" onClick={comingSoon("Export tenancies")} className="h-10 w-auto rounded-[10px] px-4 lg:rounded-[10px]">
              Export
            </Button>
            <Button variant="primary" onClick={comingSoon("New tenancy")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              + New tenancy
            </Button>
          </div>
        </div>

        <ManageTabs active="tenancies" />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {KPIS.map((kpi) => (
            <div key={kpi.label} className="flex min-w-0 flex-col gap-1.5 rounded-2xl border border-gray-200 bg-white p-4">
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
          <div role="tablist" aria-label="Show" className="flex flex-wrap gap-2.5">
            {TENANCY_FILTERS.map((option) => {
              const active = option.key === filter;
              return (
                <button
                  key={option.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(option.key)}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-[13px] font-medium leading-[19px]",
                    active ? "border-[#0f172a] bg-[#0f172a] text-white" : "border-gray-200 bg-white text-[#334155] hover:bg-gray-50",
                  )}
                >
                  {option.label} {option.count}
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
          <table className="w-full min-w-[960px] border-collapse text-left">
            <thead className="bg-[#f8fafc]">
              <tr className="text-[11px] font-bold leading-4 text-gray-500">
                {["TENANT", "PROPERTY · UNIT", "RENT", "TERM", "DEPOSIT", "STATUS"].map((heading) => (
                  <th key={heading} scope="col" className="px-4 py-2.5 font-bold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenancies.map((tenancy) => (
                <tr key={tenancy.id} className="border-t border-gray-200 text-[13px] leading-[19px] text-[#334155]">
                  <td className="px-4 py-3">
                    <button type="button" onClick={comingSoon("Tenancy details")} className="flex items-center gap-2.5 text-left">
                      <span className="relative block h-9 w-11 shrink-0 overflow-hidden rounded-lg bg-[#eef2ff]">
                        <Image src={tenancy.avatar} alt="" fill className="object-cover" sizes="44px" />
                      </span>
                      <span className="flex flex-col whitespace-nowrap">
                        <span className="font-semibold text-[#0f172a]">{tenancy.tenant}</span>
                        {tenancy.note && <span className="text-xs leading-[17px] text-gray-500">{tenancy.note}</span>}
                      </span>
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{tenancy.unit}</td>
                  <td className="whitespace-nowrap px-4 py-3">{ghs(tenancy.rent)}/mo</td>
                  <td className="whitespace-nowrap px-4 py-3">{tenancy.term}</td>
                  <td className="whitespace-nowrap px-4 py-3">{ghs(tenancy.deposit)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", STATUS_TONE[tenancy.status.kind])}>{tenancy.status.label}</span>
                  </td>
                </tr>
              ))}
              {tenancies.length === 0 && (
                <tr className="border-t border-gray-200">
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    {filter === "past" ? "Past tenancies aren’t in this sample." : "No tenancies match."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className={CARD}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Renewal offer · Efua Mensah</h2>
              <button type="button" onClick={comingSoon("Edit renewal offer")} className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900">
                Edit ›
              </button>
            </div>
            {RENEWAL_ROWS.map((row) => (
              <div key={row.label} className="flex items-start justify-between gap-3 text-[13px] leading-[19px]">
                <span className="text-gray-500">{row.label}</span>
                <span className="text-right font-semibold text-[#0f172a]">{row.value}</span>
              </div>
            ))}
            <p className="text-xs leading-[17px] text-gray-500">
              Under the Rent Act, advance rent can’t exceed 6 months. Biltlinx flags offers that ask for more.
            </p>
            <div className="flex gap-2">
              <Button variant="primary" onClick={() => showSuccessToast("Renewal offer sent to Efua Mensah")} className="h-10 min-w-0 flex-1 rounded-[10px] px-3 lg:rounded-[10px]">
                Send offer
              </Button>
              <Button variant="outline" onClick={comingSoon("Preview agreement")} className="h-10 min-w-0 flex-1 whitespace-nowrap rounded-[10px] px-3 lg:rounded-[10px]">
                Preview agreement
              </Button>
            </div>
          </section>

          <section className={CARD}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Move-out · Nana Ama Serwaa · 31 Oct</h2>
              <button type="button" onClick={comingSoon("Move-out checklist")} className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900">
                Checklist ›
              </button>
            </div>
            {MOVE_OUT_CHECKLIST.map((item) => {
              const done = checked.includes(item.id);
              return (
                <button key={item.id} type="button" role="checkbox" aria-checked={done} onClick={() => toggleChecklist(item.id)} className="flex items-center gap-2.5 text-left">
                  <span
                    className={cn(
                      "flex size-[18px] shrink-0 items-center justify-center rounded text-[11px] font-bold leading-3",
                      done ? "bg-[#16a34a] text-white" : "border border-[#cbd5e1] text-transparent",
                    )}
                  >
                    ✓
                  </span>
                  <span className={cn("text-[13px] leading-[19px]", done ? "text-gray-500" : "font-medium text-[#0f172a]")}>{item.label}</span>
                </button>
              );
            })}
          </section>
        </div>
      </PageContainer>
    </AppShell>
  );
}
