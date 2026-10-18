import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared building blocks of the Account settings tabs (Security, Billing, General settings). */
export const SETTINGS_CARD = "flex flex-col gap-1 rounded-2xl border border-gray-200 bg-white p-5";
export const SETTINGS_ROW = "flex items-center justify-between gap-4 border-t border-gray-200 py-3.5";
export const OUTLINE_BUTTON = "h-9 shrink-0 whitespace-nowrap rounded-[10px] border border-gray-200 bg-white px-4 text-[13px] font-medium text-[#0f1621] hover:bg-gray-50";
export const DANGER_BUTTON = "h-9 shrink-0 whitespace-nowrap rounded-[10px] border border-[#fca5a5] bg-white px-4 text-[13px] font-medium text-[#dc2626] hover:bg-[#fef2f2]";

export function SectionHeading({ title, note, action }: { title: string; note?: string; action?: ReactNode }) {
  return (
    <div className="mb-1 flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <h2 className="text-[15px] font-semibold leading-[22px] text-[#0f1621]">{title}</h2>
        {note && <p className="text-xs leading-[17px] text-gray-500">{note}</p>}
      </div>
      {action}
    </div>
  );
}

/** A setting's name with a one-line explanation under it. */
export function RowText({ title, note }: { title: string; note?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <p className="text-[13px] leading-[19px] text-[#0f1621]">{title}</p>
      {note && <p className="text-xs leading-[17px] text-gray-500">{note}</p>}
    </div>
  );
}

export function Switch({ checked, label, onToggle }: { checked: boolean; label: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={cn("flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors", checked ? "bg-brand-900" : "bg-[#cbd5e1]")}
    >
      <span className={cn("size-4 rounded-full bg-white transition-transform", checked && "translate-x-4")} />
    </button>
  );
}
