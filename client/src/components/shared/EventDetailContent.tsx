"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { NavIcon } from "@/components/shared/NavIcon";
import { comingSoonHref } from "@/lib/coming-soon";
import type { EventDetail } from "@/lib/dummy-communities";

/** The left column of an event page (Figma node 1087:37749): headline, when and where, about and the homes on the tour. */
export function EventDetailContent({ detail }: { detail: EventDetail }) {
  const router = useRouter();

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
      <header className="flex flex-col items-start gap-2">
        <span className="rounded-full bg-[#eff5ff] px-2.5 py-[3px] text-xs font-medium leading-4 text-brand-900">{detail.kind}</span>
        <h1 className="text-2xl font-bold leading-8 text-[#0f172a] sm:text-[26px] sm:leading-[34px]">{detail.event.title}</h1>
        <p className="flex items-start gap-1.5 text-[13px] leading-[19px] text-gray-500">
          <NavIcon icon="/icons/calendar-03.svg" size={14} className="mt-[3px] shrink-0 bg-gray-500" />
          <span>{detail.when}</span>
        </p>
        <p className="flex items-start gap-1.5 text-[13px] leading-[19px] text-gray-500">
          <NavIcon icon="/icons/post-options-location.svg" size={14} className="mt-[3px] shrink-0 bg-gray-500" />
          <span>{detail.where}</span>
        </p>
      </header>

      <section className="flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">About this event</h2>
        <p className="text-sm leading-5 text-[#334155]">{detail.about}</p>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Homes on the tour</h2>
          <button type="button" onClick={() => router.push("/properties")} className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900">
            View all {detail.homesTotal} ›
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {detail.homes.map((home) => (
            <button
              key={home.id}
              type="button"
              onClick={() => router.push(comingSoonHref("Home details"))}
              className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-left"
            >
              <span className="relative block h-[120px] w-full bg-[#eef2ff]">
                <Image src={home.image} alt="" fill className="object-cover" sizes="(min-width: 640px) 240px, 100vw" />
              </span>
              <span className="flex flex-col gap-0.5 p-3">
                <span className="text-[15px] font-bold leading-[22px] text-[#0f172a]">{home.price}</span>
                <span className="text-xs leading-[17px] text-gray-500">{home.note}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
