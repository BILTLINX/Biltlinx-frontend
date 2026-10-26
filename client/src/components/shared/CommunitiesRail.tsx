"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { comingSoonHref } from "@/lib/coming-soon";
import { COMMUNITY_EVENTS, JOINED_COMMUNITIES } from "@/lib/dummy-communities";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4";

/** Communities side cards (Figma node 1044:22122): your communities, upcoming events with RSVP, and the community rules. */
export function CommunitiesRail() {
  const router = useRouter();
  const [rsvps, setRsvps] = useState<string[]>([]);
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  function toggleRsvp(id: string) {
    setRsvps((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <section className={CARD}>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Your communities</h2>
          <button type="button" onClick={comingSoon("Manage communities")} className="shrink-0 text-[13px] font-medium text-brand-900">
            Manage ›
          </button>
        </div>
        {JOINED_COMMUNITIES.map((community) => (
          <div key={community.id} className="flex items-center gap-2.5">
            <span className="relative block size-10 shrink-0 overflow-hidden rounded-[10px] bg-[#eef2ff]">
              <Image src={community.image} alt="" fill className="object-cover" sizes="40px" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-[13px] font-semibold leading-[19px] text-[#0f172a]">{community.name}</p>
              <p className="truncate text-xs leading-[17px] text-gray-500">{community.note}</p>
            </div>
          </div>
        ))}
      </section>

      <section className={CARD}>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Community events</h2>
          <button type="button" onClick={comingSoon("Community events")} className="shrink-0 text-[13px] font-medium text-brand-900">
            See all ›
          </button>
        </div>
        <p className="text-xs leading-[17px] text-gray-500">
          Events now live inside communities and on Feed posts instead of a separate menu item.
        </p>
        {COMMUNITY_EVENTS.map((event) => {
          const going = rsvps.includes(event.id);
          return (
            <div key={event.id} className="flex items-center gap-2.5">
              <div className="flex shrink-0 flex-col items-center rounded-[10px] bg-[#0f172a] px-2 py-1.5 text-white">
                <span className="text-[10px] font-medium leading-[15px]">{event.weekday}</span>
                <span className="whitespace-nowrap text-xs font-bold leading-[17px]">{event.date}</span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">{event.title}</p>
                <p className="truncate text-xs leading-[17px] text-gray-500">{event.community}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleRsvp(event.id)}
                aria-pressed={going}
                className={cn(
                  "h-8 shrink-0 rounded-[10px] border px-4 text-sm font-medium",
                  going
                    ? "border-brand-900 bg-[#eff5ff] text-brand-900"
                    : "border-gray-200 bg-white text-[#0f172a] hover:bg-gray-50",
                )}
              >
                {going ? "Going" : "RSVP"}
              </button>
            </div>
          );
        })}
      </section>

      <section className={cn(CARD, "gap-2")}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Community rules</h2>
        <p className="text-xs leading-[17px] text-gray-500">
          Discussions, questions and recommendations only. Listings belong on Marketplace and can be shared here once,
          under each community’s rules.
        </p>
      </section>
    </div>
  );
}
