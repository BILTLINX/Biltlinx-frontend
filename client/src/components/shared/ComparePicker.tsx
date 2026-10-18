"use client";

import Image from "next/image";
import type { RefObject } from "react";
import { AnchoredPanel } from "@/components/shared/AnchoredPanel";
import { COMPARE_KIND_PLURAL, useCompare, type CompareKind } from "@/context/CompareContext";
import { getCompareCandidates } from "@/lib/compare-candidates";
import { cn } from "@/lib/utils";

interface ComparePickerProps {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  kind: CompareKind;
}

/** The pop-up list of other things of the same kind to add to the compare tray or the comparison page. */
export function ComparePicker({ open, onClose, triggerRef, kind }: ComparePickerProps) {
  const { has, toggle } = useCompare();
  const plural = COMPARE_KIND_PLURAL[kind];

  return (
    <AnchoredPanel open={open} onClose={onClose} triggerRef={triggerRef} estimatedHeight={360} minWidth={340}>
      <p className="px-1 pb-1 text-xs font-semibold leading-[17px] text-gray-500">Add {plural} to compare</p>
      <ul className="no-scrollbar flex max-h-[300px] flex-col gap-1 overflow-y-auto">
        {getCompareCandidates(kind).map((candidate) => {
          const added = has(candidate.id);
          return (
            <li key={candidate.id}>
              <button
                type="button"
                onClick={() => toggle(candidate)}
                aria-pressed={added}
                className={cn("flex w-full items-center gap-2.5 rounded-xl border p-1.5 text-left hover:bg-[#f8fafc]", added ? "border-brand-900/40 bg-[#f8fafc]" : "border-transparent")}
              >
                <span className="relative block size-10 shrink-0 overflow-hidden rounded-lg bg-[#eef2ff]">
                  <Image src={candidate.image} alt="" fill className="object-cover" sizes="40px" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col text-xs leading-[17px]">
                  <span className="truncate font-semibold text-[#0f172a]">{candidate.title}</span>
                  <span className="truncate text-gray-500">{candidate.price}</span>
                </span>
                <span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-medium leading-[17px]", added ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#eff5ff] text-brand-900")}>
                  {added ? "Added ✓" : "Add"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </AnchoredPanel>
  );
}
