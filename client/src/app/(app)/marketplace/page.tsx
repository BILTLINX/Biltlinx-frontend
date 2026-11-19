"use client";

import { SearchEmpty } from "@/components/shared/SearchEmpty";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { filterList, filterText, FilterPanel, type FilterSection, type FilterValues } from "@/components/shared/FilterPanel";
import { CreateMarketplaceListingModal } from "@/components/shared/CreateMarketplaceListingModal";
import { MarketplaceCard } from "@/components/shared/MarketplaceCard";
import { MarketplaceRail } from "@/components/shared/MarketplaceRail";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMarketListings } from "@/hooks/useMarketListings";
import { PAGE_SIZE, usePage, usePagedSearch } from "@/hooks/usePagedSearch";
import { comingSoonHref } from "@/lib/coming-soon";
import { errorMessage } from "@/lib/errors";
import { listingToOffer } from "@/lib/market-listings";
import { getFacets, KIND_LABEL, searchMarketplace } from "@/lib/marketplace-api";
import { useDebouncedSearch } from "@/context/SearchContext";

const NO_FILTERS: FilterValues = { kind: [], city: "", category: "", currency: "", minPrice: "", maxPrice: "", unit: "" };
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
  const facets = useQuery({ queryKey: ["marketplace", "facets"], queryFn: getFacets, staleTime: Infinity });
  const search = useDebouncedSearch();
  const [filters, setFilters] = useState<FilterValues>(NO_FILTERS);
  const kindKey = filterList(filters, "kind").join(",");
  const city = filterText(filters, "city");
  const category = filterText(filters, "category");
  const currency = filterText(filters, "currency");
  const minPrice = filterText(filters, "minPrice");
  const maxPrice = filterText(filters, "maxPrice");
  const unit = filterText(filters, "unit");
  const sort = filterText(filters, "sort");

  function clearFilters() {
    setFilters(NO_FILTERS);
  }

  const units = useMemo(() => {
    const byKind = facets.data?.unitsByKind ?? {};
    const keys = kindKey ? kindKey.split(",") : Object.keys(byKind);
    const set = new Set(keys.flatMap((key) => byKind[key] ?? []));
    return (facets.data?.units ?? []).filter((item) => item.unit && set.has(item.unit));
  }, [facets.data, kindKey]);
  const singleUnit = kindKey !== "" && units.length === 1;
  const wantsPrice = minPrice.trim() !== "" || maxPrice.trim() !== "";
  const needsUnit = wantsPrice && !singleUnit && unit === "";
  const sections: FilterSection[] = [
    { type: "options", label: "Sort by", key: "sort", display: "chips", options: SORTS.filter((option) => option.value !== "") },
    { type: "options", label: "Category", key: "kind", display: "list", multiple: true, options: (facets.data?.kinds ?? []).map((item) => ({ value: item, label: KIND_LABEL[item] ?? item })) },
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
    kind: kindKey || undefined,
    city: city.trim() || undefined,
    category: category.trim() || undefined,
    currency: currency || undefined,
    sort: sort || undefined,
    unit: unit || (singleUnit ? units[0]?.unit ?? undefined : undefined),
    minPrice: !needsUnit && minPrice.trim() && Number.isFinite(min) ? min : undefined,
    maxPrice: !needsUnit && maxPrice.trim() && Number.isFinite(max) ? max : undefined,
  };

  const [page, setPage] = usePage(query);
  const result = usePagedSearch(["marketplace", "offers", query], (n, signal) => searchMarketplace({ ...query, page: n, results: PAGE_SIZE }, signal), page);
  const { total, totalPages } = result;
  const [listing, setListing] = useState(false);
  const { listings: mine } = useMarketListings();

  return (
    <AppShell activeKey="feed" activeChildKey="marketplace" contentFullWidth rightRail={<MarketplaceRail />}>
      <PageContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Marketplace</h1>
            <p className="text-sm leading-5 text-gray-500">Buy, rent, hire, book or order anything for the built environment. Every listing shows its price.</p>
          </div>
          <Button variant="primary" onClick={() => setListing(true)} className="h-10 w-auto shrink-0 rounded-[10px] px-4 text-sm font-medium lg:rounded-[10px]">
            List on Marketplace
          </Button>
          <FilterPanel
            className="shrink-0 sm:max-w-[45%] sm:justify-end"
            sections={sections}
            values={filters}
            onChange={(next) => setFilters(filterList(next, "kind").join(",") !== kindKey ? { ...next, unit: "" } : next)}
          />
        </div>

        {mine.length > 0 && (
          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Your listings</h2>
              <p className="text-xs text-gray-500">Saved in this browser only for now. Buyers cannot see them yet.</p>
            </div>
            <div className="@container">
              <div className="grid grid-cols-1 gap-4 @[560px]:grid-cols-2">
                {mine.map((item) => (
                  <MarketplaceCard key={item.id} offer={listingToOffer(item)} />
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-sm font-medium text-[#0f172a]">
            {result.isPending ? "Searching…" : `${total.toLocaleString("en-GH")} live listings${city.trim() ? ` in ${city.trim()}` : ""}`}
          </p>
        </div>
        {needsUnit && <p className="text-xs text-[#b45309]">Choose what it is priced per, so we only compare like with like.</p>}


        {result.isPending && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        {!result.isPending && !result.isError && result.items.length === 0 && search && <SearchEmpty noun="listings" />}
        {!result.isPending && !result.isError && result.items.length === 0 && !search && (
          <EmptyState
            mood="sad"
            icon="search-sad"
            title="No listings match your search"
            body="Try a wider area, another category or fewer filters. Or save this search and we’ll tell you when something lands."
            primary={{ label: "Clear filters", onClick: clearFilters }}
            secondary={{ label: "Save this search", href: comingSoonHref("Saved searches") }}
          />
        )}
        {result.items.length > 0 && (
          // Always two across, whether the sidebar is open or collapsed.
          <div className="@container">
            <div className="grid grid-cols-1 gap-4 @[560px]:grid-cols-2">
              {result.items.map((offer) => (
                <MarketplaceCard key={`${offer.kind}-${offer.id}`} offer={offer} />
              ))}
            </div>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />

        <div className="xl:hidden">
          <MarketplaceRail />
        </div>
      </PageContainer>
      <CreateMarketplaceListingModal open={listing} onClose={() => setListing(false)} />
    </AppShell>
  );
}
