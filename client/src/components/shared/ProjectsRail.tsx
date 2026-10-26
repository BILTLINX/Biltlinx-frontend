"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { SITE_UPDATES } from "@/lib/dummy-projects";

/** Projects side cards (Figma node 1042:21544): latest site updates and the Concierge build prompt. */
export function ProjectsRail() {
  const router = useRouter();
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <div className="flex w-full flex-col gap-4">
      <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Latest site updates</h2>
          <button type="button" onClick={comingSoon("Site updates")} className="shrink-0 text-[13px] font-medium text-brand-900">
            See all ›
          </button>
        </div>
        {SITE_UPDATES.map((update) => (
          <div key={update.id} className="flex items-center gap-2.5">
            <span className="relative block size-9 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
              <Image src={update.avatar} alt="" fill className="object-cover" sizes="36px" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-[13px] font-semibold leading-[19px] text-[#0f172a]">{update.project}</p>
              <p className="truncate text-xs leading-[17px] text-gray-500">{update.note}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Planning your own build?</h2>
        <p className="text-xs leading-[17px] text-gray-500">
          Concierge can line up a surveyor, architect, engineer and contractor for your land.
        </p>
        <Button variant="primary" onClick={comingSoon("Concierge")} className="rounded-[10px] lg:rounded-[10px]">
          Plan with Concierge
        </Button>
      </section>
    </div>
  );
}
