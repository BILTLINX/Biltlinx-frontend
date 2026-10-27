"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterDropdown } from "@/components/shared/FilterDropdown";
import { OfferingCard } from "@/components/shared/OfferingCard";
import { PageContainer } from "@/components/shared/PageContainer";
import { ServicesRail } from "@/components/shared/ServicesRail";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useOfferings, useTaxonomy, useTradeSuggestions } from "@/hooks/useServices";
import { errorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { useDebouncedSearch } from "@/context/SearchContext";

const SORTS = [
  { value: "", label: "Newest" },
  { value: "priceAsc", label: "Price: low to high" },
  { value: "priceDesc", label: "Price: high to low" },
] as const;

const FIELD = "h-12 min-w-0 rounded-xl border border-gray-200 bg-white px-3 text-sm text-[#0f172a] focus:border-brand-900 focus:outline-none";

export default function ServicesPage() {
  const router = useRouter();
  const taxonomy = useTaxonomy();
  const search = useDebouncedSearch();
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<(typeof SORTS)[number]["value"]>("");
  const [problem, setProblem] = useState("");

  function clearFilters() {
    setCategory("");
    setCity("");
    setMaxPrice("");
    setSort("");
    setProblem("");
  }
  const suggestions = useTradeSuggestions(problem);
  const sentinel = useRef<HTMLDivElement | null>(null);

  const max = Number(maxPrice);
  const { items, total, isPending, isError, error, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useOfferings({
    q: search || undefined,
    category: category || undefined,
    city: city.trim() || undefined,
    maxPrice: maxPrice.trim() && Number.isFinite(max) ? max : undefined,
    sort: sort || undefined,
  });

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasNextPage) return;
    const observer = new IntersectionObserver((entries) => entries.some((entry) => entry.isIntersecting) && !isFetchingNextPage && void fetchNextPage(), { rootMargin: "400px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, items.length]);

  const categories = [...(taxonomy.data?.professions ?? []), ...(taxonomy.data?.trades ?? [])];

  return (
    <AppShell activeKey="services" activeChildKey="services" contentFullWidth rightRail={<ServicesRail />}>
      <PageContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Services</h1>
            <p className="text-sm leading-5 text-gray-500">Priced services from professionals, artisans and companies. Compare what is included before you book.</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/manage/provider")} className="h-10 w-auto shrink-0 self-start rounded-[10px] px-4 sm:self-auto lg:rounded-[10px]">
            Offer a service
          </Button>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl bg-[#eff5ff] p-4">
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-brand-900">
            Not sure who to hire? Describe the problem
            <input value={problem} onChange={(event) => setProblem(event.target.value)} placeholder="e.g. the socket sparks when I plug in the kettle" className={cn(FIELD, "h-11 font-normal")} />
          </label>
          {(suggestions.data?.length ?? 0) > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2 text-[13px]">
                <span className="text-brand-900">Try:</span>
                {suggestions.data?.slice(0, 4).map((item) => (
                  <button key={item.trade} type="button" onClick={() => setCategory(item.trade ?? "")} className="rounded-full bg-white px-3 py-1 font-medium text-brand-900 shadow-sm hover:bg-gray-50">
                    {item.trade}
                  </button>
                ))}
              </div>
              {suggestions.data?.some((item) => item.warning) && <p className="rounded-lg bg-[#fef3c7] p-2.5 text-xs leading-[17px] text-[#b45309]">{suggestions.data.find((item) => item.warning)?.warning}</p>}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" aria-label="City" className={cn(FIELD, "sm:w-[140px]")} />
          <input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Max price (GHS)" inputMode="numeric" aria-label="Maximum price" className={cn(FIELD, "sm:w-[150px]")} />
          <FilterDropdown label="Sort" value={sort} onChange={(value) => setSort(value as typeof sort)} options={SORTS} className="sm:self-center" />
        </div>

        <FilterDropdown label="Category" value={category} onChange={setCategory} options={[{ value: "", label: "All" }, ...categories.map((item) => ({ value: item, label: item }))]} />

        <p className="text-sm font-medium text-[#0f172a]">{isPending ? "Searching…" : `${total} ${total === 1 ? "service" : "services"}`}</p>

        {isPending && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-4">
            {[0, 1, 2].map((n) => (
              <Skeleton key={n} className="h-[300px] rounded-2xl" />
            ))}
          </div>
        )}
        {isError && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-gray-500">{errorMessage(error)}</p>
            <button type="button" onClick={() => void refetch()} className="text-sm font-medium text-brand-900">
              Try again
            </button>
          </div>
        )}
        {!isPending && !isError && items.length === 0 && (
          <EmptyState
            mood="sad"
            icon="services-sad"
            title="No services match"
            body="Try a different category or price. If it isn’t listed, describe it and providers will quote."
            primary={{ label: "Request a service", href: "/request-board/new" }}
            secondary={{ label: "Clear filters", onClick: clearFilters }}
          />
        )}
        {items.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-4">
            {items.map((offering) => (
              <OfferingCard key={offering.id} offering={offering} />
            ))}
          </div>
        )}
        {hasNextPage && <div ref={sentinel} aria-hidden="true" className="h-px" />}

        <div className="xl:hidden">
          <ServicesRail />
        </div>
      </PageContainer>
    </AppShell>
  );
}
