"use client";

import { useRef, useState } from "react";
import { AnchoredPanel } from "@/components/shared/AnchoredPanel";
import { NavIcon } from "@/components/shared/NavIcon";
import { VisibilityRow } from "@/components/shared/VisibilityRow";
import type { FilterOption } from "@/components/shared/FilterDropdown";
import { cn } from "@/lib/utils";

const ROW_HEIGHT = 40;
const MAX_PANEL_HEIGHT = 300;

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly FilterOption[];
  /** Shown while `value` matches no option. */
  placeholder?: string;
  "aria-label"?: string;
  invalid?: boolean;
  /** Sizing and spacing for the field itself. */
  className?: string;
}

/** A form field whose options open in the app's frosted dropdown panel instead of the browser's own list. */
export function SelectField({ value, onChange, options, placeholder, invalid, className, "aria-label": ariaLabel }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const selected = options.find((option) => option.value === value);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-12 w-full min-w-0 items-center gap-2 rounded-xl border bg-white px-3 text-left text-sm focus-visible:border-brand-900 focus-visible:outline-none",
          invalid ? "border-[#dc2626]" : open ? "border-brand-900" : "border-gray-200",
          className,
        )}
      >
        <span className={cn("min-w-0 flex-1 truncate", selected ? "text-[#0f172a]" : "text-[#94a3b8]")}>{selected?.label ?? placeholder ?? ""}</span>
        <NavIcon icon="/icons/poll-chevron-down.svg" size={14} className={cn("bg-gray-500 transition-transform duration-150", open && "rotate-180")} />
      </button>

      <AnchoredPanel open={open} onClose={() => setOpen(false)} triggerRef={triggerRef} estimatedHeight={Math.min(MAX_PANEL_HEIGHT, 40 + options.length * ROW_HEIGHT)}>
        <div className="flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: MAX_PANEL_HEIGHT }}>
          {options.map((option) => (
            <VisibilityRow
              key={option.value}
              label={option.label}
              selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            />
          ))}
        </div>
      </AnchoredPanel>
    </>
  );
}
