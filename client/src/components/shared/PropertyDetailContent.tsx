"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyFacts } from "@/components/shared/KeyFacts";
import { NavIcon } from "@/components/shared/NavIcon";
import { comingSoonHref } from "@/lib/coming-soon";
import type { PropertyDetail } from "@/lib/dummy-property-detail";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4";

/** The left column of a property page (Figma node 1052:23833): headline, key facts, description, features, documents, location and similar homes. */
export function PropertyDetailContent({ detail }: { detail: PropertyDetail }) {
  const router = useRouter();
  const { listing } = detail;
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#eff5ff] px-2.5 py-1 text-xs font-medium leading-4 text-brand-900">
            {listing.kind}
          </span>
          {listing.badges?.map((badge) => (
            <span
              key={badge.label}
              className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium leading-[14px] text-[#16a34a]"
            >
              {badge.label}
            </span>
          ))}
          <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[11px] font-medium leading-4 text-[#334155]">
            {detail.updated}
          </span>
        </div>
        <h1 className="text-2xl font-bold leading-8 text-[#0f172a] sm:text-[26px] sm:leading-[34px]">{listing.title}</h1>
        <p className="flex items-start gap-1.5 text-[13px] leading-[19px] text-gray-500">
          <NavIcon icon="/icons/post-options-location.svg" size={13} className="mt-[3px] shrink-0 bg-gray-500" />
          <span>{listing.location} · exact address shared after viewing is confirmed</span>
        </p>
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[28px] font-bold leading-9 text-[#0f172a]">{listing.price}</span>
          <span className="text-[13px] font-medium leading-[19px] text-gray-500">{detail.priceNote}</span>
        </p>
      </header>

      <KeyFacts facts={detail.keyFacts} />

      <section className={CARD}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">About this home</h2>
        <p className="text-sm leading-5 text-[#334155]">{detail.description}</p>
      </section>

      <section className={CARD}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Features &amp; amenities</h2>
        <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
          {detail.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-[13px] leading-[19px] text-[#334155]">
              <span className="font-bold text-[#16a34a]">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      </section>

      <section className={CARD}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Documents &amp; checks</h2>
          <button type="button" onClick={comingSoon("What was checked")} className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900">
            What was checked? ›
          </button>
        </div>
        {detail.documents.map((document) => (
          <div key={document.id} className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#f1f5f9]">
              <NavIcon icon="/icons/post-options-compare.svg" size={16} className="bg-[#334155]" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-sm font-semibold leading-5 text-[#0f172a]">{document.title}</p>
              <p className="text-xs leading-[17px] text-gray-500">{document.note}</p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium leading-4",
                document.status === "Checked" ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#fef3c7] text-[#b45309]",
              )}
            >
              {document.status}
            </span>
          </div>
        ))}
        <p className="text-xs leading-[17px] text-gray-500">
          Copies are shared with buyers only after the owner approves your request. Biltlinx checks documents but does
          not give legal advice.
        </p>
      </section>

      <section className={CARD}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Location &amp; neighbourhood</h2>
        <div className="relative h-[180px] w-full overflow-hidden rounded-xl sm:h-[220px]">
          <Image src={detail.mapImage} alt={`Map of ${listing.location}`} fill className="object-cover" sizes="(min-width: 1024px) 700px, 100vw" />
        </div>
        <div className="flex flex-wrap gap-2">
          {detail.nearby.map((place) => (
            <span key={place} className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[11px] font-medium leading-4 text-[#334155]">
              {place}
            </span>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Similar homes nearby</h2>
          <Link href="/properties" className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900">
            See all ›
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {detail.similar.map((home) => (
            <button
              key={home.id}
              type="button"
              onClick={comingSoon("Similar home")}
              className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-left hover:bg-gray-50"
            >
              <span className="relative block h-[120px] w-full">
                <Image src={home.image} alt="" fill className="object-cover" sizes="(min-width: 640px) 240px, 100vw" />
              </span>
              <span className="flex flex-col gap-0.5 p-3">
                <span className="text-[15px] font-bold leading-[22px] text-[#0f172a]">{home.price}</span>
                <span className="truncate text-xs leading-[17px] text-gray-500">{home.summary}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
