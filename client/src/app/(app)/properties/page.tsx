"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PageContainer } from "@/components/shared/PageContainer";
import { ListingCard } from "@/components/shared/ListingCard";
import { NavIcon } from "@/components/shared/NavIcon";
import { PropertiesRail } from "@/components/shared/PropertiesRail";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { PROPERTY_FEATURE_CHIPS, PROPERTY_LISTINGS, PROPERTY_TABS, type PropertyTabKey } from "@/lib/dummy-properties";
import { cn } from "@/lib/utils";

const FILTER_FIELDS = [
  { label: "Price", value: "Any – GHS 1.5M" },
  { label: "Bedrooms", value: "3+" },
  { label: "Type", value: "House" },
];

export default function PropertiesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<PropertyTabKey>("buy");
  const [query, setQuery] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  const listings = useMemo(() => {
    const term = query.trim().toLowerCase();
    return PROPERTY_LISTINGS.filter(
      (listing) =>
        listing.tab === tab &&
        features.every((feature) => listing.features.includes(feature)) &&
        (!term || `${listing.title} ${listing.location}`.toLowerCase().includes(term)),
    );
  }, [tab, query, features]);
  const resultNoun = PROPERTY_TABS.find((item) => item.key === tab)?.resultNoun;

  function toggleFeature(feature: string) {
    setFeatures((current) =>
      current.includes(feature) ? current.filter((item) => item !== feature) : [...current, feature],
    );
  }

  return (
    <AppShell activeKey="property" activeChildKey="properties" contentFullWidth rightRail={<PropertiesRail />}>
      <PageContainer>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Properties</h1>
            <p className="text-sm leading-5 text-gray-500">
              Homes, land and commercial space for sale or rent across Ghana.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={comingSoon("Save this search")}
              className="h-10 w-auto rounded-[10px] px-4 lg:rounded-[10px]"
            >
              Save this search
            </Button>
            <Button
              variant="primary"
              onClick={comingSoon("List a property")}
              className="h-10 w-auto rounded-[10px] px-4 lg:rounded-[10px]"
            >
              List a property
            </Button>
          </div>
        </div>

        <div role="tablist" aria-label="Property type" className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-1">
          {PROPERTY_TABS.map((item) => {
            const active = item.key === tab;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.key)}
                className={cn(
                  "min-w-fit flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm leading-5",
                  active ? "bg-white font-semibold text-brand-900" : "font-medium text-gray-500 hover:text-[#0f172a]",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4">
            <NavIcon icon="/icons/search-02.svg" size={15} className="bg-gray-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by area, estate or landmark"
              aria-label="Search properties"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
            />
          </label>
          <div className="grid grid-cols-3 gap-3 lg:flex">
            {FILTER_FIELDS.map((field) => (
              <button
                key={field.label}
                type="button"
                onClick={comingSoon(`${field.label} filter`)}
                className="flex h-12 min-w-0 flex-col items-start justify-center rounded-xl border border-gray-200 bg-white px-4 text-left lg:w-[150px]"
              >
                <span className="text-[11px] font-medium leading-[14px] text-gray-500">{field.label}</span>
                <span className="w-full truncate text-sm font-medium leading-5 text-[#0f172a]">{field.value}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {PROPERTY_FEATURE_CHIPS.map((chip) => {
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

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium leading-5 text-[#0f172a]">
            {listings.length} {resultNoun} in Greater Accra
          </p>
          <div className="flex shrink-0 gap-1 rounded-[10px] border border-gray-200 p-1">
            <span className="rounded-lg bg-brand-900 px-3.5 py-1.5 text-[13px] font-medium leading-[19px] text-white">List</span>
            <button
              type="button"
              onClick={comingSoon("Map view")}
              className="rounded-lg px-3.5 py-1.5 text-[13px] font-medium leading-[19px] text-[#334155] hover:bg-gray-50"
            >
              Map
            </button>
          </div>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(290px,100%),1fr))] gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            No properties match these filters.
          </p>
        )}

        <div className="xl:hidden">
          <PropertiesRail />
        </div>
      </PageContainer>
    </AppShell>
  );
}
