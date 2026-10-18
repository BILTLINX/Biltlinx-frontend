import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { notifyError } from "@/lib/errors";
import { toStayCard, type StayDates } from "@/lib/stay-mapper";
import { cancelBooking, getBooking, getBookingHistory, getCancellationPreview, getStay, listMyBookings, searchStays, type StaySearchQuery } from "@/lib/stay-api";

export const STAY_KEY = ["stay"] as const;

const PAGE_SIZE = 12;

export function useStaySearch(query: Omit<StaySearchQuery, "page" | "results">) {
  const result = useInfiniteQuery({
    queryKey: [...STAY_KEY, "search", query],
    queryFn: ({ pageParam, signal }) => searchStays({ ...query, page: pageParam, results: PAGE_SIZE }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.currentPage < last.totalPages ? last.currentPage + 1 : undefined),
    placeholderData: keepPreviousData,
  });
  const dates: StayDates = { checkIn: query.checkIn, checkOut: query.checkOut, guests: query.guests, rooms: query.rooms };
  const cards = useMemo(
    () => (result.data?.pages.flatMap((page) => page.items ?? []) ?? []).map((stay) => toStayCard(stay, dates)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [result.data, query.checkIn, query.checkOut, query.guests, query.rooms],
  );
  return { ...result, cards, total: result.data?.pages[0]?.totalResults ?? 0 };
}

export function useStayDetail(id: string, dates: StayDates) {
  return useQuery({
    queryKey: [...STAY_KEY, "one", id, dates],
    queryFn: () => getStay(id, dates),
    placeholderData: keepPreviousData,
  });
}

export function useBooking(id: string, options: { pollWhile?: (status: string | null) => boolean } = {}) {
  return useQuery({
    queryKey: [...STAY_KEY, "booking", id],
    queryFn: () => getBooking(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status ?? null;
      return options.pollWhile && options.pollWhile(status) ? 2000 : false;
    },
  });
}

export function useMyBookings(status?: string) {
  return useQuery({ queryKey: [...STAY_KEY, "mine", status ?? "all"], queryFn: () => listMyBookings({ results: 50, status }) });
}

export function useBookingHistory(id: string) {
  return useQuery({ queryKey: [...STAY_KEY, "history", id], queryFn: () => getBookingHistory(id) });
}

export function useCancellationPreview(id: string, enabled: boolean) {
  return useQuery({ queryKey: [...STAY_KEY, "cancel-preview", id], queryFn: () => getCancellationPreview(id), enabled, staleTime: 0 });
}

export function useCancelBooking(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cancelBooking(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: STAY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["action-needed"] });
    },
    onError: (error) => notifyError(error),
  });
}
