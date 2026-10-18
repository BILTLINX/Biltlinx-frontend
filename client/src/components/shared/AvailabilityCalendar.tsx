"use client";

import { useRouter } from "next/navigation";
import { comingSoonHref } from "@/lib/coming-soon";
import { CALENDAR } from "@/lib/dummy-stay-detail";
import { isDayAvailable, type Selection } from "@/lib/stay-booking";
import { cn } from "@/lib/utils";

const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface AvailabilityCalendarProps {
  selection: Selection;
  onSelectDay: (day: number) => void;
}

/** The month's availability (Figma node 1060:30135): pick a check-in and a check-out among the free days. */
export function AvailabilityCalendar({ selection, onSelectDay }: AvailabilityCalendarProps) {
  const router = useRouter();
  const { checkIn, checkOut } = selection;
  const firstOfMonth = new Date(CALENDAR.year, CALENDAR.month, 1);
  const daysInMonth = new Date(CALENDAR.year, CALENDAR.month + 1, 0).getDate();
  // The grid starts on Monday.
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array<null>(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Availability · {CALENDAR.monthLabel}</h2>
        <button
          type="button"
          onClick={() => router.push(comingSoonHref("Next month"))}
          className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900"
        >
          November ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-1.5">
        {WEEKDAY_HEADERS.map((weekday) => (
          <span key={weekday} className="text-center text-xs font-medium leading-[17px] text-gray-500">
            {weekday}
          </span>
        ))}
        {cells.map((day, index) => {
          if (day === null) return <span key={`blank-${index}`} />;
          const available = isDayAvailable(day);
          const isEdge = day === checkIn || day === checkOut;
          const inRange = checkIn !== null && checkOut !== null && day > checkIn && day < checkOut;
          return (
            <button
              key={day}
              type="button"
              disabled={!available}
              onClick={() => onSelectDay(day)}
              aria-pressed={isEdge}
              className={cn(
                "rounded-lg py-2 text-[13px] leading-[19px]",
                !available && "cursor-not-allowed font-medium text-[#cbd5e1]",
                available && !isEdge && !inRange && "font-medium text-[#0f172a] hover:bg-gray-50",
                inRange && "bg-[#dbeafe] font-semibold text-brand-900",
                isEdge && "bg-brand-900 font-semibold text-white",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="flex gap-4 text-xs font-medium leading-[17px]">
        <span className="text-brand-900">■ Selected</span>
        <span className="text-[#cbd5e1]">■ Booked</span>
      </div>
    </section>
  );
}
