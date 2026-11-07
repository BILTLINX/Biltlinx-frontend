import type { ReactNode } from "react";
import { WizardSteps } from "@/components/shared/ModalFormParts";

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
