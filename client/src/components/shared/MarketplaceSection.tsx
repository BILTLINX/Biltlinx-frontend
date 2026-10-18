import Image from "next/image";
import Link from "next/link";
import { NavIcon } from "@/components/shared/NavIcon";
import { comingSoonHref } from "@/lib/coming-soon";
import { MARKETPLACE_LISTINGS, type MarketplaceListing } from "@/lib/dummy-marketplace";

/** "/home" dashboard's property-marketplace teaser grid. */
export function MarketplaceSection() {
  return (
    <section className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[16px] font-bold text-night-700">From your marketplace</h2>
        <Link
          href="/marketplace"
          className="flex items-center gap-2 font-inter text-[13px] font-medium text-brand-600"
        >
          Marketplace
          <NavIcon icon="/icons/chevron-right.svg" color="brand" size={10} />
        </Link>
      </div>

      <div className="no-scrollbar flex w-full items-start gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:gap-2.5 sm:overflow-visible sm:pb-0">
        {MARKETPLACE_LISTINGS.map((listing) => (
          <div key={listing.id} className="w-[307px] shrink-0 sm:w-full sm:shrink">
            <MarketplaceCard listing={listing} />
          </div>
        ))}
      </div>
    </section>
  );
}

function MarketplaceCard({ listing }: { listing: MarketplaceListing }) {
  return (
    <Link
      href={comingSoonHref(listing.subLine)}
      className="block w-full overflow-hidden rounded-[30px] border border-gray-200 bg-white p-1"
    >
      <div className="relative aspect-[299/291] sm:aspect-[388/397] w-full overflow-hidden rounded-[26px]">
        <Image
          src={listing.image}
          alt={listing.subLine}
          fill
          className="object-cover"
          sizes="(min-width: 640px) 50vw, 307px"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent to-[62%]"
        />

        <span className="absolute left-4 top-4 flex h-6 items-center rounded-full bg-[#e3f2f7] px-2 font-inter text-[12px] leading-4 text-ink">
          {listing.category}
        </span>

        <div className="absolute inset-x-4 bottom-5 flex sm:bottom-4 items-center justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-col items-start gap-1">
              <span className="flex items-center gap-1 rounded-full border-[0.2px] border-[#3c6e4f] bg-[#dcfce7] px-1 py-0.5 font-onest text-[9px] leading-4 text-[#16a34a]">
                {listing.verificationLabel}
                <Image
                  src="/icons/file-verified.svg"
                  alt=""
                  width={7}
                  height={7}
                  className="shrink-0"
                />
              </span>
              <p className="font-lexend text-[16px] font-semibold leading-6 sm:text-[24px] text-surface-button">
                {listing.price}
                <span className="sm:text-[12px]">/{listing.priceUnit}</span>
              </p>
            </div>
            <div className="flex flex-col gap-1 text-[8px] leading-[11px] sm:text-[10px]">
              <p className="font-rubik font-normal text-surface-button">{listing.subLine}</p>
              <p className="font-rubik font-light text-[#f6f6f9]">{listing.detailLine}</p>
            </div>
          </div>

          <span className="flex size-12 shrink-0 -rotate-90 items-center justify-center rounded-full border border-[#ffb01a] transition-colors duration-200 hover:bg-[#ffb01a]">
            <Image src="/icons/arrow-down-multiple.svg" alt="" width={16} height={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}
