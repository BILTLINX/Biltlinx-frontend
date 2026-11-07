"use client";

import { useState } from "react";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { ListingFormLayout } from "@/components/shared/ListingFormLayout";
import { NavIcon } from "@/components/shared/NavIcon";
import { PropertyListingForm } from "@/components/shared/PropertyListingForm";
import { ServiceListingForm } from "@/components/shared/ServiceListingForm";
import { StayListingForm } from "@/components/shared/StayListingForm";
import { cn } from "@/lib/utils";
import type { ListingKind } from "@/lib/listing-status";
import type { OfferingDto } from "@/types/api/schema";

/** What the dialog opens on: a kind to create, or an existing listing to carry on with or change. */
export type ListingTarget =
  | { kind: "property"; draftId?: string; editId?: string }
  | { kind: "stay"; stayId?: string }
  | { kind: "service"; offering?: OfferingDto };

const CHOICES: { kind: ListingKind; title: string; note: string; icon: string; flip?: boolean }[] = [
  { kind: "property", title: "Property", note: "For sale or to rent. Reviewed by our team before it goes live.", icon: "/icons/house-03.svg", flip: true },
  { kind: "stay", title: "Stay", note: "A hotel, guest house, hostel or short-let that guests book by the night.", icon: "/icons/bed-single-01.svg" },
  { kind: "service", title: "Service", note: "A job or trade you offer, with a price or a quote.", icon: "/icons/wrench-01.svg" },
];

interface CreateListingModalProps {
  /** Omit to start on the "what are you listing" choice. */
  initial?: ListingTarget | null;
  onClose: () => void;
}

/** The one place a lister creates or edits a property, stay or service, as a dialog. Mount it when needed; it keeps its own step. */
export function CreateListingModal({ initial = null, onClose }: CreateListingModalProps) {
  const [target, setTarget] = useState<ListingTarget | null>(initial);

  return (
    <CenteredDialog open onClose={onClose} labelledBy="listing-dialog-title" className={target ? "max-w-[760px]" : "max-w-[520px]"}>
      {!target && (
        <ListingFormLayout titleId="listing-dialog-title" title="What are you listing?" subtitle="Pick one. You can list the others later." onClose={onClose}>
          <div className="flex flex-col gap-3">
            {CHOICES.map((choice) => (
              <button
                key={choice.kind}
                type="button"
                onClick={() => setTarget({ kind: choice.kind })}
                className="flex items-center gap-3.5 rounded-2xl border border-gray-200 p-4 text-left hover:border-brand-900 hover:bg-[#f8fbff]"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eff5ff]">
                  <NavIcon icon={choice.icon} size={22} className={cn("bg-brand-900", choice.flip && "-scale-y-100")} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[15px] font-bold leading-[22px] text-[#0f172a]">{choice.title}</span>
                  <span className="text-[13px] leading-[19px] text-gray-500">{choice.note}</span>
                </span>
              </button>
            ))}
          </div>
        </ListingFormLayout>
      )}
      {target?.kind === "property" && <PropertyListingForm draftParam={target.draftId ?? null} editId={target.editId ?? null} onClose={onClose} />}
      {target?.kind === "stay" && <StayListingForm stayId={target.stayId ?? null} onClose={onClose} />}
      {target?.kind === "service" && <ServiceListingForm offering={target.offering ?? null} onClose={onClose} />}
    </CenteredDialog>
  );
}
