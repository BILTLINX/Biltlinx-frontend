"use client";

import Image from "next/image";
import Link from "next/link";
import { NavIcon } from "@/components/shared/NavIcon";
import type { OfferingDto } from "@/types/api/schema";

const ACTION_LABEL: Record<string, string> = {
  Book: "Book",
  RequestQuote: "Request a quote",
  RequestInspection: "Request an inspection",
};

export function offeringActionLabel(offering: OfferingDto) {
  return ACTION_LABEL[offering.primaryAction ?? ""] ?? "View";
}

export function offeringPrice(offering: OfferingDto) {
  if (offering.price === null) return offering.priceLabel ?? "Price on request";
  const amount = `${offering.currency ?? "GHS"} ${offering.price.toLocaleString("en-GH")}`;
  return `${offering.priceLabel ? `${offering.priceLabel} ` : ""}${amount}${offering.priceUnit ? ` / ${offering.priceUnit}` : ""}`;
}

export function OfferingCard({ offering }: { offering: OfferingDto }) {
  const cover = offering.media?.[0]?.url;
  return (
    <Link href={`/services/${offering.id}`} className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white hover:border-brand-900">
      <div className="relative h-[150px] w-full bg-[#eef2ff]">
        {cover ? <Image src={cover} alt="" fill unoptimized className="object-cover" sizes="320px" /> : <div className="flex size-full items-center justify-center"><NavIcon icon="/icons/settings-02.svg" size={32} className="bg-[#94a3b8]" /></div>}
        {offering.category && <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#0f172a]">{offering.category}</span>}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-base font-bold leading-6 text-[#0f172a]">{offeringPrice(offering)}</p>
        <p className="text-sm font-medium text-[#334155]">{offering.title}</p>
        <p className="text-xs text-gray-500">
          {offering.provider.displayName ?? offering.provider.owner.username} · {offering.provider.city}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {offering.provider.credentialVerified && <span className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium text-[#16a34a]">Credential verified ✓</span>}
          {offering.provider.credentialWarning && <span className="rounded-full bg-[#fef3c7] px-2 py-[3px] text-[11px] font-medium text-[#b45309]">Credential not verified</span>}
        </div>
        <span className="mt-auto pt-1 text-[13px] font-medium text-brand-900">{offeringActionLabel(offering)} ›</span>
      </div>
    </Link>
  );
}
