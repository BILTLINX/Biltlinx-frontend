"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { ListingCard } from "@/components/shared/ListingCard";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { PropertiesRail } from "@/components/shared/PropertiesRail";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProperties } from "@/hooks/useProperties";
import { comingSoonHref } from "@/lib/coming-soon";
import { errorMessage } from "@/lib/errors";
import type { PropertyQuery } from "@/lib/properties-api";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "buy", label: "Buy", noun: "homes for sale", query: { listingType: "Sale" } },
  { key: "rent", label: "Rent", noun: "homes for rent", query: { listingType: "Rent" } },
  { key: "land", label: "Land", noun: "plots", query: { propertyType: "Land" } },
  { key: "commercial", label: "Commercial", noun: "commercial properties", query: { propertyType: "Commercial" } },
] as const satisfies readonly { key: string; label: string; noun: string; query: Partial<PropertyQuery> }[];

type TabKey = (typeof TABS)[number]["key"];

const BEDROOM_OPTIONS = [
  { label: "Any", value: "" },
  { label: "1+", value: "1" },
  { label: "2+", value: "2" },
  { label: "3+", value: "3" },
  { label: "4+", value: "4" },
  { label: "5+", value: "5" },
];

const SORT_OPTIONS: { label: string; value: NonNullable<PropertyQuery["sort"]> }[] = [
  { label: "Newest", value: "newest" },
  { label: "Price: low to high", value: "price_asc" },
  { label: "Price: high to low", value: "price_desc" },
];

const FIELD = "h-12 min-w-0 rounded-xl border border-gray-200 bg-white px-3 text-sm text-[#0f172a] focus:border-brand-900 focus:outline-none";

function numberOrUndefined(value: string) {
  const parsed = Number(value);
  return value.trim() !== "" && Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export default function PropertiesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("buy");
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [sort, setSort] = useState<NonNullable<PropertyQuery["sort"]>>("newest");
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(text.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [text]);

  const active = TABS.find((item) => item.key === tab) ?? TABS[0];
  const { cards, total, isPending, isError, error, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useProperties({
    ...active.query,
    q: search || undefined,
    minPrice: numberOrUndefined(minPrice),
    maxPrice: numberOrUndefined(maxPrice),
    minBedrooms: tab === "land" || tab === "commercial" ? undefined : numberOrUndefined(bedrooms),
    sort,
  });

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, cards.length]);

  return (
    <AppShell activeKey="property" activeChildKey="properties" contentFullWidth rightRail={<PropertiesRail />}>
      <PageContainer>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Properties</h1>
            <p className="text-sm leading-5 text-gray-500">Homes, land and commercial space for sale or rent across Ghana.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              variant="primary"
              onClick={() => router.push("/manage/listings/new")}
              className="h-10 w-auto rounded-[10px] px-4 lg:rounded-[10px]"
            >
              List a property
            </Button>
          </div>
        </div>

        <div role="tablist" aria-label="Property type" className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-1">
          {TABS.map((item) => {
            const isActive = item.key === tab;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(item.key)}
                className={cn(
                  "min-w-fit flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm leading-5",
                  isActive ? "bg-white font-semibold text-brand-900" : "font-medium text-gray-500 hover:text-[#0f172a]",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4">
            <NavIcon icon="/icons/search-02.svg" size={15} className="bg-gray-500" />
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Search by area, estate or landmark"
              aria-label="Search properties"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
            />
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex">
            <input
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              inputMode="numeric"
              placeholder="Min price"
              aria-label="Minimum price"
              className={cn(FIELD, "lg:w-[120px]")}
            />
            <input
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              inputMode="numeric"
              placeholder="Max price"
              aria-label="Maximum price"
              className={cn(FIELD, "lg:w-[120px]")}
            />
            {(tab === "buy" || tab === "rent") && (
              <select value={bedrooms} onChange={(event) => setBedrooms(event.target.value)} aria-label="Bedrooms" className={cn(FIELD, "lg:w-[110px]")}>
                {BEDROOM_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value ? `${option.label} beds` : "Any beds"}
                  </option>
                ))}
              </select>
            )}
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as NonNullable<PropertyQuery["sort"]>)}
              aria-label="Sort"
              className={cn(FIELD, "lg:w-[170px]")}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium leading-5 text-[#0f172a]">
            {isPending ? "Searching…" : `${total.toLocaleString("en-GH")} ${active.noun}`}
          </p>
          <div className="flex shrink-0 gap-1 rounded-[10px] border border-gray-200 p-1">
            <span className="rounded-lg bg-brand-900 px-3.5 py-1.5 text-[13px] font-medium leading-[19px] text-white">List</span>
            <button
              type="button"
              onClick={() => router.push(comingSoonHref("Map view"))}
              className="rounded-lg px-3.5 py-1.5 text-[13px] font-medium leading-[19px] text-[#334155] hover:bg-gray-50"
            >
              Map
            </button>
          </div>
        </div>

        {isPending && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(290px,100%),1fr))] gap-4">
            {[0, 1, 2].map((n) => (
              <Skeleton key={n} className="h-[360px] rounded-2xl" />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-gray-500">{errorMessage(error, "We could not load properties.")}</p>
            <button type="button" onClick={() => void refetch()} className="text-sm font-medium text-brand-900">
              Try again
            </button>
          </div>
        )}

        {!isPending && !isError && cards.length === 0 && (
          <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">No properties match these filters.</p>
        )}

        {cards.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(290px,100%),1fr))] gap-4">
            {cards.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
        {isFetchingNextPage && <Skeleton className="h-[360px] rounded-2xl" />}
        {hasNextPage && <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />}

        <div className="xl:hidden">
          <PropertiesRail />
        </div>
      </PageContainer>
    </AppShell>
  );
}
