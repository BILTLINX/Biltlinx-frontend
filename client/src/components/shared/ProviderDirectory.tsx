"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { EmptyState, type EmptyIcon } from "@/components/shared/EmptyState";
import { filterText, FilterPanel, type FilterSection, type FilterValues } from "@/components/shared/FilterPanel";
import { PageContainer } from "@/components/shared/PageContainer";
import { ProviderCard } from "@/components/shared/ProviderCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProviders, useTaxonomy } from "@/hooks/useServices";
import { errorMessage } from "@/lib/errors";
import { useDebouncedSearch } from "@/context/SearchContext";

const NO_RESULTS: Record<ProviderDirectoryProps["kind"], { icon: EmptyIcon; title: string; body: string; post: string }> = {
  professional: {
    icon: "professional-sad",
    title: "No professionals found",
    body: "Try another discipline or widen the location. Or post a request and let professionals come to you.",
    post: "Post a request",
  },
  artisan: {
    icon: "wrench-sad",
    title: "No artisans nearby for this trade",
    body: "Widen the area or try a related trade. Post the job and nearby artisans can send you quotes.",
    post: "Post a job",
  },
};

const FILTER: Record<ProviderDirectoryProps["kind"], { label: string; all: string }> = {
  professional: { label: "Discipline", all: "All" },
  artisan: { label: "Trade", all: "All trades" },
};

interface ProviderDirectoryProps {
  kind: "professional" | "artisan";
  title: string;
  subtitle: string;
  activeChildKey: string;
  rightRail: ReactNode;
}

export function ProviderDirectory({ kind, title, subtitle, activeChildKey, rightRail }: ProviderDirectoryProps) {
  const router = useRouter();
  const taxonomy = useTaxonomy();
  const search = useDebouncedSearch();
  const [filters, setFilters] = useState<FilterValues>({ category: "", city: "", verified: "", urgent: "" });
  const sentinel = useRef<HTMLDivElement | null>(null);

  function clearFilters() {
    setFilters({ category: "", city: "", verified: "", urgent: "" });
  }

  const city = filterText(filters, "city");
  const category = filterText(filters, "category");
  const verifiedOnly = filterText(filters, "verified") === "true";
  const urgent = filterText(filters, "urgent") === "true";
  const { items, total, isPending, isError, error, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useProviders({
    kind,
    q: search || undefined,
    city: city.trim() || undefined,
    category: category || undefined,
    credentialVerified: verifiedOnly || undefined,
    urgent: urgent || undefined,
  });

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasNextPage) return;
    const observer = new IntersectionObserver((entries) => entries.some((entry) => entry.isIntersecting) && !isFetchingNextPage && void fetchNextPage(), { rootMargin: "400px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, items.length]);

  const categories = (kind === "professional" ? taxonomy.data?.professions : taxonomy.data?.trades) ?? [];
  const sections: FilterSection[] = [
    { type: "options", label: FILTER[kind].label, key: "category", display: "list", searchable: true, options: categories.map((item) => ({ value: item, label: item })) },
    { type: "text", label: "City", key: "city", placeholder: "Any city" },
    { type: "toggle", label: "Credential verified", key: "verified", text: "Credential verified" },
    { type: "toggle", label: "Urgent jobs", key: "urgent", text: "Urgent jobs" },
  ];

  return (
    <AppShell activeKey="people" activeChildKey={activeChildKey} contentFullWidth rightRail={rightRail}>
      <PageContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">{title}</h1>
            <p className="text-sm leading-5 text-gray-500">{subtitle}</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/manage/provider")} className="h-10 w-auto shrink-0 self-start rounded-[10px] px-4 sm:self-auto lg:rounded-[10px]">
            {kind === "professional" ? "Join as a professional" : "Join as an artisan"}
          </Button>
        </div>

        <FilterPanel sections={sections} values={filters} onChange={setFilters} />

        <p className="text-sm font-medium leading-5 text-[#0f172a]">{isPending ? "Searching…" : `${total} ${total === 1 ? "result" : "results"}`}</p>

        {isPending && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-4">
            {[0, 1].map((n) => (
              <Skeleton key={n} className="h-[260px] rounded-2xl" />
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
            icon={NO_RESULTS[kind].icon}
            title={NO_RESULTS[kind].title}
            body={NO_RESULTS[kind].body}
            primary={{ label: NO_RESULTS[kind].post, href: "/request-board/new" }}
            secondary={{ label: "Clear filters", onClick: clearFilters }}
          />
        )}
        {items.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-4">
            {items.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} kind={kind} />
            ))}
          </div>
        )}
        {hasNextPage && <div ref={sentinel} aria-hidden="true" className="h-px" />}
      </PageContainer>
    </AppShell>
  );
}
