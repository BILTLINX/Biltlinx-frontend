"use client";

import { useState } from "react";
import { parseKey, todayKey, toKey } from "@/components/shared/ViewingSlotPickers";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4";

interface StayAvailabilityCalendarProps {
  /** yyyy-mm-dd, or "" when not chosen. */
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
}

function monthName(year: number, month: number, style: "long" | "short" = "long") {
  return new Date(year, month, 1).toLocaleDateString("en-GB", { month: style === "long" ? "long" : "short" });
}

/** The month calendar on a stay page (Figma node 1060:29915): pick a check-in then a check-out day; the nights between are shaded. Past days cannot be picked. */
export function StayAvailabilityCalendar({ checkIn, checkOut, onChange }: StayAvailabilityCalendarProps) {
  const min = todayKey();
  const [view, setView] = useState(() => {
    const start = parseKey(checkIn || min);
    return { year: start.getFullYear(), month: start.getMonth() };
  });
  const today = parseKey(min);
  const atEarliest = view.year === today.getFullYear() && view.month === today.getMonth();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  // The grid starts on Monday.
  const blanks = (new Date(view.year, view.month, 1).getDay() + 6) % 7;
  const cells: (number | null)[] = [...Array<null>(blanks).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  const previous = new Date(view.year, view.month - 1, 1);
  const next = new Date(view.year, view.month + 1, 1);

  function shift(delta: number) {
    const target = new Date(view.year, view.month + delta, 1);
    setView({ year: target.getFullYear(), month: target.getMonth() });
  }

  function pick(key: string) {
    // A first click, or a click after a full range, starts a new stay; a later day then ends it.
    if (!checkIn || checkOut || key <= checkIn) onChange(key, "");
    else onChange(checkIn, key);
  }

  return (
    <section id="availability" className={CARD}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-[#0f172a]">
          Availability · {monthName(view.year, view.month)} {view.year}
        </h2>
        <div className="flex items-center gap-3 text-[13px] font-medium text-brand-900">
          {!atEarliest && (
            <button type="button" onClick={() => shift(-1)}>
              ‹ {monthName(previous.getFullYear(), previous.getMonth(), "short")}
            </button>
          )}
          <button type="button" onClick={() => shift(1)}>
            {monthName(next.getFullYear(), next.getMonth())} ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1.5">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday} className="py-1 text-center text-xs text-gray-500">
            {weekday}
          </span>
        ))}
        {cells.map((day, index) => {
          if (day === null) return <span key={`blank-${index}`} />;
          const key = toKey(view.year, view.month, day);
          const past = key < min;
          const edge = key === checkIn || key === checkOut;
          const between = Boolean(checkIn && checkOut && key > checkIn && key < checkOut);
          return (
            <button
              key={key}
              type="button"
              disabled={past}
              aria-pressed={edge}
              onClick={() => pick(key)}
              className={cn(
                "mx-0.5 h-9 rounded-lg text-sm",
                past && "cursor-not-allowed text-[#cbd5e1]",
                !past && !edge && !between && "text-[#0f172a] hover:bg-[#f8fafc]",
                between && "bg-[#dbeafe] font-medium text-brand-900",
                edge && "bg-brand-900 font-semibold text-white",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-brand-900">
        <span aria-hidden className="size-2 bg-brand-900" />
        Selected
      </p>
    </section>
  );
}
