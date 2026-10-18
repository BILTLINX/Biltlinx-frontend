"use client";

import type { ReactNode } from "react";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { WizardSteps } from "@/components/shared/ModalFormParts";
import { cn } from "@/lib/utils";

interface WizardDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** The line under the title; in a multi-step flow it is hidden on short screens to make room. */
  subtitle: string;
  /** Step names for a multi-step flow; leave out for a single-step dialog. */
  steps?: string[];
  /** 1-based number of the step being shown. */
  current?: number;
  /** Fill the screen's height (multi-step flows, so every step is the same size) or fit the content. */
  fixedHeight?: boolean;
  /** Footer text on the left. */
  hint: string;
  backLabel?: string;
  nextLabel: string;
  onBack: () => void;
  onNext: () => void;
  children: ReactNode;
}

/**
 * The frame shared by the multi-step request dialogs (consultation, quote): title and close button, step bars, a body
 * that fits the screen without scrolling, and a footer with a hint, Back and the main action.
 */
export function WizardDialog({
  open,
  onClose,
  title,
  subtitle,
  steps,
  current = 1,
  fixedHeight = true,
  hint,
  backLabel = "Back",
  nextLabel,
  onBack,
  onNext,
  children,
}: WizardDialogProps) {
  return (
    <CenteredDialog open={open} onClose={onClose} labelledBy="wizard-dialog-title" className={cn("max-w-[560px]", fixedHeight && "h-[min(calc(100dvh-2rem),820px)]")}>
      <div className="flex flex-col gap-1 border-b border-gray-200 px-5 pb-3 pt-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <h2 id="wizard-dialog-title" className="text-lg font-bold leading-7 text-[#0f172a] sm:text-xl">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-1 shrink-0 p-1 text-lg leading-[26px] text-gray-500 hover:text-[#0f172a]">
            ✕
          </button>
        </div>
        <p className={cn("text-[13px] leading-[19px] text-gray-500", steps && "[@media(max-height:800px)]:hidden")}>{subtitle}</p>
        {steps && <WizardSteps steps={steps} current={current} />}
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-5 py-4 sm:px-6 [@media(max-height:860px)]:gap-2 [@media(max-height:860px)]:py-3",
          // On short screens the whole form scales down a little; it never scrolls.
          "[@media(max-height:720px)_and_(min-height:661px)]:[zoom:0.88] [@media(max-height:660px)_and_(min-height:601px)]:[zoom:0.8] [@media(max-height:600px)]:[zoom:0.72]",
        )}
      >
        {children}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-3 border-t border-gray-200 bg-[#f8fafc] px-5 py-3 sm:px-6">
        <p className="min-w-[200px] flex-1 text-xs leading-[17px] text-gray-500">{hint}</p>
        <div className="ml-auto flex gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="h-10 rounded-[10px] border border-gray-200 bg-white px-[18px] text-sm font-medium text-[#0f172a] hover:bg-gray-50"
          >
            {backLabel}
          </button>
          <button
            type="button"
            onClick={onNext}
            className="h-10 whitespace-nowrap rounded-[10px] bg-brand-900 px-[18px] text-sm font-medium text-white hover:bg-brand-900/90"
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </CenteredDialog>
  );
}
