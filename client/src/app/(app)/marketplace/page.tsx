"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PageContainer } from "@/components/shared/PageContainer";
import { ListingCard } from "@/components/shared/ListingCard";
import { MarketplaceRail } from "@/components/shared/MarketplaceRail";
import { NavIcon } from "@/components/shared/NavIcon";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import {
  CATALOG_LISTINGS,
  MARKETPLACE_CATEGORIES,
  MARKETPLACE_TOTAL_LISTINGS,
  type MarketplaceCategory,
} from "@/lib/dummy-marketplace-catalog";
import { cn } from "@/lib/utils";

const SECONDARY_BUTTON =
  "h-10 w-auto rounded-[10px] px-4 lg:rounded-[10px] border border-gray-200 bg-white text-[#0f172a] hover:bg-gray-50";

export default function MarketplacePage() {
  const router = useRouter();
  const [category, setCategory] = useState<MarketplaceCategory>("All");
  const [query, setQuery] = useState("");
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  const listings = useMemo(() => {
    const term = query.trim().toLowerCase();
    return CATALOG_LISTINGS.filter(
      (listing) =>
        (category === "All" || listing.category === category) &&
        (!term || `${listing.title} ${listing.location} ${listing.kind}`.toLowerCase().includes(term)),
    );
  }, [category, query]);
  const resultCount = category === "All" && !query.trim() ? MARKETPLACE_TOTAL_LISTINGS : listings.length;

  return (
    <AppShell
      activeKey="feed"
      activeChildKey="marketplace"
      contentFullWidth
      rightRail={<MarketplaceRail />}
    >
      <PageContainer>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Marketplace</h1>
            <p className="text-sm leading-5 text-gray-500">
              Buy, rent, hire, book or order anything for the built environment. Every listing shows its price.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button onClick={comingSoon("Saved searches")} className={SECONDARY_BUTTON}>
              Saved searches
            </Button>
            <Button variant="primary" onClick={comingSoon("List on Marketplace")} className="h-10 w-auto rounded-[10px] px-4 lg:rounded-[10px]">
              List on Marketplace
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4">
            <NavIcon icon="/icons/search-02.svg" size={15} className="bg-gray-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search land, rentals, artisans, cement, excavators…"
              aria-label="Search the marketplace"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
            />
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={comingSoon("Location filter")}
              className="flex h-12 flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-[#0f172a] sm:w-[200px] sm:flex-none"
            >
              <NavIcon icon="/icons/post-options-location.svg" size={15} className="bg-[#0f172a]" />
              Greater Accra
            </button>
            <button
              type="button"
              onClick={comingSoon("Filters")}
              className="flex h-12 flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-[#0f172a] sm:w-[110px] sm:flex-none"
            >
              <NavIcon icon="/icons/list-bullet.svg" size={15} className="bg-[#0f172a]" />
              Filters
            </button>
          </div>
        </div>

        <div role="tablist" aria-label="Listing categories" className="flex flex-wrap gap-2">
          {MARKETPLACE_CATEGORIES.map((item) => {
            const active = item === category;
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(item)}
                className={cn(
                  "whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-medium leading-[18px]",
                  active ? "bg-brand-900 text-white" : "border border-gray-200 bg-white text-[#334155] hover:bg-gray-50",
                )}
              >
                {item}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium leading-5 text-[#0f172a]">
            {resultCount.toLocaleString("en-US")} live listings in Greater Accra
          </p>
          <p className="shrink-0 whitespace-nowrap text-[13px] leading-[19px]">
            <span className="text-gray-500">Sort: </span>
            <span className="font-medium text-[#0f172a]">Recommended ▾</span>
          </p>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            No listings match your search.
          </p>
        )}

        <div className="xl:hidden">
          <MarketplaceRail />
        </div>
      </PageContainer>
    </AppShell>
  );
}
