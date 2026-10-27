"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { NavIcon } from "@/components/shared/NavIcon";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatMoney } from "@/lib/format";
import { KIND_LABEL, searchMarketplace } from "@/lib/marketplace-api";
import type { OfferDto } from "@/types/api/schema";

const UNIT: Record<string, string> = { PerNight: "night", PerMonth: "month", PerYear: "year", PerJob: "job", PerHour: "hour", PerDay: "day", PerWeek: "week", PerSqm: "sqm", PerUnit: "unit" };

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

      {offers.isPending && <Skeleton className="h-[300px] w-full rounded-[30px]" />}
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

function MarketplaceCard({ offer }: { offer: OfferDto }) {
  return (
    <Link href={offer.detailRoute ?? "/marketplace"} className="block w-full overflow-hidden rounded-[30px] border border-gray-200 bg-white p-1">
      <div className="relative aspect-[299/291] w-full overflow-hidden rounded-[26px] bg-[#eef2ff] sm:aspect-[388/397]">
        <Image src={offer.coverUrl ?? "/images/marketplace/property-sale.jpg"} alt={offer.title ?? ""} fill unoptimized className="object-cover" sizes="(min-width: 640px) 50vw, 307px" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent to-[62%]" />
        <span className="absolute left-4 top-4 flex h-6 items-center rounded-full bg-[#e3f2f7] px-2 font-inter text-[12px] leading-4 text-ink">{KIND_LABEL[offer.kind ?? ""] ?? offer.category}</span>
        <div className="absolute inset-x-4 bottom-5 flex items-center justify-between gap-2 sm:bottom-4">
          <div className="flex min-w-0 flex-col gap-2">
            <p className="font-lexend text-[16px] font-semibold leading-6 text-surface-button sm:text-[24px]">
              {formatMoney(offer.price, offer.currency ?? "GHS")}
              {offer.unit && UNIT[offer.unit] && <span className="sm:text-[12px]">/{UNIT[offer.unit]}</span>}
            </p>
            <div className="flex flex-col gap-1 text-[8px] leading-[11px] sm:text-[10px]">
              <p className="font-rubik font-normal text-surface-button">{offer.title}</p>
              <p className="font-rubik font-light text-[#f6f6f9]">{[offer.category, offer.city].filter(Boolean).join(" · ")}</p>
            </div>
          </div>
          <span className="flex size-12 shrink-0 -rotate-90 items-center justify-center rounded-full border border-[#ffb01a] transition-colors duration-200 hover:bg-[#ffb01a]">
            <Image src="/icons/arrow-down-multiple.svg" alt="" width={16} height={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}
