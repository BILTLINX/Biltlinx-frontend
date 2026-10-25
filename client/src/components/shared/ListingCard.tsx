"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { RequestViewingModal } from "@/components/shared/RequestViewingModal";
import { Button } from "@/components/ui/Button";
import { useStartConversation } from "@/hooks/useMessaging";
import { comingSoonHref } from "@/lib/coming-soon";
import { cn } from "@/lib/utils";
import type { ListingCardData } from "@/types/listing";

/** The call to action that opens the viewing request dialog instead of a coming-soon page. */
const VIEWING_CTA = "Request viewing";

const DETAIL_ICONS = { bed: "/icons/bed-sm.svg", plot: "/icons/map-pinpoint-01.svg" } as const;

/** One listing (Figma nodes 1040:20554 and 1042:20628): image with category pill and save, price, title, location, optional detail line, trust badge and call(s) to action. */
export function ListingCard({ listing }: { listing: ListingCardData }) {
  const router = useRouter();
  const [viewingOpen, setViewingOpen] = useState(false);
  const startMessage = useStartConversation();

  function messageOwner() {
    if (!listing.ownerId) {
      router.push(comingSoonHref(listing.secondaryCta ?? "Message"));
      return;
    }
    startMessage.mutate(
      { recipientAccountId: listing.ownerId, contextType: "Property", contextId: listing.id, contextTitle: listing.title },
      { onSuccess: (conversation) => router.push(`/messages?c=${conversation.id}`) },
    );
  }

  return (
    <article className="@container flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="relative h-[180px] w-full shrink-0">
        <Image
          src={listing.image}
          alt={listing.title}
          fill
          className="object-cover"
          sizes="(min-width: 1440px) 280px, (min-width: 640px) 45vw, 100vw"
        />
        {listing.href && <Link href={listing.href} aria-label={`View ${listing.title}`} className="absolute inset-0" />}
        <span className="absolute left-3 top-3 flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-medium leading-4 text-[#0f172a]">
          {listing.kind}
        </span>
      </div>

      <div className="flex flex-1 flex-col items-start gap-2 p-4">
        <p className="flex items-baseline gap-1 text-lg font-bold leading-6 text-[#0f172a]">
          {listing.price}
          {listing.priceUnit && <span className="text-[13px] font-medium text-gray-500">/ {listing.priceUnit}</span>}
        </p>
        <p className="text-sm font-medium leading-5 text-[#334155]">
          {listing.href ? (
            <Link href={listing.href} className="hover:text-brand-900 hover:underline">
              {listing.title}
            </Link>
          ) : (
            listing.title
          )}
        </p>
        <p className="flex items-center gap-1.5 text-xs leading-[17px] text-gray-500">
          <NavIcon icon="/icons/post-options-location.svg" size={12} className="bg-gray-500" />
          <span className="min-w-0">{listing.location}</span>
        </p>
        {listing.detail && (
          <p className="flex items-center gap-1.5 text-xs leading-[17px] text-gray-500">
            <NavIcon icon={DETAIL_ICONS[listing.detail.icon]} size={12} className="bg-gray-500" />
            <span className="min-w-0">{listing.detail.text}</span>
          </p>
        )}
        {listing.badges?.map((badge) => (
          <span
            key={badge.label}
            className={cn(
              "rounded-full text-[11px] font-medium",
              badge.tone === "verified"
                ? "bg-[#dcfce7] px-2 py-[3px] leading-[14px] text-[#16a34a]"
                : "bg-[#f1f5f9] px-2.5 py-1 leading-4 text-[#334155]",
            )}
          >
            {badge.label}
          </span>
        ))}
        <div className="mt-auto flex w-full gap-2 pt-1">
          <Button
            variant="primary"
            onClick={() => (listing.ctaHref ? router.push(listing.ctaHref) : listing.cta === VIEWING_CTA ? setViewingOpen(true) : router.push(comingSoonHref(listing.cta)))}
            className={cn(
              "h-10 min-w-0 flex-1 whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]",
              listing.secondaryCta && "px-2 text-[13px]",
            )}
          >
            {listing.cta}
          </Button>
          {listing.secondaryCta && (
            <Button
              variant="outline"
              disabled={startMessage.isPending}
              onClick={() => messageOwner()}
              className="h-10 min-w-0 flex-1 whitespace-nowrap rounded-[10px] px-2 text-[13px] lg:rounded-[10px]"
            >
              {listing.secondaryCta}
            </Button>
          )}
        </div>
      </div>
      {listing.cta === VIEWING_CTA && (
        <RequestViewingModal
          open={viewingOpen}
          onClose={() => setViewingOpen(false)}
          property={{ id: listing.id, title: listing.title, summary: `${listing.location.split(",")[0]} · ${listing.price}`, image: listing.image }}
        />
      )}
    </article>
  );
}
