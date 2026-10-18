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
import { LISTING_FILTERS, LISTING_KPIS, MANAGE_LISTINGS, type ListingCheckKind, type ListingStage, type ManageListing } from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";

const CHECK_TONE: Record<ListingCheckKind, string> = {
  checked: "bg-[#dcfce7] text-[#16a34a]",
  pending: "bg-[#fef3c7] text-[#b45309]",
  none: "bg-[#f1f5f9] text-[#334155]",
};

const STATUS_TONE: Record<ManageListing["status"]["tone"], string> = {
  boosted: "bg-[#f3e8ff] text-[#7e22ce]",
  active: "bg-[#dcfce7] text-[#16a34a]",
  muted: "bg-[#f1f5f9] text-[#334155]",
};

const number = (value?: number) => (value === undefined ? "—" : value.toLocaleString("en-US"));

/** Manage · Listings (Figma node 1059:29461): everything listed on the Marketplace, Properties and Stay, with performance and checks. */
export default function ManageListingsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<ListingStage>("active");
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  // The design opens on "Active" yet lists the draft and paused rows too, so that chip shows everything that isn't closed.
  const listings = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return MANAGE_LISTINGS.filter(
      (listing) => (stage === "active" ? listing.stage !== "closed" : listing.stage === stage) && (!needle || `${listing.title} ${listing.detail}`.toLowerCase().includes(needle)),
    );
  }, [query, stage]);

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Listings" }]} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Listings</h1>
            <p className="text-sm leading-5 text-gray-500">Everything you have on the Marketplace, Properties and Stay, with views, saves and enquiries.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" onClick={comingSoon("Boost a listing")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              Boost a listing
            </Button>
            <Button variant="primary" onClick={() => router.push("/manage/listings/new")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              + Create listing
            </Button>
          </div>
        </div>

        <ManageTabs active="listings" />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {LISTING_KPIS.map((kpi) => (
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
          <label className="flex h-10 w-full items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-3.5 focus-within:border-brand-900 sm:w-[280px]">
            <NavIcon icon="/icons/search-02.svg" size={16} className="shrink-0 bg-gray-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your listings"
              aria-label="Search your listings"
              className="min-w-0 flex-1 bg-transparent text-[13px] leading-[19px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
            />
          </label>
          <div role="tablist" aria-label="Show" className="flex flex-wrap gap-2.5">
            {LISTING_FILTERS.map((option) => {
              const active = option.key === stage;
              return (
                <button
                  key={option.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStage(option.key)}
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
                {["LISTING", "PRICE", "VIEWS", "ENQUIRIES", "CHECKS", "STATUS"].map((heading) => (
                  <th key={heading} scope="col" className="px-4 py-2.5 font-bold">
                    {heading}
                  </th>
                ))}
                <th scope="col" aria-label="Actions" className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id} className="border-t border-gray-200 text-[13px] leading-[19px] text-[#334155]">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2.5">
                      <span className="relative block h-[38px] w-12 shrink-0 overflow-hidden rounded-lg bg-[#eef2ff]">
                        <Image src={listing.image} alt="" fill className="object-cover" sizes="48px" />
                      </span>
                      <span className="flex flex-col whitespace-nowrap">
                        <span className="font-semibold text-[#0f172a]">{listing.title}</span>
                        <span className="text-xs leading-[17px] text-gray-500">{listing.detail}</span>
                      </span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{listing.price}</td>
                  <td className="whitespace-nowrap px-4 py-3">{number(listing.views)}</td>
                  <td className="whitespace-nowrap px-4 py-3">{number(listing.enquiries)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", CHECK_TONE[listing.check.kind])}>{listing.check.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", STATUS_TONE[listing.status.tone])}>{listing.status.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={comingSoon(`${listing.action} listing`)} className="whitespace-nowrap text-[13px] font-medium text-brand-900">
                      {listing.action}
                    </button>
                  </td>
                </tr>
              ))}
              {listings.length === 0 && (
                <tr className="border-t border-gray-200">
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                    {stage === "closed" ? "Sold and let listings aren’t in this sample." : "No listings match."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 rounded-xl bg-[#eff5ff] p-4 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <NavIcon icon="/icons/sparkles.svg" size={18} className="shrink-0 bg-brand-900" />
            <p className="min-w-0 flex-1 text-[13px] font-medium leading-[19px] text-brand-900">
              Listings with checked documents get 2.3× more enquiries. Add the land title to your Prampram plot to request a check.
            </p>
          </div>
          <Button variant="primary" onClick={() => router.push("/manage/documents")} className="h-9 w-auto shrink-0 self-start whitespace-nowrap rounded-[10px] px-4 sm:self-auto lg:rounded-[10px]">
            Add documents
          </Button>
        </div>
      </PageContainer>
    </AppShell>
  );
}

