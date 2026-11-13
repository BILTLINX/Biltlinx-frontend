"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { QuoteRequestDialog } from "@/components/shared/QuoteRequestDialog";
import { Button } from "@/components/ui/Button";
import { formatPricePeriod } from "@/lib/format";
import type { OfferingDto } from "@/types/api/schema";

const ACTION_LABEL: Record<string, string> = {
  Book: "Book",
  RequestQuote: "Request quote",
  RequestInspection: "Request inspection",
};

const MODE_LABEL: Record<string, string> = {
  FixedPrice: "Fixed price",
  QuoteRequired: "Quote required",
  InspectionFirst: "Inspection first",
};

/** The amount without its unit, e.g. "From GHS 1,500". */
function offeringAmount(offering: OfferingDto) {
  if (offering.price === null) return offering.priceLabel ?? "Price on request";
  return `${offering.priceLabel ? `${offering.priceLabel} ` : ""}${offering.currency ?? "GHS"} ${offering.price.toLocaleString("en-GH")}`;
}

export function offeringPrice(offering: OfferingDto) {
  return offering.price === null ? offeringAmount(offering) : `${offeringAmount(offering)} ${formatPricePeriod(offering.priceUnit)}`.trim();
}

/** One priced service as a row (Figma node 1043:22158): photo, title, provider and trust badge, price, then the actions. It stacks when the card is narrow. */
export function OfferingCard({ offering }: { offering: OfferingDto }) {
  const router = useRouter();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const { provider } = offering;
  const href = `/services/${offering.id}`;
  const cover = offering.media?.[0]?.url;
  const title = offering.title ?? "Service";
  const name = provider.displayName ?? provider.owner.username ?? "Provider";
  const action = ACTION_LABEL[offering.primaryAction ?? ""];
  const unit = offering.price !== null ? formatPricePeriod(offering.priceUnit).replace("/", "per") : "";
  const note = [MODE_LABEL[offering.mode ?? ""], unit].filter(Boolean).join(" · ");

  return (
    <article className="@container overflow-hidden rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-4 @[560px]:flex-row @[560px]:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Link href={href} aria-label={`View ${title}`} className="relative block size-24 shrink-0 overflow-hidden rounded-xl bg-[#eef2ff]">
            {cover ? (
              <Image src={cover} alt="" fill unoptimized className="object-cover" sizes="96px" />
            ) : (
              <span className="flex size-full items-center justify-center">
                <NavIcon icon="/icons/settings-02.svg" size={28} className="bg-[#94a3b8]" />
              </span>
            )}
          </Link>
          <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
            <p className="text-base font-bold leading-[23px] text-[#0f172a]">
              <Link href={href} className="hover:text-brand-900 hover:underline">
                {title}
              </Link>
            </p>
            <p className="max-w-full truncate text-[13px] font-medium leading-[19px] text-brand-900">{[name, offering.category].filter(Boolean).join(" · ")}</p>
            {provider.credentialVerified && <span className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium leading-[14px] text-[#16a34a]">Credential verified ✓</span>}
            {provider.credentialWarning && <span className="rounded-full bg-[#fef3c7] px-2 py-[3px] text-[11px] font-medium leading-[14px] text-[#b45309]">Credential not verified</span>}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-1 @[560px]:items-end">
          <p className="whitespace-nowrap text-lg font-bold leading-[26px] text-[#0f172a]">{offeringAmount(offering)}</p>
          {note && <p className="whitespace-nowrap text-xs leading-[17px] text-gray-500">{note}</p>}
        </div>

        <div className="flex shrink-0 gap-2 @[560px]:w-[150px] @[560px]:flex-col">
          {action && (
            <Button
              variant="primary"
              onClick={() => (offering.primaryAction === "Book" ? router.push(href) : setQuoteOpen(true))}
              className="h-10 min-w-0 whitespace-nowrap rounded-[10px] px-2 lg:rounded-[10px]"
            >
              {action}
            </Button>
          )}
          <Link
            href={href}
            className="flex h-10 w-full min-w-0 items-center justify-center whitespace-nowrap rounded-[10px] border border-gray-200 px-2 text-sm font-medium text-[#0f172a] hover:bg-gray-50 @[560px]:h-9"
          >
            Details
          </Link>
        </div>
      </div>
      {quoteOpen && (
        <QuoteRequestDialog
          open
          onClose={() => setQuoteOpen(false)}
          target={{
            providerIds: [provider.id],
            providerName: name,
            offeringId: offering.id,
            category: offering.category ?? undefined,
            city: provider.city ?? undefined,
            title: offering.title ?? undefined,
            needsInspection: offering.primaryAction === "RequestInspection",
          }}
        />
      )}
    </article>
  );
}
