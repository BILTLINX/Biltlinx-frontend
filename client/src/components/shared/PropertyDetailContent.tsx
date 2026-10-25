"use client";

import Image from "next/image";
import Link from "next/link";
import { KeyFacts } from "@/components/shared/KeyFacts";
import { NavIcon } from "@/components/shared/NavIcon";
import { getDocumentUrl } from "@/lib/properties-api";
import { notifyError } from "@/lib/errors";
import { propertyLocation, type PropertyDetailView } from "@/lib/property-mapper";
import type { ListingCardData } from "@/types/listing";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4";

async function openDocument(propertyId: string, documentId: string, publicUrl: string | null) {
  if (publicUrl) {
    window.open(publicUrl, "_blank", "noopener,noreferrer");
    return;
  }
  try {
    const link = await getDocumentUrl(propertyId, documentId);
    if (link.url) window.open(link.url, "_blank", "noopener,noreferrer");
  } catch (error) {
    notifyError(error);
  }
}

/** The left column of a property page (Figma node 1052:23833): headline, key facts, description, terms, documents and similar homes. */
export function PropertyDetailContent({ detail, similar }: { detail: PropertyDetailView; similar: ListingCardData[] }) {
  const { card, property } = detail;
  const addressHidden = property.addressVisibility !== "Public";

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#eff5ff] px-2.5 py-1 text-xs font-medium leading-4 text-brand-900">{card.kind}</span>
          {card.badges?.map((badge) => (
            <span
              key={badge.label}
              className={cn(
                "rounded-full text-[11px] font-medium",
                badge.tone === "verified" ? "bg-[#dcfce7] px-2 py-[3px] leading-[14px] text-[#16a34a]" : "bg-[#fef3c7] px-2.5 py-1 leading-4 text-[#b45309]",
              )}
            >
              {badge.label}
            </span>
          ))}
          <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[11px] font-medium leading-4 text-[#334155]">{detail.updated}</span>
        </div>
        <h1 className="text-2xl font-bold leading-8 text-[#0f172a] sm:text-[26px] sm:leading-[34px]">{card.title}</h1>
        <p className="flex items-start gap-1.5 text-[13px] leading-[19px] text-gray-500">
          <NavIcon icon="/icons/post-options-location.svg" size={13} className="mt-[3px] shrink-0 bg-gray-500" />
          <span>
            {propertyLocation(property)}
            {addressHidden && " · exact address shared after viewing is confirmed"}
          </span>
        </p>
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[28px] font-bold leading-9 text-[#0f172a]">
            {card.price}
            {card.priceUnit && <span className="text-base font-medium text-gray-500"> / {card.priceUnit}</span>}
          </span>
          <span className="text-[13px] font-medium leading-[19px] text-gray-500">{detail.priceNote}</span>
        </p>
      </header>

      {detail.keyFacts.length > 0 && <KeyFacts facts={detail.keyFacts} />}

      {detail.description && (
        <section className={CARD}>
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">About this property</h2>
          <p className="whitespace-pre-line text-sm leading-5 text-[#334155]">{detail.description}</p>
        </section>
      )}

      {detail.terms.length > 0 && (
        <section className={CARD}>
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Terms</h2>
          <KeyFacts facts={detail.terms} />
        </section>
      )}

      {detail.documents.length > 0 && (
        <section className={CARD}>
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Documents</h2>
          {detail.documents.map((document) => (
            <div key={document.id} className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#f1f5f9]">
                <NavIcon icon="/icons/post-options-compare.svg" size={16} className="bg-[#334155]" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="text-sm font-semibold leading-5 text-[#0f172a]">{document.title}</p>
                <p className="text-xs leading-[17px] text-gray-500">{document.note}</p>
              </div>
              {(document.isPublic || property.isOwn) && (
                <button
                  type="button"
                  onClick={() => void openDocument(property.id, document.id, document.url)}
                  className="shrink-0 rounded-full bg-[#eff5ff] px-3 py-1 text-[12px] font-medium text-brand-900"
                >
                  Open
                </button>
              )}
            </div>
          ))}
          <p className="text-xs leading-[17px] text-gray-500">
            Private documents are visible to the owner and Biltlinx reviewers only. Biltlinx does not give legal advice.
          </p>
        </section>
      )}

      {similar.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Similar properties</h2>
            <Link href="/properties" className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900">
              See all ›
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {similar.slice(0, 3).map((home) => (
              <Link
                key={home.id}
                href={home.href ?? "/properties"}
                className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-left hover:bg-gray-50"
              >
                <span className="relative block h-[120px] w-full">
                  <Image src={home.image} alt="" fill className="object-cover" sizes="(min-width: 640px) 240px, 100vw" />
                </span>
                <span className="flex flex-col gap-0.5 p-3">
                  <span className="text-[15px] font-bold leading-[22px] text-[#0f172a]">{home.price}</span>
                  <span className="truncate text-xs leading-[17px] text-gray-500">{home.title}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
