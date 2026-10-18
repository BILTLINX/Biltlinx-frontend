import { CALENDAR, NIGHTLY_FEE_RATE, TOURISM_LEVY_RATE } from "@/lib/dummy-stay-detail";

/** The days of the shown month a guest may pick: not yet passed and not booked by the host. */
export function isDayAvailable(day: number): boolean {
  return day > CALENDAR.pastUntil && !CALENDAR.booked.includes(day);
}

/** Whether any night between two days is already booked, which would break a stay across them. */
export function rangeHasBooked(from: number, to: number): boolean {
  return CALENDAR.booked.some((day) => day > from && day < to);
}

export interface Selection {
  checkIn: number | null;
  checkOut: number | null;
}

/** Applies a click on a calendar day: the first click sets check-in, a later day then sets check-out. */
export function selectDay(current: Selection, day: number): Selection {
  const { checkIn, checkOut } = current;
  if (checkIn === null || checkOut !== null || day <= checkIn || rangeHasBooked(checkIn, day)) {
    return { checkIn: day, checkOut: null };
  }
  return { checkIn, checkOut: day };
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** e.g. "Sat 24 Oct" */
export function formatStayDate(day: number): string {
  const date = new Date(CALENDAR.year, CALENDAR.month, day);
  return `${WEEKDAYS[date.getDay()]} ${day} ${MONTHS[CALENDAR.month]}`;
}

export interface PriceBreakdown {
  nights: number;
  subtotal: number;
  /** Optional extras added at checkout, such as airport pick-up. */
  extras: number;
  serviceFee: number;
  levy: number;
  total: number;
}

export function priceBreakdown(nightlyRate: number, nights: number, extras = 0): PriceBreakdown {
  const subtotal = nightlyRate * nights;
  // The fee and the levy are worked out on the room and the extras together.
  const taxable = subtotal + extras;
  const serviceFee = Math.round(taxable * NIGHTLY_FEE_RATE);
  const levy = Math.round(taxable * TOURISM_LEVY_RATE);
  return { nights, subtotal, extras, serviceFee, levy, total: taxable + serviceFee + levy };
}

export function formatGhs(amount: number): string {
  return `GHS ${amount.toLocaleString("en-US")}`;
}
