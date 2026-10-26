"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useRef } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterDropdown } from "@/components/shared/FilterDropdown";
import { ListingCard } from "@/components/shared/ListingCard";
import { PageContainer } from "@/components/shared/PageContainer";
import { StayRail } from "@/components/shared/StayRail";
import { StaySearchBar, type StaySearchValue } from "@/components/shared/StaySearchBar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useStaySearch } from "@/hooks/useStay";
import { errorMessage } from "@/lib/errors";
import { STAY_AMENITIES, STAY_TYPES, type StaySearchQuery } from "@/lib/stay-api";
import { nightsBetween, STAY_TYPE_LABEL } from "@/lib/stay-mapper";

const SORTS: { label: string; value: NonNullable<StaySearchQuery["sort"]> }[] = [
  { label: "Newest", value: "newest" },
  { label: "Price: low to high", value: "priceAsc" },
  { label: "Price: high to low", value: "priceDesc" },
];

function numberParam(value: string | null) {
  const parsed = Number(value);
  return value && Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function StayContent() {
  const router = useRouter();
  const params = useSearchParams();
  const searchBar = useRef<HTMLDivElement | null>(null);

  const query = useMemo<Omit<StaySearchQuery, "page" | "results">>(
    () => ({
      destination: params.get("destination") ?? undefined,
      checkIn: params.get("checkIn") ?? undefined,
      checkOut: params.get("checkOut") ?? undefined,
      guests: numberParam(params.get("guests")),
      rooms: numberParam(params.get("rooms")),
      type: params.get("type") ?? undefined,
      amenities: params.get("amenities")?.split(",").filter(Boolean),
      breakfast: params.get("breakfast") === "true" ? true : undefined,
      sort: (params.get("sort") as StaySearchQuery["sort"]) ?? undefined,
    }),
    [params],
  );

  function update(changes: Record<string, string | undefined>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === undefined || value === "") next.delete(key);
      else next.set(key, value);
    }
    router.replace(`/stay?${next.toString()}`);
  }

  function search(value: StaySearchValue) {
    update({
      destination: value.destination.trim() || undefined,
      checkIn: value.checkIn,
      checkOut: value.checkOut,
      guests: value.guests ? String(value.guests) : undefined,
      rooms: value.rooms ? String(value.rooms) : undefined,
    });
  }

  function clearFilters() {
    update({ type: undefined, amenities: undefined, breakfast: undefined, sort: undefined });
  }

  const { cards, total, isPending, isError, error, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useStaySearch(query);
  const nights = nightsBetween(query.checkIn, query.checkOut);

  return (
    <AppShell activeKey="property" activeChildKey="stay" contentFullWidth rightRail={<StayRail />}>
      <PageContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Stay</h1>
            <p className="text-sm leading-5 text-gray-500">Short stays: apartments, guest houses and hotels, booked by the night.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" onClick={() => router.push("/stay/bookings")} className="h-10 w-auto rounded-[10px] px-4 lg:rounded-[10px]">
              My bookings
            </Button>
            <Button variant="outline" onClick={() => router.push("/manage/stay")} className="h-10 w-auto rounded-[10px] px-4 lg:rounded-[10px]">
              Host a stay
            </Button>
          </div>
        </div>

        <div ref={searchBar}>
          <StaySearchBar
            key={params.toString()}
            value={{ destination: query.destination ?? "", checkIn: query.checkIn, checkOut: query.checkOut, guests: query.guests, rooms: query.rooms }}
            onSearch={search}
          />
        </div>

        <div className="flex flex-wrap gap-2.5">
          <FilterDropdown
            label="Stay type"
            value={query.type ?? ""}
            onChange={(type) => update({ type: type || undefined })}
            options={[{ value: "", label: "All stays" }, ...STAY_TYPES.map((type) => ({ value: type, label: STAY_TYPE_LABEL[type] }))]}
          />
          <FilterDropdown
            multiple
            label="Amenities"
            value={query.amenities ?? []}
            onChange={(amenities) => update({ amenities: amenities.length > 0 ? amenities.join(",") : undefined })}
            options={STAY_AMENITIES.map((amenity) => ({ value: amenity, label: amenity.replace(/([a-z])([A-Z])/g, "$1 $2") }))}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="text-sm leading-5 text-[#0f172a]">
            {isPending ? "Searching…" : `${total} ${total === 1 ? "stay" : "stays"}`}
            {nights > 0 ? ` · prices for ${nights} ${nights === 1 ? "night" : "nights"}` : " · prices per night, before fees"}
          </p>
          <FilterDropdown label="Sort" value={query.sort ?? "newest"} onChange={(sort) => update({ sort })} options={SORTS} />
        </div>

        {isPending && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-4">
            {[0, 1, 2].map((n) => (
              <Skeleton key={n} className="h-[340px] rounded-2xl" />
            ))}
          </div>
        )}
        {isError && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-gray-500">{errorMessage(error, "We could not search stays.")}</p>
            <button type="button" onClick={() => void refetch()} className="text-sm font-medium text-brand-900">
              Try again
            </button>
          </div>
        )}
        {!isPending && !isError && cards.length === 0 && (
          <EmptyState
            mood="sad"
            icon="stay-sad"
            title="No stays for these dates"
            body="Try other dates or a nearby area. Popular weekends in Accra fill up fast."
            primary={{ label: "Change dates", onClick: () => searchBar.current?.scrollIntoView({ behavior: "smooth", block: "center" }) }}
            secondary={{ label: "Clear filters", onClick: clearFilters }}
          />
        )}
        {cards.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-4">
            {cards.map((stay) => (
              <ListingCard key={stay.id} listing={stay} />
            ))}
          </div>
        )}
        {hasNextPage && (
          <button type="button" disabled={isFetchingNextPage} onClick={() => void fetchNextPage()} className="self-center text-[13px] font-medium text-brand-900">
            {isFetchingNextPage ? "Loading…" : "Show more stays"}
          </button>
        )}

        <div className="xl:hidden">
          <StayRail />
        </div>
      </PageContainer>
    </AppShell>
  );
}

export default function StayPage() {
  return (
    <Suspense fallback={null}>
      <StayContent />
    </Suspense>
  );
}
