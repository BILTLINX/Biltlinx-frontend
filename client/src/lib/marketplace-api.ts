import { apiRequest, apiRequestWithMeta, type QueryValue } from "@/lib/api";
import type { Paged } from "@/types/api/common";
import type {
  MarketFacets,
  MarketListing,
  MarketListingInput,
  MarketListingStatus,
  MarketOffer,
  MarketOrder,
  MarketOrderPayment,
  MarketOrderStatus,
  MarketStaffOrder,
  MyMarketListing,
  PlaceMarketOrderInput,
  StaffMarketListing,
} from "@/types/api/marketplace";

export interface MarketplaceQuery {
  page?: number;
  results?: number;
  q?: string;
  category?: string;
  city?: string;
  unit?: string;
  minPrice?: number;
  maxPrice?: number;
  delivery?: boolean;
  sort?: string;
}

export function searchMarketplace(query: MarketplaceQuery, signal?: AbortSignal) {
  return apiRequest<Paged<MarketOffer>>("/marketplace", { query: query as Record<string, QueryValue>, signal });
}

export function getFacets() {
  return apiRequest<MarketFacets>("/marketplace/facets");
}

export function getMarketListing(id: string) {
  return apiRequest<MarketListing>(`/marketplace/listings/${id}`);
}

export async function createMarketListing(input: MarketListingInput) {
  const { data } = await apiRequestWithMeta<{ id: string }>("/marketplace/listings", { method: "POST", body: input });
  return data;
}

export function updateMarketListing(id: string, input: MarketListingInput) {
  return apiRequest<MarketListing>(`/marketplace/listings/${id}`, { method: "PUT", body: input });
}

export function listMyMarketListings(status?: MarketListingStatus) {
  return apiRequest<Paged<MyMarketListing>>("/marketplace/listings/mine", { query: { results: 50, status } });
}

export function pauseMarketListing(id: string) {
  return apiRequest<MarketListing>(`/marketplace/listings/${id}/pause`, { method: "POST" });
}

export function resumeMarketListing(id: string) {
  return apiRequest<MarketListing>(`/marketplace/listings/${id}/resume`, { method: "POST" });
}

export function removeMarketListing(id: string) {
  return apiRequest<void>(`/marketplace/listings/${id}`, { method: "DELETE" });
}

export function placeMarketOrder(input: PlaceMarketOrderInput) {
  return apiRequest<MarketOrder>("/marketplace/orders", { method: "POST", body: input });
}

export function listMarketOrders(role: "buyer" | "seller", status?: MarketOrderStatus) {
  return apiRequest<Paged<MarketOrder>>("/marketplace/orders", { query: { role, status, results: 50 } });
}

export function getMarketOrder(id: string) {
  return apiRequest<MarketOrder>(`/marketplace/orders/${id}`);
}

export function acceptMarketOrder(id: string) {
  return apiRequest<MarketOrder>(`/marketplace/orders/${id}/accept`, { method: "POST" });
}

export function declineMarketOrder(id: string, reason: string) {
  return apiRequest<MarketOrder>(`/marketplace/orders/${id}/decline`, { method: "POST", body: { reason } });
}

export function cancelMarketOrder(id: string, reason: string) {
  return apiRequest<MarketOrder>(`/marketplace/orders/${id}/cancel`, { method: "POST", body: { reason } });
}

export function payMarketOrder(id: string, email: string) {
  return apiRequest<MarketOrderPayment>(`/marketplace/orders/${id}/pay`, { method: "POST", body: { email } });
}

export function dispatchMarketOrder(id: string) {
  return apiRequest<MarketOrder>(`/marketplace/orders/${id}/dispatch`, { method: "POST" });
}

export function confirmMarketOrder(id: string) {
  return apiRequest<MarketOrder>(`/marketplace/orders/${id}/confirm`, { method: "POST" });
}

export function disputeMarketOrder(id: string, reason: string) {
  return apiRequest<MarketOrder>(`/marketplace/orders/${id}/dispute`, { method: "POST", body: { reason } });
}

export function listStaffMarketListings(status?: MarketListingStatus) {
  return apiRequest<Paged<StaffMarketListing>>("/marketplace/staff/listings", { query: { results: 50, status } });
}

export function approveMarketListing(id: string) {
  return apiRequest<MarketListing>(`/marketplace/staff/listings/${id}/approve`, { method: "POST" });
}

export function rejectMarketListing(id: string, reason: string) {
  return apiRequest<MarketListing>(`/marketplace/staff/listings/${id}/reject`, { method: "POST", body: { reason } });
}

export function listStaffMarketOrders(kind: "disputes" | "payouts") {
  return apiRequest<Paged<MarketStaffOrder>>("/marketplace/staff/orders", { query: { kind, results: 50 } });
}

export function resolveMarketDispute(id: string, outcome: "Release" | "Refund", note: string) {
  return apiRequest<MarketStaffOrder>(`/marketplace/staff/orders/${id}/resolve`, { method: "POST", body: { outcome, note } });
}

export function markMarketPayoutPaid(id: string, note: string) {
  return apiRequest<MarketStaffOrder>(`/marketplace/staff/orders/${id}/payout`, { method: "POST", body: { note } });
}
