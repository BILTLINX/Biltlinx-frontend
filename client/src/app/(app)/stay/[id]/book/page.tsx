"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, use, useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { FIELD_BOX, FIELD_INPUT, FormField } from "@/components/shared/ModalFormParts";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSession } from "@/context/SessionContext";
import { useBooking } from "@/hooks/useStay";
import { errorMessage, notifyError } from "@/lib/errors";
import { formatDate, formatMoney } from "@/lib/format";
import { newIdempotencyKey } from "@/lib/idempotency";
import { checkoutBooking } from "@/lib/stay-api";
import { isNonEmpty, isValidPhone } from "@/lib/validation";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5";

function useCountdown(expiresAt: string | null | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  if (!expiresAt) return null;
  const end = new Date(/(Z|[+-]\d{2}:?\d{2})$/.test(expiresAt) ? expiresAt : `${expiresAt}Z`).getTime();
  return Math.max(0, Math.floor((end - now) / 1000));
}

function formatClock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex items-start justify-between gap-3 text-[13px] leading-[19px]", strong && "font-bold text-[#0f172a]")}>
      <span className={strong ? undefined : "text-gray-500"}>{label}</span>
      <span className={cn("shrink-0 whitespace-nowrap", !strong && "font-medium text-[#0f172a]")}>{value}</span>
    </div>
  );
}

