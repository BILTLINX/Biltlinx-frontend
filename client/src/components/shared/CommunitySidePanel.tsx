"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { comingSoonHref } from "@/lib/coming-soon";
import type { CommunityDetail } from "@/lib/dummy-communities";
import { DetailAside } from "@/components/shared/DetailAside";

const CARD = "flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-5";

/** The right column of a community page (Figma node 1087:37550): upcoming events, the rules and the moderators. */
export function CommunitySidePanel({ detail }: { detail: CommunityDetail }) {
  const router = useRouter();
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <DetailAside single className="xl:w-[340px]">
      <section className={CARD}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Upcoming events</h2>
          <button type="button" onClick={comingSoon("Community events")} className="shrink-0 text-[13px] font-medium text-brand-900">
            All ›
          </button>
        </div>
        {detail.events.map((event) => (
          <Link key={event.id} href={`/communities/${detail.community.id}/events/${event.id}`} className="flex items-center gap-2.5 text-left">
            <span className="flex shrink-0 flex-col items-center rounded-[10px] bg-[#0f172a] px-2.5 py-1.5">
              <span className="text-sm font-bold leading-5 text-white">{event.day}</span>
              <span className="text-[10px] font-medium leading-[15px] text-[#cbd5e1]">{event.month}</span>
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13px] font-semibold leading-[19px] text-[#0f172a]">{event.title}</span>
              <span className="truncate text-xs leading-[17px] text-gray-500">{event.meta}</span>
            </span>
          </Link>
        ))}
      </section>

      <section className={`${CARD} gap-2`}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Community rules</h2>
        {detail.rules.map((rule) => (
          <p key={rule} className="text-[13px] leading-[19px] text-[#334155]">
            • {rule}
          </p>
        ))}
      </section>

      <section className={`${CARD} gap-2`}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Moderators</h2>
        <div className="flex gap-1.5">
          {detail.moderators.map((moderator) => (
            <span key={moderator.id} className="relative block size-8 overflow-hidden rounded-full bg-[#eef2ff]">
              <Image src={moderator.avatar} alt="" fill className="object-cover" sizes="32px" />
            </span>
          ))}
        </div>
      </section>
    </DetailAside>
  );
}
