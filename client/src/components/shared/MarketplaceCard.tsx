"use client";

import Image from "next/image";
import Link from "next/link";
import { BookmarkIcon } from "@/components/shared/BookmarkIcon";
import { useSaved } from "@/hooks/useSaved";
import { formatMoney } from "@/lib/format";
import { KIND_PILL, UNIT_SUFFIX } from "@/lib/marketplace-api";
import { savedOffer } from "@/lib/saved-items";
import type { OfferDto } from "@/types/api/schema";

/** One offer (Figma node 1519:47774): title, location and save above a photo carrying the category, price and an open button. The whole photo opens the listing. */
export function MarketplaceCard({ offer }: { offer: OfferDto }) {
  const href = offer.detailRoute ?? "/marketplace";
  const kind = KIND_PILL[offer.kind ?? ""] ?? offer.category ?? "";
  const price = formatMoney(offer.price, offer.currency ?? "GHS");
  const unit = offer.unit ? UNIT_SUFFIX[offer.unit] : undefined;
  const { canSave, saved, toggle } = useSaved(savedOffer(offer, kind, unit ? `${price} / ${unit}` : price));

  return (
    <article className="flex w-full min-w-0 flex-col gap-2 overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-white p-2">
      <div className="flex items-start justify-between gap-2 px-2 pt-2">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-base font-semibold leading-[1.35] text-[#0f172a]">{offer.title}</p>
          {offer.city && (
            <p className="flex items-center gap-1 text-[13px] leading-[1.35] text-[#475569]">
              <Image src="/icons/location-01.svg" alt="" width={14} height={14} />
              <span className="truncate">{offer.city}</span>
            </p>
          )}
        </div>
        {canSave && (
          <button
            type="button"
            aria-pressed={saved}
            aria-label={saved ? `Remove ${offer.title} from saved` : `Save ${offer.title}`}
            onClick={toggle}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f1f5f9] hover:bg-gray-200"
          >
            <BookmarkIcon saved={saved} size={20} />
          </button>
        )}
      </div>

      <div className="relative h-[230px] w-full overflow-hidden rounded-[14px] bg-[#eef2ff]">
        <Image src={offer.coverUrl ?? "/images/marketplace/property-sale.jpg"} alt="" fill unoptimized className="object-cover" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 307px" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[130px] bg-gradient-to-b from-[rgba(15,23,41,0)] to-[rgba(15,23,41,0.82)]" />
        <Link href={href} aria-label={`View ${offer.title}`} className="absolute inset-0" />
        <span className="pointer-events-none absolute left-2.5 top-2.5 flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold leading-[1.35] text-[#0f172a]">{kind}</span>
        <p className="pointer-events-none absolute bottom-[15px] left-3.5 right-16 flex items-baseline gap-1 leading-[1.35]">
          <span className="truncate text-2xl font-bold text-white">{price}</span>
          {unit && <span className="text-sm font-medium text-[#e2e8f0]">/{unit}</span>}
        </p>
        <span aria-hidden className="pointer-events-none absolute bottom-3 right-2.5 flex size-11 items-center justify-center rounded-full bg-white">
          <Image src="/icons/arrow-up-right.svg" alt="" width={20} height={20} />
        </span>
      </div>
    </article>
  );
}
