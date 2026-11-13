import type { ReactNode } from "react";
import { ListingCard } from "@/components/shared/ListingCard";
import { WizardSteps } from "@/components/shared/ModalFormParts";
import type { ListingCardData } from "@/types/listing";

interface ListingFormLayoutProps {
  titleId: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  headerAction?: ReactNode;
  /** Step names for a step-by-step form, with the 0-based `step` it is on. */
  steps?: string[];
  step?: number;
  footer?: ReactNode;
  children: ReactNode;
}

/** The frame every create-listing form shares inside the dialog: a titled header with its step bars, a body that holds one step at a time, and a pinned footer. */
export function ListingFormLayout({ titleId, title, subtitle, onClose, headerAction, steps, step = 0, footer, children }: ListingFormLayoutProps) {
  return (
    <>
      <div className="flex shrink-0 flex-col border-b border-gray-200 px-5 pb-3 pt-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h2 id={titleId} className="text-lg font-bold leading-6 text-[#0f172a]">
              {title}
            </h2>
            {subtitle && <p className="text-[13px] leading-[19px] text-gray-500">{subtitle}</p>}
          </div>
          {headerAction}
          <button type="button" aria-label="Close" onClick={onClose} className="flex size-8 shrink-0 items-center justify-center rounded-full text-lg leading-none text-gray-500 hover:bg-gray-100">
            ×
          </button>
        </div>
        {steps && <WizardSteps steps={steps} current={step + 1} />}
      </div>
      <div className="flex min-h-[420px] flex-1 flex-col gap-4 overflow-y-auto px-5 py-4 sm:px-6">{children}</div>
      {footer && <div className="flex shrink-0 flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:px-6">{footer}</div>}
    </>
  );
}

/** The header button that swaps a listing form for how the listing will look. */
export function PreviewToggle({ previewing, onToggle }: { previewing: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="h-9 whitespace-nowrap rounded-[10px] bg-[#eff5ff] px-3.5 text-[13px] font-medium text-brand-900 hover:bg-[#e2edff]">
      {previewing ? "Back to editing" : "Preview"}
    </button>
  );
}

/** What the listing looks like in search results, and anything the card cannot show. */
export function ListingPreview({ listing, note }: { listing: ListingCardData; note?: string }) {
  return (
    <div className="mx-auto flex w-full max-w-[360px] flex-col gap-3">
      <h3 className="text-base font-bold leading-[23px] text-[#0f172a]">How it will look</h3>
      <div inert>
        <ListingCard listing={listing} />
      </div>
      {note && <p className="text-xs leading-[17px] text-gray-500">{note}</p>}
    </div>
  );
}

/** Back on the left, then the step's own buttons (Next, or the final actions). Back is hidden on the first step. */
export function WizardNav({ step, onBack, children }: { step: number; onBack: () => void; children: ReactNode }) {
  return (
    <div className="flex gap-2">
      {step > 0 && (
        <button type="button" onClick={onBack} className="h-11 shrink-0 rounded-[10px] border border-gray-200 px-5 text-sm font-medium text-[#0f172a] hover:bg-gray-50">
          Back
        </button>
      )}
      {children}
    </div>
  );
}
