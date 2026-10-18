"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { SAVED_SEARCHES } from "@/lib/dummy-marketplace-catalog";
import { cn } from "@/lib/utils";

/** Marketplace side cards (Figma nodes 1040:20770, 1040:20775, 1040:20791): list CTA, saved searches and how badges work. */
export function MarketplaceRail() {
  const router = useRouter();
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <div className="flex w-full flex-col gap-4">
      <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Sell, rent or hire on Biltlinx</h2>
        <p className="text-[13px] leading-[19px] text-gray-500">
          List a property, a service, materials or equipment. Buyers see the price first, so set a real asking price.
        </p>
        <Button variant="primary" onClick={comingSoon("Create a listing")} className="rounded-[10px] lg:rounded-[10px]">
          Create a listing
        </Button>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Your saved searches</h2>
          <button type="button" onClick={comingSoon("Saved searches")} className="shrink-0 text-[13px] font-medium text-brand-900">
            Manage ›
          </button>
        </div>
        {SAVED_SEARCHES.map((search) => (
          <div key={search.id} className="flex items-center gap-2">
            <p className="min-w-0 flex-1 text-[13px] font-medium leading-[19px] text-[#334155]">{search.label}</p>
            <span
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium leading-4",
                search.hasNew ? "bg-[#eff5ff] text-brand-900" : "bg-[#f1f5f9] text-[#334155]",
              )}
            >
              {search.status}
            </span>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">How badges work</h2>
        <p className="text-xs leading-[17px] text-gray-500">
          Each badge says what was checked, for example “Land title documents”. Sponsored and Featured are paid
          placements and are never a verification.
        </p>
      </section>
    </div>
  );
}
