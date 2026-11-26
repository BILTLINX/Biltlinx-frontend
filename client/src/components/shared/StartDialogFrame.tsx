"use client";

import type { ReactNode } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/** A multi-line field in the start dialogs. */
export const START_TEXTAREA = "h-[88px] resize-none rounded-[10px] border border-[#e2e8f0] bg-white px-3.5 py-3 text-sm leading-[22px] text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#1465e6] focus:shadow-[0_0_0_3px_rgba(20,101,230,0.15)] focus:outline-none";
/** Add to a field's box so it shows the blue focus ring. */
export const START_INPUT_BOX = "focus-within:shadow-[0_0_0_3px_rgba(20,101,230,0.15)]";
export const START_HINT = "text-xs leading-[17px] text-[#64748a]";

/** One pick-one choice in a start dialog: a pill, with a tick once it is chosen. */
export function TickChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium leading-[19px]",
        selected ? "border-[#1465e6] bg-[#eff5ff] text-[#1465e6]" : "border-[#e2e8f0] bg-white text-[#334155] hover:bg-gray-50",
      )}
    >
      {selected && <NavIcon icon="/icons/visibility-tick-check.svg" size={14} className="bg-[#1465e6]" />}
      {label}
    </button>
  );
}

interface StartDialogFrameProps {
  titleId: string;
  title: string;
  subtitle: string;
  onClose: () => void;
  /** The main action. Leave out to show no footer. */
  primary?: { label: string; onClick: () => void; disabled?: boolean };
  children: ReactNode;
}

/**
 * The frame of the "Start a community" and "Create an event" dialogs (Figma nodes 1684:54058, 1684:54066, 1684:54110): a titled header with a close button, a body, and a grey footer with Cancel and the main action.
 * On short screens the body tightens up and scales down a little so it fits without scrolling.
 */
export function StartDialogFrame({ titleId, title, subtitle, onClose, primary, children }: StartDialogFrameProps) {
  return (
    <>
      <div className="flex shrink-0 items-start gap-3 border-b border-[#e2e8f0] px-7 pb-4 pt-5">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 id={titleId} className="text-xl font-bold leading-7 text-[#0f172a]">
            {title}
          </h2>
          <p className="text-[13px] leading-[19px] text-[#64748a] [@media(max-height:800px)]:hidden">{subtitle}</p>
        </div>
        <button type="button" aria-label="Close" onClick={onClose} className="flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-gray-100">
          <NavIcon icon="/icons/community-close.svg" size={20} className="bg-[#64748a]" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-7 py-5 [@media(max-height:860px)]:gap-4 [@media(max-height:860px)]:py-4 [@media(max-height:720px)_and_(min-height:661px)]:[zoom:0.88] [@media(max-height:660px)_and_(min-height:601px)]:[zoom:0.8] [@media(max-height:600px)]:[zoom:0.72]">
        {children}
      </div>

      {primary && (
        <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-[#e2e8f0] bg-[#f8fafc] px-7 py-3.5">
          <button type="button" onClick={onClose} className="h-11 rounded-[10px] border border-[#e2e8f0] bg-white px-5 text-sm font-medium leading-5 text-[#0f172a] hover:bg-gray-50">
            Cancel
          </button>
          <Button variant="primary" onClick={primary.onClick} disabled={primary.disabled} className="h-11 w-auto rounded-[10px] px-5 text-sm font-medium lg:rounded-[10px]">
            {primary.label}
          </Button>
        </div>
      )}
    </>
  );
}
