import { apiRequest, apiRequestWithMeta, type QueryValue } from "@/lib/api";
import type {
  AvailabilityDayDto,
  InspectionBody,
  OfferingDto,
  OfferingRequest,
  PagedOfOfferingDto,
  PagedOfProviderCardDto,
  PortfolioRequest,
  ProviderDto,
  QuoteBody,
  QuoteRequestBody,
  QuoteRequestDto,
  SaveProviderRequest,
  ServicesBookingDto,
  TaxonomyDto,
  TradeSuggestion,
} from "@/types/api/schema";

export interface ProviderQuery {
  page?: number;
  results?: number;
  q?: string;
  city?: string;
  category?: string;
  credentialVerified?: boolean;
  urgent?: boolean;
  kind?: "professional" | "artisan";
}

export interface OfferingQuery {
  page?: number;
  results?: number;
  q?: string;
  category?: string;
  city?: string;
  mode?: string;
  minPrice?: number;
  maxPrice?: number;
  providerId?: string;
  sort?: "priceAsc" | "priceDesc";
}

export function getTaxonomy() {
  return apiRequest<TaxonomyDto>("/services/taxonomy");
}

export function suggestTrade(problem: string) {
  return apiRequest<TradeSuggestion[]>("/services/suggest-trade", { query: { problem } });
}

export function searchProviders(query: ProviderQuery, signal?: AbortSignal) {
  return apiRequest<PagedOfProviderCardDto>("/services/providers", { query: query as Record<string, QueryValue>, signal });
}

export function getProvider(id: string) {
  return apiRequest<ProviderDto>(`/services/providers/${id}`);
}

export function getMyProvider() {
  return apiRequest<ProviderDto>("/services/providers/me");
}

export function saveMyProvider(input: Partial<SaveProviderRequest>) {
  return apiRequest("/services/providers/me", { method: "PUT", body: input });
}

export function publishMyProvider() {
  return apiRequest("/services/providers/me/publish", { method: "POST" });
}

export function unpublishMyProvider() {
  return apiRequest("/services/providers/me/unpublish", { method: "POST" });
}

export function addPortfolioItem(input: Partial<PortfolioRequest>) {
  return apiRequest("/services/providers/me/portfolio", { method: "POST", body: input });
}

export function removePortfolioItem(itemId: string) {
  return apiRequest(`/services/providers/me/portfolio/${itemId}`, { method: "DELETE" });
}

export function searchOfferings(query: OfferingQuery, signal?: AbortSignal) {
  return apiRequest<PagedOfOfferingDto>("/services", { query: query as Record<string, QueryValue>, signal });
}

export function listMyOfferings() {
  return apiRequest<OfferingDto[]>("/services/mine");
}

export function getOffering(id: string) {
  return apiRequest<OfferingDto>(`/services/${id}`);
}

export async function createOffering(input: Partial<OfferingRequest>) {
  const response = await apiRequestWithMeta("/services", { method: "POST", body: input });
  return response.headers.get("Resource-ID") as string;
}

export function updateOffering(id: string, input: Partial<OfferingRequest>) {
  return apiRequest(`/services/${id}`, { method: "PUT", body: input });
}

export function offeringAction(id: string, action: "publish" | "pause" | "archive") {
  return apiRequest(`/services/${id}/${action}`, { method: "POST" });
}

export function getAvailability(id: string, from: string, days = 30) {
  return apiRequest<AvailabilityDayDto[]>(`/services/${id}/availability`, { query: { from, days } });
}

export function bookService(id: string, input: { date: string; notes?: string; acceptTerms: boolean }) {
  return apiRequest(`/services/${id}/bookings`, { method: "POST", body: input });
}

export function listMyServiceBookings() {
  return apiRequest<ServicesBookingDto[]>("/services/bookings/mine");
}

export function listIncomingServiceBookings() {
  return apiRequest<ServicesBookingDto[]>("/services/bookings/incoming");
}

export function serviceBookingAction(id: string, action: "confirm" | "decline" | "complete" | "cancel", note?: string) {
  return apiRequest(`/services/bookings/${id}/${action}`, { method: "POST", body: note ? { note } : undefined });
}

export function createQuoteRequest(input: Partial<QuoteRequestBody>) {
  return apiRequest<QuoteRequestDto>("/services/quote-requests", { method: "POST", body: input });
}

export function listMyQuoteRequests() {
  return apiRequest<QuoteRequestDto[]>("/services/quote-requests/mine");
}

export function listIncomingQuoteRequests() {
  return apiRequest<QuoteRequestDto[]>("/services/quote-requests/incoming");
}

export function getQuoteRequest(id: string) {
  return apiRequest<QuoteRequestDto>(`/services/quote-requests/${id}`);
}

export function cancelQuoteRequest(id: string) {
  return apiRequest(`/services/quote-requests/${id}/cancel`, { method: "POST" });
}

export function sendQuote(requestId: string, input: Partial<QuoteBody>) {
  return apiRequest(`/services/quote-requests/${requestId}/quotes`, { method: "POST", body: input });
}

export function quoteAction(quoteId: string, action: "accept" | "reject" | "withdraw") {
  return apiRequest(`/services/quotes/${quoteId}/${action}`, { method: "POST" });
}

export function proposeInspection(requestId: string, input: InspectionBody) {
  return apiRequest(`/services/quote-requests/${requestId}/inspections`, { method: "POST", body: input });
}

export function inspectionAction(inspectionId: string, action: "confirm" | "decline" | "cancel" | "complete") {
  return apiRequest(`/services/inspections/${inspectionId}/${action}`, { method: "POST" });
}
