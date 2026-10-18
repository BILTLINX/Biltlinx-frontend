import Image from "next/image";
import { NavIcon } from "@/components/shared/NavIcon";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The bordered box around a text input in the request dialogs. */
export const FIELD_BOX = "flex h-11 [@media(max-height:860px)]:h-10 items-center gap-2 rounded-[10px] border bg-white px-3.5 focus-within:border-brand-900";
export const FIELD_INPUT = "min-w-0 flex-1 bg-transparent text-[13px] leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none sm:text-sm";

/** A labelled group of controls with an optional error line. */
export function FormField({ label, error, children, className }: { label: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">{label}</span>
      {children}
      {error && <span className="text-xs leading-[17px] text-[#dc2626]">{error}</span>}
    </div>
  );
}

/** A pill choice: `radio` for pick-one groups, `checkbox` for pick-many. */
export function ChoiceChip({ label, selected, onClick, role }: { label: string; selected: boolean; onClick: () => void; role: "radio" | "checkbox" }) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-[13px] font-medium leading-[19px] [@media(max-height:860px)]:py-1",
        selected ? "border-brand-900 bg-[#eff5ff] text-brand-900" : "border-gray-200 bg-white text-[#334155] hover:bg-gray-50",
      )}
    >
      {label}
    </button>
  );
}

/** The step bars under a multi-step dialog's title; every step up to and including `current` (1-based) is filled. */
export function WizardSteps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex gap-1.5 pt-2" aria-label="Steps">
      {steps.map((step, index) => {
        const reached = index < current;
        return (
          <li key={step} aria-current={index === current - 1 ? "step" : undefined} className="flex flex-1 flex-col gap-1.5">
            <span className={cn("h-1 rounded-sm", reached ? "bg-brand-900" : "bg-gray-200")} />
            <span
              className={cn(
                "text-[11px] leading-4",
                index === current - 1 ? "font-semibold text-brand-900" : reached ? "font-medium text-brand-900" : "font-medium text-[#94a3b8]",
              )}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** The grey card at the top of each step saying who or what the request is for: a photo, a title and a line of detail. */
export function SummaryRow({ image, title, subtitle, round }: { image?: string; title: string; subtitle: string; round?: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-3 rounded-xl bg-[#f8fafc] p-2.5">
      <span className={cn("relative block shrink-0 overflow-hidden bg-[#eef2ff]", round ? "size-11 rounded-full" : "h-11 w-14 rounded-lg")}>
        {image ? (
          <Image src={image} alt="" fill className="object-cover" sizes="56px" />
        ) : (
          <span className="flex size-full items-center justify-center bg-[#eff5ff]">
            <NavIcon icon="/icons/clipboard-list-01.svg" size={20} className="bg-brand-900" />
          </span>
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-sm font-semibold leading-5 text-[#0f172a]">{title}</p>
        <p className="truncate text-xs leading-[17px] text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

/** A label/value list for the review step. */
export function ReviewList({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="flex flex-col gap-2 rounded-xl border border-gray-200 p-3.5 text-[13px] leading-[19px]">
      {rows.map((row) => (
        <div key={row.label} className="flex items-start justify-between gap-4">
          <dt className="shrink-0 text-gray-500">{row.label}</dt>
          <dd className="min-w-0 text-right font-medium text-[#0f172a]">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The blue switch strip under a job form, e.g. "also send to similar providers". */
export function SwitchStrip({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className="flex shrink-0 items-center gap-2.5 rounded-[10px] bg-[#eff5ff] p-3 text-left text-[13px] font-medium leading-[19px] text-brand-900 [@media(max-height:860px)]:p-2.5"
    >
      <NavIcon icon="/icons/message-lock-02.svg" size={16} className="bg-brand-900" />
      <span className="min-w-0 flex-1">{label}</span>
      <span className={cn("flex size-[18px] shrink-0 items-center justify-center rounded-md border text-[11px] font-bold", checked ? "border-brand-900 bg-brand-900 text-white" : "border-brand-900/40 bg-white text-transparent")}>
        ✓
      </span>
    </button>
  );
}
