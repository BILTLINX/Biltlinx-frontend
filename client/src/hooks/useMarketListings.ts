"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useSession } from "@/context/SessionContext";
import { NONE, readList, subscribeToLists, writeList } from "@/lib/browser-list";
import type { MarketListing, MarketListingDraft } from "@/lib/market-listings";

/** The marketplace listings you made. There is no API to create one yet, so they live in this browser, one list per signed-in account. */
export function useMarketListings() {
  const { user } = useSession();
  const storageKey = `biltlinx.market-listings.${user?.id ?? "guest"}`;
  const listings = useSyncExternalStore<MarketListing[]>(subscribeToLists, () => readList(storageKey), () => NONE);

  const create = useCallback(
    (draft: MarketListingDraft) => {
      const listing: MarketListing = { ...draft, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
      writeList(storageKey, [listing, ...readList<MarketListing>(storageKey)]);
      return listing;
    },
    [storageKey],
  );

  return { listings, create };
}
