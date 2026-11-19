"use client";

import Image from "next/image";
import Link from "next/link";
import { BookmarkIcon } from "@/components/shared/BookmarkIcon";
import { NavIcon } from "@/components/shared/NavIcon";
import { useSaved } from "@/hooks/useSaved";
import { savedListing } from "@/lib/saved-items";
import type { ListingCardData } from "@/types/listing";

const GLASS = "bg-white/95";

/** A property or a stay at a glance (Figma node 1529:48144): photo with type, price, verified tick and save, then location and one key fact. Everything else lives on the property page, which the whole card opens. */
export function PropertyCard({ listing }: { listing: ListingCardData }) {
  const { canSave, saved, toggle } = useSaved(savedListing(listing));
  const verified = listing.badges?.some((badge) => badge.tone === "verified");

  return (
    <article className="relative flex w-full min-w-0 flex-col gap-2 overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white p-2 shadow-[0px_10px_24px_-6px_rgba(15,23,41,0.08)]">
      <div className="relative h-[200px] w-full overflow-hidden rounded-[18px] bg-[#eef2ff]">
        <Image src={listing.image} alt="" fill className="object-cover" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
        {/* A soft dark tint so the white pills read clearly over any photo. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#0f1729]/35" />
        {listing.href && <Link href={listing.href} aria-label={`View ${listing.title}`} className="absolute inset-0" />}
        <span className={`pointer-events-none absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-xs font-semibold leading-[1.35] text-[#0f172a] ${GLASS}`}>{listing.kind}</span>
        {verified && (
          <span title="Verified lister" className={`absolute right-[52px] top-3.5 flex size-7 items-center justify-center rounded-full ${GLASS}`}>
            <Image src="/icons/checkmark-badge-01.svg" alt="Verified lister" width={16} height={16} />
          </span>
        )}
        {canSave && (
          <button
            type="button"
            aria-pressed={saved}
            aria-label={saved ? `Remove ${listing.title} from saved` : `Save ${listing.title}`}
            onClick={toggle}
            className={`absolute right-2.5 top-2.5 flex size-9 items-center justify-center rounded-full ${GLASS} hover:bg-white`}
          >
            <BookmarkIcon saved={saved} size={18} />
          </button>
        )}
        <p className={`pointer-events-none absolute bottom-2.5 right-2.5 flex items-baseline gap-[3px] rounded-full px-3 py-1.5 leading-[1.35] text-[#0f172a] ${GLASS}`}>
          <span className="text-[15px] font-bold">{listing.price}</span>
          {listing.priceUnit && <span className="text-xs font-medium text-[#475569]">/{listing.priceUnit}</span>}
        </p>
      </div>

      <div className="flex w-full items-center gap-1.5 rounded-full bg-[#eef4ff] py-1.5 pl-3 pr-1.5">
        <NavIcon icon="/icons/location-01.svg" size={16} className="bg-[#1465E6]" />
        <p className="min-w-0 flex-1 truncate text-[13px] font-semibold leading-[1.35] text-[#0f172a]">{listing.location}</p>
        {listing.detail && <span className="max-w-[60%] shrink-0 truncate rounded-full bg-[#dbeafe] px-2.5 py-1.5 text-xs font-semibold leading-[1.35] text-[#1e3a8a]">{listing.detail.text}</span>}
      </div>
    </article>
  );
}
