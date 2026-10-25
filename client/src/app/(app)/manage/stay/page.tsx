"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageContainer } from "@/components/shared/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { STAY_KEY } from "@/hooks/useStay";
import { errorMessage, notifyError } from "@/lib/errors";
import { formatDate, formatMoney } from "@/lib/format";
import {
  listOperatorProperties,
  listReservations,
  pauseOperatorProperty,
  publishOperatorProperty,
  reservationAction,
  type ReservationAction,
} from "@/lib/stay-api";
import { BOOKING_LABEL, BOOKING_TONE, FALLBACK_STAY_IMAGE, STAY_TYPE_LABEL } from "@/lib/stay-mapper";
import { cn } from "@/lib/utils";

type Tab = "stays" | "reservations";

const STAY_STATUS_TONE: Record<string, string> = {
  Published: "bg-[#dcfce7] text-[#16a34a]",
  Draft: "bg-[#f1f5f9] text-[#334155]",
  Paused: "bg-[#fef3c7] text-[#b45309]",
};

function Stays() {
  const queryClient = useQueryClient();
  const stays = useQuery({ queryKey: [...STAY_KEY, "operator"], queryFn: listOperatorProperties });
  const toggle = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) => (publish ? publishOperatorProperty(id) : pauseOperatorProperty(id)),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: STAY_KEY });
      showSuccessToast(variables.publish ? "Your stay is live" : "Your stay is paused. Existing bookings stay valid.");
    },
    onError: (error) => notifyError(error, "That could not be done."),
  });

  if (stays.isPending) return <Skeleton className="h-28 w-full rounded-2xl" />;
  if (stays.isError) return <p className="text-sm text-[#dc2626]">{errorMessage(stays.error)}</p>;
  if (stays.data.length === 0) {
    return (
      <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        You have not added a stay yet.{" "}
        <Link href="/manage/stay/new" className="font-medium text-brand-900">
          Add your first one
        </Link>
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {stays.data.map((stay) => (
        <article key={stay.id} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4">
          <span className="relative block h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-[#eef2ff]">
            <Image src={stay.coverUrl ?? FALLBACK_STAY_IMAGE} alt="" fill className="object-cover" sizes="112px" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <h2 className="min-w-0 flex-1 truncate text-[15px] font-bold text-[#0f172a]">{stay.name}</h2>
              <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium", STAY_STATUS_TONE[stay.status ?? ""] ?? STAY_STATUS_TONE.Draft)}>{stay.status}</span>
            </div>
            <p className="text-xs text-gray-500">
              {STAY_TYPE_LABEL[stay.type ?? ""] ?? stay.type} · {[stay.area, stay.city].filter(Boolean).join(", ")}
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-3 text-[13px] font-medium">
              <Link href={`/manage/stay/${stay.id}`} className="text-brand-900">
                Edit rooms and rates
              </Link>
              {stay.status === "Published" ? (
                <button type="button" onClick={() => toggle.mutate({ id: stay.id, publish: false })} className="text-[#b45309]">
                  Pause
                </button>
              ) : (
                <button type="button" onClick={() => toggle.mutate({ id: stay.id, publish: true })} className="text-[#16a34a]">
                  Publish
                </button>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function Reservations() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string | undefined>(undefined);
  const reservations = useQuery({ queryKey: [...STAY_KEY, "reservations", status ?? "all"], queryFn: () => listReservations({ results: 50, status }) });
  const act = useMutation({
    mutationFn: ({ id, action }: { id: string; action: ReservationAction }) => reservationAction(id, action, action === "cancel" ? "Cancelled by the host" : undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: STAY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["action-needed"] });
    },
    onError: (error) => notifyError(error),
  });

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" aria-label="Status" className="flex flex-wrap gap-2">
        {([undefined, "Confirmed", "Completed", "Cancelled", "NoShow"] as const).map((value) => (
          <button
            key={value ?? "all"}
            type="button"
            role="tab"
            aria-selected={value === status}
            onClick={() => setStatus(value)}
            className={cn("rounded-full border px-3.5 py-2 text-[13px] font-medium", value === status ? "border-[#0f172a] bg-[#0f172a] text-white" : "border-gray-200 bg-white text-[#334155]")}
          >
            {value ? BOOKING_LABEL[value] : "All"}
          </button>
        ))}
      </div>
      {reservations.isPending && <Skeleton className="h-24 w-full rounded-2xl" />}
      {reservations.isError && <p className="text-sm text-[#dc2626]">{errorMessage(reservations.error)}</p>}
      {reservations.data?.items?.length === 0 && <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">No reservations yet.</p>}
      {reservations.data?.items?.map((booking) => {
        const active = booking.status === "Confirmed" || booking.status === "Modified";
        return (
          <article key={booking.id} className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="min-w-0 flex-1 truncate text-sm font-bold text-[#0f172a]">
                {booking.propertyName} · {booking.roomName}
              </p>
              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", BOOKING_TONE[booking.status ?? ""])}>{BOOKING_LABEL[booking.status ?? ""] ?? booking.status}</span>
            </div>
            <p className="text-[13px] text-[#334155]">
              {booking.guestName ?? booking.guestUsername} · {formatDate(booking.checkIn)} to {formatDate(booking.checkOut)} · {booking.guests} guests · {formatMoney(booking.price.total, booking.price.currency ?? "GHS")}
            </p>
            {booking.specialRequests && <p className="rounded-lg bg-[#f8fafc] p-2.5 text-xs text-[#334155]">{booking.specialRequests}</p>}
            <div className="flex flex-wrap items-center gap-3 text-[13px] font-medium">
              {active && (
                <>
                  <button type="button" onClick={() => act.mutate({ id: booking.id, action: "complete" })} className="text-brand-900">
                    Mark completed
                  </button>
                  <button type="button" onClick={() => act.mutate({ id: booking.id, action: "no-show" })} className="text-[#b45309]">
                    No-show
                  </button>
                  <button type="button" onClick={() => act.mutate({ id: booking.id, action: "cancel" })} className="text-[#dc2626]">
                    Cancel and refund guest
                  </button>
                </>
              )}
              {booking.status === "Completed" && !booking.depositReleased && booking.price.deposit > 0 && (
                <button type="button" onClick={() => act.mutate({ id: booking.id, action: "release-deposit" })} className="text-[#16a34a]">
                  Release deposit
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

/** Manage · Stay (host): your stay properties and the reservations for them. */
export default function ManageStayPage() {
  const [tab, setTab] = useState<Tab>("stays");
  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Stay" }]} />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Host a stay</h1>
            <p className="text-sm leading-5 text-gray-500">Hotels, guest houses, hostels and short-lets. You need a verified host to go live.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link href="/verification" className="h-10 rounded-[10px] border border-gray-200 px-4 text-sm font-medium leading-10 text-[#0f172a] hover:bg-gray-50">
              Get verified
            </Link>
            <Link href="/manage/stay/new" className="h-10 rounded-[10px] bg-brand-900 px-4 text-sm font-medium leading-10 text-white">
              + Add a stay
            </Link>
          </div>
        </div>
        <div role="tablist" aria-label="Section" className="flex gap-2">
          {(["stays", "reservations"] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={key === tab}
              onClick={() => setTab(key)}
              className={cn("rounded-full border px-3.5 py-2 text-[13px] font-medium", key === tab ? "border-[#0f172a] bg-[#0f172a] text-white" : "border-gray-200 bg-white text-[#334155]")}
            >
              {key === "stays" ? "My stays" : "Reservations"}
            </button>
          ))}
        </div>
        {tab === "stays" ? <Stays /> : <Reservations />}
      </PageContainer>
    </AppShell>
  );
}
