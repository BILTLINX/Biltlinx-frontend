"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { AvailabilityCalendar } from "@/components/shared/AvailabilityCalendar";
import { KeyFacts } from "@/components/shared/KeyFacts";
import { NavIcon } from "@/components/shared/NavIcon";
import { comingSoonHref } from "@/lib/coming-soon";
import type { StayDetail } from "@/lib/dummy-stay-detail";
import type { Selection } from "@/lib/stay-booking";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4";

interface StayDetailContentProps {
  detail: StayDetail;
  selection: Selection;
  onSelectDay: (day: number) => void;
}

/** The left column of a stay page (Figma node 1060:30072): headline, key facts, description, amenities, availability, policies and reviews. */
export function StayDetailContent({ detail, selection, onSelectDay }: StayDetailContentProps) {
  const router = useRouter();
  const { listing } = detail;
  const verified = listing.badges?.filter((badge) => badge.tone === "verified") ?? [];

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#eff5ff] px-2.5 py-1 text-xs font-medium leading-4 text-brand-900">{listing.kind}</span>
          {verified.map((badge) => (
            <span key={badge.label} className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium leading-[14px] text-[#16a34a]">
              {badge.label}
            </span>
          ))}
          <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[11px] font-medium leading-4 text-[#334155]">
            {detail.ratingLabel}
          </span>
        </div>
        <h1 className="text-2xl font-bold leading-8 text-[#0f172a] sm:text-[26px] sm:leading-[34px]">{listing.title}</h1>
        <p className="flex items-start gap-1.5 text-[13px] leading-[19px] text-gray-500">
          <NavIcon icon="/icons/post-options-location.svg" size={13} className="mt-[3px] shrink-0 bg-gray-500" />
          <span>{listing.location} · 5 min to the beach · 15 min to Kotoka Airport</span>
        </p>
      </header>

      <KeyFacts facts={detail.keyFacts} />

      <section className={CARD}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">About this stay</h2>
        <p className="text-sm leading-5 text-[#334155]">{detail.description}</p>
      </section>

      <section className={CARD}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">What this place offers</h2>
        <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
          {detail.amenities.map((amenity) => (
            <li key={amenity} className="flex items-center gap-2 text-[13px] leading-[19px] text-[#334155]">
              <span className="font-bold text-[#16a34a]">✓</span>
              {amenity}
            </li>
          ))}
        </ul>
      </section>

      <AvailabilityCalendar selection={selection} onSelectDay={onSelectDay} />

      <section className={CARD}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">House rules &amp; cancellation</h2>
        <p className="text-[13px] leading-[19px] text-[#334155]">{detail.policies}</p>
      </section>

      <section className={CARD}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">{detail.reviewsHeading}</h2>
          <button
            type="button"
            onClick={() => router.push(comingSoonHref("Reviews"))}
            className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900"
          >
            See all ›
          </button>
        </div>
        {detail.reviews.map((review) => (
          <div key={review.id} className="flex items-start gap-3">
            <span className="relative block size-8 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
              <Image src={review.avatar} alt="" fill className="object-cover" sizes="32px" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">{review.author}</p>
              <p className="text-[13px] leading-[19px] text-[#334155]">{review.text}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