function Checkout({ id }: { id: string }) {
  const router = useRouter();
  const bookingId = useSearchParams().get("booking") ?? "";
  const { user } = useSession();
  const booking = useBooking(bookingId);
  const key = useRef(newIdempotencyKey());

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [requests, setRequests] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string }>({});
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current || !user) return;
    seeded.current = true;
    setName(user.username);
    setPhone(user.primaryContact);
    setEmail(user.accounts[0]?.email ?? "");
  }, [user]);

  const data = booking.data;
  const remaining = useCountdown(data?.status === "Held" || data?.status === "PendingPayment" ? data.holdExpiresAt : null);
  const expired = data?.status === "Expired" || (remaining !== null && remaining <= 0 && data?.status === "Held");

  const pay = useMutation({
    mutationFn: () =>
      checkoutBooking(
        bookingId,
        { guestName: name.trim(), guestPhone: phone.trim(), guestEmail: email.trim(), specialRequests: requests.trim() || undefined, acceptTerms: terms },
        key.current,
      ),
    onSuccess: (result) => {
      if (result.authorizationUrl) window.location.assign(result.authorizationUrl);
      else router.push(`/stay/bookings/${bookingId}`);
    },
    onError: (error) => {
      key.current = newIdempotencyKey();
      notifyError(error, "We could not start the payment.");
    },
  });

  function submit() {
    const found = {
      name: isNonEmpty(name) ? undefined : "Enter the guest name",
      phone: isValidPhone(phone) ? undefined : "Enter a valid phone number",
      email: /^\S+@\S+\.\S+$/.test(email.trim()) ? undefined : "Enter a valid email address",
    };
    setErrors(found);
    if (found.name || found.phone || found.email || !terms) return;
    pay.mutate();
  }

  useEffect(() => {
    if (data && (data.status === "Confirmed" || data.status === "Modified")) router.replace(`/stay/bookings/${bookingId}`);
  }, [data, bookingId, router]);

  return (
    <AppShell activeKey="property" activeChildKey="stay" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Stay", href: "/stay" }, { label: data?.propertyName ?? "Stay", href: `/stay/${id}` }, { label: "Confirm and pay" }]} />
        <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Confirm and pay</h1>

        {!bookingId && <p className="text-sm text-gray-500">Choose a room first. <Link href={`/stay/${id}`} className="font-medium text-brand-900">Back to the stay</Link></p>}
        {booking.isPending && bookingId && <Skeleton className="h-64 w-full rounded-2xl" />}
        {booking.isError && <p className="text-sm text-[#dc2626]">{errorMessage(booking.error)}</p>}

        {data && (
          <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
            <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
              {expired || data.status === "Cancelled" ? (
                <section className={CARD}>
                  <h2 className="text-base font-bold text-[#0f172a]">{data.status === "Cancelled" ? "This booking was cancelled" : "Your hold has expired"}</h2>
                  <p className="text-sm text-gray-500">The room was released so others can book it. You can choose it again if it is still free.</p>
                  <Link href={`/stay/${id}?checkIn=${data.checkIn}&checkOut=${data.checkOut}&guests=${data.guests}&rooms=${data.units}`} className="self-start text-sm font-medium text-brand-900">
                    Pick the room again
                  </Link>
                </section>
              ) : (
                <>
                  {remaining !== null && (
                    <div className="flex items-center gap-3 rounded-2xl bg-[#fef3c7] p-4 text-[#b45309]">
                      <span className="text-xl font-bold tabular-nums" role="timer" aria-label="Time left to pay">
                        {formatClock(remaining)}
                      </span>
                      <p className="text-[13px] font-medium">We are holding this room for you. Pay before the timer ends or it goes back on sale.</p>
                    </div>
                  )}
                  {data.status === "PendingPayment" && (
                    <p className="rounded-xl bg-[#eff5ff] p-3 text-[13px] text-brand-900">A payment was started. If you did not finish it, you can pay again below.</p>
                  )}

                  <section className={CARD}>
                    <h2 className="text-base font-bold text-[#0f172a]">Guest details</h2>
                    <FormField label="Full name" error={errors.name}>
                      <label className={cn(FIELD_BOX, errors.name ? "border-[#dc2626]" : "border-gray-200")}>
                        <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className={FIELD_INPUT} />
                      </label>
                    </FormField>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <FormField label="Phone" error={errors.phone}>
                        <label className={cn(FIELD_BOX, errors.phone ? "border-[#dc2626]" : "border-gray-200")}>
                          <input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" autoComplete="tel" className={FIELD_INPUT} />
                        </label>
                      </FormField>
                      <FormField label="Email" error={errors.email}>
                        <label className={cn(FIELD_BOX, errors.email ? "border-[#dc2626]" : "border-gray-200")}>
                          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" className={FIELD_INPUT} />
                        </label>
                      </FormField>
                    </div>
                    <FormField label="Special requests (optional)">
                      <textarea
                        value={requests}
                        onChange={(event) => setRequests(event.target.value)}
                        rows={3}
                        className="rounded-[10px] border border-gray-200 px-3.5 py-2.5 text-sm text-[#0f172a] focus:border-brand-900 focus:outline-none"
                      />
                    </FormField>
                  </section>

                  <section className={CARD}>
                    <h2 className="text-base font-bold text-[#0f172a]">Cancellation</h2>
                    <p className="text-[13px] leading-[19px] text-[#334155]">{data.cancellationTerms}</p>
                    <label className="flex items-start gap-2.5 text-sm text-[#334155]">
                      <input type="checkbox" checked={terms} onChange={(event) => setTerms(event.target.checked)} className="mt-0.5 size-4 accent-[#1465e6]" />
                      I have read the cancellation terms and house rules and I agree to them.
                    </label>
                  </section>
                </>
              )}
            </div>

            <aside className="flex w-full flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 xl:sticky xl:top-0 xl:w-[380px] xl:shrink-0 xl:self-start">
              <h2 className="text-base font-bold text-[#0f172a]">{data.propertyName}</h2>
              <p className="text-[13px] text-gray-500">{data.roomName} · {data.ratePlanName}</p>
              <Line label="Dates" value={`${formatDate(data.checkIn)} to ${formatDate(data.checkOut)}`} />
              <Line label="Guests" value={`${data.guests} · ${data.units} ${data.units === 1 ? "room" : "rooms"}`} />
              <div className="flex flex-col gap-1.5 border-t border-gray-200 pt-3">
                {(data.price.lines ?? []).map((line, index) => (
                  <Line key={`${line.label}-${index}`} label={line.label ?? ""} value={formatMoney(line.amount, data.price.currency ?? "GHS")} />
                ))}
                <Line label="Total" value={formatMoney(data.price.total, data.price.currency ?? "GHS")} strong />
              </div>
              <Button
                variant="primary"
                disabled={expired || data.status === "Cancelled" || pay.isPending || !terms}
                onClick={submit}
                className="h-12 rounded-[10px] lg:rounded-[10px]"
              >
                {pay.isPending ? "Starting payment…" : `Pay ${formatMoney(data.price.total, data.price.currency ?? "GHS")}`}
              </Button>
              <p className="text-xs leading-[17px] text-gray-500">You will pay on Paystack&rsquo;s secure page with a card or mobile money. We never see your card details.</p>
            </aside>
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}

export default function StayCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={null}>
      <Checkout id={id} />
    </Suspense>
  );
}
