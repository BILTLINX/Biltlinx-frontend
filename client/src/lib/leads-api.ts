import { apiRequest, type QueryValue } from "@/lib/api";
import type { BoardDto, EnquiryResult, LeadDto, MyLeadDto, PagedOfLeadCardDto, PagedOfMyLeadDto, QualificationInput } from "@/types/api/schema";

export const LEAD_STAGES = [
  "New",
  "Contacted",
  "Qualified",
  "ViewingRequested",
  "ViewingScheduled",
  "Viewed",
  "Negotiating",
  "DecisionPending",
  "ClosedWon",
  "ClosedLost",
  "ClosedSpam",
] as const;

export type LeadStageName = (typeof LEAD_STAGES)[number];

export function enquire(input: { listingId: string; message?: string; qualification?: Partial<QualificationInput>; campaign?: string }) {
  return apiRequest<EnquiryResult>("/leads", { method: "POST", body: input });
}

export function listMyEnquiries(query: { page?: number; results?: number } = {}) {
  return apiRequest<PagedOfMyLeadDto>("/leads/mine", { query });
}

export function getMyEnquiry(id: string) {
  return apiRequest<MyLeadDto>(`/leads/mine/${id}`);
}

export function listLeads(query: { page?: number; results?: number; stage?: string; followUps?: boolean; openOnly?: boolean } = {}) {
  return apiRequest<PagedOfLeadCardDto>("/leads", { query: query as Record<string, QueryValue> });
}

export function getLeadBoard() {
  return apiRequest<BoardDto>("/leads/board");
}

export function getLead(id: string) {
  return apiRequest<LeadDto>(`/leads/${id}`);
}

export function moveLead(id: string, stage: LeadStageName, reason?: string) {
  return apiRequest(`/leads/${id}/stage`, { method: "POST", body: { stage, reason } });
}

export function reopenLead(id: string) {
  return apiRequest(`/leads/${id}/reopen`, { method: "POST" });
}

export function setNextAction(id: string, body: { at?: string; note?: string; snoozeUntil?: string }) {
  return apiRequest(`/leads/${id}/next-action`, { method: "POST", body });
}

export function addLeadNote(id: string, text: string) {
  return apiRequest(`/leads/${id}/notes`, { method: "POST", body: { text } });
}
