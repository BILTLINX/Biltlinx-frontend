"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RequestQuoteModal, quoteServiceFromDetail } from "@/components/shared/RequestQuoteModal";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { getServiceDetail } from "@/lib/dummy-service-detail";
import type { ServiceListing } from "@/lib/dummy-services";

/** The call to action that opens the quote request dialog instead of a coming-soon page. */
const QUOTE_CTA = "Request quote";

/** One priced service (Figma node 1043:22158): thumbnail, title, provider and trust badge, price, and book / details actions. */
export function ServiceCard({ service }: { service: ServiceListing }) {
  const router = useRouter();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    // The container must be an ancestor of the elements it restyles, so the card sits inside a wrapper.
    <div className="@container">
    <article className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 @[640px]:flex-row @[640px]:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <span className="relative block size-24 shrink-0 overflow-hidden rounded-xl bg-[#eef2ff]">
          <Image src={service.image} alt="" fill className="object-cover" sizes="96px" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">
            <Link href={`/services/${service.id}`} className="hover:text-brand-900 hover:underline">
              {service.title}
            </Link>
          </h2>
          <p className="text-[13px] font-medium leading-[19px] text-brand-900">{service.provider}</p>
          <span className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium leading-[14px] text-[#16a34a]">
            {service.badge}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1 @[640px]:items-end @[640px]:text-right">
        <p className="whitespace-nowrap text-lg font-bold leading-[26px] text-[#0f172a]">{service.price}</p>
        <p className="text-xs leading-[17px] text-gray-500 @[640px]:whitespace-nowrap">{service.priceNote}</p>
      </div>

      <div className="flex gap-2 @[640px]:w-[150px] @[640px]:flex-col">
        <Button
          variant="primary"
          onClick={service.cta === QUOTE_CTA ? () => setQuoteOpen(true) : comingSoon(service.cta)}
          className="h-10 min-w-0 flex-1 whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px] @[640px]:flex-none"
        >
          {service.cta}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/services/${service.id}`)}
          className="h-10 min-w-0 flex-1 whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px] @[640px]:h-9 @[640px]:flex-none"
        >
          Details
        </Button>
      </div>
    </article>
    {quoteOpen && service.cta === QUOTE_CTA && (
      <RequestQuoteModal open onClose={() => setQuoteOpen(false)} service={quoteServiceFromDetail(getServiceDetail(service.id)!)} />
    )}
    </div>
  );
}
