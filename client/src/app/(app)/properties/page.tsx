"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { filterText, FilterPanel, type FilterSection, type FilterValues } from "@/components/shared/FilterPanel";
import { ListingCard } from "@/components/shared/ListingCard";
import { PageContainer } from "@/components/shared/PageContainer";
import { PropertiesRail } from "@/components/shared/PropertiesRail";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProperties } from "@/hooks/useProperties";
import { comingSoonHref } from "@/lib/coming-soon";
import { errorMessage } from "@/lib/errors";
import type { PropertyQuery } from "@/lib/properties-api";
import { cn } from "@/lib/utils";
import { useDebouncedSearch } from "@/context/SearchContext";

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

function numberOrUndefined(value: string) {
  const parsed = Number(value);
  return value.trim() !== "" && Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export default function PropertiesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("buy");
  const search = useDebouncedSearch();
  const [filters, setFilters] = useState<FilterValues>({ minPrice: "", maxPrice: "", bedrooms: "", sort: "" });
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  function clearFilters() {
    setFilters({ minPrice: "", maxPrice: "", bedrooms: "", sort: "" });
  }

  const sections: FilterSection[] = [
    { type: "options", label: "Sort by", key: "sort", display: "chips", options: SORT_OPTIONS },
    { type: "range", label: "Price", minKey: "minPrice", maxKey: "maxPrice", prefix: "GHS" },
    { type: "options", label: "Bedrooms", key: "bedrooms", display: "chips", options: BEDROOM_OPTIONS.filter((option) => option.value !== ""), hidden: tab !== "buy" && tab !== "rent" },
  ];
  const active = TABS.find((item) => item.key === tab) ?? TABS[0];
  const { cards, total, isPending, isError, error, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useProperties({
    ...active.query,
    q: search || undefined,
    minPrice: numberOrUndefined(filterText(filters, "minPrice")),
    maxPrice: numberOrUndefined(filterText(filters, "maxPrice")),
    minBedrooms: tab === "land" || tab === "commercial" ? undefined : numberOrUndefined(filterText(filters, "bedrooms")),
    sort: (filterText(filters, "sort") || "newest") as NonNullable<PropertyQuery["sort"]>,
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
          <FilterPanel className="shrink-0 lg:max-w-[45%] lg:justify-end" sections={sections} values={filters} onChange={setFilters} />
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
          <EmptyState
            mood="sad"
            icon="home-sad"
            title="No homes match these filters"
            body="Widen the price range or remove a feature or two. Turn on alerts and we’ll send new homes as they’re listed."
            primary={{ label: "Clear filters", onClick: clearFilters }}
            secondary={{ label: "Turn on alerts", href: comingSoonHref("Property alerts") }}
          />
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
