"use client";

import { useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { Button } from "@/components/ui/Button";
import { nightsBetween, type StayDates } from "@/lib/stay-mapper";
import { cn } from "@/lib/utils";

export interface StaySearchValue extends StayDates {
  destination: string;
}

const FIELD = "flex min-w-0 flex-col items-start gap-0.5 rounded-xl px-4 py-2 text-left hover:bg-gray-50 lg:flex-1";
const LABEL = "text-[11px] font-medium leading-[14px] text-gray-500";
const INPUT = "w-full min-w-0 bg-transparent text-sm font-medium leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none";

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/** Where / dates / guests search (Figma node 1042:21062). The chosen dates travel with the guest into detail and checkout. */
export function StaySearchBar({ value, onSearch }: { value: StaySearchValue; onSearch: (value: StaySearchValue) => void }) {
  const [draft, setDraft] = useState<StaySearchValue>(value);
  const [error, setError] = useState<string | undefined>();

  function submit() {
    const hasOne = Boolean(draft.checkIn) !== Boolean(draft.checkOut);
    if (hasOne) {
      setError("Choose both a check-in and a check-out date.");
      return;
    }
    if (draft.checkIn && draft.checkOut && nightsBetween(draft.checkIn, draft.checkOut) < 1) {
      setError("Check-out must be after check-in.");
      return;
    }
    setError(undefined);
    onSearch(draft);
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="flex flex-col gap-2"
    >
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-gray-200 bg-white p-2 lg:flex lg:items-center">
        <label className={cn(FIELD, "col-span-2")}>
          <span className={LABEL}>Where</span>
          <span className="flex w-full items-center gap-2">
            <NavIcon icon="/icons/post-options-location.svg" size={14} className="bg-[#0f172a]" />
            <input value={draft.destination} onChange={(event) => setDraft({ ...draft, destination: event.target.value })} placeholder="City or area" className={INPUT} />
          </span>
        </label>
        <label className={FIELD}>
          <span className={LABEL}>Check in</span>
          <input type="date" min={todayKey()} value={draft.checkIn ?? ""} onChange={(event) => setDraft({ ...draft, checkIn: event.target.value || undefined })} className={INPUT} />
        </label>
        <label className={FIELD}>
          <span className={LABEL}>Check out</span>
          <input type="date" min={draft.checkIn ?? todayKey()} value={draft.checkOut ?? ""} onChange={(event) => setDraft({ ...draft, checkOut: event.target.value || undefined })} className={INPUT} />
        </label>
        <label className={FIELD}>
          <span className={LABEL}>Guests</span>
          <input type="number" min={1} max={20} value={draft.guests ?? 2} onChange={(event) => setDraft({ ...draft, guests: Math.max(1, Number(event.target.value) || 1) })} className={INPUT} />
        </label>
        <label className={FIELD}>
          <span className={LABEL}>Rooms</span>
          <input type="number" min={1} max={10} value={draft.rooms ?? 1} onChange={(event) => setDraft({ ...draft, rooms: Math.max(1, Number(event.target.value) || 1) })} className={INPUT} />
        </label>
        <Button variant="primary" type="submit" className="col-span-2 h-12 rounded-[10px] px-4 lg:w-auto lg:rounded-[10px] lg:px-5">
          Search
        </Button>
      </div>
      {error && <p className="px-2 text-xs text-[#dc2626]">{error}</p>}
    </form>
  );
}
