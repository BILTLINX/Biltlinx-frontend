"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageContainer } from "@/components/shared/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { errorMessage } from "@/lib/errors";
import { formatDate, formatMoney } from "@/lib/format";
import { listPayments, PAYMENT_STATUS_LABEL, PAYMENT_STATUS_TONE } from "@/lib/payments-api";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: undefined, label: "All" },
  { key: "Paid", label: "Paid" },
  { key: "Pending", label: "Unpaid" },
  { key: "Failed", label: "Failed" },
  { key: "Refunded", label: "Refunded" },
] as const;

export default function PaymentsPage() {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const payments = useInfiniteQuery({
    queryKey: ["payments", status],
    queryFn: ({ pageParam }) => listPayments({ page: pageParam, results: 15, status }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.currentPage < last.totalPages ? last.currentPage + 1 : undefined),
  });
  const items = useMemo(() => payments.data?.pages.flatMap((page) => page.items ?? []) ?? [], [payments.data]);

  return (
    <AppShell contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "You" }, { label: "Payments" }]} />
        <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Payments</h1>

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

        {payments.isPending && <Skeleton className="h-20 w-full rounded-2xl" />}
        {payments.isError && <p className="text-sm text-[#dc2626]">{errorMessage(payments.error)}</p>}
        {!payments.isPending && items.length === 0 && <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">No payments yet.</p>}

        <div className="flex flex-col gap-3">
          {items.map((payment) => (
            <Link key={payment.id} href={`/payments/${payment.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-gray-200 bg-white p-4 hover:border-brand-900">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold text-[#0f172a]">{payment.description ?? payment.purpose}</p>
                <p className="text-xs text-gray-500">
                  {payment.documentType} · {formatDate(payment.paidAt ?? payment.createdAt)}
                  {payment.receiptNumber ? ` · ${payment.receiptNumber}` : ""}
                </p>
              </div>
              <p className="text-[15px] font-bold text-[#0f172a]">{formatMoney(payment.amount, payment.currency ?? "GHS")}</p>
              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", PAYMENT_STATUS_TONE[payment.status ?? ""])}>{PAYMENT_STATUS_LABEL[payment.status ?? ""] ?? payment.status}</span>
            </Link>
          ))}
        </div>
        {payments.hasNextPage && (
          <button type="button" disabled={payments.isFetchingNextPage} onClick={() => void payments.fetchNextPage()} className="self-center text-[13px] font-medium text-brand-900">
            {payments.isFetchingNextPage ? "Loading…" : "Load more"}
          </button>
        )}
      </PageContainer>
    </AppShell>
  );
}
