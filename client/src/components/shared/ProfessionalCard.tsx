"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookmarkIcon } from "@/components/shared/BookmarkIcon";
import { NavIcon } from "@/components/shared/NavIcon";
import { providerHref } from "@/components/shared/ProviderCard";
import { QuoteRequestDialog } from "@/components/shared/QuoteRequestDialog";
import { useStartConversation } from "@/hooks/useMessaging";
import { useSaved } from "@/hooks/useSaved";
import { savedProvider } from "@/lib/saved-items";
import type { ProviderCardDto } from "@/types/api/schema";

/** The soft blue wash behind the white panel, with a green glow on the right. */
const BACKDROP =
  "radial-gradient(ellipse 18% 40% at 4% 22%, rgba(96,165,250,0.8), transparent), radial-gradient(ellipse 14% 30% at 95% 30%, rgba(34,197,94,0.55), transparent), radial-gradient(ellipse 22% 28% at 50% 3%, rgba(20,101,230,0.95), transparent), linear-gradient(90deg, #dce8ff, #c3d7fb)";

const ROUND_BUTTON = "flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-gray-100";

/** One professional (Figma node 1523:47926): a profile card with the avatar overlapping the panel, name, verified tick, short bio and the actions. */
export function ProfessionalCard({ provider }: { provider: ProviderCardDto }) {
  const router = useRouter();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const href = providerHref(provider, "professional");
  const name = provider.displayName ?? provider.owner.username ?? "Professional";
  const { canSave, saved, toggle } = useSaved(savedProvider(provider, "professional", name));
  const startMessage = useStartConversation();
  const verified = provider.owner.isVerified || provider.credentialVerified;

  function message() {
    startMessage.mutate(
      { recipientAccountId: provider.owner.accountId, contextType: "Direct", contextTitle: `Chat with ${name}` },
      { onSuccess: (conversation) => router.push(`/messages?c=${conversation.id}`) },
    );
  }

  return (
    <article className="relative flex min-w-0 flex-col rounded-[28px] px-2.5 pb-2.5 pt-16 drop-shadow-[0px_16px_16px_rgba(15,23,41,0.1)]" style={{ background: BACKDROP }}>
      <Link href={href} aria-label={`View ${name}`} className="absolute left-[30px] top-[22px] z-10 size-24 overflow-hidden rounded-full border-4 border-white bg-[#eef2ff] shadow-[0_4px_12px_rgba(15,23,41,0.15)]">
        <Image src={provider.owner.profilePicUrl ?? "/icons/avatar-placeholder-user.svg"} alt="" fill className="object-cover" sizes="96px" />
      </Link>

      <div className="flex flex-col gap-3 rounded-[22px] bg-white px-5 pb-5 pt-4">
        <div className="flex min-h-7 items-center gap-1.5 pl-[112px]">
          <h2 className="truncate text-xl font-semibold leading-[1.4] text-[#0f172a]">
            <Link href={href} className="hover:underline">
              {name}
            </Link>
          </h2>
          {verified && <Image src="/icons/checkmark-badge-01.svg" alt="Verified" title="Verified" width={18} height={18} className="shrink-0" />}
        </div>

        {provider.headline && <p className="line-clamp-2 text-sm leading-[1.4] text-[#475569]">{provider.headline}</p>}

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setQuoteOpen(true)}
            className="flex h-[52px] min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-full bg-[#1465e6] px-5 text-base font-semibold leading-[1.4] text-white hover:bg-[#0f52c0]"
          >
            Request consultation
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

      {quoteOpen && (
        <QuoteRequestDialog open onClose={() => setQuoteOpen(false)} target={{ providerIds: [provider.id], providerName: name, category: provider.categories?.[0], city: provider.city ?? undefined }} />
      )}
    </article>
  );
}
