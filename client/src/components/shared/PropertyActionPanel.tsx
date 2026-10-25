"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { DetailAside } from "@/components/shared/DetailAside";
import { EnquiryModal } from "@/components/shared/EnquiryModal";
import { NavIcon } from "@/components/shared/NavIcon";
import { RequestViewingModal } from "@/components/shared/RequestViewingModal";
import { Button } from "@/components/ui/Button";
import { useCompare } from "@/context/CompareContext";
import { useStartConversation } from "@/hooks/useMessaging";
import { useReportUnavailable } from "@/hooks/useProperties";
import type { PropertyDetailView } from "@/lib/property-mapper";
import { shareContent } from "@/lib/share";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4";
const ROUNDED = "rounded-[10px] lg:rounded-[10px]";

/** The right column of a property page (Figma node 1052:23834): price and viewing actions, the lister, safety advice and Concierge. */
export function PropertyActionPanel({ detail }: { detail: PropertyDetailView }) {
  const router = useRouter();
  const [viewingOpen, setViewingOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const compare = useCompare();
  const { card, property } = detail;
  const owner = property.owner;
  const report = useReportUnavailable(property.id);
  const message = useStartConversation();
  const isRental = property.listingType === "Rent";
  const unavailable = property.availability !== null && property.availability !== "Available";

  function reportListing() {
    report.mutate(undefined, { onSuccess: () => showSuccessToast("Thanks. We will check whether it is still available.") });
  }

  return (
    <DetailAside className="xl:w-[360px]">
      <section className={`${CARD} gap-3.5 p-5`}>
        <p className="text-[22px] font-bold leading-[30px] text-[#0f172a]">
          {card.price}
          {card.priceUnit && <span className="text-sm font-medium text-gray-500"> / {card.priceUnit}</span>}
        </p>
        <p className="text-xs leading-[17px] text-gray-500">{detail.priceNote}</p>
        {property.isOwn ? (
          <Button variant="outline" onClick={() => router.push("/manage/listings")} className={`h-11 ${ROUNDED}`}>
            Manage this listing
          </Button>
        ) : (
          <>
            <Button variant="primary" onClick={() => setViewingOpen(true)} disabled={unavailable} className={`h-12 ${ROUNDED}`}>
              Request viewing
            </Button>
            <Button variant="outline" onClick={() => setEnquiryOpen(true)} disabled={unavailable} className={`h-11 ${ROUNDED}`}>
              Make an enquiry
            </Button>
            {unavailable && <p className="text-xs leading-[17px] text-[#b45309]">This property is {property.availability?.toLowerCase()}.</p>}
          </>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => shareContent({ title: card.title, path: `/properties/${property.id}` })}
            className="flex items-center justify-center gap-1.5 rounded-[10px] border border-gray-200 py-2 text-[13px] font-medium leading-[19px] text-[#334155] hover:bg-gray-50"
          >
            <NavIcon icon="/icons/post-options-copy-link.svg" size={14} className="bg-[#334155]" />
            Share
          </button>
          <button
            type="button"
            onClick={() =>
              compare.toggle({
                id: property.id,
                kind: "home",
                title: card.title,
                price: card.price,
                subtitle: card.location,
                image: card.image,
                href: `/properties/${property.id}`,
              })
            }
            aria-pressed={compare.has(property.id)}
            className="flex items-center justify-center gap-1.5 rounded-[10px] border border-gray-200 py-2 text-[13px] font-medium leading-[19px] text-[#334155] hover:bg-gray-50"
          >
            <NavIcon icon="/icons/post-options-compare.svg" size={14} className="bg-[#334155]" />
            {compare.has(property.id) ? "Added" : "Compare"}
          </button>
        </div>
      </section>

      <section className={`${CARD} p-5`}>
        <div className="flex items-center gap-3">
          <span className="relative block size-[52px] shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
            <Image src={owner.profilePicUrl ?? "/icons/avatar-placeholder-user.svg"} alt={owner.username ?? ""} fill className="object-cover" sizes="52px" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="truncate text-[15px] font-bold leading-[22px] text-[#0f172a]">{owner.username}</p>
            {owner.organizationName && owner.organizationName !== owner.username && (
              <p className="truncate text-xs leading-[17px] text-gray-500">{owner.organizationName}</p>
            )}
          </div>
        </div>
        {owner.isVerified && (
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium leading-[14px] text-[#16a34a]">Verified ✓</span>
          </div>
        )}
        {!property.isOwn && (
          <button
            type="button"
            disabled={message.isPending}
            onClick={() =>
              message.mutate(
                { recipientAccountId: owner.id, contextType: "Property", contextId: property.id, contextTitle: card.title },
                { onSuccess: (conversation) => router.push(`/messages?c=${conversation.id}`) },
              )
            }
            className="h-10 w-full rounded-[10px] bg-[#eff5ff] px-4 text-sm font-medium text-brand-900 hover:bg-[#e2edff] disabled:opacity-60"
          >
            Message {owner.username}
          </button>
        )}
      </section>

      <section className={`${CARD} gap-2`}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">{isRental ? "Rent safely" : "Buy safely"}</h2>
        <p className="text-xs leading-[17px] text-gray-500">
          Never pay a deposit before you have seen the property and the documents. Report anything suspicious.
        </p>
        {!property.isOwn && (
          <button
            type="button"
            disabled={report.isPending || report.isSuccess}
            onClick={reportListing}
            className="self-start text-[13px] font-medium leading-[19px] text-[#dc2626] disabled:opacity-60"
          >
            {report.isSuccess ? "Reported. Thank you." : "Report as no longer available"}
          </button>
        )}
      </section>

      <RequestViewingModal
        open={viewingOpen}
        onClose={() => setViewingOpen(false)}
        property={{
          id: property.id,
          title: card.title,
          summary: `${property.city ?? "Ghana"} · ${card.price}`,
          image: card.image,
          agentName: owner.username ?? undefined,
        }}
      />
      <EnquiryModal
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        listingId={property.id}
        title={card.title}
        isRental={isRental}
        currency={property.currency ?? "GHS"}
      />
    </DetailAside>
  );
}
