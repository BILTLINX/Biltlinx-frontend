"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageContainer } from "@/components/shared/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMyBookings } from "@/hooks/useStay";
import { errorMessage } from "@/lib/errors";
import { formatDate, formatMoney } from "@/lib/format";
import { BOOKING_LABEL, BOOKING_TONE } from "@/lib/stay-mapper";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: undefined, label: "All" },
  { key: "Confirmed", label: "Upcoming" },
  { key: "Held", label: "Awaiting payment" },
  { key: "Completed", label: "Past" },
  { key: "Cancelled", label: "Cancelled" },
] as const;

export default function MyBookingsPage() {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const bookings = useMyBookings(status);

  return (
    <AppShell activeKey="property" activeChildKey="stay" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Stay", href: "/stay" }, { label: "My bookings" }]} />
        <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">My bookings</h1>

        <div role="tablist" aria-label="Filter" className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              role="tab"
              aria-selected={filter.key === status}
              onClick={() => setStatus(filter.key)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-[13px] font-medium",
                filter.key === status ? "border-[#0f172a] bg-[#0f172a] text-white" : "border-gray-200 bg-white text-[#334155] hover:bg-gray-50",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {bookings.isPending && <Skeleton className="h-24 w-full rounded-2xl" />}
        {bookings.isError && <p className="text-sm text-[#dc2626]">{errorMessage(bookings.error)}</p>}
        {bookings.data?.items?.length === 0 && (
          <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            No bookings here yet.{" "}
            <Link href="/stay" className="font-medium text-brand-900">
              Find a stay
            </Link>
          </p>
        )}
        <div className="flex flex-col gap-3">
          {bookings.data?.items?.map((booking) => (
            <Link
              key={booking.id}
              href={booking.status === "Held" || booking.status === "PendingPayment" ? `/stay/${booking.stayId}/book?booking=${booking.id}` : `/stay/bookings/${booking.id}`}
              className="flex flex-col gap-1.5 rounded-2xl border border-gray-200 bg-white p-4 hover:border-brand-900"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="min-w-0 flex-1 truncate text-[15px] font-bold text-[#0f172a]">{booking.propertyName}</p>
                <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", BOOKING_TONE[booking.status ?? ""])}>{BOOKING_LABEL[booking.status ?? ""] ?? booking.status}</span>
              </div>
              <p className="text-[13px] text-[#334155]">
                {booking.roomName} · {formatDate(booking.checkIn)} to {formatDate(booking.checkOut)}
              </p>
              <p className="text-xs text-gray-500">
                {booking.reference} · {formatMoney(booking.price.total, booking.price.currency ?? "GHS")}
              </p>
            </Link>
          ))}
        </div>
      </PageContainer>
    </AppShell>
  );
}
