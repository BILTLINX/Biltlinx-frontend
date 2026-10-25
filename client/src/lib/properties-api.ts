import { apiRequest, apiRequestWithMeta, type QueryValue } from "@/lib/api";
import type {
  BulkResultDto,
  DocumentUploadTicketDto,
  DocumentUrlDto,
  DraftDto,
  DraftSummaryDto,
  ImpactDto,
  ListingChangeDto,
  ListingDocumentDto,
  PagedOfPropertyDto,
  PortfolioSummaryDto,
  PropertyDto,
  ReadinessDto,
  ViewingRequestDto,
} from "@/types/api/schema";

export interface PropertyQuery {
  page?: number;
  results?: number;
  q?: string;
  city?: string;
  listingType?: "Sale" | "Rent";
  propertyType?: string;
  status?: string;
  availability?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "relevance";
  minBedrooms?: number;
  minBathrooms?: number;
  minFloorArea?: number;
  maxFloorArea?: number;
  minLandSize?: number;
  maxLandSize?: number;
  listedSince?: string;
  assignedToMe?: boolean;
}

export function listProperties(query: PropertyQuery, signal?: AbortSignal) {
  return apiRequest<PagedOfPropertyDto>("/properties", { query: query as Record<string, QueryValue>, signal });
}

export function listMyProperties(query: PropertyQuery, signal?: AbortSignal) {
  return apiRequest<PagedOfPropertyDto>("/properties/mine", { query: query as Record<string, QueryValue>, signal });
}

export function getPortfolioSummary() {
  return apiRequest<PortfolioSummaryDto>("/properties/mine/summary");
}

export function getProperty(id: string) {
  return apiRequest<PropertyDto>(`/properties/${id}`);
}

export function getRelatedProperties(id: string) {
  return apiRequest<PropertyDto[]>(`/properties/${id}/related`);
}

export function getPropertyDocuments(id: string) {
  return apiRequest<ListingDocumentDto[]>(`/properties/${id}/documents`);
}

export function reportUnavailable(id: string) {
  return apiRequest(`/properties/${id}/report-unavailable`, { method: "POST" });
}

export function confirmAvailability(id: string) {
  return apiRequest(`/properties/${id}/confirm-availability`, { method: "POST" });
}

export type ListingAction = "pause" | "resume" | "close" | "archive" | "delete";

export function getImpact(id: string, action: ListingAction) {
  return apiRequest<ImpactDto>(`/properties/${id}/impact`, { query: { action } });
}

export function runListingAction(id: string, action: Exclude<ListingAction, "delete">, outcome?: "Sold" | "Rented") {
  return apiRequest(`/properties/${id}/${action}`, { method: "POST", body: action === "close" ? { outcome } : undefined });
}

export function deleteProperty(id: string) {
  return apiRequest(`/properties/${id}`, { method: "DELETE" });
}

export function bulkAction(ids: string[], action: string, outcome?: string) {
  return apiRequest<BulkResultDto[]>("/properties/bulk", { method: "POST", body: { ids, action, outcome } });
}

export function getListingChanges(id: string) {
  return apiRequest<ListingChangeDto[]>(`/properties/${id}/changes`);
}

export function requestViewing(propertyId: string, body: { preferredAt: string; alternativeAt?: string; message?: string }) {
  return apiRequest(`/properties/${propertyId}/viewings`, { method: "POST", body });
}

export function getMyViewings() {
  return apiRequest<ViewingRequestDto[]>("/viewings/mine");
}

export function getIncomingViewings(status?: string) {
  return apiRequest<ViewingRequestDto[]>("/viewings/incoming", { query: { status } });
}

export function confirmViewing(id: string, useAlternative = false) {
  return apiRequest(`/viewings/${id}/confirm`, { method: "POST", body: { useAlternative } });
}

export function proposeViewing(id: string, at: string, note?: string) {
  return apiRequest(`/viewings/${id}/propose`, { method: "POST", body: { at, note } });
}

export function declineViewing(id: string, note?: string) {
  return apiRequest(`/viewings/${id}/decline`, { method: "POST", body: note ? { note } : undefined });
}

export function acceptViewingProposal(id: string) {
  return apiRequest(`/viewings/${id}/accept-proposal`, { method: "POST" });
}

export function cancelViewing(id: string) {
  return apiRequest(`/viewings/${id}/cancel`, { method: "POST" });
}

export function listDrafts() {
  return apiRequest<DraftSummaryDto[]>("/listing-drafts");
}

export function getDraft(id: string) {
  return apiRequest<DraftDto>(`/listing-drafts/${id}`);
}

export async function createDraft(step: number, data: Record<string, unknown>) {
  const response = await apiRequestWithMeta("/listing-drafts", { method: "POST", body: { step, data } });
  return response.headers.get("Resource-ID") as string;
}

export function saveDraft(id: string, step: number, data: Record<string, unknown>) {
  return apiRequest(`/listing-drafts/${id}`, { method: "PUT", body: { step, data } });
}

export function deleteDraft(id: string) {
  return apiRequest(`/listing-drafts/${id}`, { method: "DELETE" });
}

export function getReadiness(id: string) {
  return apiRequest<ReadinessDto>(`/listing-drafts/${id}/readiness`);
}

export function getDraftPreview(id: string) {
  return apiRequest<PropertyDto>(`/listing-drafts/${id}/preview`);
}

export function submitDraft(id: string) {
  return apiRequest<PropertyDto>(`/listing-drafts/${id}/submit`, { method: "POST" });
}

export function publishDraft(id: string) {
  return apiRequest<PropertyDto>(`/listing-drafts/${id}/publish`, { method: "POST" });
}

export function requestDocumentUpload(propertyId: string, body: { kind: string; contentType: string; sizeBytes: number }) {
  return apiRequest<DocumentUploadTicketDto>(`/properties/${propertyId}/documents/uploads`, { method: "POST", body });
}

export function attachDocument(propertyId: string, body: Record<string, unknown>) {
  return apiRequest(`/properties/${propertyId}/documents`, { method: "POST", body });
}

export function removeDocument(propertyId: string, documentId: string) {
  return apiRequest(`/properties/${propertyId}/documents/${documentId}`, { method: "DELETE" });
}

export function getDocumentUrl(propertyId: string, documentId: string) {
  return apiRequest<DocumentUrlDto>(`/properties/${propertyId}/documents/${documentId}/url`);
}
