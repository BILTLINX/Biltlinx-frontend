"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageContainer } from "@/components/shared/PageContainer";
import { SavedItemRow } from "@/components/shared/SavedItemRow";
import { SavedRail } from "@/components/shared/SavedRail";
import { SearchEmpty } from "@/components/shared/SearchEmpty";
import { useSearchTerm } from "@/context/SearchContext";
import { useSavedItems } from "@/hooks/useSaved";
import { SAVED_FILTERS, type SavedFilter } from "@/lib/saved-items";
import { cn } from "@/lib/utils";

export default function SavedPage() {
  const { items, remove } = useSavedItems();
  const [filter, setFilter] = useState<SavedFilter>("All");
  const term = useSearchTerm();

  // Only the types you have saved something of get a tab, so there are no dead ends.
  const tabs = useMemo(
    () => SAVED_FILTERS.map((key) => ({ key, count: key === "All" ? items.length : items.filter((item) => item.type === key).length })).filter((tab) => tab.key === "All" || tab.count > 0),
    [items],
  );
  const active = tabs.some((tab) => tab.key === filter) ? filter : "All";
  const shown = useMemo(
    () => items.filter((item) => (active === "All" || item.type === active) && (!term || `${item.title} ${item.kind} ${item.subtitle ?? ""}`.toLowerCase().includes(term))),
    [items, active, term],
  );

  return (
    <AppShell activeKey="you" activeChildKey="saved" contentFullWidth rightRail={<SavedRail />}>
      <PageContainer>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Saved</h1>
          <p className="text-sm leading-5 text-gray-500">Everything you saved, in one private place. Only you can see it.</p>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon="bookmark"
            title="Nothing saved yet"
            body="Tap the bookmark on a listing, post or reel and it will be kept here, ready when you want it."
            primary={{ label: "Browse properties", href: "/properties" }}
            secondary={{ label: "Explore the marketplace", href: "/marketplace" }}
          />
        ) : (
          <>
            <div role="tablist" aria-label="Type" className="no-scrollbar flex gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={tab.key === active}
                  onClick={() => setFilter(tab.key)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium leading-[19px]",
                    tab.key === active ? "border-[#0f172a] bg-[#0f172a] text-white" : "border-gray-200 bg-white text-[#334155] hover:bg-gray-50",
                  )}
                >
                  {tab.key}
                  <span className={cn("text-xs", tab.key === active ? "text-white/70" : "text-gray-400")}>{tab.count}</span>
                </button>
              ))}
            </div>

            {shown.length > 0 ? (
              <div className="flex flex-col gap-3">
                {shown.map((item) => (
                  <SavedItemRow key={item.key} item={item} onRemove={() => remove(item)} />
                ))}
              </div>
            ) : (
              <SearchEmpty noun="saved items" />
            )}
          </>
        )}

        <div className="xl:hidden">
          <SavedRail />
        </div>
      </PageContainer>
    </AppShell>
  );
}
