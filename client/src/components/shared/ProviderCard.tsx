"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookmarkIcon } from "@/components/shared/BookmarkIcon";
import { NavIcon } from "@/components/shared/NavIcon";
import { QuoteRequestDialog } from "@/components/shared/QuoteRequestDialog";
import { useStartConversation } from "@/hooks/useMessaging";
import { useSaved } from "@/hooks/useSaved";
import { savedProvider } from "@/lib/saved-items";
import type { ProviderCardDto } from "@/types/api/schema";

export function providerHref(provider: ProviderCardDto, kind: "professional" | "artisan") {
  return `/${kind === "professional" ? "professionals" : "artisans"}/${provider.id}`;
}

const ROUND_BUTTON = "flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-gray-100";

/** One professional or artisan (Figma node 1599:50278): a profile card with the avatar overlapping the panel, name, verified tick, short bio and the actions. */
export function ProviderCard({ provider, kind }: { provider: ProviderCardDto; kind: "professional" | "artisan" }) {
  const router = useRouter();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const href = providerHref(provider, kind);
  const name = provider.displayName ?? provider.owner.username ?? "Provider";
  const { canSave, saved, toggle } = useSaved(savedProvider(provider, kind, name));
  const startMessage = useStartConversation();
  const verified = provider.owner.isVerified || provider.credentialVerified;

  function message() {
    startMessage.mutate(
      { recipientAccountId: provider.owner.accountId, contextType: "Direct", contextTitle: `Chat with ${name}` },
      { onSuccess: (conversation) => router.push(`/messages?c=${conversation.id}`) },
    );
  }

  return (
    <article className="relative flex min-w-0 flex-col hover:border-[#cbd5e1] rounded-[28px] border border-[#e2e8f0] bg-[#f1f1f1] px-2.5 pb-2.5 pt-16">
      <div className="pointer-events-none absolute left-[29px] top-[21px] z-10 size-24 overflow-hidden rounded-full border-4 border-white bg-[#eef2ff] shadow-[0_4px_12px_rgba(15,23,41,0.15)]">
        <Image src={provider.owner.profilePicUrl ?? "/icons/avatar-placeholder-user.svg"} alt="" fill className="object-cover" sizes="96px" />
      </div>

      <div className="flex flex-col gap-3 rounded-[22px] border border-[#e2e8f0] bg-white px-5 pb-5 pt-4">
        <div className="flex min-h-7 items-center gap-1.5 pl-[112px]">
          <h2 className="truncate text-xl font-semibold leading-[1.4] text-[#0f172a]">{name}</h2>
          {verified && <Image src="/icons/checkmark-badge-01.svg" alt="Verified" title="Verified" width={18} height={18} className="shrink-0" />}
        </div>

        {provider.headline && <p className="line-clamp-2 text-sm leading-[1.4] text-[#475569]">{provider.headline}</p>}

        <div className="relative z-10 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setQuoteOpen(true)}
            className="flex h-10 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-[10px] bg-[#eef4ff] px-4 text-sm font-medium leading-5 text-[#1465e6] hover:bg-[#dfeaff]"
          >
            {kind === "professional" ? "Request consultation" : "Request a quote"}
          </button>
          <button type="button" aria-label={`Message ${name}`} onClick={message} disabled={startMessage.isPending} className={`${ROUND_BUTTON} disabled:opacity-60`}>
            <NavIcon icon="/icons/message-01.svg" size={22} className="bg-[#334155]" />
          </button>
          {canSave && (
            <button type="button" aria-pressed={saved} aria-label={saved ? `Remove ${name} from saved` : `Save ${name}`} onClick={toggle} className={ROUND_BUTTON}>
              <BookmarkIcon saved={saved} size={22} />
            </button>
          )}
        </div>
      </div>

      {/* The whole card opens the profile; the buttons sit above this link. */}
      <Link href={href} aria-label={`View ${name}`} className="absolute inset-0 rounded-[28px]" />

      {quoteOpen && (
        <QuoteRequestDialog open onClose={() => setQuoteOpen(false)} target={{ providerIds: [provider.id], providerName: name, consultation: kind === "professional", category: provider.categories?.[0], city: provider.city ?? undefined }} />
      )}
    </article>
  );
}
