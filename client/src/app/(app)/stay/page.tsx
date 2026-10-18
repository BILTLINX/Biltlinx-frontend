"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PageContainer } from "@/components/shared/PageContainer";
import { ListingCard } from "@/components/shared/ListingCard";
import { StayRail } from "@/components/shared/StayRail";
import { StaySearchBar } from "@/components/shared/StaySearchBar";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import {
  STAY_FEATURE_CHIPS,
  STAY_LISTINGS,
  STAY_TOTAL_LISTINGS,
  STAY_TYPE_CHIPS,
  type StayTypeChip,
} from "@/lib/dummy-stays";
import { cn } from "@/lib/utils";

export default function StayPage() {
  const router = useRouter();
  const [type, setType] = useState<StayTypeChip>("All stays");
  const [features, setFeatures] = useState<string[]>([]);

  const stays = useMemo(
    () =>
      STAY_LISTINGS.filter(
        (stay) =>
          (type === "All stays" || stay.type === type) && features.every((feature) => stay.features.includes(feature)),
      ),
    [type, features],
  );
  const filtered = type !== "All stays" || features.length > 0;
  const resultCount = filtered ? stays.length : STAY_TOTAL_LISTINGS;

  function toggleFeature(feature: string) {
    setFeatures((current) =>
      current.includes(feature) ? current.filter((item) => item !== feature) : [...current, feature],
    );
  }

  return (
    <AppShell activeKey="property" activeChildKey="stay" contentFullWidth rightRail={<StayRail />}>
      <PageContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Stay</h1>
            <p className="text-sm leading-5 text-gray-500">
              Short stays: apartments, guest houses and hotels, booked by the night.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(comingSoonHref("My bookings"))}
            className="h-10 w-auto shrink-0 self-start rounded-[10px] px-4 sm:self-auto lg:rounded-[10px]"
          >
            My bookings
          </Button>
        </div>

        <StaySearchBar />

        <div className="flex flex-wrap gap-2">
          {STAY_TYPE_CHIPS.map((chip) => {
            const active = chip === type;
            return (
              <button
                key={chip}
                type="button"
                aria-pressed={active}
                onClick={() => setType(chip)}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3.5 py-2 text-[13px] font-medium leading-[18px]",
                  active ? "border-brand-900 bg-brand-900 text-white" : "border-gray-200 bg-white text-[#334155] hover:bg-gray-50",
                )}
              >
                {chip}
              </button>
            );
          })}
          {STAY_FEATURE_CHIPS.map((chip) => {
            const active = features.includes(chip);
            return (
              <button
                key={chip}
                type="button"
                aria-pressed={active}
                onClick={() => toggleFeature(chip)}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3.5 py-2 text-[13px] font-medium leading-[18px]",
                  active
                    ? "border-brand-900 bg-[#eff5ff] text-brand-900"
                    : "border-gray-200 bg-white text-[#334155] hover:bg-gray-50",
                )}
              >
                {chip}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="text-sm leading-5 text-[#0f172a]">
            {resultCount} stays in Accra · prices per night, before fees
          </p>
          <p className="shrink-0 whitespace-nowrap text-[13px] leading-[19px]">
            <span className="text-gray-500">Sort: </span>
            <span className="font-medium text-[#0f172a]">Recommended ▾</span>
          </p>
        </div>

        {stays.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-4">
            {stays.map((stay) => (
              <ListingCard key={stay.id} listing={stay} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            No stays match these filters.
          </p>
        )}

        <div className="xl:hidden">
          <StayRail />
        </div>
      </PageContainer>
    </AppShell>
  );
}
