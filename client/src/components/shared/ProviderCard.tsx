"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { QuoteRequestDialog } from "@/components/shared/QuoteRequestDialog";
import { Button } from "@/components/ui/Button";
import type { ProviderCardDto } from "@/types/api/schema";

export function providerHref(provider: ProviderCardDto, kind: "professional" | "artisan") {
  return `/${kind === "professional" ? "professionals" : "artisans"}/${provider.id}`;
}

/** One professional or artisan (Figma nodes 1043:21348, 1043:21756): identity, trust badges, summary and contact actions. */
export function ProviderCard({ provider, kind }: { provider: ProviderCardDto; kind: "professional" | "artisan" }) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const href = providerHref(provider, kind);
  const name = provider.displayName ?? provider.owner.username ?? "Provider";

  return (
    <article className="@container flex min-w-0 flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="relative block size-14 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
          <Image src={provider.owner.profilePicUrl ?? "/icons/avatar-placeholder-user.svg"} alt={name} fill className="object-cover" sizes="56px" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="truncate text-base font-bold leading-[23px] text-[#0f172a]">
            <Link href={href} className="hover:text-brand-900 hover:underline">
              {name}
            </Link>
          </h2>
          <p className="truncate text-[13px] font-medium leading-[19px] text-brand-900">{(provider.categories ?? []).slice(0, 2).join(" · ")}</p>
          <p className="flex items-center gap-1.5 text-xs leading-[17px] text-gray-500">
            <NavIcon icon="/icons/post-options-location.svg" size={12} className="bg-gray-500" />
            <span className="truncate">{provider.city}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {provider.owner.isVerified && <span className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium leading-[14px] text-[#16a34a]">ID verified ✓</span>}
        {provider.credentialVerified && <span className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium leading-[14px] text-[#16a34a]">Credential verified ✓</span>}
        {provider.urgentAvailable && <span className="rounded-full bg-[#fef3c7] px-2 py-[3px] text-[11px] font-medium leading-[14px] text-[#b45309]">Urgent jobs</span>}
      </div>

      {provider.headline && <p className="text-[13px] leading-[19px] text-[#475569]">{provider.headline}</p>}
      {provider.credentialWarning && <p className="rounded-lg bg-[#fef3c7] p-2.5 text-xs leading-[17px] text-[#b45309]">{provider.credentialWarning}</p>}

      <div className="mt-auto flex flex-col gap-2 @[380px]:flex-row">
        <Button variant="primary" onClick={() => setQuoteOpen(true)} className="h-10 min-w-0 whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px] @[380px]:flex-1">
          Request quote
        </Button>
        <Link href={href} className="flex h-10 min-w-0 items-center justify-center whitespace-nowrap rounded-[10px] border border-gray-200 px-4 text-sm font-medium text-night-900 hover:bg-gray-50 @[380px]:flex-1">
          View profile
        </Link>
      </div>
      {quoteOpen && (
        <QuoteRequestDialog open onClose={() => setQuoteOpen(false)} target={{ providerIds: [provider.id], providerName: name, category: provider.categories?.[0], city: provider.city ?? undefined }} />
      )}
    </article>
  );
}
