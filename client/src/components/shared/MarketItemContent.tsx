"use client";

import Image from "next/image";
import { useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { BULK_THRESHOLD, type MarketItemDetail } from "@/lib/dummy-market-detail";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4";

interface MarketItemContentProps {
  detail: MarketItemDetail;
  deliverTo: string;
  onDeliverToChange: (value: string) => void;
}

/** The left column of a marketplace item (Figma node 1061:31146): photos, headline, price tiers, details and delivery estimate. */
export function MarketItemContent({ detail, deliverTo, onDeliverToChange }: MarketItemContentProps) {
  const { listing } = detail;
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
      <div className="flex gap-3">
        <div className="relative h-[260px] min-w-0 flex-1 overflow-hidden rounded-2xl bg-[#eef2ff] sm:h-[320px] lg:h-[380px]">
          <Image src={detail.gallery[selected]} alt={listing.title} fill priority className="object-cover" sizes="(min-width: 1024px) 630px, 100vw" />
        </div>
        <div className="flex w-[64px] shrink-0 flex-col gap-2 sm:w-[90px]">
          {detail.gallery.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`Show photo ${index + 1}`}
              aria-current={index === selected}
              className={cn(
                "relative aspect-square w-full overflow-hidden rounded-[10px] bg-[#eef2ff] ring-2 ring-offset-1",
                index === selected ? "ring-brand-900" : "ring-transparent",
              )}
            >
              <Image src={image} alt="" fill className="object-cover" sizes="90px" />
            </button>
          ))}
        </div>
      </div>

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#eff5ff] px-2.5 py-1 text-xs font-medium leading-4 text-brand-900">
            {listing.category}
          </span>
          {listing.badges
            ?.filter((badge) => badge.tone === "verified")
            .map((badge) => (
              <span key={badge.label} className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium leading-[14px] text-[#16a34a]">
                {badge.label}
              </span>
            ))}
          <span className="rounded-full bg-[#dcfce7] px-2.5 py-1 text-xs font-medium leading-4 text-[#16a34a]">
            {detail.stockLabel}
          </span>
        </div>
        <h1 className="text-2xl font-bold leading-8 text-[#0f172a] sm:text-[26px] sm:leading-[34px]">{listing.title}</h1>
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[28px] font-bold leading-9 text-[#0f172a]">{listing.price}</span>
          <span className="text-[13px] font-medium leading-[19px] text-gray-500">
            per {detail.unit} · GHS {detail.bulkPrice} per {detail.unit} for {BULK_THRESHOLD}+
          </span>
        </p>
      </header>

      <section className={CARD}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Details</h2>
        <dl className="flex flex-col gap-2.5">
          {detail.specs.map((spec) => (
            <div key={spec.label} className="flex flex-col gap-0.5 text-[13px] leading-[19px] sm:flex-row sm:justify-between sm:gap-6">
              <dt className="text-gray-500">{spec.label}</dt>
              <dd className="font-medium text-[#0f172a] sm:text-right">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={CARD}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Delivery estimate</h2>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">Deliver to</span>
          <span className="flex items-center gap-2 rounded-[10px] border border-gray-200 px-3.5 py-3">
            <NavIcon icon="/icons/post-options-location.svg" size={14} className="shrink-0 bg-gray-500" />
            <input
              value={deliverTo}
              onChange={(event) => onDeliverToChange(event.target.value)}
              aria-label="Deliver to"
              className="min-w-0 flex-1 bg-transparent text-sm leading-5 text-[#0f172a] focus:outline-none"
            />
          </span>
        </label>
        <p className="text-xs leading-[17px] text-gray-500">{detail.deliveryNote}</p>
      </section>
    </div>
  );
}
