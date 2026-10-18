"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { PageContainer } from "@/components/shared/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { useStartConversation } from "@/hooks/useMessaging";
import { STAY_KEY, useBooking, useBookingHistory, useCancellationPreview, useCancelBooking } from "@/hooks/useStay";
import { errorMessage, notifyError } from "@/lib/errors";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { newIdempotencyKey } from "@/lib/idempotency";
import { extendBooking, modifyBooking } from "@/lib/stay-api";
import { BOOKING_LABEL, BOOKING_TONE } from "@/lib/stay-mapper";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5";
const FIELD = "h-10 rounded-[10px] border border-gray-200 bg-white px-3 text-[13px] text-[#0f172a] focus:border-brand-900 focus:outline-none";

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const booking = useBooking(id);
  const history = useBookingHistory(id);
  const message = useStartConversation();
  const [dialog, setDialog] = useState<"cancel" | "modify" | "extend" | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [extra, setExtra] = useState(1);

  const data = booking.data;
  const active = data?.status === "Confirmed" || data?.status === "Modified";
  const preview = useCancellationPreview(id, dialog === "cancel" && active);
  const cancel = useCancelBooking(id);

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: STAY_KEY });

  const modify = useMutation({
    mutationFn: () => modifyBooking(id, { checkIn, checkOut, guests: data?.guests, rooms: data?.units }),
    onSuccess: () => {
      invalidate();
      showSuccessToast("Your booking was changed");
      setDialog(null);
    },
    onError: (error) => notifyError(error),
  });

  const extend = useMutation({
    mutationFn: () => extendBooking(id, extra, newIdempotencyKey()),
    onSuccess: (extension) => router.push(`/stay/${extension.stayId}/book?booking=${extension.id}`),
    onError: (error) => notifyError(error),
  });

  return (
    <AppShell activeKey="property" activeChildKey="stay" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Stay", href: "/stay" }, { label: "My bookings", href: "/stay/bookings" }, { label: data?.reference ?? "Booking" }]} />
        {booking.isPending && <Skeleton className="h-64 w-full rounded-2xl" />}
        {booking.isError && <p className="text-sm text-[#dc2626]">{errorMessage(booking.error)}</p>}

        {data && (
          <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
            <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
              <section className={CARD}>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="min-w-0 flex-1 text-xl font-bold text-[#0f172a]">{data.propertyName}</h1>
                  <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", BOOKING_TONE[data.status ?? ""])}>{BOOKING_LABEL[data.status ?? ""] ?? data.status}</span>
                </div>
                <p className="text-sm text-gray-500">
                  {data.roomName} · {data.ratePlanName} · reference {data.reference}
                </p>
                <dl className="grid gap-x-6 gap-y-3 text-[13px] sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-gray-500">Check in</dt>
                    <dd className="font-medium text-[#0f172a]">{formatDate(data.checkIn)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Check out</dt>
                    <dd className="font-medium text-[#0f172a]">{formatDate(data.checkOut)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Guests and rooms</dt>
                    <dd className="font-medium text-[#0f172a]">
                      {data.guests} · {data.units}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Address</dt>
                    <dd className="font-medium text-[#0f172a]">{data.address ?? "Shown once the booking is confirmed"}</dd>
                  </div>
                </dl>
                <p className="text-[13px] leading-[19px] text-[#334155]">{data.cancellationTerms}</p>
              </section>

              <section className={CARD}>
                <h2 className="text-base font-bold text-[#0f172a]">History</h2>
                {history.data?.map((event, index) => (
                  <p key={`${event.at}-${index}`} className="text-[13px] text-[#334155]">
                    <span className="text-xs text-gray-500">{formatDateTime(event.at)}</span> · {event.to}
                    {event.note ? ` — ${event.note}` : ""}
                  </p>
                ))}
              </section>
            </div>

            <aside className="flex w-full flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 xl:sticky xl:top-0 xl:w-[360px] xl:shrink-0 xl:self-start">
              <h2 className="text-base font-bold text-[#0f172a]">Payment</h2>
              {(data.price.lines ?? []).map((line, index) => (
                <p key={`${line.label}-${index}`} className="flex justify-between gap-3 text-[13px] text-gray-500">
                  <span>{line.label}</span>
                  <span className="font-medium text-[#0f172a]">{formatMoney(line.amount, data.price.currency ?? "GHS")}</span>
                </p>
              ))}
              <p className="flex justify-between gap-3 border-t border-gray-200 pt-2 text-[13px] font-bold text-[#0f172a]">
                <span>Total</span>
                <span>{formatMoney(data.price.total, data.price.currency ?? "GHS")}</span>
              </p>
              {data.refunded > 0 && <p className="text-xs text-[#16a34a]">Refunded {formatMoney(data.refunded, data.price.currency ?? "GHS")}</p>}
              <Link href="/payments" className="text-[13px] font-medium text-brand-900">
                See receipt
              </Link>
              {(data.status === "Held" || data.status === "PendingPayment") && (
                <Link href={`/stay/${data.stayId}/book?booking=${data.id}`} className="h-11 rounded-[10px] bg-brand-900 text-center text-sm font-medium leading-[44px] text-white">
                  Finish payment
                </Link>
              )}
              {active && (
                <div className="flex flex-col gap-2 border-t border-gray-200 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCheckIn(data.checkIn);
                      setCheckOut(data.checkOut);
                      setDialog("modify");
                    }}
                    className="h-10 rounded-[10px] border border-gray-200 text-sm font-medium text-[#0f172a] hover:bg-gray-50"
                  >
                    Change dates
                  </button>
                  <button type="button" onClick={() => setDialog("extend")} className="h-10 rounded-[10px] border border-gray-200 text-sm font-medium text-[#0f172a] hover:bg-gray-50">
                    Extend my stay
                  </button>
                  <button type="button" onClick={() => setDialog("cancel")} className="h-10 text-sm font-medium text-[#dc2626]">
                    Cancel booking
                  </button>
                </div>
              )}
              <button
                type="button"
                disabled={message.isPending}
                onClick={() =>
                  message.mutate(
                    { recipientAccountId: data.operator.accountId, contextType: "Stay", contextId: data.stayId, contextTitle: data.propertyName ?? undefined },
                    { onSuccess: (conversation) => router.push(`/messages?c=${conversation.id}`) },
                  )
                }
                className="h-10 rounded-[10px] bg-[#eff5ff] text-sm font-medium text-brand-900 hover:bg-[#e2edff] disabled:opacity-60"
              >
                Message {data.operator.name}
              </button>
            </aside>
          </div>
        )}
      </PageContainer>

      <CenteredDialog open={dialog === "cancel"} onClose={() => setDialog(null)} labelledBy="cancel-title" className="max-w-[440px]">
        <div className="flex flex-col gap-3 p-6">
          <h2 id="cancel-title" className="text-lg font-bold text-[#0f172a]">
            Cancel this booking?
          </h2>
          {preview.isPending && <p className="text-sm text-gray-500">Working out your refund…</p>}
          {preview.data && (
            <p className="rounded-xl bg-[#f8fafc] p-3.5 text-sm leading-5 text-[#334155]">
              You would get back <strong>{formatMoney(preview.data.refundAmount, preview.data.currency ?? "GHS")}</strong> ({preview.data.refundPercent}%). {preview.data.terms}
            </p>
          )}
          <div className="flex justify-end gap-2.5">
            <button type="button" onClick={() => setDialog(null)} className="h-10 rounded-[10px] border border-gray-200 px-4 text-sm font-medium">
              Keep booking
            </button>
            <button
              type="button"
              disabled={cancel.isPending || preview.isPending}
              onClick={() => cancel.mutate(undefined, { onSuccess: () => { showSuccessToast("Booking cancelled"); setDialog(null); } })}
              className="h-10 rounded-[10px] bg-[#dc2626] px-4 text-sm font-medium text-white disabled:opacity-60"
            >
              {cancel.isPending ? "Cancelling…" : "Cancel booking"}
            </button>
          </div>
        </div>
      </CenteredDialog>

      <CenteredDialog open={dialog === "modify"} onClose={() => setDialog(null)} labelledBy="modify-title" className="max-w-[440px]">
        <div className="flex flex-col gap-3 p-6">
          <h2 id="modify-title" className="text-lg font-bold text-[#0f172a]">
            Change your dates
          </h2>
          <p className="text-sm text-gray-500">Allowed until 24 hours before check-in, and only if it does not cost more than you paid. To stay longer, use Extend.</p>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} aria-label="New check in" className={FIELD} />
            <input type="date" value={checkOut} min={checkIn} onChange={(event) => setCheckOut(event.target.value)} aria-label="New check out" className={FIELD} />
          </div>
          <div className="flex justify-end gap-2.5">
            <button type="button" onClick={() => setDialog(null)} className="h-10 rounded-[10px] border border-gray-200 px-4 text-sm font-medium">
              Cancel
            </button>
            <button type="button" disabled={modify.isPending} onClick={() => modify.mutate()} className="h-10 rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white disabled:opacity-60">
              {modify.isPending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </CenteredDialog>

      <CenteredDialog open={dialog === "extend"} onClose={() => setDialog(null)} labelledBy="extend-title" className="max-w-[440px]">
        <div className="flex flex-col gap-3 p-6">
          <h2 id="extend-title" className="text-lg font-bold text-[#0f172a]">
            Extend your stay
          </h2>
          <p className="text-sm text-gray-500">We hold the extra nights for 15 minutes while you pay for them.</p>
          <label className="flex items-center gap-3 text-sm font-medium text-[#0f172a]">
            Extra nights
            <input type="number" min={1} max={30} value={extra} onChange={(event) => setExtra(Math.max(1, Number(event.target.value) || 1))} className={cn(FIELD, "w-24")} />
          </label>
          <div className="flex justify-end gap-2.5">
            <button type="button" onClick={() => setDialog(null)} className="h-10 rounded-[10px] border border-gray-200 px-4 text-sm font-medium">
              Cancel
            </button>
            <button type="button" disabled={extend.isPending} onClick={() => extend.mutate()} className="h-10 rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white disabled:opacity-60">
              {extend.isPending ? "Holding…" : "Continue to payment"}
            </button>
          </div>
        </div>
      </CenteredDialog>
    </AppShell>
  );
}
