"use client";

import { useRef, useState } from "react";
import { AnchoredPanel } from "@/components/shared/AnchoredPanel";
import { NavIcon } from "@/components/shared/NavIcon";
import { VisibilityRow } from "@/components/shared/VisibilityRow";
import { cn } from "@/lib/utils";

export const DURATION_OPTIONS = ["1 day", "3 days", "A week", "A month"];

interface PollDurationDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options?: string[];
}

/** Poll-duration picker (Figma node 480:69019) — a floating menu anchored to
 * its trigger, so it sizes to whatever width the trigger is given and works
 * the same way on both the desktop and mobile composers. */
export function PollDurationDropdown({ value, onChange, options = DURATION_OPTIONS }: PollDurationDropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-12 w-full items-center justify-between rounded-2xl border border-[#cbd5e0] bg-white px-3 text-left text-sm text-[#0f1621]"
      >
        <span>{value}</span>
        <NavIcon
          icon="/icons/poll-chevron-down.svg"
          color="night"
          size={16}
          className={cn("shrink-0 transition-transform duration-150", open && "rotate-180")}
        />
      </button>

      <AnchoredPanel open={open} onClose={() => setOpen(false)} triggerRef={triggerRef} estimatedHeight={40 + options.length * 40}>
        {options.map((option) => (
          <VisibilityRow
            key={option}
            label={option}
            selected={option === value}
            onClick={() => {
              onChange(option);
              setOpen(false);
            }}
          />
        ))}
      </AnchoredPanel>
    </>
  );
}
