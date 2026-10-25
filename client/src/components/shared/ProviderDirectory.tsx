"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { ProviderCard } from "@/components/shared/ProviderCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProviders, useTaxonomy } from "@/hooks/useServices";
import { errorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";

interface ProviderDirectoryProps {
  kind: "professional" | "artisan";
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  activeChildKey: string;
  rightRail: ReactNode;
}

export function ProviderDirectory({ kind, title, subtitle, searchPlaceholder, activeChildKey, rightRail }: ProviderDirectoryProps) {
  const router = useRouter();
  const taxonomy = useTaxonomy();
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const sentinel = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(text.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [text]);

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
  const chip = "whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-medium leading-[18px]";

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

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4">
            <NavIcon icon="/icons/search-02.svg" size={15} className="bg-gray-500" />
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={`Search ${title.toLowerCase()}`}
              className="min-w-0 flex-1 bg-transparent text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
            />
          </label>
          <label className="flex h-12 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 sm:w-[200px]">
            <NavIcon icon="/icons/post-options-location.svg" size={14} className="bg-[#0f172a]" />
            <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" aria-label="City" className="min-w-0 flex-1 bg-transparent text-sm font-medium focus:outline-none" />
          </label>
        </div>

        <div role="tablist" aria-label="Category" className="flex flex-wrap gap-2">
          {["", ...categories].map((item) => (
            <button
              key={item || "all"}
              type="button"
              role="tab"
              aria-selected={item === category}
              onClick={() => setCategory(item)}
              className={cn(chip, item === category ? "bg-brand-900 text-white" : "border border-gray-200 bg-white text-[#334155] hover:bg-gray-50")}
            >
              {item || "All"}
            </button>
          ))}
          <button type="button" aria-pressed={verifiedOnly} onClick={() => setVerifiedOnly((v) => !v)} className={cn(chip, verifiedOnly ? "bg-[#eff5ff] text-brand-900 ring-1 ring-brand-900" : "border border-gray-200 bg-white text-[#334155]")}>
            Credential verified
          </button>
          <button type="button" aria-pressed={urgent} onClick={() => setUrgent((v) => !v)} className={cn(chip, urgent ? "bg-[#eff5ff] text-brand-900 ring-1 ring-brand-900" : "border border-gray-200 bg-white text-[#334155]")}>
            Urgent jobs
          </button>
        </div>

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
        {!isPending && !isError && items.length === 0 && <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">No one matches these filters yet.</p>}
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
