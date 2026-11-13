import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";

export const PAGE_SIZE = 12;

interface Paged<T> {
  items: T[] | null;
  totalPages: number;
  totalResults: number;
}

/** One page of a paged search. The previous page stays on screen while the next one loads. */
export function usePagedSearch<T>(
  key: readonly unknown[],
  fetchPage: (page: number, signal?: AbortSignal) => Promise<Paged<T>>,
  page: number,
  enabled = true,
) {
  const result = useQuery({
    queryKey: [...key, page],
    queryFn: ({ signal }) => fetchPage(page, signal),
    placeholderData: keepPreviousData,
    enabled,
  });
  return { ...result, items: result.data?.items ?? [], total: result.data?.totalResults ?? 0, totalPages: result.data?.totalPages ?? 1 };
}

/** The page being viewed. It goes back to 1 whenever `resetKey` (the search and filters) changes. */
export function usePage(resetKey: unknown) {
  const key = JSON.stringify(resetKey);
  const [state, setState] = useState({ key, page: 1 });
  const page = state.key === key ? state.page : 1;
  const setPage = useCallback((next: number) => setState({ key, page: next }), [key]);
  return [page, setPage] as const;
}
