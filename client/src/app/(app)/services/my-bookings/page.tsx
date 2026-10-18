"use client";

import Link from "next/link";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageContainer } from "@/components/shared/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMyServiceBookings, useServicesMutations } from "@/hooks/useServices";
import { errorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { SERVICE_BOOKING_TONE } from "@/lib/services-labels";
import { cn } from "@/lib/utils";

export default function MyServiceBookingsPage() {
  const bookings = useMyServiceBookings();
  const { bookingAction } = useServicesMutations();

  return (
    <AppShell activeKey="services" activeChildKey="services" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Services", href: "/services" }, { label: "My bookings" }]} />
        <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">My service bookings</h1>
        {bookings.isPending && <Skeleton className="h-24 w-full rounded-2xl" />}
        {bookings.isError && <p className="text-sm text-[#dc2626]">{errorMessage(bookings.error)}</p>}
        {bookings.data?.length === 0 && (
          <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            You have not booked a service yet.{" "}
            <Link href="/services" className="font-medium text-brand-900">
              Browse services
            </Link>
          </p>
        )}
        <div className="flex flex-col gap-3">
          {bookings.data?.map((booking) => (
            <article key={booking.id} className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/services/${booking.offeringId}`} className="min-w-0 flex-1 truncate text-[15px] font-bold text-[#0f172a] hover:text-brand-900">
                  {booking.offeringTitle}
                </Link>
                <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", SERVICE_BOOKING_TONE[booking.status ?? ""])}>{booking.status}</span>
              </div>
              <p className="text-[13px] text-[#334155]">
                {booking.provider.displayName ?? booking.provider.owner.username} · {formatDate(booking.date)}
              </p>
              {booking.providerNote && <p className="rounded-lg bg-[#f8fafc] p-2.5 text-xs text-[#334155]">{booking.providerNote}</p>}
              {(booking.status === "Requested" || booking.status === "Confirmed") && (
                <button type="button" onClick={() => bookingAction.mutate({ id: booking.id, action: "cancel" })} className="self-start text-[13px] font-medium text-[#dc2626]">
                  Cancel booking
                </button>
              )}
            </article>
          ))}
        </div>
      </PageContainer>
    </AppShell>
  );
}
