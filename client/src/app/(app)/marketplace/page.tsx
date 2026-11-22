"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { CreateMarketplaceListingModal } from "@/components/shared/CreateMarketplaceListingModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterPanel, filterText, type FilterSection, type FilterValues } from "@/components/shared/FilterPanel";
import { MarketplaceCard } from "@/components/shared/MarketplaceCard";
import { MarketplaceRail } from "@/components/shared/MarketplaceRail";
import { PageContainer } from "@/components/shared/PageContainer";
import { SearchEmpty } from "@/components/shared/SearchEmpty";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDebouncedSearch } from "@/context/SearchContext";
import { useMarketFacets } from "@/hooks/useMarketplace";
import { PAGE_SIZE, usePage, usePagedSearch } from "@/hooks/usePagedSearch";
import { comingSoonHref } from "@/lib/coming-soon";
import { errorMessage } from "@/lib/errors";
import { searchMarketplace } from "@/lib/marketplace-api";
import { cn } from "@/lib/utils";

const NO_FILTERS: FilterValues = { minPrice: "", maxPrice: "", unit: "", city: "", delivery: "", sort: "" };
const SORTS = [
  { value: "priceAsc", label: "Price: low to high" },
  { value: "priceDesc", label: "Price: high to low" },
];
const TABS = [
  { value: "", label: "All" },
  { value: "Materials", label: "Materials" },
  { value: "Equipment", label: "Equipment" },
  { value: "Land", label: "Land" },
];
const TAB = "h-9 shrink-0 rounded-full border px-4 text-[13px] font-medium";

export default function MarketplacePage() {
  const facets = useMarketFacets();
  const search = useDebouncedSearch();
  const [category, setCategory] = useState("");
  const [filters, setFilters] = useState<FilterValues>(NO_FILTERS);
  const [listing, setListing] = useState(false);
  const city = filterText(filters, "city");
  const minPrice = filterText(filters, "minPrice");
  const maxPrice = filterText(filters, "maxPrice");
  const unit = filterText(filters, "unit");
  const sort = filterText(filters, "sort");
  const delivery = filterText(filters, "delivery") === "true";

  const units = useMemo(() => {
    const categories = (facets.data?.categories ?? []).filter((item) => !category || item.category === category);
    const seen = new Set<string>();
    return categories.flatMap((item) => item.units).filter((item) => !seen.has(item.unit) && seen.add(item.unit));
  }, [facets.data, category]);
  const singleUnit = category !== "" && units.length === 1;
  const wantsPrice = minPrice.trim() !== "" || maxPrice.trim() !== "" || sort !== "";
  const needsUnit = wantsPrice && !singleUnit && unit === "";
  const activeUnit = unit && units.some((item) => item.unit === unit) ? unit : singleUnit ? units[0]?.unit : undefined;

  const sections: FilterSection[] = [
    { type: "options", label: "Sort by", key: "sort", display: "chips", options: SORTS },
    { type: "range", label: "Price", minKey: "minPrice", maxKey: "maxPrice", prefix: "GHS" },
    { type: "options", label: "Priced per", key: "unit", display: "chips", options: units.map((item) => ({ value: item.unit, label: item.label })), hidden: singleUnit },
    { type: "text", label: "Location", key: "city", placeholder: "Any area, e.g. Tema" },
    { type: "toggle", label: "Delivery", key: "delivery", text: "Seller delivers" },
  ];

  const min = Number(minPrice);
  const max = Number(maxPrice);
  const query = {
    q: search || undefined,
    category: category || undefined,
    city: city.trim() || undefined,
    unit: activeUnit,
    delivery: delivery || undefined,
    sort: needsUnit ? undefined : sort || undefined,
    minPrice: !needsUnit && minPrice.trim() && Number.isFinite(min) ? min : undefined,
    maxPrice: !needsUnit && maxPrice.trim() && Number.isFinite(max) ? max : undefined,
  };

  const [page, setPage] = usePage(query);
  const result = usePagedSearch(["marketplace", "offers", query], (n, signal) => searchMarketplace({ ...query, page: n, results: PAGE_SIZE }, signal), page);
  const { total, totalPages } = result;

  function clearFilters() {
    setCategory("");
    setFilters(NO_FILTERS);
  }

  return (
    <AppShell activeKey="feed" activeChildKey="marketplace" contentFullWidth rightRail={<MarketplaceRail />}>
      <PageContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Marketplace</h1>
            <p className="text-sm leading-5 text-gray-500">Buy or hire building materials, equipment and land from sellers across Ghana. Every listing shows its price.</p>
          </div>
          <Button variant="primary" onClick={() => setListing(true)} className="h-10 w-auto shrink-0 rounded-[10px] px-4 text-sm font-medium lg:rounded-[10px]">
            List on Marketplace
          </Button>
          <FilterPanel
            className="shrink-0 sm:max-w-[45%] sm:justify-end"
            sections={sections}
            values={filters}
            onChange={(next) => setFilters(filterText(next, "unit") && !units.some((item) => item.unit === filterText(next, "unit")) ? { ...next, unit: "" } : next)}
          />
        </div>

        <div className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist" aria-label="Category">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={category === tab.value}
              onClick={() => {
                setCategory(tab.value);
                setFilters((current) => ({ ...current, unit: "" }));
              }}
              className={cn(TAB, category === tab.value ? "border-brand-900 bg-[#eff5ff] text-brand-900" : "border-gray-200 bg-white text-[#334155] hover:bg-gray-50")}
            >
              {tab.label}
            </button>
          ))}
          <Link href="/marketplace/orders" className={cn(TAB, "ml-auto flex items-center border-gray-200 bg-white text-[#334155] hover:bg-gray-50")}>
            My orders
          </Link>
        </div>

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
          <div className="@container">
            <div className="grid grid-cols-1 gap-4 @[560px]:grid-cols-2">
              {result.items.map((offer) => (
                <MarketplaceCard key={offer.id} offer={offer} />
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
