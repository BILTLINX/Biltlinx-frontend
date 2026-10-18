"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AnchoredPanel } from "@/components/shared/AnchoredPanel";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ManageTabs } from "@/components/shared/ManageTabs";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { VisibilityRow } from "@/components/shared/VisibilityRow";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { ANALYTICS_KPIS, ANALYTICS_RANGES, ENQUIRY_SOURCES, INCOME_BY_MONTH, TOP_LISTINGS } from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";

const SECTION_LINK = "shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900";

/** Manage · Analytics (Figma node 1059:30190): income, listing performance and where enquiries come from. */
export default function ManageAnalyticsPage() {
  const router = useRouter();
  const [range, setRange] = useState<(typeof ANALYTICS_RANGES)[number]>("Last 30 days");
  const [rangeOpen, setRangeOpen] = useState(false);
  const rangeRef = useRef<HTMLButtonElement | null>(null);
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Analytics" }]} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Analytics</h1>
            <p className="text-sm leading-5 text-gray-500">How your listings, rent and work are performing. Last 30 days unless you change it.</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-start gap-2">
            <button
              ref={rangeRef}
              type="button"
              aria-haspopup="listbox"
              aria-expanded={rangeOpen}
              onClick={() => setRangeOpen((open) => !open)}
              className="flex h-10 items-center gap-2 whitespace-nowrap rounded-[10px] border border-gray-200 bg-white px-4 text-sm font-medium leading-5 text-[#0f172a] hover:bg-gray-50"
            >
              {range}
              <NavIcon icon="/icons/poll-chevron-down.svg" size={14} className={cn("bg-gray-500 transition-transform duration-150", rangeOpen && "rotate-180")} />
            </button>
            <Button variant="primary" onClick={comingSoon("Download report")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              Download report
            </Button>
          </div>
        </div>

        <ManageTabs active="analytics" />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {ANALYTICS_KPIS.map((kpi) => (
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
              <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Income by month · GHS</h2>
              <button type="button" onClick={comingSoon("Income by property")} className={SECTION_LINK}>
                By property ▾ ›
              </button>
            </div>
            <div role="img" aria-label="Income by month from November to October, rising each month" className="flex h-[200px] items-end gap-1.5 sm:gap-2.5">
              {INCOME_BY_MONTH.map((item, index) => (
                <div key={item.month} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                  <span
                    className={cn("block w-full max-w-[28px] rounded-md", index === INCOME_BY_MONTH.length - 1 ? "bg-brand-900" : "bg-[#bfdbfe]")}
                    style={{ height: item.height }}
                  />
                  <span className="text-[11px] font-medium leading-4 text-gray-500">{item.month}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="flex w-full shrink-0 flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 lg:w-[360px]">
            <h2 className="text-[15px] font-bold leading-[22px] text-[#0f172a]">Where enquiries come from</h2>
            {ENQUIRY_SOURCES.map((item) => (
              <div key={item.label} className="flex flex-col gap-1.5">
                <div className="flex items-start justify-between text-[13px] leading-[19px]">
                  <span className="font-medium text-[#334155]">{item.label}</span>
                  <span className="font-semibold text-[#0f172a]">{item.percent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded bg-[#f1f5f9]">
                  <div className={cn("h-2", item.color)} style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </section>
        </div>

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Top listings</h2>
          <button type="button" onClick={() => router.push("/manage/listings")} className={SECTION_LINK}>
            All listings ›
          </button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead className="bg-[#f8fafc]">
              <tr className="text-[11px] font-bold leading-4 text-gray-500">
                {["LISTING", "VIEWS", "SAVES", "ENQUIRIES", "VIEWINGS", "ENQUIRY RATE"].map((heading) => (
                  <th key={heading} scope="col" className="px-4 py-2.5 font-bold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_LISTINGS.map((listing) => (
                <tr key={listing.id} className="border-t border-gray-200 text-[13px] leading-[19px] text-[#334155]">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2.5 whitespace-nowrap font-semibold text-[#0f172a]">
                      <span className="relative block h-[38px] w-12 shrink-0 overflow-hidden rounded-lg bg-[#eef2ff]">
                        <Image src={listing.image} alt="" fill className="object-cover" sizes="48px" />
                      </span>
                      {listing.title}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{listing.views.toLocaleString("en-US")}</td>
                  <td className="whitespace-nowrap px-4 py-3">{listing.saves}</td>
                  <td className="whitespace-nowrap px-4 py-3">{listing.enquiries}</td>
                  <td className="whitespace-nowrap px-4 py-3">{listing.viewings || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3">{listing.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl bg-[#0f172a] p-5 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <NavIcon icon="/icons/message-lock-02.svg" size={20} className="shrink-0 bg-white" />
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="text-[15px] font-bold leading-[22px] text-white">Team performance and scheduled reports</p>
              <p className="text-[13px] leading-[19px] text-[#cbd5e1]">Available on Business. See which agent replies fastest and email reports to owners every month.</p>
            </div>
          </div>
          <Button variant="outline" onClick={comingSoon("Compare plans")} className="h-10 w-auto shrink-0 self-start whitespace-nowrap rounded-[10px] px-4 sm:self-auto lg:rounded-[10px]">
            Compare plans
          </Button>
        </div>
      </PageContainer>

      <AnchoredPanel open={rangeOpen} onClose={() => setRangeOpen(false)} triggerRef={rangeRef} estimatedHeight={40 + ANALYTICS_RANGES.length * 40} minWidth={180}>
        {ANALYTICS_RANGES.map((option) => (
          <VisibilityRow
            key={option}
            label={option}
            selected={option === range}
            onClick={() => {
              setRange(option);
              setRangeOpen(false);
            }}
          />
        ))}
      </AnchoredPanel>
    </AppShell>
  );
}

