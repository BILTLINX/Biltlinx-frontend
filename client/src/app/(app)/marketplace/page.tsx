"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { ListingCard } from "@/components/shared/ListingCard";
import { MarketplaceRail } from "@/components/shared/MarketplaceRail";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { errorMessage } from "@/lib/errors";
import { getFacets, KIND_LABEL, offerToCard, searchMarketplace } from "@/lib/marketplace-api";
import { cn } from "@/lib/utils";

const FIELD = "h-12 min-w-0 rounded-xl border border-gray-200 bg-white px-3 text-sm text-[#0f172a] focus:border-brand-900 focus:outline-none";
const SORTS = [
  { value: "", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

export default function MarketplacePage() {
  const facets = useQuery({ queryKey: ["marketplace", "facets"], queryFn: getFacets, staleTime: Infinity });
  const [kind, setKind] = useState("");
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [sort, setSort] = useState("");
  const sentinel = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(text.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [text]);

  const units = useMemo(() => {
    const byKind = facets.data?.unitsByKind ?? {};
    const keys = kind ? [kind] : Object.keys(byKind);
    const set = new Set(keys.flatMap((key) => byKind[key] ?? []));
    return (facets.data?.units ?? []).filter((item) => item.unit && set.has(item.unit));
  }, [facets.data, kind]);
  const singleUnit = kind !== "" && (facets.data?.unitsByKind?.[kind]?.length ?? 0) === 1;
  const wantsPrice = minPrice.trim() !== "" || maxPrice.trim() !== "";
  const needsUnit = wantsPrice && !singleUnit && unit === "";
  const min = Number(minPrice);
  const max = Number(maxPrice);

  const query = {
    q: search || undefined,
    kind: kind || undefined,
    city: city.trim() || undefined,
    sort: sort || undefined,
    unit: unit || (singleUnit ? facets.data?.unitsByKind?.[kind]?.[0] : undefined),
    minPrice: !needsUnit && minPrice.trim() && Number.isFinite(min) ? min : undefined,
    maxPrice: !needsUnit && maxPrice.trim() && Number.isFinite(max) ? max : undefined,
  };

  const result = useInfiniteQuery({
    queryKey: ["marketplace", "offers", query],
    queryFn: ({ pageParam, signal }) => searchMarketplace({ ...query, page: pageParam, results: 12 }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.currentPage < last.totalPages ? last.currentPage + 1 : undefined),
    placeholderData: keepPreviousData,
  });
  const cards = useMemo(() => (result.data?.pages.flatMap((page) => page.items ?? []) ?? []).map(offerToCard), [result.data]);
  const total = result.data?.pages[0]?.totalResults ?? 0;

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !result.hasNextPage) return;
    const observer = new IntersectionObserver((entries) => entries.some((entry) => entry.isIntersecting) && !result.isFetchingNextPage && void result.fetchNextPage(), { rootMargin: "400px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [result, cards.length]);

  return (
    <AppShell activeKey="feed" activeChildKey="marketplace" contentFullWidth rightRail={<MarketplaceRail />}>
      <PageContainer>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Marketplace</h1>
          <p className="text-sm leading-5 text-gray-500">Properties, land, stays and services in one place. Every listing shows its price and what it is priced per.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4">
            <NavIcon icon="/icons/search-02.svg" size={15} className="bg-gray-500" />
            <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Search land, rentals, stays, electricians…" aria-label="Search the marketplace" className="min-w-0 flex-1 bg-transparent text-sm focus:outline-none" />
          </label>
          <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" aria-label="City" className={cn(FIELD, "sm:w-[140px]")} />
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort" className={cn(FIELD, "sm:w-[170px]")}>
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div role="tablist" aria-label="Listing kinds" className="flex flex-wrap gap-2">
          {["", ...(facets.data?.kinds ?? [])].map((item) => (
            <button
              key={item || "all"}
              type="button"
              role="tab"
              aria-selected={item === kind}
              onClick={() => {
                setKind(item);
                setUnit("");
              }}
              className={cn("whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-medium leading-[18px]", item === kind ? "bg-brand-900 text-white" : "border border-gray-200 bg-white text-[#334155] hover:bg-gray-50")}
            >
              {item ? (KIND_LABEL[item] ?? item) : "All"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <input value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="Min price" inputMode="numeric" aria-label="Minimum price" className={cn(FIELD, "h-11 w-32")} />
          <input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Max price" inputMode="numeric" aria-label="Maximum price" className={cn(FIELD, "h-11 w-32")} />
          {!singleUnit && (
            <select value={unit} onChange={(event) => setUnit(event.target.value)} aria-label="Priced per" className={cn(FIELD, "h-11 w-40", needsUnit && "border-[#b45309]")}>
              <option value="">Priced per…</option>
              {units.map((item) => (
                <option key={item.unit} value={item.unit ?? ""}>
                  {item.label}
                </option>
              ))}
            </select>
          )}
          {needsUnit && <span className="text-xs text-[#b45309]">Choose what it is priced per, so we only compare like with like.</span>}
        </div>

        <p className="text-sm font-medium text-[#0f172a]">{result.isPending ? "Searching…" : `${total.toLocaleString("en-GH")} live listings`}</p>

        {result.isPending && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-4">
            {[0, 1, 2].map((n) => (
              <Skeleton key={n} className="h-[330px] rounded-2xl" />
            ))}
          </div>
        )}
        {result.isError && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-gray-500">{errorMessage(result.error)}</p>
            <button type="button" onClick={() => void result.refetch()} className="text-sm font-medium text-brand-900">
              Try again
            </button>
          </div>
        )}
        {!result.isPending && !result.isError && cards.length === 0 && <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">No listings match your search.</p>}
        {cards.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-4">
            {cards.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
        {result.hasNextPage && <div ref={sentinel} aria-hidden="true" className="h-px" />}

        <div className="xl:hidden">
          <MarketplaceRail />
        </div>
      </PageContainer>
    </AppShell>
  );
}
