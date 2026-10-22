"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { use } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageContainer } from "@/components/shared/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { errorMessage } from "@/lib/errors";
import { formatDateTime, formatMoney } from "@/lib/format";
import { getPayment, PAYMENT_STATUS_LABEL, PAYMENT_STATUS_TONE } from "@/lib/payments-api";
import { cn } from "@/lib/utils";

export default function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const payment = useQuery({ queryKey: ["payments", "one", id], queryFn: () => getPayment(id) });
  const data = payment.data;
  const currency = data?.currency ?? "GHS";

  return (
    <AppShell contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "You", href: "/account-settings" }, { label: "Payments", href: "/payments" }, { label: data?.receiptNumber ?? "Payment" }]} />
        {payment.isPending && <Skeleton className="h-64 w-full max-w-[640px] rounded-2xl" />}
        {payment.isError && <p className="text-sm text-[#dc2626]">{errorMessage(payment.error)}</p>}
        {data && (
          <article className="flex w-full max-w-[640px] flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 print:border-0">
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{data.documentType}</p>
                <h1 className="text-xl font-bold text-[#0f172a]">{data.description ?? data.purpose}</h1>
                <p className="text-xs text-gray-500">
                  {data.receiptNumber ? `${data.receiptNumber} · ` : ""}reference {data.reference}
                </p>
              </div>
              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", PAYMENT_STATUS_TONE[data.status ?? ""])}>{PAYMENT_STATUS_LABEL[data.status ?? ""] ?? data.status}</span>
            </div>

            <div className="flex flex-col gap-1.5 border-y border-gray-200 py-3">
              {(data.lines ?? []).map((line, index) => (
                <p key={`${line.label}-${index}`} className="flex justify-between gap-3 text-[13px] text-[#334155]">
                  <span>{line.label}</span>
                  <span className="font-medium text-[#0f172a]">{formatMoney(line.amount, currency)}</span>
                </p>
              ))}
              <p className="flex justify-between gap-3 pt-1.5 text-[15px] font-bold text-[#0f172a]">
                <span>Total</span>
                <span>{formatMoney(data.amount, currency)}</span>
              </p>
              {data.refunded > 0 && <p className="text-[13px] text-[#16a34a]">Refunded {formatMoney(data.refunded, currency)}</p>}
            </div>

            {data.paidAt && <p className="text-[13px] text-gray-500">Paid {formatDateTime(data.paidAt)}</p>}
            {data.failureReason && <p className="text-[13px] text-[#dc2626]">{data.failureReason}</p>}

            <div className="flex flex-wrap items-center gap-3 print:hidden">
              {data.status === "Pending" && data.authorizationUrl && (
                <a href={data.authorizationUrl} className="h-10 rounded-[10px] bg-brand-900 px-4 text-sm font-medium leading-10 text-white">
                  Pay now
                </a>
              )}
              {data.purpose === "StayBooking" && (
                <Link href={`/stay/bookings/${data.subjectId}`} className="text-sm font-medium text-brand-900">
                  View booking
                </Link>
              )}
              <button type="button" onClick={() => window.print()} className="text-sm font-medium text-brand-900">
                Print
              </button>
            </div>
          </article>
        )}
      </PageContainer>
    </AppShell>
  );
}
