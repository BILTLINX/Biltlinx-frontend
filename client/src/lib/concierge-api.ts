import { apiRequest, apiRequestWithMeta } from "@/lib/api";
import type { Paged } from "@/types/api/common";
import type {
  ConciergeFeePayment,
  ConciergePlanDto,
  ConciergeRequestCardDto,
  ConciergeRequestDto,
  ConciergeShortlistInput,
  ConciergeStaffCardDto,
  ConciergeStaffRequestDto,
  ConciergeStatus,
  ConciergeStepInput,
  NewConciergeRequest,
} from "@/types/api/concierge";

export async function createConciergeRequest(input: NewConciergeRequest) {
  const { data } = await apiRequestWithMeta<{ id: string }>("/concierge/requests", { method: "POST", body: input });
  return data;
}

export function listMyConciergeRequests(openOnly = false) {
  return apiRequest<Paged<ConciergeRequestCardDto>>("/concierge/requests", { query: { results: 20, openOnly } });
}

export function getMyConciergeRequest(id: string) {
  return apiRequest<ConciergeRequestDto>(`/concierge/requests/${id}`);
}

export function cancelConciergeRequest(id: string) {
  return apiRequest<ConciergeRequestDto>(`/concierge/requests/${id}/cancel`, { method: "POST" });
}

export function listConciergeQueue(status?: ConciergeStatus) {
  return apiRequest<Paged<ConciergeStaffCardDto>>("/concierge/staff/requests", { query: { results: 50, status }, skipSignInRedirect: true });
}

export function getConciergeStaffRequest(id: string) {
  return apiRequest<ConciergeStaffRequestDto>(`/concierge/staff/requests/${id}`);
}

export function saveConciergePlan(id: string, steps: ConciergeStepInput[]) {
  return apiRequest<ConciergeStaffRequestDto>(`/concierge/staff/requests/${id}/plan`, { method: "PUT", body: { steps } });
}

export function setConciergeStatus(id: string, status: ConciergeStatus) {
  return apiRequest<ConciergeStaffRequestDto>(`/concierge/staff/requests/${id}/status`, { method: "POST", body: { status } });
}

export function listConciergePlans() {
  return apiRequest<ConciergePlanDto[]>("/concierge/plans");
}

export function payConciergeFee(id: string, email: string) {
  return apiRequest<ConciergeFeePayment>(`/concierge/requests/${id}/fee/pay`, { method: "POST", body: { email } });
}

export function quoteConciergeFee(id: string, amount: number) {
  return apiRequest<ConciergeStaffRequestDto>(`/concierge/staff/requests/${id}/quote`, { method: "POST", body: { amount } });
}

export function addConciergeShortlist(id: string, input: ConciergeShortlistInput) {
  return apiRequest<ConciergeStaffRequestDto>(`/concierge/staff/requests/${id}/shortlist`, { method: "POST", body: input });
}

export function removeConciergeShortlist(id: string, entryId: string) {
  return apiRequest<ConciergeStaffRequestDto>(`/concierge/staff/requests/${id}/shortlist/${entryId}`, { method: "DELETE" });
}

export function addConciergeUpdate(id: string, text: string, mediaUrls: string[]) {
  return apiRequest<ConciergeStaffRequestDto>(`/concierge/staff/requests/${id}/updates`, { method: "POST", body: { text, mediaUrls } });
}
