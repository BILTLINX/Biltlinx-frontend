import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PAGE_SIZE, usePagedSearch } from "@/hooks/usePagedSearch";
import { notifyError } from "@/lib/errors";
import {
  bookService,
  cancelQuoteRequest,
  createQuoteRequest,
  getAvailability,
  getMyProvider,
  getOffering,
  getProvider,
  getQuoteRequest,
  getTaxonomy,
  inspectionAction,
  listIncomingQuoteRequests,
  listIncomingServiceBookings,
  listMyOfferings,
  listMyQuoteRequests,
  listMyServiceBookings,
  proposeInspection,
  quoteAction,
  searchOfferings,
  searchProviders,
  sendQuote,
  serviceBookingAction,
  suggestTrade,
  type OfferingQuery,
  type ProviderQuery,
} from "@/lib/services-api";
import { ApiError } from "@/lib/api";

export const SERVICES_KEY = ["services"] as const;

export function useTaxonomy() {
  return useQuery({ queryKey: [...SERVICES_KEY, "taxonomy"], queryFn: getTaxonomy, staleTime: Infinity });
}

export function useTradeSuggestions(problem: string) {
  return useQuery({
    queryKey: [...SERVICES_KEY, "suggest", problem],
    queryFn: () => suggestTrade(problem),
    enabled: problem.trim().length >= 4,
    staleTime: 60_000,
  });
}

export function useProviders(query: Omit<ProviderQuery, "page" | "results">, page = 1) {
  return usePagedSearch([...SERVICES_KEY, "providers", query], (n, signal) => searchProviders({ ...query, page: n, results: PAGE_SIZE }, signal), page);
}

export function useProvider(id: string) {
  return useQuery({ queryKey: [...SERVICES_KEY, "provider", id], queryFn: () => getProvider(id) });
}

export function useMyProvider(enabled = true) {
  return useQuery({
    queryKey: [...SERVICES_KEY, "provider", "me"],
    queryFn: async () => {
      try {
        return await getMyProvider();
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
    enabled,
  });
}

export function useOfferings(query: Omit<OfferingQuery, "page" | "results">, page = 1) {
  return usePagedSearch([...SERVICES_KEY, "offerings", query], (n, signal) => searchOfferings({ ...query, page: n, results: PAGE_SIZE }, signal), page);
}

export function useOffering(id: string) {
  return useQuery({ queryKey: [...SERVICES_KEY, "offering", id], queryFn: () => getOffering(id) });
}

export function useMyOfferings(enabled = true) {
  return useQuery({ queryKey: [...SERVICES_KEY, "offerings", "mine"], queryFn: listMyOfferings, enabled });
}

export function useAvailability(id: string, from: string, enabled: boolean) {
  return useQuery({ queryKey: [...SERVICES_KEY, "availability", id, from], queryFn: () => getAvailability(id, from, 45), enabled });
}

export function useMyServiceBookings() {
  return useQuery({ queryKey: [...SERVICES_KEY, "bookings", "mine"], queryFn: listMyServiceBookings });
}

export function useIncomingServiceBookings(enabled = true) {
  return useQuery({ queryKey: [...SERVICES_KEY, "bookings", "incoming"], queryFn: listIncomingServiceBookings, enabled });
}

export function useMyQuoteRequests() {
  return useQuery({ queryKey: [...SERVICES_KEY, "requests", "mine"], queryFn: listMyQuoteRequests });
}

export function useIncomingQuoteRequests(enabled = true) {
  return useQuery({ queryKey: [...SERVICES_KEY, "requests", "incoming"], queryFn: listIncomingQuoteRequests, enabled });
}

export function useQuoteRequest(id: string) {
  return useQuery({ queryKey: [...SERVICES_KEY, "request", id], queryFn: () => getQuoteRequest(id) });
}

export function useServicesMutations() {
  const queryClient = useQueryClient();
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
    void queryClient.invalidateQueries({ queryKey: ["action-needed"] });
  };
  const options = { onSuccess: refresh, onError: (error: unknown) => notifyError(error) };

  return {
    book: useMutation({ mutationFn: (input: { id: string; date: string; notes?: string }) => bookService(input.id, { date: input.date, notes: input.notes, acceptTerms: true }), ...options }),
    bookingAction: useMutation({ mutationFn: (input: { id: string; action: "confirm" | "decline" | "complete" | "cancel"; note?: string }) => serviceBookingAction(input.id, input.action, input.note), ...options }),
    createRequest: useMutation({ mutationFn: createQuoteRequest, ...options }),
    cancelRequest: useMutation({ mutationFn: cancelQuoteRequest, ...options }),
    sendQuote: useMutation({ mutationFn: (input: { requestId: string; body: Parameters<typeof sendQuote>[1] }) => sendQuote(input.requestId, input.body), ...options }),
    quoteAction: useMutation({ mutationFn: (input: { id: string; action: "accept" | "reject" | "withdraw" }) => quoteAction(input.id, input.action), ...options }),
    proposeInspection: useMutation({ mutationFn: (input: { requestId: string; at: string; fee?: number; notes?: string }) => proposeInspection(input.requestId, { at: input.at, fee: input.fee ?? null, currency: "GHS", notes: input.notes ?? null }), ...options }),
    inspectionAction: useMutation({ mutationFn: (input: { id: string; action: "confirm" | "decline" | "cancel" | "complete" }) => inspectionAction(input.id, input.action), ...options }),
  };
}
