"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { AppShell } from "@/components/shared/AppShell";
import { ArtisanRoleBar } from "@/components/shared/ArtisanRoleBar";
import { ArtisanTabs } from "@/components/shared/ManageTabs";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { ARTISAN_QUOTES, QUOTE_FILTERS, QUOTE_KPIS, matchesQuoteFilter, type ArtisanQuote, type QuoteFilterKey, type QuoteKind } from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<QuoteKind, string> = {
  viewed: "bg-[#fef3c7] text-[#b45309]",
  waiting: "bg-[#f1f5f9] text-[#334155]",
  accepted: "bg-[#dcfce7] text-[#16a34a]",
  expiring: "bg-[#fee2e2] text-[#dc2626]",
  declined: "bg-[#f1f5f9] text-[#334155]",
};

const ghs = (amount: number) => `GHS ${amount.toLocaleString("en-US")}`;

/** Manage · Artisan · Quotes (Figma node 1081:33273): quotes sent, who has seen them and which became jobs. */
export default function ArtisanQuotesPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<QuoteFilterKey>("All");
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  const quotes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ARTISAN_QUOTES.filter((quote) => matchesQuoteFilter(quote, filter) && (!needle || `${quote.title} ${quote.detail} ${quote.client.name}`.toLowerCase().includes(needle)));
  }, [query, filter]);

  function act(quote: ArtisanQuote) {
    if (quote.action === "Follow up") return showSuccessToast(`Follow-up sent to ${quote.client.name}`);
    if (quote.action === "Extend") return showSuccessToast(`${quote.id} extended by 7 days`);
    if (quote.action === "Open job") return router.push("/manage/artisan/jobs");
    return router.push(comingSoonHref(`${quote.action} quote`));
  }

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <ArtisanRoleBar page="Quotes" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Quotes</h1>
            <p className="text-sm leading-5 text-gray-500">Quotes you’ve sent and requests waiting for one. Accepted quotes become jobs.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" onClick={comingSoon("Quote templates")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              Templates
            </Button>
            <Button variant="primary" onClick={comingSoon("New quote")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              + New quote
            </Button>
          </div>
        </div>

        <ArtisanTabs active="quotes" />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {QUOTE_KPIS.map((kpi) => (
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
              placeholder="Search quotes"
              aria-label="Search quotes"
              className="min-w-0 flex-1 bg-transparent text-[13px] leading-[19px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
            />
          </label>
          <div role="tablist" aria-label="Show" className="flex flex-wrap gap-2.5">
            {QUOTE_FILTERS.map((option) => {
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
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead className="bg-[#f8fafc]">
              <tr className="text-[11px] font-bold leading-4 text-gray-500">
                {["QUOTE", "CLIENT", "AMOUNT", "SENT", "STATUS"].map((heading) => (
                  <th key={heading} scope="col" className="px-4 py-2.5 font-bold">
                    {heading}
                  </th>
                ))}
                <th scope="col" aria-label="Actions" className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id} className="border-t border-gray-200 text-[13px] leading-[19px] text-[#334155]">
                  <td className="px-4 py-3">
                    <span className="flex flex-col whitespace-nowrap">
                      <span className="font-semibold text-[#0f172a]">{quote.title}</span>
                      <span className="text-xs leading-[17px] text-gray-500">{quote.detail}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2.5 whitespace-nowrap font-semibold text-[#0f172a]">
                      <span className="relative block size-8 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
                        <Image src={quote.client.avatar} alt="" fill className="object-cover" sizes="32px" />
                      </span>
                      {quote.client.name}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{ghs(quote.amount)}</td>
                  <td className="whitespace-nowrap px-4 py-3">{quote.sent}</td>
                  <td className="px-4 py-3">
                    <span className={cn("whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", STATUS_TONE[quote.status.kind])}>{quote.status.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => act(quote)} className="whitespace-nowrap text-[13px] font-medium text-brand-900">
                      {quote.action}
                    </button>
                  </td>
                </tr>
              ))}
              {quotes.length === 0 && (
                <tr className="border-t border-gray-200">
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    {filter === "Drafts" ? "You have no draft quotes." : "No quotes match."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 rounded-xl bg-[#eff5ff] p-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <NavIcon icon="/icons/sparkles.svg" size={18} className="shrink-0 bg-brand-900" />
            <p className="min-w-0 flex-1 text-[13px] font-medium leading-[19px] text-brand-900">Quotes with photos of past work win 2× more often. Add 3 photos to your Services &amp; portfolio.</p>
          </div>
          <Button variant="primary" onClick={comingSoon("Services & portfolio")} className="h-9 w-auto shrink-0 self-start whitespace-nowrap rounded-[10px] px-4 sm:self-auto lg:rounded-[10px]">
            Add photos
          </Button>
        </div>
      </PageContainer>
    </AppShell>
  );
}

