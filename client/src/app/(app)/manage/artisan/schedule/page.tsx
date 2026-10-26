"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { ArtisanRoleBar } from "@/components/shared/ArtisanRoleBar";
import { ArtisanTabs } from "@/components/shared/ManageTabs";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import {
  SCHEDULE_EVENTS,
  SCHEDULE_FIRST_HOUR,
  SCHEDULE_LAST_HOUR,
  SCHEDULE_LEGEND,
  SCHEDULE_TODAY,
  SCHEDULE_WEEK_START,
  type ScheduleKind,
} from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";

/** Pixels per hour in the calendar; two hours are 128px, as in the design. */
const HOUR_PX = 64;
const HOURS = SCHEDULE_LAST_HOUR - SCHEDULE_FIRST_HOUR;
const DAY_MS = 24 * 60 * 60 * 1000;
const VIEWS = ["Day", "Week", "Month"] as const;
/** The design runs Monday to Sunday, so the weekday names are fixed rather than read from the sample dates. */
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const EVENT_TONE: Record<ScheduleKind, string> = {
  job: "border-brand-900 bg-brand-900/10",
  booking: "border-[#16a34a] bg-[#16a34a]/10",
  quote: "border-[#b45309] bg-[#b45309]/10",
  blocked: "border-[#94a3b8] bg-[#94a3b8]/10",
};

const SWATCH: Record<ScheduleKind, string> = {
  job: "bg-brand-900",
  booking: "bg-[#16a34a]",
  quote: "bg-[#b45309]",
  blocked: "bg-[#94a3b8]",
};

const hourLabel = (hour: number) => `${hour % 12 === 0 ? 12 : hour % 12} ${hour < 12 ? "am" : "pm"}`;
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/** "20 – 26 October 2026", or "26 Oct – 1 Nov 2026" when the week crosses a month. */
function weekLabel(start: Date) {
  const end = new Date(start.getTime() + 6 * DAY_MS);
  if (start.getMonth() === end.getMonth()) return `${start.getDate()} – ${end.getDate()} ${end.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`;
  const short = (date: Date) => date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${short(start)} – ${short(end)} ${end.getFullYear()}`;
}

/** Manage · Artisan · Schedule (Figma node 1082:33095): the week of jobs, bookings, quote visits and blocked time. */
export default function ArtisanSchedulePage() {
  const router = useRouter();
  const [weekOffset, setWeekOffset] = useState(0);
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  const weekStart = new Date(SCHEDULE_WEEK_START.getTime() + weekOffset * 7 * DAY_MS);
  const days = Array.from({ length: 7 }, (_, index) => new Date(weekStart.getTime() + index * DAY_MS));
  // Only the sample week has events.
  const events = weekOffset === 0 ? SCHEDULE_EVENTS : [];

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <ArtisanRoleBar page="Schedule" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Schedule</h1>
            <p className="text-sm leading-5 text-gray-500">Your week of jobs and site visits. Clients can only book the open slots.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" onClick={comingSoon("Working hours")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              Working hours
            </Button>
            <Button variant="primary" onClick={comingSoon("Block time")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              + Block time
            </Button>
          </div>
        </div>

        <ArtisanTabs active="schedule" />

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" aria-label="Previous week" onClick={() => setWeekOffset((value) => value - 1)} className="h-9 w-auto rounded-[10px] px-4 lg:rounded-[10px]">
            ‹
          </Button>
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">{weekLabel(weekStart)}</h2>
          <Button variant="outline" aria-label="Next week" onClick={() => setWeekOffset((value) => value + 1)} className="h-9 w-auto rounded-[10px] px-4 lg:rounded-[10px]">
            ›
          </Button>
          {weekOffset !== 0 && (
            <button type="button" onClick={() => setWeekOffset(0)} className="text-[13px] font-medium text-brand-900">
              This week
            </button>
          )}
          <div role="tablist" aria-label="Calendar view" className="ml-auto flex rounded-[10px] border border-gray-200 bg-white p-[3px]">
            {VIEWS.map((view) => {
              const active = view === "Week";
              return (
                <button
                  key={view}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={active ? undefined : comingSoon(`${view} view`)}
                  className={cn("rounded-lg px-3.5 py-1.5 text-[13px] font-medium leading-[19px]", active ? "bg-[#0f172a] text-white" : "text-[#334155] hover:bg-gray-50")}
                >
                  {view}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <div className="flex min-w-[860px]">
            <div className="w-16 shrink-0 pt-11">
              {Array.from({ length: HOURS / 2 }, (_, index) => (
                <div key={index} className="px-2.5" style={{ height: HOUR_PX * 2 }}>
                  <span className="text-[11px] font-medium leading-4 text-[#94a3b8]">{hourLabel(SCHEDULE_FIRST_HOUR + index * 2)}</span>
                </div>
              ))}
            </div>
            {days.map((day, dayIndex) => {
              const today = sameDay(day, SCHEDULE_TODAY);
              return (
                <div key={dayIndex} className="flex min-w-0 flex-1 flex-col border-l border-gray-200">
                  <div className={cn("px-2.5 py-3 text-[13px] font-semibold leading-[19px]", today ? "bg-[#eff5ff] text-brand-900" : "bg-[#f8fafc] text-[#0f172a]")}>
                    {WEEKDAYS[dayIndex]} {day.getDate()}
                  </div>
                  <div className="relative" style={{ height: HOURS * HOUR_PX }}>
                    {Array.from({ length: HOURS / 2 }, (_, index) => (
                      <div key={index} className="absolute inset-x-0 h-px bg-[#f1f5f9]" style={{ top: index * HOUR_PX * 2 }} />
                    ))}
                    {events
                      .filter((event) => event.day === dayIndex)
                      .map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          onClick={comingSoon("Booking details")}
                          className={cn("absolute inset-x-1 flex flex-col items-start gap-0.5 overflow-hidden rounded-lg border px-2 py-1.5 text-left", EVENT_TONE[event.kind])}
                          style={{ top: (event.start - SCHEDULE_FIRST_HOUR) * HOUR_PX, height: event.hours * HOUR_PX }}
                        >
                          <span className="whitespace-nowrap text-xs font-semibold leading-[17px] text-[#0f172a]">{event.title}</span>
                          {event.place && <span className="text-[11px] leading-4 text-gray-500">{event.place}</span>}
                        </button>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          {SCHEDULE_LEGEND.map((item) => (
            <li key={item.kind} className="flex items-center gap-1.5 text-xs font-medium leading-[17px] text-gray-500">
              <span className={cn("size-2.5 rounded-sm", SWATCH[item.kind])} />
              {item.label}
            </li>
          ))}
        </ul>
      </PageContainer>
    </AppShell>
  );
}

