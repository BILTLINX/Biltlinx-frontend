import { apiRequest, type QueryValue } from "@/lib/api";
import type { PagedOfPaymentDto, PaymentDto } from "@/types/api/schema";

export function listPayments(query: { page?: number; results?: number; status?: string } = {}) {
  return apiRequest<PagedOfPaymentDto>("/payments", { query: query as Record<string, QueryValue> });
}

export function getPayment(id: string) {
  return apiRequest<PaymentDto>(`/payments/${id}`);
}

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  Pending: "Waiting for you to pay",
  Processing: "Processing",
  Paid: "Paid",
  Failed: "Failed",
  PartiallyRefunded: "Partly refunded",
  Refunded: "Refunded",
};

export const PAYMENT_STATUS_TONE: Record<string, string> = {
  Pending: "bg-[#fef3c7] text-[#b45309]",
  Processing: "bg-[#fef3c7] text-[#b45309]",
  Paid: "bg-[#dcfce7] text-[#16a34a]",
  Failed: "bg-[#fee2e2] text-[#dc2626]",
  PartiallyRefunded: "bg-[#eff5ff] text-brand-900",
  Refunded: "bg-[#f1f5f9] text-[#334155]",
};
