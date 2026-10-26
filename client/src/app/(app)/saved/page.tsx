"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PageContainer } from "@/components/shared/PageContainer";
import { SavedItemRow } from "@/components/shared/SavedItemRow";
import { SavedRail } from "@/components/shared/SavedRail";
import { FilterDropdown } from "@/components/shared/FilterDropdown";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { SAVED_COLLECTIONS, SAVED_FILTERS, SAVED_ITEMS, type SavedFilter } from "@/lib/dummy-saved";
import { cn } from "@/lib/utils";

export default function SavedPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<SavedFilter>("All");
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  const items = useMemo(
    () => SAVED_ITEMS.filter((item) => filter === "All" || item.filter === filter),
    [filter],
  );

  return (
    <AppShell activeKey="you" activeChildKey="saved" contentFullWidth rightRail={<SavedRail />}>
      <PageContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Saved</h1>
            <p className="text-sm leading-5 text-gray-500">
              Everything you saved, in one private place. Only you can see it.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={comingSoon("New collection")}
            className="h-10 w-auto shrink-0 self-start rounded-[10px] px-4 sm:self-auto lg:rounded-[10px]"
          >
            New collection
          </Button>
        </div>

        <FilterDropdown label="Type" value={filter} onChange={(value) => setFilter(value as typeof filter)} options={SAVED_FILTERS.map((item) => ({ value: item, label: item }))} />

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Collections</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(170px,100%),1fr))] gap-3">
            {SAVED_COLLECTIONS.map((collection) => (
              <button
                key={collection.id}
                type="button"
                onClick={comingSoon("Collection")}
                className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-left hover:bg-gray-50"
              >
                <span className="relative block h-[120px] w-full">
                  <Image src={collection.image} alt="" fill className="object-cover" sizes="(min-width: 640px) 200px, 50vw" />
                </span>
                <span className="flex flex-col gap-0.5 p-3">
                  <span className="truncate text-sm font-semibold leading-5 text-[#0f172a]">{collection.name}</span>
                  <span className="text-xs leading-[17px] text-gray-500">{collection.summary}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Recently saved</h2>
          {items.length > 0 ? (
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <SavedItemRow key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              Nothing saved here yet.
            </p>
          )}
        </section>

        <div className="xl:hidden">
          <SavedRail />
        </div>
      </PageContainer>
    </AppShell>
  );
}
