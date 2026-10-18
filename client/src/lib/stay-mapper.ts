import { formatMoney } from "@/lib/format";
import type { ListingCardData } from "@/types/listing";
import type { StayCardDto } from "@/types/api/schema";

export const FALLBACK_STAY_IMAGE = "/images/post-hotel-pool.jpg";

export const STAY_TYPE_LABEL: Record<string, string> = {
  Hotel: "Hotel",
  GuestHouse: "Guest house",
  Hostel: "Hostel",
  Apartment: "Apartment",
  StudentHostel: "Student housing",
};

export const SHAPE_LABEL: Record<string, string> = {
  HotelRoom: "Hotel room",
  PrivateRoom: "Private room",
  DormBed: "Dorm bed",
  WholeUnit: "Whole unit",
};

export interface StayDates {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
}

export function stayQueryString(dates: StayDates): string {
  const params = new URLSearchParams();
  if (dates.checkIn) params.set("checkIn", dates.checkIn);
  if (dates.checkOut) params.set("checkOut", dates.checkOut);
  if (dates.guests) params.set("guests", String(dates.guests));
  if (dates.rooms) params.set("rooms", String(dates.rooms));
  const text = params.toString();
  return text ? `?${text}` : "";
}

export function nightsBetween(checkIn: string | undefined, checkOut: string | undefined): number {
  if (!checkIn || !checkOut) return 0;
  const diff = (new Date(`${checkOut}T00:00:00Z`).getTime() - new Date(`${checkIn}T00:00:00Z`).getTime()) / 86_400_000;
  return Number.isFinite(diff) && diff > 0 ? Math.round(diff) : 0;
}

export function toStayCard(stay: StayCardDto, dates: StayDates): ListingCardData {
  const currency = stay.currency ?? "GHS";
  const withDates = stay.totalForStay !== null && stay.nights !== null && stay.nights > 0;
  const badges: NonNullable<ListingCardData["badges"]> = [];
  if (stay.operator.isVerified) badges.push({ label: "Verified operator ✓", tone: "verified" });
  if (stay.available === false) badges.push({ label: "Not available for your dates", tone: "neutral" });
  return {
    id: stay.id,
    kind: STAY_TYPE_LABEL[stay.type ?? ""] ?? "Stay",
    image: stay.coverUrl ?? FALLBACK_STAY_IMAGE,
    href: `/stay/${stay.id}${stayQueryString(dates)}`,
    price: withDates ? formatMoney(stay.totalForStay as number, currency) : stay.fromNightly !== null ? `From ${formatMoney(stay.fromNightly, currency)}` : "Price on request",
    priceUnit: withDates ? `${stay.nights} ${stay.nights === 1 ? "night" : "nights"}` : stay.fromNightly !== null ? "night" : undefined,
    title: stay.name ?? "Stay",
    location: [stay.area, stay.city].filter(Boolean).join(", ") || "Ghana",
    detail: stay.amenities && stay.amenities.length > 0 ? { icon: "bed", text: stay.amenities.slice(0, 3).join(" · ") } : undefined,
    badges: badges.length > 0 ? badges : undefined,
    cta: "View and book",
    ctaHref: `/stay/${stay.id}${stayQueryString(dates)}`,
    ownerId: stay.operator.accountId,
    ownerName: stay.operator.name ?? undefined,
  };
}

export const BOOKING_TONE: Record<string, string> = {
  Held: "bg-[#fef3c7] text-[#b45309]",
  PendingPayment: "bg-[#fef3c7] text-[#b45309]",
  Confirmed: "bg-[#dcfce7] text-[#16a34a]",
  Modified: "bg-[#dcfce7] text-[#16a34a]",
  Cancelled: "bg-[#f1f5f9] text-[#334155]",
  Expired: "bg-[#f1f5f9] text-[#334155]",
  NoShow: "bg-[#fee2e2] text-[#dc2626]",
  Completed: "bg-[#eff5ff] text-brand-900",
};

export const BOOKING_LABEL: Record<string, string> = {
  Held: "Awaiting payment",
  PendingPayment: "Payment in progress",
  Confirmed: "Confirmed",
  Modified: "Confirmed (changed)",
  Cancelled: "Cancelled",
  Expired: "Expired",
  NoShow: "No-show",
  Completed: "Completed",
};
