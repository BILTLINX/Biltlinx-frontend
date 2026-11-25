"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { WizardSteps } from "@/components/shared/ModalFormParts";
import { cn } from "@/lib/utils";

/** What a listing form reports when it is done, for the "it's sent" dialog: what happened, a summary, and where to see it. */
export interface ListingSubmitted {
  title: string;
  message: string;
  rows: { label: string; value: string }[];
  manageHref: string;
}

interface ListingFormLayoutProps {
  titleId: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  headerAction?: ReactNode;
  /** Step names for a step-by-step form, with the 0-based `step` it is on. */
  steps?: string[];
  step?: number;
  /** How the listing will look. With steps, it turns the frame into the steps rail, live preview and form layout of the marketplace listing dialog. */
  preview?: ReactNode;
  /** A short card at the foot of the steps rail. */
  railNote?: { title: string; body: string };
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * The frame every create dialog shares: a titled header with its step bars, a body that holds one step at a time, and a pinned footer.
 * Give it `steps` and a `preview` and it becomes the marketplace listing layout instead: steps down the left, the live preview in the middle (on wide screens; a Preview button swaps it in on narrower ones) and the form on the right.
 */
export function ListingFormLayout({ titleId, title, subtitle, onClose, headerAction, steps, step = 0, preview, railNote, footer, children }: ListingFormLayoutProps) {
  const [previewing, setPreviewing] = useState(false);

  if (!steps || !preview) {
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

  return (
    <div className="flex min-h-0 flex-1">
      <nav aria-label="Steps" className="hidden w-[190px] shrink-0 flex-col border-r border-gray-200 p-5 lg:flex">
        <h2 id={titleId} className="text-base font-bold leading-6 text-[#0f172a]">
          {title}
        </h2>
        <ol className="mt-5 flex flex-col gap-4">
          {steps.map((name, index) => (
            <li key={name} aria-current={index === step ? "step" : undefined} className={cn("flex flex-col border-l-[3px] pl-3 leading-[1.35]", index === step ? "border-brand-900" : "border-transparent")}>
              <span className={cn("flex items-center gap-1.5 text-[13px]", index === step ? "text-brand-900" : index < step ? "text-[#334155]" : "text-[#94a3b8]")}>
                Step {index + 1}/{steps.length}
                {index < step && <Image src="/icons/checkmark-badge-01.svg" alt="Done" width={14} height={14} />}
              </span>
              <span className={cn("text-[15px] font-semibold", index === step ? "text-[#0f172a]" : index < step ? "text-[#334155]" : "text-[#94a3b8]")}>{name}</span>
            </li>
          ))}
        </ol>
        {railNote && (
          <div className="mt-auto flex flex-col gap-1 rounded-xl bg-[#f8fafc] p-3">
            <p className="text-[13px] font-semibold text-[#0f172a]">{railNote.title}</p>
            <p className="text-xs leading-[17px] text-gray-500">{railNote.body}</p>
          </div>
        )}
      </nav>

      <aside className="hidden w-[320px] shrink-0 flex-col justify-center gap-4 overflow-y-auto border-r border-gray-200 bg-[#f1f5f9] p-5 xl:flex">
        {preview}
        <p className="text-center text-[13px] text-gray-500">Updates as you fill in each step.</p>
      </aside>

      {/* A container, so the form's columns follow the room it has rather than the screen. */}
      <div className="@container flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 flex-col px-5 pt-4 sm:px-7 sm:pt-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-base font-bold leading-6 text-[#0f172a] lg:hidden">{title}</p>
            <div className="ml-auto flex items-center gap-2">
              {headerAction}
              <span className="xl:hidden">
                <PreviewToggle previewing={previewing} onToggle={() => setPreviewing((current) => !current)} />
              </span>
              <button type="button" aria-label="Close" onClick={onClose} className="flex size-8 shrink-0 items-center justify-center rounded-full text-lg leading-none text-gray-500 hover:bg-gray-100">
                ×
              </button>
            </div>
          </div>
          <div className="lg:hidden">
            <WizardSteps steps={steps} current={step + 1} />
          </div>
        </div>

        <div className="flex min-h-[300px] flex-1 flex-col gap-3.5 overflow-y-auto px-5 py-3 sm:px-7">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-bold leading-7 text-[#0f172a]">{steps[step]}</h3>
            {subtitle && <p className="text-sm leading-5 text-gray-500">{subtitle}</p>}
          </div>
          {/* Hidden, not removed, while the preview is showing, so nothing typed in the form is lost. */}
          <div className={cn("flex flex-col gap-3.5", previewing && "max-xl:hidden")}>{children}</div>
          {previewing && <div className="mx-auto w-full max-w-[420px] xl:hidden">{preview}</div>}
        </div>

        {footer && <div className="flex shrink-0 flex-col gap-3 px-5 pb-4 pt-2 sm:px-7 sm:pb-5">{footer}</div>}
      </div>
    </div>
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

/** The heading over a listing preview, with a line saying where it will look like this. */
export function PreviewPane({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <p className="text-[15px] font-bold text-[#0f172a]">Preview</p>
        <p className="text-[13px] text-gray-500">{caption}</p>
      </div>
      {children}
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
