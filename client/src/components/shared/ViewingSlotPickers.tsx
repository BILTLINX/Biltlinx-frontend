"use client";

import { useRef, useState } from "react";
import { AnchoredPanel } from "@/components/shared/AnchoredPanel";
import { NavIcon } from "@/components/shared/NavIcon";
import { VisibilityRow } from "@/components/shared/VisibilityRow";
import { cn } from "@/lib/utils";

export const TIME_SLOTS = ["8:00 am – 10:00 am", "10:00 am – 12:00 pm", "12:00 pm – 2:00 pm", "2:00 pm – 4:00 pm", "4:00 pm – 6:00 pm"];

const TRIGGER =
  "flex h-11 w-full [@media(max-height:860px)]:h-10 items-center gap-2 rounded-[10px] border bg-white px-3.5 text-left text-[13px] leading-5 text-[#0f172a] focus-visible:border-brand-900 focus-visible:outline-none sm:text-sm";
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Today as yyyy-mm-dd in the visitor's own time zone. */
export function todayKey() {
  const now = new Date();
  return toKey(now.getFullYear(), now.getMonth(), now.getDate());
}

function parseKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** "2026-10-24" → "Sat, 24 Oct 2026" */
export function formatDateKey(key: string) {
  return parseKey(key).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).replace(",", "");
}

interface DatePickerFieldProps {
  /** yyyy-mm-dd, or "" when nothing is chosen yet. */
  value: string;
  onChange: (value: string) => void;
  /** Earliest selectable day, yyyy-mm-dd. */
  min: string;
  invalid?: boolean;
}

/** Date field whose calendar opens in the app's frosted dropdown panel (the stay availability calendar's grid, one month at a time). */
export function DatePickerField({ value, onChange, min, invalid }: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [view, setView] = useState(() => {
    const start = parseKey(value || min);
    return { year: start.getFullYear(), month: start.getMonth() };
  });

  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  // The grid starts on Monday.
  const leadingBlanks = (new Date(view.year, view.month, 1).getDay() + 6) % 7;
  const cells: (number | null)[] = [...Array<null>(leadingBlanks).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const minDate = parseKey(min);
  const atEarliestMonth = view.year === minDate.getFullYear() && view.month === minDate.getMonth();

  function shiftMonth(delta: number) {
    const next = new Date(view.year, view.month + delta, 1);
    setView({ year: next.getFullYear(), month: next.getMonth() });
  }

  function toggle() {
    if (!open) {
      const start = parseKey(value || min);
      setView({ year: start.getFullYear(), month: start.getMonth() });
    }
    setOpen((v) => !v);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
        className={cn(TRIGGER, invalid ? "border-[#dc2626]" : open ? "border-brand-900" : "border-gray-200")}
      >
        <NavIcon icon="/icons/calendar-03.svg" size={16} className="bg-gray-500" />
        <span className={cn("min-w-0 flex-1 truncate", !value && "text-[#94a3b8]")}>{value ? formatDateKey(value) : "Choose a date"}</span>
      </button>

      <AnchoredPanel open={open} onClose={() => setOpen(false)} triggerRef={triggerRef} estimatedHeight={330} minWidth={290}>
        <div className="flex items-center justify-between gap-2 px-1 pb-1">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            disabled={atEarliestMonth}
            aria-label="Previous month"
            className="flex size-8 items-center justify-center rounded-lg hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <NavIcon icon="/icons/chevron-right-gray.svg" size={16} className="rotate-180 bg-[#334155]" />
          </button>
          <p className="text-[13.5px] font-semibold leading-5 text-[#0f172a]">{monthLabel}</p>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            className="flex size-8 items-center justify-center rounded-lg hover:bg-[#f8fafc]"
          >
            <NavIcon icon="/icons/chevron-right-gray.svg" size={16} className="bg-[#334155]" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((weekday) => (
            <span key={weekday} className="py-1 text-center text-xs font-medium leading-[17px] text-gray-500">
              {weekday}
            </span>
          ))}
          {cells.map((day, index) => {
            if (day === null) return <span key={`blank-${index}`} />;
            const key = toKey(view.year, view.month, day);
            const disabled = key < min;
            const selected = key === value;
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => {
                  onChange(key);
                  setOpen(false);
                }}
                className={cn(
                  "rounded-lg py-1.5 text-[13px] leading-[19px]",
                  disabled && "cursor-not-allowed font-medium text-[#cbd5e1]",
                  !disabled && !selected && "font-medium text-[#0f172a] hover:bg-[#f8fafc]",
                  selected && "bg-brand-900 font-semibold text-white",
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </AnchoredPanel>
    </>
  );
}

interface OptionSelectFieldProps {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  /** Shown while `value` is empty. */
  placeholder?: string;
  icon?: string;
  /** Narrowest the dropdown may be; it is otherwise as wide as the field. */
  minPanelWidth?: number;
}

/** A field whose options open in the app's frosted dropdown panel (the same rows as the visibility and poll-duration menus). */
export function OptionSelectField({ value, options, onChange, placeholder, icon, minPanelWidth = 0 }: OptionSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(TRIGGER, open ? "border-brand-900" : "border-gray-200")}
      >
        {icon && <NavIcon icon={icon} size={16} className="bg-gray-500" />}
        <span className={cn("min-w-0 flex-1 truncate", !value && "text-[#94a3b8]")}>{value || placeholder}</span>
        <NavIcon icon="/icons/poll-chevron-down.svg" size={14} className={cn("bg-gray-500 transition-transform duration-150", open && "rotate-180")} />
      </button>

      <AnchoredPanel open={open} onClose={() => setOpen(false)} triggerRef={triggerRef} estimatedHeight={40 + options.length * 40} minWidth={minPanelWidth}>
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

interface TimeSelectFieldProps {
  value: string;
  onChange: (value: string) => void;
}

/** Time-slot field. */
export function TimeSelectField({ value, onChange }: TimeSelectFieldProps) {
  return <OptionSelectField value={value} options={TIME_SLOTS} onChange={onChange} icon="/icons/timer-clock-watch.svg" minPanelWidth={210} />;
}
