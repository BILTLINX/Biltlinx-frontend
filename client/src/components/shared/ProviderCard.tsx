"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookmarkIcon } from "@/components/shared/BookmarkIcon";
import { NavIcon } from "@/components/shared/NavIcon";
import { RequestConsultationModal, consultationProviderFrom } from "@/components/shared/RequestConsultationModal";
import { RequestQuoteModal, quoteServiceFromProvider } from "@/components/shared/RequestQuoteModal";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import type { ProviderCardData } from "@/types/provider";

/** The call to action that opens the consultation request dialog instead of a coming-soon page. */
const CONSULTATION_CTA = "Request consultation";
const QUOTE_CTA = "Request quote";

/** One professional or artisan (Figma nodes 1043:21348, 1043:21756): identity, trust badges, summary, headline stats, pricing and contact actions. */
export function ProviderCard({ provider }: { provider: ProviderCardData }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const opensQuote = provider.cta === QUOTE_CTA;
  const opensConsultation = provider.cta === CONSULTATION_CTA;
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <article className="@container flex min-w-0 flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="relative block size-14 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
          <Image src={provider.avatar} alt={provider.name} fill className="object-cover" sizes="56px" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="truncate text-base font-bold leading-[23px] text-[#0f172a]">
            {provider.profileHref ? (
              <Link href={provider.profileHref} className="hover:text-brand-900 hover:underline">
                {provider.name}
              </Link>
            ) : (
              provider.name
            )}
          </h2>
          <p className="truncate text-[13px] font-medium leading-[19px] text-brand-900">{provider.role}</p>
          <p className="flex items-center gap-1.5 text-xs leading-[17px] text-gray-500">
            <NavIcon icon="/icons/post-options-location.svg" size={12} className="bg-gray-500" />
            <span className="truncate">{provider.location}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSaved((v) => !v)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${provider.name} from saved` : `Save ${provider.name}`}
          className="flex size-[34px] shrink-0 items-center justify-center rounded-full border border-gray-200"
        >
          <BookmarkIcon saved={saved} size={16} />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {provider.badges.map((badge) => (
          <span
            key={badge}
            className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium leading-[14px] text-[#16a34a]"
          >
            {badge}
          </span>
        ))}
      </div>

      <p className="text-[13px] leading-[19px] text-[#475569]">{provider.summary}</p>

      <div className="flex py-2.5">
        {provider.stats.map((stat) => (
          <div key={stat.label} className="flex min-w-0 flex-1 flex-col items-center gap-0.5">
            <p className="text-[15px] font-bold leading-[22px] text-[#0f172a]">{stat.value}</p>
            <p className="text-[11px] leading-4 text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <p className="flex flex-wrap items-baseline gap-x-1">
        <span className="text-base font-bold leading-[23px] text-[#0f172a]">{provider.pricing.headline}</span>
        <span className="text-xs font-medium leading-[17px] text-gray-500">{provider.pricing.note}</span>
      </p>

      {/* Side by side only once the card is wide enough for both labels; otherwise stacked. */}
      <div className="mt-auto flex flex-col gap-2 @[380px]:flex-row">
        <Button
          variant="primary"
          onClick={opensConsultation ? () => setConsultationOpen(true) : opensQuote ? () => setQuoteOpen(true) : comingSoon(provider.cta)}
          className="h-10 min-w-0 whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px] @[380px]:flex-1"
        >
          {provider.cta}
        </Button>
        <Button
          variant="outline"
          onClick={() => (provider.profileHref ? router.push(provider.profileHref) : comingSoon("View profile")())}
          className="h-10 min-w-0 whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px] @[380px]:flex-1"
        >
          View profile
        </Button>
      </div>
      {opensConsultation && (
        <RequestConsultationModal
          open={consultationOpen}
          onClose={() => setConsultationOpen(false)}
          provider={consultationProviderFrom(provider)}
        />
      )}
      {quoteOpen && <RequestQuoteModal open onClose={() => setQuoteOpen(false)} service={quoteServiceFromProvider(provider)} />}
    </article>
  );
}
