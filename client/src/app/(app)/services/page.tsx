"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PageContainer } from "@/components/shared/PageContainer";
import { NavIcon } from "@/components/shared/NavIcon";
import { ServiceCard } from "@/components/shared/ServiceCard";
import { ServicesRail } from "@/components/shared/ServicesRail";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { SERVICE_CATEGORIES, SERVICES, type ServiceCategory } from "@/lib/dummy-services";
import { cn } from "@/lib/utils";

export default function ServicesPage() {
  const router = useRouter();
  const [category, setCategory] = useState<ServiceCategory>("All");
  const [query, setQuery] = useState("");
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  const services = useMemo(() => {
    const term = query.trim().toLowerCase();
    return SERVICES.filter(
      (service) =>
        (category === "All" || service.category === category) &&
        (!term || `${service.title} ${service.provider}`.toLowerCase().includes(term)),
    );
  }, [category, query]);

  return (
    <AppShell activeKey="services" activeChildKey="services" contentFullWidth rightRail={<ServicesRail />}>
      <PageContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Services</h1>
            <p className="text-sm leading-5 text-gray-500">
              Priced services from professionals, artisans and companies. Compare what’s included before you book.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={comingSoon("Offer a service")}
            className="h-10 w-auto shrink-0 self-start rounded-[10px] px-4 sm:self-auto lg:rounded-[10px]"
          >
            Offer a service
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4">
            <NavIcon icon="/icons/search-02.svg" size={15} className="shrink-0 bg-gray-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search services, e.g. “site survey” or “deep cleaning”"
              aria-label="Search services"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={comingSoon("Price filter")}
            className="flex h-12 flex-col items-start justify-center rounded-xl border border-gray-200 bg-white px-4 text-left sm:w-[140px]"
          >
            <span className="text-[11px] font-medium leading-[14px] text-gray-500">Price</span>
            <span className="text-sm font-medium leading-5 text-[#0f172a]">Any</span>
          </button>
        </div>

        <div role="tablist" aria-label="Service category" className="flex flex-wrap gap-2">
          {SERVICE_CATEGORIES.map((item) => {
            const active = item === category;
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(item)}
                className={cn(
                  "whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-medium leading-[18px]",
                  active ? "bg-brand-900 text-white" : "border border-gray-200 bg-white text-[#334155] hover:bg-gray-50",
                )}
              >
                {item}
              </button>
            );
          })}
        </div>

        {services.length > 0 ? (
          <div className="flex flex-col gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            No services match your search.
          </p>
        )}

        <div className="xl:hidden">
          <ServicesRail />
        </div>
      </PageContainer>
    </AppShell>
  );
}
