import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { notifyError } from "@/lib/errors";
import { toListingCard, toPropertyDetail } from "@/lib/property-mapper";
import {
  getProperty,
  getPropertyDocuments,
  getRelatedProperties,
  listMyProperties,
  listProperties,
  reportUnavailable,
  requestViewing,
  type PropertyQuery,
} from "@/lib/properties-api";

export const PROPERTIES_KEY = ["properties"] as const;

const PAGE_SIZE = 12;

function usePagedProperties(scope: "public" | "mine", query: Omit<PropertyQuery, "page" | "results">, enabled = true) {
  const fetcher = scope === "mine" ? listMyProperties : listProperties;
  const result = useInfiniteQuery({
    queryKey: [...PROPERTIES_KEY, scope, query],
    queryFn: ({ pageParam, signal }) => fetcher({ ...query, page: pageParam, results: PAGE_SIZE }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.currentPage < last.totalPages ? last.currentPage + 1 : undefined),
    placeholderData: keepPreviousData,
    enabled,
  });
  const items = useMemo(() => result.data?.pages.flatMap((page) => page.items ?? []) ?? [], [result.data]);
  const total = result.data?.pages[0]?.totalResults ?? 0;
  return { ...result, items, total };
}

export function useProperties(query: Omit<PropertyQuery, "page" | "results">) {
  const result = usePagedProperties("public", query);
  const cards = useMemo(() => result.items.map(toListingCard), [result.items]);
  return { ...result, cards };
}

export function useMyProperties(query: Omit<PropertyQuery, "page" | "results">, enabled = true) {
  return usePagedProperties("mine", query, enabled);
}

export function useProperty(id: string) {
  const property = useQuery({ queryKey: [...PROPERTIES_KEY, "one", id], queryFn: () => getProperty(id) });
  const documents = useQuery({
    queryKey: [...PROPERTIES_KEY, "documents", id],
    queryFn: () => getPropertyDocuments(id),
    enabled: property.isSuccess,
  });
  const related = useQuery({
    queryKey: [...PROPERTIES_KEY, "related", id],
    queryFn: () => getRelatedProperties(id),
    enabled: property.isSuccess,
  });
  const detail = useMemo(
    () => (property.data ? toPropertyDetail(property.data, documents.data ?? property.data.documents ?? []) : null),
    [property.data, documents.data],
  );
  const similar = useMemo(() => (related.data ?? []).map(toListingCard), [related.data]);
  return { property, detail, similar };
}

export function useRequestViewing(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { preferredAt: string; alternativeAt?: string; message?: string }) => requestViewing(propertyId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["viewings"] });
      void queryClient.invalidateQueries({ queryKey: ["action-needed"] });
    },
    onError: (error) => notifyError(error, "Your viewing request could not be sent."),
  });
}

export function useReportUnavailable(propertyId: string) {
  return useMutation({
    mutationFn: () => reportUnavailable(propertyId),
    onError: (error) => notifyError(error),
  });
}
