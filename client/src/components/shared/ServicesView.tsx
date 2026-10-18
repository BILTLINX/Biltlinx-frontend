"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { AppShell } from "@/components/shared/AppShell";
import { ArtisanRoleBar } from "@/components/shared/ArtisanRoleBar";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import type { ArtisanService, MANAGE_ROLES } from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";

const SECTION_LINK = "shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900";

interface ServicesViewProps {
  role: (typeof MANAGE_ROLES)[number];
  /** The module tab row for this workspace. */
  tabs: ReactNode;
  services: ArtisanService[];
  portfolio: { total: number; projects: { id: string; title: string; detail: string; image: string }[] };
  credentials: { id: string; label: string; verified: boolean }[];
}

/** The Services & portfolio page of an artisan or professional workspace: what they offer, their prices, past work and credentials. */
export function ServicesView({ role, tabs, services, portfolio, credentials }: ServicesViewProps) {
  const router = useRouter();
  const [active, setActive] = useState<Record<string, boolean>>(() => Object.fromEntries(services.map((service) => [service.id, service.active])));
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  function toggle(id: string, title: string) {
    const next = !active[id];
    setActive((current) => ({ ...current, [id]: next }));
    showSuccessToast(`${title} ${next ? "is live again" : "paused"}`);
  }

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <ArtisanRoleBar page="Services & portfolio" role={role} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Services &amp; portfolio</h1>
            <p className="text-sm leading-5 text-gray-500">What you offer, your prices and photos of past work. This is what clients see on your profile.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" onClick={comingSoon("Public profile")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              View public profile
            </Button>
            <Button variant="primary" onClick={comingSoon("Add service")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              + Add service
            </Button>
          </div>
        </div>

        {tabs}

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Services · {services.length}</h2>
          <button type="button" onClick={comingSoon("Reorder services")} className={SECTION_LINK}>
            Reorder ›
          </button>
        </div>
        <div className="flex flex-col gap-2.5">
          {services.map((service) => {
            const on = active[service.id];
            return (
              <div key={service.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex min-w-0 flex-1 basis-56 flex-col gap-0.5">
                  <p className="text-sm font-semibold leading-5 text-[#0f172a]">{service.title}</p>
                  <p className="text-xs leading-[17px] text-gray-500">{on ? service.detail : `${service.detail} · Paused`}</p>
                </div>
                <p className="shrink-0 whitespace-nowrap text-[15px] font-bold leading-[22px] text-[#0f172a]">{service.price}</p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  aria-label={`${service.title} is ${on ? "live" : "paused"}`}
                  onClick={() => toggle(service.id, service.title)}
                  className={cn("flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors", on ? "bg-brand-900" : "bg-[#cbd5e1]")}
                >
                  <span className={cn("size-4 rounded-full bg-white transition-transform", on && "translate-x-4")} />
                </button>
                <Button variant="outline" onClick={comingSoon("Edit service")} className="h-9 w-auto shrink-0 rounded-[10px] px-4 lg:rounded-[10px]">
                  Edit
                </Button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Portfolio · {portfolio.total} projects</h2>
          <button type="button" onClick={comingSoon("Add project")} className={SECTION_LINK}>
            Add project ›
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {portfolio.projects.map((project) => (
            <div key={project.id} className="flex min-w-0 flex-col gap-2">
              <span className="relative block h-[170px] overflow-hidden rounded-xl bg-[#eef2ff]">
                <Image src={project.image} alt={project.title} fill className="object-cover" sizes="(min-width: 1024px) 25vw, 50vw" />
              </span>
              <p className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">{project.title}</p>
              <p className="text-xs leading-[17px] text-gray-500">{project.detail}</p>
            </div>
          ))}
        </div>

        <section className="flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Credentials</h2>
            <button type="button" onClick={comingSoon("Verification centre")} className={SECTION_LINK}>
              Verification centre ›
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {credentials.map((credential) => (
              <span
                key={credential.id}
                className={cn("whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", credential.verified ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#fef3c7] text-[#b45309]")}
              >
                {credential.label}
              </span>
            ))}
          </div>
        </section>
      </PageContainer>
    </AppShell>
  );
}
