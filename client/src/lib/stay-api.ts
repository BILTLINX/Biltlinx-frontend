import { apiRequest, apiRequestWithMeta, type QueryValue } from "@/lib/api";
import type {
  BookingEventDto,
  CancellationPreviewDto,
  CheckoutResultDto,
  PagedOfBookingDto,
  PagedOfStayCardDto,
  PaymentDto,
  SaveRatePlanInput,
  SaveRoomInput,
  SaveStayInput,
  StayBookingDto,
  StayCardDto,
  StayDetailDto,
  StayQuoteDto,
} from "@/types/api/schema";

export interface StaySearchQuery {
  page?: number;
  results?: number;
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
  type?: string;
  shape?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  studentOnly?: boolean;
  academicPeriodId?: string;
  breakfast?: boolean;
  sort?: "newest" | "priceAsc" | "priceDesc";
}

export const STAY_TYPES = ["Hotel", "GuestHouse", "Hostel", "Apartment", "StudentHostel"] as const;
export const STAY_AMENITIES = ["WiFi", "Pool", "Parking", "AirConditioning", "Kitchen", "Breakfast", "Generator", "Security"] as const;

export function searchStays(query: StaySearchQuery, signal?: AbortSignal) {
  return apiRequest<PagedOfStayCardDto>("/stay/search", { query: query as Record<string, QueryValue>, signal });
}

export function getStay(id: string, query: { checkIn?: string; checkOut?: string; guests?: number; rooms?: number } = {}) {
  return apiRequest<StayDetailDto>(`/stay/${id}`, { query });
}

export function quoteStay(input: { ratePlanId: string; checkIn: string; checkOut: string; guests?: number; rooms?: number }) {
  return apiRequest<StayQuoteDto>("/stay/quote", { method: "POST", body: input });
}

export function holdBooking(
  input: { ratePlanId: string; checkIn: string; checkOut: string; guests?: number; rooms?: number; academicPeriodId?: string },
  idempotencyKey: string,
) {
  return apiRequest<StayBookingDto>("/stay/bookings", { method: "POST", body: input, headers: { "Idempotency-Key": idempotencyKey } });
}

export function listMyBookings(query: { page?: number; results?: number; status?: string } = {}) {
  return apiRequest<PagedOfBookingDto>("/stay/bookings/mine", { query: query as Record<string, QueryValue> });
}

export function getBooking(id: string) {
  return apiRequest<StayBookingDto>(`/stay/bookings/${id}`);
}

export function getBookingHistory(id: string) {
  return apiRequest<BookingEventDto[]>(`/stay/bookings/${id}/history`);
}

export function checkoutBooking(
  id: string,
  input: { guestName: string; guestPhone: string; guestEmail: string; specialRequests?: string; acceptTerms: boolean },
  idempotencyKey: string,
) {
  return apiRequest<CheckoutResultDto>(`/stay/bookings/${id}/checkout`, { method: "POST", body: input, headers: { "Idempotency-Key": idempotencyKey } });
}

export function getCancellationPreview(id: string) {
  return apiRequest<CancellationPreviewDto>(`/stay/bookings/${id}/cancellation-preview`);
}

export function cancelBooking(id: string) {
  return apiRequest(`/stay/bookings/${id}/cancel`, { method: "POST" });
}

export function modifyBooking(id: string, input: { checkIn: string; checkOut: string; guests?: number; rooms?: number }) {
  return apiRequest(`/stay/bookings/${id}/modify`, { method: "POST", body: input });
}

export function extendBooking(id: string, extraNights: number, idempotencyKey: string) {
  return apiRequest<StayBookingDto>(`/stay/bookings/${id}/extend`, { method: "POST", body: { extraNights }, headers: { "Idempotency-Key": idempotencyKey } });
}

export function verifyPayment(reference: string) {
  return apiRequest<PaymentDto>(`/payments/${encodeURIComponent(reference)}/verify`, { method: "POST" });
}

export function listOperatorProperties() {
  return apiRequest<StayCardDto[]>("/stay/operator/properties");
}

export async function createOperatorProperty(input: Partial<SaveStayInput>) {
  const response = await apiRequestWithMeta("/stay/operator/properties", { method: "POST", body: input });
  return response.headers.get("Resource-ID") as string;
}

export function updateOperatorProperty(id: string, input: Partial<SaveStayInput>) {
  return apiRequest(`/stay/operator/properties/${id}`, { method: "PUT", body: input });
}

export function publishOperatorProperty(id: string) {
  return apiRequest(`/stay/operator/properties/${id}/publish`, { method: "POST" });
}

export function pauseOperatorProperty(id: string) {
  return apiRequest(`/stay/operator/properties/${id}/pause`, { method: "POST" });
}

export function addRoom(propertyId: string, input: Partial<SaveRoomInput>) {
  return apiRequest(`/stay/operator/properties/${propertyId}/rooms`, { method: "POST", body: input });
}

export function updateRoom(propertyId: string, roomId: string, input: Partial<SaveRoomInput>) {
  return apiRequest(`/stay/operator/properties/${propertyId}/rooms/${roomId}`, { method: "PUT", body: input });
}

export function retireRoom(propertyId: string, roomId: string) {
  return apiRequest(`/stay/operator/properties/${propertyId}/rooms/${roomId}`, { method: "DELETE" });
}

export function addRate(propertyId: string, roomId: string, input: Partial<SaveRatePlanInput>) {
  return apiRequest(`/stay/operator/properties/${propertyId}/rooms/${roomId}/rates`, { method: "POST", body: input });
}

export function retireRate(propertyId: string, roomId: string, planId: string) {
  return apiRequest(`/stay/operator/properties/${propertyId}/rooms/${roomId}/rates/${planId}`, { method: "DELETE" });
}

export function blockUnits(propertyId: string, roomId: string, input: { from: string; to: string; units?: number; reason?: string }) {
  return apiRequest(`/stay/operator/properties/${propertyId}/rooms/${roomId}/blocks`, { method: "POST", body: input });
}

export function removeBlock(propertyId: string, blockId: string) {
  return apiRequest(`/stay/operator/properties/${propertyId}/blocks/${blockId}`, { method: "DELETE" });
}

export function listReservations(query: { page?: number; results?: number; status?: string; stayId?: string; from?: string; to?: string } = {}) {
  return apiRequest<PagedOfBookingDto>("/stay/operator/bookings", { query: query as Record<string, QueryValue> });
}

export type ReservationAction = "cancel" | "no-show" | "complete" | "release-deposit";

export function reservationAction(id: string, action: ReservationAction, reason?: string) {
  return apiRequest(`/stay/operator/bookings/${id}/${action}`, { method: "POST", body: action === "cancel" ? { reason } : undefined });
}
