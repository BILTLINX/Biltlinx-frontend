"use client";

import { useRouter } from "next/navigation";
import { NavIcon } from "@/components/shared/NavIcon";
import { Button } from "@/components/ui/Button";
import { formatGhs, formatStayDate, priceBreakdown, type Selection } from "@/lib/stay-booking";

const GUEST_OPTIONS = ["1 adult", "2 adults", "3 adults", "4 adults"];
const ROUNDED = "rounded-[10px] lg:rounded-[10px]";

interface StayBookingPanelProps {
  stayId: string;
  nightlyRate: number;
  selection: Selection;
  guests: string;
  onGuestsChange: (value: string) => void;
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-3 text-[13px] leading-[19px] ${strong ? "font-bold text-[#0f172a]" : ""}`}>
      <span className={strong ? undefined : "text-gray-500"}>{label}</span>
      <span className={strong ? undefined : "font-medium text-[#0f172a]"}>{value}</span>
    </div>
  );
}

/** The booking card (Figma node 1060:30250): the picked dates and guests, availability, actions and the price breakdown. */
export function StayBookingPanel({ stayId, nightlyRate, selection, guests, onGuestsChange }: StayBookingPanelProps) {
  const router = useRouter();
  const { checkIn, checkOut } = selection;
  const nights = checkIn !== null && checkOut !== null ? checkOut - checkIn : 0;
  const price = priceBreakdown(nightlyRate, nights);
  const ready = nights > 0;

  return (
    <aside className="flex w-full flex-col gap-3.5 rounded-2xl border border-gray-200 bg-white p-5 xl:sticky xl:top-0 xl:w-[380px] xl:shrink-0 xl:self-start">
      <p className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold leading-8 text-[#0f172a]">{formatGhs(nightlyRate)}</span>
        <span className="text-sm leading-5 text-gray-500">/ night</span>
      </p>

      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-gray-200">
        <div className="flex flex-col gap-0.5 px-3.5 py-2.5">
          <span className="text-[10px] font-bold leading-[15px] text-gray-500">CHECK IN</span>
          <span className="text-sm font-semibold leading-5 text-[#0f172a]">
            {checkIn !== null ? formatStayDate(checkIn) : "Add date"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 border-l border-gray-200 px-3.5 py-2.5">
          <span className="text-[10px] font-bold leading-[15px] text-gray-500">CHECK OUT</span>
          <span className="text-sm font-semibold leading-5 text-[#0f172a]">
            {checkOut !== null ? formatStayDate(checkOut) : "Add date"}
          </span>
        </div>
      </div>

      <label className="relative flex flex-col gap-0.5 rounded-xl border border-gray-200 px-3.5 py-2.5">
        <span className="text-[10px] font-bold leading-[15px] text-gray-500">GUESTS</span>
        <select
          value={guests}
          onChange={(event) => onGuestsChange(event.target.value)}
          aria-label="Guests"
          className="w-full appearance-none bg-transparent pr-6 text-sm font-semibold leading-5 text-[#0f172a] focus:outline-none"
        >
          {GUEST_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <NavIcon icon="/icons/poll-chevron-down.svg" size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 bg-gray-500" />
      </label>

      <span
        className={`self-start rounded-full px-2.5 py-1 text-[11px] font-medium leading-4 ${
          ready ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#f1f5f9] text-[#334155]"
        }`}
      >
        {ready ? "Available for your dates" : "Choose check-in and check-out"}
      </span>

      <Button variant="primary" disabled={!ready} onClick={() => router.push(`/stay/${stayId}/book?in=${checkIn}&out=${checkOut}&guests=${encodeURIComponent(guests)}`)} className={`h-12 ${ROUNDED}`}>
        Book now
      </Button>
      <Button variant="outline" onClick={() => router.push("/messages")} className={`h-11 ${ROUNDED}`}>
        Message host
      </Button>

      {ready && (
        <>
          <Line label={`${formatGhs(nightlyRate)} × ${nights} ${nights === 1 ? "night" : "nights"}`} value={formatGhs(price.subtotal)} />
          <Line label="Biltlinx service fee" value={formatGhs(price.serviceFee)} />
          <Line label="Tourism levy (1%)" value={formatGhs(price.levy)} />
          <Line label="Total" value={formatGhs(price.total)} strong />
        </>
      )}
      <p className="text-xs leading-[17px] text-gray-500">
        You won’t be charged yet. Payment is held by Biltlinx until you check in.
      </p>
    </aside>
  );
}
