"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PageContainer } from "@/components/shared/PageContainer";
import { Spinner } from "@/components/shared/Spinner";
import { errorMessage } from "@/lib/errors";
import { formatMoney } from "@/lib/format";
import { getBooking, verifyPayment } from "@/lib/stay-api";

const POLL_MS = 2000;
const POLL_LIMIT_MS = 24_000;

function Result({ tone, title, body, children }: { tone: "ok" | "wait" | "fail"; title: string; body: string; children?: React.ReactNode }) {
  const style = tone === "ok" ? "bg-[#dcfce7] text-[#16a34a]" : tone === "wait" ? "bg-[#fef3c7] text-[#b45309]" : "bg-[#fee2e2] text-[#dc2626]";
  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-3.5 rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center">
      <span className={`flex size-16 items-center justify-center rounded-full text-[28px] font-bold ${style}`}>{tone === "ok" ? "✓" : tone === "wait" ? "…" : "!"}</span>
      <h1 className="text-xl font-bold text-[#0f172a]">{title}</h1>
      <p className="text-sm leading-5 text-gray-500">{body}</p>
      {children}
    </div>
  );
}

function PaymentReturn() {
  const params = useSearchParams();
  const reference = params.get("reference") ?? params.get("trxref") ?? "";
  const queryClient = useQueryClient();
  const [startedAt] = useState(() => Date.now());

  const payment = useQuery({
    queryKey: ["payment-verify", reference],
    queryFn: () => verifyPayment(reference),
    enabled: reference !== "",
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const isStay = payment.data?.purpose === "StayBooking";
  const bookingId = payment.data?.subjectId;
  const booking = useQuery({
    queryKey: ["stay", "booking", bookingId],
    queryFn: () => getBooking(bookingId as string),
    enabled: Boolean(isStay && bookingId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      const waiting = status === "Held" || status === "PendingPayment";
      return waiting && Date.now() - startedAt < POLL_LIMIT_MS ? POLL_MS : false;
    },
  });

  const status = booking.data?.status;
  useEffect(() => {
    if (status === "Confirmed") {
      void queryClient.invalidateQueries({ queryKey: ["action-needed"] });
      void queryClient.invalidateQueries({ queryKey: ["stay"] });
    }
  }, [status, queryClient]);

  let content: React.ReactNode;
  if (!reference) {
    content = <Result tone="fail" title="Nothing to check" body="This page opens after a payment. Go back to your bookings to see where things stand." />;
  } else if (payment.isPending) {
    content = (
      <div className="flex flex-col items-center gap-4 py-16">
        <Spinner />
        <p className="text-sm text-gray-500">Checking your payment with Paystack…</p>
      </div>
    );
  } else if (payment.isError) {
    content = <Result tone="fail" title="We could not check your payment" body={errorMessage(payment.error)} />;
  } else if (payment.data.status === "Failed") {
    content = <Result tone="fail" title="The payment did not go through" body={payment.data.failureReason ?? "You have not been charged. Your hold stays for a few minutes so you can try again."} />;
  } else if (payment.data.status === "Pending" || payment.data.status === "Processing") {
    content = <Result tone="wait" title="Your payment is still processing" body="Mobile money can take a minute. We will confirm your booking as soon as it arrives. You can leave this page." />;
  } else if (isStay && status === "Confirmed") {
    content = (
      <Result tone="ok" title="Booking confirmed" body={`${booking.data?.propertyName} · ${formatMoney(payment.data.amount, payment.data.currency ?? "GHS")} paid. The full address is now on your booking.`}>
        <Link href={`/stay/bookings/${bookingId}`} className="text-sm font-medium text-brand-900">
          View my booking
        </Link>
      </Result>
    );
  } else if (isStay && booking.isPending) {
    content = (
      <div className="flex flex-col items-center gap-4 py-16">
        <Spinner />
        <p className="text-sm text-gray-500">Payment received. Confirming your booking…</p>
      </div>
    );
  } else {
    content = (
      <Result tone="wait" title="Payment received" body="We are finalising your booking. This can take a moment. Check My bookings in a minute.">
        <Link href={isStay ? `/stay/bookings/${bookingId}` : "/stay/bookings"} className="text-sm font-medium text-brand-900">
          Go to my booking
        </Link>
      </Result>
    );
  }

  return (
    <AppShell activeKey="property" activeChildKey="stay" contentFullWidth>
      <PageContainer>{content}</PageContainer>
    </AppShell>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={null}>
      <PaymentReturn />
    </Suspense>
  );
}
