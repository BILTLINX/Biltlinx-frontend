"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookmarkIcon } from "@/components/shared/BookmarkIcon";
import { NavIcon } from "@/components/shared/NavIcon";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import type { PropertyDetail } from "@/lib/dummy-property-detail";
import { shareContent } from "@/lib/share";
import { DetailAside } from "@/components/shared/DetailAside";
import { useCompare } from "@/context/CompareContext";
import { RequestViewingModal } from "@/components/shared/RequestViewingModal";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4";
const ROUNDED = "rounded-[10px] lg:rounded-[10px]";

/** The right column of a property page (Figma node 1052:23834): price and viewing actions, the agent, safety advice and Concierge. */
export function PropertyActionPanel({ detail }: { detail: PropertyDetail }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [viewingOpen, setViewingOpen] = useState(false);
  const compare = useCompare();
  const { listing, agent } = detail;
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <DetailAside className="xl:w-[360px]">
      <section className={`${CARD} gap-3.5 p-5`}>
        <p className="text-[22px] font-bold leading-[30px] text-[#0f172a]">{listing.price}</p>
        <p className="text-xs leading-[17px] text-gray-500">Asking price · negotiable</p>
        <Button variant="primary" onClick={() => setViewingOpen(true)} className={`h-12 ${ROUNDED}`}>
          Request viewing
        </Button>
        <Button variant="outline" onClick={comingSoon("Make an enquiry")} className={`h-11 ${ROUNDED}`}>
          Make an enquiry
        </Button>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setSaved((v) => !v)}
            aria-pressed={saved}
            className="flex items-center justify-center gap-1.5 rounded-[10px] border border-gray-200 py-2 text-[13px] font-medium leading-[19px] text-[#334155] hover:bg-gray-50"
          >
            <BookmarkIcon saved={saved} size={16} />
            {saved ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => shareContent({ title: listing.title, path: `#property-${listing.id}` })}
            className="flex items-center justify-center gap-1.5 rounded-[10px] border border-gray-200 py-2 text-[13px] font-medium leading-[19px] text-[#334155] hover:bg-gray-50"
          >
            <NavIcon icon="/icons/post-options-copy-link.svg" size={14} className="bg-[#334155]" />
            Share
          </button>
          <button
            type="button"
            onClick={() => compare.toggle({ id: listing.id, kind: "home", title: listing.title, price: listing.price, subtitle: listing.location, image: listing.image, href: `/properties/${listing.id}` })}
            aria-pressed={compare.has(listing.id)}
            className="flex items-center justify-center gap-1.5 rounded-[10px] border border-gray-200 py-2 text-[13px] font-medium leading-[19px] text-[#334155] hover:bg-gray-50"
          >
            <NavIcon icon="/icons/post-options-compare.svg" size={14} className="bg-[#334155]" />
            {compare.has(listing.id) ? "Added" : "Compare"}
          </button>
        </div>
      </section>

      <section className={`${CARD} p-5`}>
        <div className="flex items-center gap-3">
          <span className="relative block size-[52px] shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
            <Image src={agent.avatar} alt={agent.name} fill className="object-cover" sizes="52px" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="truncate text-[15px] font-bold leading-[22px] text-[#0f172a]">{agent.name}</p>
            <p className="truncate text-xs leading-[17px] text-gray-500">{agent.role}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {agent.badges.map((badge) => (
            <span key={badge} className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium leading-[14px] text-[#16a34a]">
              {badge}
            </span>
          ))}
        </div>
        <p className="text-xs leading-[17px] text-gray-500">{agent.stats}</p>
        <button
          type="button"
          onClick={() => router.push("/messages")}
          className="h-10 w-full rounded-[10px] bg-[#eff5ff] px-4 text-sm font-medium text-brand-900 hover:bg-[#e2edff]"
        >
          Message {agent.name.split(" ")[0]}
        </button>
      </section>

      <section className={`${CARD} gap-2`}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Buy safely</h2>
        <p className="text-xs leading-[17px] text-gray-500">
          Never pay a deposit before you have seen the property and the documents. Report anything suspicious.
        </p>
        <button type="button" onClick={comingSoon("Report this listing")} className="self-start text-[13px] font-medium leading-[19px] text-[#dc2626]">
          Report this listing
        </button>
      </section>

      <section className={`${CARD} gap-2`}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Want help buying?</h2>
        <p className="text-xs leading-[17px] text-gray-500">
          Concierge can line up a surveyor and a lawyer to check this property before you pay.
        </p>
        <Button variant="outline" onClick={() => router.push("/concierge")} className={`h-9 ${ROUNDED}`}>
          Ask Concierge
        </Button>
      </section>
      <RequestViewingModal
        open={viewingOpen}
        onClose={() => setViewingOpen(false)}
        property={{ title: listing.title, summary: `${listing.location.split(",")[0]} · ${listing.price}`, image: listing.image, agentName: agent.name.split(" ")[0] }}
      />
    </DetailAside>
  );
}
