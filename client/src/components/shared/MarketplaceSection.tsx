"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { MarketplaceCard } from "@/components/shared/MarketplaceCard";
import { NavIcon } from "@/components/shared/NavIcon";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { searchMarketplace } from "@/lib/marketplace-api";

/** "/home" dashboard's marketplace teaser grid. */
export function MarketplaceSection() {
  const offers = useQuery({ queryKey: ["marketplace", "home"], queryFn: () => searchMarketplace({ results: 4 }), staleTime: 60_000 });
  const items = offers.data?.items ?? [];

  return (
    <section className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[16px] font-bold text-night-700">From your marketplace</h2>
        <Link href="/marketplace" className="flex items-center gap-2 font-inter text-[13px] font-medium text-brand-600">
          Marketplace
          <NavIcon icon="/icons/chevron-right.svg" color="brand" size={10} />
        </Link>
      </div>

      {offers.isPending && <Skeleton className="h-[300px] w-full rounded-[20px]" />}
      {offers.isError && <p className="text-[13px] text-gray-500">The marketplace could not be loaded right now.</p>}
      {!offers.isPending && !offers.isError && items.length === 0 && (
        <EmptyState
          size="section"
          icon="marketplace"
          title="No picks for you yet"
          body="Browse a few listings or save a search, and we’ll start picking homes, land and materials for you."
          primary={{ label: "Browse Marketplace", href: "/marketplace" }}
        />
      )}

      <div className="no-scrollbar flex w-full items-start gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:gap-2.5 sm:overflow-visible sm:pb-0">
        {items.map((offer) => (
          <div key={`${offer.kind}-${offer.id}`} className="w-[307px] shrink-0 sm:w-full sm:shrink">
            <MarketplaceCard offer={offer} />
          </div>
        ))}
      </div>
    </section>
  );
}
