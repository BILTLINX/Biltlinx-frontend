"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PageContainer } from "@/components/shared/PageContainer";
import { NavIcon } from "@/components/shared/NavIcon";
import { ProfessionalsRail } from "@/components/shared/ProfessionalsRail";
import { ProviderCard } from "@/components/shared/ProviderCard";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { PROFESSIONAL_DISCIPLINES, PROFESSIONALS, type ProfessionalDiscipline } from "@/lib/dummy-professionals";
import { cn } from "@/lib/utils";

export default function ProfessionalsPage() {
  const router = useRouter();
  const [discipline, setDiscipline] = useState<ProfessionalDiscipline>("All");
  const [query, setQuery] = useState("");
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  const professionals = useMemo(() => {
    const term = query.trim().toLowerCase();
    return PROFESSIONALS.filter(
      (professional) =>
        (discipline === "All" || professional.discipline === discipline) &&
        (!term || `${professional.name} ${professional.role} ${professional.summary}`.toLowerCase().includes(term)),
    );
  }, [discipline, query]);

  return (
    <AppShell activeKey="people" activeChildKey="professionals" contentFullWidth rightRail={<ProfessionalsRail />}>
      <PageContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Professionals</h1>
            <p className="text-sm leading-5 text-gray-500">
              Architects, surveyors, engineers, lawyers and agents for your property and build.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={comingSoon("Join as a professional")}
            className="h-10 w-auto shrink-0 self-start rounded-[10px] px-4 sm:self-auto lg:rounded-[10px]"
          >
            Join as a professional
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4">
            <NavIcon icon="/icons/search-02.svg" size={15} className="bg-gray-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, discipline or service"
              aria-label="Search professionals"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={comingSoon("Location filter")}
            className="flex h-12 flex-col items-start justify-center rounded-xl border border-gray-200 bg-white px-4 text-left sm:w-[200px]"
          >
            <span className="text-[11px] font-medium leading-[14px] text-gray-500">Location</span>
            <span className="flex items-center gap-2 text-sm font-medium leading-5 text-[#0f172a]">
              <NavIcon icon="/icons/post-options-location.svg" size={14} className="bg-[#0f172a]" />
              Greater Accra
            </span>
          </button>
        </div>

        <div role="tablist" aria-label="Discipline" className="flex flex-wrap gap-2">
          {PROFESSIONAL_DISCIPLINES.map((item) => {
            const active = item === discipline;
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setDiscipline(item)}
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

        {professionals.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-4">
            {professionals.map((professional) => (
              <ProviderCard key={professional.id} provider={professional} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            No professionals match your search.
          </p>
        )}

        <div className="xl:hidden">
          <ProfessionalsRail />
        </div>
      </PageContainer>
    </AppShell>
  );
}
