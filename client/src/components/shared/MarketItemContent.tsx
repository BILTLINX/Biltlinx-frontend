"use client";

import Image from "next/image";
import { useState } from "react";
import { formatDate, formatMoney } from "@/lib/format";
import { CATEGORY_PILL, isCounted, stockNoun, UNIT_LABEL, unitSuffix } from "@/lib/market-listings";
import { cn } from "@/lib/utils";
import type { MarketListing } from "@/types/api/marketplace";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4";
const PLACEHOLDERS = { Materials: "/images/marketplace/material.jpg", Equipment: "/images/marketplace/equipment.jpg", Land: "/images/marketplace/land.jpg" };

/** The left column of a marketplace item (Figma node 1061:31146): photos, headline, price tiers, details and description. */
export function MarketItemContent({ listing }: { listing: MarketListing }) {
  const [selected, setSelected] = useState(0);
  const gallery = listing.photos.length > 0 ? listing.photos : [PLACEHOLDERS[listing.category]];
  const noun = stockNoun(listing.category, listing.unit);
  const suffix = unitSuffix(listing.unit);
  const counted = isCounted(listing.category);

  const specs = [
    { label: "Category", value: CATEGORY_PILL[listing.category] },
    { label: "Priced", value: UNIT_LABEL[listing.unit] ?? listing.unit },
    { label: "Location", value: listing.location },
    counted && listing.stock !== null ? { label: "In stock", value: `${listing.stock.toLocaleString("en-GH")} ${noun}` } : null,
    counted && listing.minOrder ? { label: "Minimum order", value: `${listing.minOrder.toLocaleString("en-GH")} ${noun}` } : null,
    counted
      ? {
          label: "Delivery",
          value: listing.deliveryAvailable
            ? listing.deliveryFee
              ? `Seller delivers · ${formatMoney(listing.deliveryFee, listing.currency)} per order`
              : "Seller delivers · free"
            : "Pickup only",
        }
      : null,
    { label: "Listed", value: formatDate(listing.createdAt) },
  ].filter((spec): spec is { label: string; value: string } => spec !== null);

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
      <div className="flex gap-3">
        <div className="relative h-[260px] min-w-0 flex-1 overflow-hidden rounded-2xl bg-[#eef2ff] sm:h-[320px] lg:h-[380px]">
          <Image src={gallery[selected] ?? gallery[0]} alt={listing.title} fill priority unoptimized className="object-cover" sizes="(min-width: 1024px) 630px, 100vw" />
        </div>
        {gallery.length > 1 && (
          <div className="flex w-[64px] shrink-0 flex-col gap-2 sm:w-[90px]">
            {gallery.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelected(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === selected}
                className={cn("relative aspect-square w-full overflow-hidden rounded-[10px] bg-[#eef2ff] ring-2 ring-offset-1", index === selected ? "ring-brand-900" : "ring-transparent")}
              >
                <Image src={image} alt="" fill unoptimized className="object-cover" sizes="90px" />
              </button>
            ))}
          </div>
        )}
      </div>

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#eff5ff] px-2.5 py-1 text-xs font-medium leading-4 text-brand-900">{CATEGORY_PILL[listing.category]}</span>
          {listing.seller.verified && <span className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium leading-[14px] text-[#16a34a]">Seller verified ✓</span>}
          {counted && listing.stock !== null && (
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium leading-4", listing.stock > 0 ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#fee2e2] text-[#b91c1c]")}>
              {listing.stock > 0 ? `In stock · ${listing.stock.toLocaleString("en-GH")} ${noun}` : "Sold out"}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold leading-8 text-[#0f172a] sm:text-[26px] sm:leading-[34px]">{listing.title}</h1>
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[28px] font-bold leading-9 text-[#0f172a]">{formatMoney(listing.price, listing.currency)}</span>
          <span className="text-[13px] font-medium leading-[19px] text-gray-500">
            {suffix ? `per ${suffix}` : ""}
            {listing.bulk ? ` · ${formatMoney(listing.bulk.price, listing.currency)} per ${suffix ?? "item"} for ${listing.bulk.minQuantity.toLocaleString("en-GH")}+` : ""}
          </span>
        </p>
      </header>

      <section className={CARD}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Details</h2>
        <dl className="flex flex-col gap-2.5">
          {specs.map((spec) => (
            <div key={spec.label} className="flex flex-col gap-0.5 text-[13px] leading-[19px] sm:flex-row sm:justify-between sm:gap-6">
              <dt className="text-gray-500">{spec.label}</dt>
              <dd className="font-medium text-[#0f172a] sm:text-right">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {listing.description && (
        <section className={CARD}>
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Description</h2>
          <p className="whitespace-pre-wrap text-[13px] leading-[20px] text-[#334155]">{listing.description}</p>
        </section>
      )}
    </div>
  );
}
