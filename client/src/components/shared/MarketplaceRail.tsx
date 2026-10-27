"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4";

/** Marketplace side cards (Figma node 1040:20492): where to list, your saved searches, and how badges work. */
export function MarketplaceRail() {
  const router = useRouter();
  const savedSearches = comingSoonHref("Saved searches");

  return (
    <div className="flex w-full flex-col gap-4">
      <section className={CARD}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Sell, rent or hire on Biltlinx</h2>
        <p className="text-[13px] leading-[19px] text-gray-500">List a property, a service, materials or equipment. Buyers see the price first, so set a real asking price.</p>
        <Button variant="primary" onClick={() => router.push("/manage/listings/new")} className="h-10 rounded-[10px] lg:rounded-[10px]">
          Create a listing
        </Button>
      </section>

      <section className={CARD}>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Your saved searches</h2>
          <Link href={savedSearches} className="whitespace-pre text-[13px] font-medium leading-[19px] text-brand-900">
            {"Manage  ›"}
          </Link>
        </div>
        <EmptyState
          size="compact"
          icon="bookmark"
          title="No saved searches yet"
          body="Save a search and we’ll alert you when new listings match."
          primary={{ label: "Save this search", href: savedSearches }}
          className="rounded-none border-0 p-0"
        />
      </section>

      <section className="flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">How badges work</h2>
        <p className="text-xs leading-[17px] text-gray-500">
          Each badge says what was checked, for example “Land title documents”. Sponsored and Featured are paid placements and are never a verification.
        </p>
      </section>
    </div>
  );
}
