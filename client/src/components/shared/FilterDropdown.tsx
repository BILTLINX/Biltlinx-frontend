"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

type FilterDropdownProps = {
  /** The filter's name, shown before its value and as the menu heading. */
  label: string;
  options: FilterOption[];
  className?: string;
} & (
  | { multiple?: false; value: string; onChange: (value: string) => void }
  | { multiple: true; value: string[]; onChange: (value: string[]) => void; /** Shown when nothing is picked. */ anyLabel?: string }
);

/** An icon from /icons placed in a square box with the padding it was exported with. */
function BoxIcon({ name, size, inset, bleed }: { name: string; size: number; inset: string; bleed: string }) {
  return (
    <span aria-hidden className="relative block shrink-0" style={{ width: size, height: size }}>
      <span className="absolute" style={{ inset }}>
        <span className="absolute" style={{ inset: bleed }}>
          <Image src={`/icons/${name}.svg`} alt="" fill className="max-w-none" />
        </span>
      </span>
    </span>
  );
}

const OPTION = "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] text-left text-sm";

/**
 * The filter that replaces a row of tabs or chips (Figma node 1228:37927): a "Label  Value" button that opens a menu.
 * Single choice closes on pick; `multiple` shows checkboxes with Clear and Apply.
 */
export function FilterDropdown(props: FilterDropdownProps) {
  const { label, options, className } = props;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);
  const root = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function close(event: MouseEvent | KeyboardEvent) {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const selected = props.multiple ? props.value : [];
  const summary = props.multiple
    ? selected.length === 0
      ? (props.anyLabel ?? "Any")
      : selected.length === 1
        ? (options.find((option) => option.value === selected[0])?.label ?? selected[0])
        : `${selected.length} selected`
    : (options.find((option) => option.value === props.value)?.label ?? options[0]?.label ?? "");

  function toggle() {
    if (!open && props.multiple) setDraft(props.value);
    setOpen((current) => !current);
  }

  function pick(value: string) {
    if (props.multiple) {
      setDraft((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
      return;
    }
    props.onChange(value);
    setOpen(false);
  }

  function apply(values: string[]) {
    if (props.multiple) props.onChange(values);
    setOpen(false);
  }

  return (
    <div ref={root} className={cn("relative self-start", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={toggle}
        className={cn(
          "flex items-center gap-2 rounded-[10px] py-2.5 pl-3.5 pr-3 text-sm",
          open ? "border-[1.5px] border-brand-900 bg-white py-[9.25px] pl-[13.25px] pr-[11.25px]" : "border border-[#e2e8f0] bg-white hover:border-[#cbd5e1] hover:bg-[#f8fafc]",
        )}
      >
        <BoxIcon name="filter-list" size={18} inset="20.83% 16.67% 16.67%" bleed="-3.33% -3.13% 0" />
        <span className="font-medium text-[#64748b]">{label}</span>
        <span className="font-semibold text-[#0f172a]">{summary}</span>
        {open && props.multiple && selected.length > 1 && <span className="rounded-full bg-brand-900 px-[7px] py-px text-[11px] font-semibold text-white">{selected.length}</span>}
        <span className={cn("block shrink-0", open && "rotate-180")}>
          <BoxIcon name="filter-chevron-down" size={16} inset="37.5% 25%" bleed="-8.33% -4.17% -4.88%" />
        </span>
      </button>

      {open && (
        <div
          id={menuId}
          role="listbox"
          aria-label={label}
          aria-multiselectable={props.multiple || undefined}
          className="absolute left-0 top-[calc(100%+6px)] z-30 flex w-[300px] max-w-[calc(100vw-32px)] flex-col gap-0.5 rounded-xl border border-[#e2e8f0] bg-white p-2 shadow-[0_12px_32px_-6px_rgba(15,23,41,0.12)]"
        >
          <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.66px] text-[#94a3b8]">{label}</p>

          {props.multiple
            ? options.map((option) => {
                const checked = draft.includes(option.value);
                return (
                  <button key={option.value} type="button" role="option" aria-selected={checked} onClick={() => pick(option.value)} className={cn(OPTION, "font-medium text-[#334155] hover:bg-gray-50")}>
                    <span className={cn("relative flex size-[18px] shrink-0 items-center justify-center rounded-[5px]", checked ? "bg-brand-900" : "border-[1.5px] border-[#cbd5e1] bg-white")}>
                      {checked && <BoxIcon name="filter-tick-white" size={14} inset="27.08% 20.83%" bleed="-4.55% -3.57%" />}
                    </span>
                    <span className="min-w-0 flex-1">{option.label}</span>
                  </button>
                );
              })
            : options.map((option) => {
                const active = option.value === props.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => pick(option.value)}
                    className={cn(OPTION, active ? "bg-[#eff5ff] font-semibold text-brand-900" : "font-medium text-[#334155] hover:bg-gray-50")}
                  >
                    <span className="min-w-0 flex-1">{option.label}</span>
                    {active && <BoxIcon name="filter-tick" size={16} inset="27.08% 20.83%" bleed="-4.55% -3.57%" />}
                  </button>
                );
              })}

          {props.multiple && (
            <>
              <div className="h-px w-full bg-[#f1f5f9]" />
              <div className="flex items-center justify-between pb-0.5 pl-2.5 pr-1 pt-1.5">
                <button type="button" onClick={() => apply([])} className="text-[13px] font-semibold text-[#64748b] hover:text-[#0f172a]">
                  Clear
                </button>
                <button type="button" onClick={() => apply(draft)} className="rounded-lg bg-brand-900 px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90">
                  Apply
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
