"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterDropdown } from "@/components/shared/FilterDropdown";
import { filterText, FilterPanel, type FilterSection, type FilterValues } from "@/components/shared/FilterPanel";
import { ListingCard } from "@/components/shared/ListingCard";
import { MarketplaceRail } from "@/components/shared/MarketplaceRail";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { comingSoonHref } from "@/lib/coming-soon";
import { errorMessage } from "@/lib/errors";
import { getFacets, KIND_LABEL, offerToCard, searchMarketplace } from "@/lib/marketplace-api";
import { useDebouncedSearch } from "@/context/SearchContext";

const NO_FILTERS: FilterValues = { kind: "", city: "", category: "", currency: "", minPrice: "", maxPrice: "", unit: "" };
const CURRENCIES = [
  { value: "GHS", label: "GHS" },
  { value: "USD", label: "USD" },
];
const SORTS = [
  { value: "", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

export default function MarketplacePage() {
  const router = useRouter();
  const facets = useQuery({ queryKey: ["marketplace", "facets"], queryFn: getFacets, staleTime: Infinity });
  const search = useDebouncedSearch();
  const [filters, setFilters] = useState<FilterValues>(NO_FILTERS);
  const kind = filterText(filters, "kind");
  const city = filterText(filters, "city");
  const category = filterText(filters, "category");
  const currency = filterText(filters, "currency");
  const minPrice = filterText(filters, "minPrice");
  const maxPrice = filterText(filters, "maxPrice");
  const unit = filterText(filters, "unit");
  const [sort, setSort] = useState("");
  const sentinel = useRef<HTMLDivElement | null>(null);

  function clearFilters() {
    setFilters(NO_FILTERS);
    setSort("");
  }

  const units = useMemo(() => {
    const byKind = facets.data?.unitsByKind ?? {};
    const keys = kind ? [kind] : Object.keys(byKind);
    const set = new Set(keys.flatMap((key) => byKind[key] ?? []));
    return (facets.data?.units ?? []).filter((item) => item.unit && set.has(item.unit));
  }, [facets.data, kind]);
  const singleUnit = kind !== "" && (facets.data?.unitsByKind?.[kind]?.length ?? 0) === 1;
  const wantsPrice = minPrice.trim() !== "" || maxPrice.trim() !== "";
  const needsUnit = wantsPrice && !singleUnit && unit === "";
  const sections: FilterSection[] = [
    { type: "options", label: "Category", key: "kind", display: "list", options: (facets.data?.kinds ?? []).map((item) => ({ value: item, label: KIND_LABEL[item] ?? item })) },
    { type: "range", label: "Price", minKey: "minPrice", maxKey: "maxPrice", prefix: "GHS" },
    { type: "options", label: "Priced per", key: "unit", display: "chips", options: units.map((item) => ({ value: item.unit ?? "", label: item.label ?? item.unit ?? "" })), hidden: singleUnit },
    { type: "options", label: "Currency", key: "currency", display: "chips", options: CURRENCIES },
    { type: "text", label: "City", key: "city", placeholder: "Any city" },
    { type: "text", label: "Item type", key: "category", placeholder: "e.g. Cement, Excavator" },
  ];
  const min = Number(minPrice);
  const max = Number(maxPrice);

  const query = {
    q: search || undefined,
    kind: kind || undefined,
    city: city.trim() || undefined,
    category: category.trim() || undefined,
    currency: currency || undefined,
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Marketplace</h1>
            <p className="text-sm leading-5 text-gray-500">Buy, rent, hire, book or order anything for the built environment. Every listing shows its price.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" onClick={() => router.push(comingSoonHref("Saved searches"))} className="h-10 w-auto rounded-[10px] px-4 lg:rounded-[10px]">
              Saved searches
            </Button>
            <Button variant="primary" onClick={() => router.push("/manage/listings/new")} className="h-10 w-auto rounded-[10px] px-4 lg:rounded-[10px]">
              List on Marketplace
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <FilterPanel sections={sections} values={filters} onChange={(next) => setFilters(filterText(next, "kind") !== kind ? { ...next, unit: "" } : next)} />
          <p className="text-sm font-medium text-[#0f172a]">
            {result.isPending ? "Searching…" : `${total.toLocaleString("en-GH")} live listings${city.trim() ? ` in ${city.trim()}` : ""}`}
          </p>
          <FilterDropdown variant="text" label="Sort" value={sort} onChange={setSort} options={SORTS} className="ml-auto self-center" />
        </div>
        {needsUnit && <p className="text-xs text-[#b45309]">Choose what it is priced per, so we only compare like with like.</p>}


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
        {!result.isPending && !result.isError && cards.length === 0 && (
          <EmptyState
            mood="sad"
            icon="search-sad"
            title="No listings match your search"
            body="Try a wider area, another category or fewer filters. Or save this search and we’ll tell you when something lands."
            primary={{ label: "Clear filters", onClick: clearFilters }}
            secondary={{ label: "Save this search", href: comingSoonHref("Saved searches") }}
          />
        )}
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
