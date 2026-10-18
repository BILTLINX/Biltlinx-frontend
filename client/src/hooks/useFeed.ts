import { keepPreviousData, useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { mapPost } from "@/lib/post-mapper";
import { getFeed, getNewPostCount, getPost } from "@/lib/social-api";
import type { FeedQuery } from "@/types/api/social";
import type { PostCardData } from "@/types/post";

export const FEED_KEY = ["feed"] as const;

const PAGE_SIZE = 10;

export function useFeed(query: Omit<FeedQuery, "page" | "results"> = {}, options: { pageSize?: number; enabled?: boolean } = {}) {
  const pageSize = options.pageSize ?? PAGE_SIZE;
  const result = useInfiniteQuery({
    queryKey: [...FEED_KEY, query, pageSize],
    queryFn: ({ pageParam, signal }) => getFeed({ ...query, page: pageParam, results: pageSize }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.currentPage < last.totalPages ? last.currentPage + 1 : undefined),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });

  const posts = useMemo(() => {
    const seen = new Set<string>();
    const mapped: PostCardData[] = [];
    for (const page of result.data?.pages ?? []) {
      for (const post of page.items) {
        if (seen.has(post.id)) continue;
        seen.add(post.id);
        mapped.push(mapPost(post));
      }
    }
    return mapped;
  }, [result.data]);

  return { ...result, posts };
}

export function usePost(id: string) {
  const query = useQuery({ queryKey: ["post", id], queryFn: () => getPost(id) });
  const post = useMemo(() => (query.data ? mapPost(query.data) : null), [query.data]);
  return { ...query, post };
}

const NEW_POSTS_POLL_MS = 30_000;

export function useNewPosts(scope?: string) {
  const queryClient = useQueryClient();
  const [since, setSince] = useState(() => new Date().toISOString());

  const { data } = useQuery({
    queryKey: ["feed-new-count", scope ?? "all", since],
    queryFn: () => getNewPostCount(since, scope),
    refetchInterval: NEW_POSTS_POLL_MS,
    refetchIntervalInBackground: false,
  });

  const reveal = useCallback(async () => {
    setSince(new Date().toISOString());
    await queryClient.invalidateQueries({ queryKey: FEED_KEY });
  }, [queryClient]);

  return { count: data?.count ?? 0, reveal };
}
