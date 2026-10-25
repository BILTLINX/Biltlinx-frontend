import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getPostLikes } from "@/lib/social-api";
import type { Author } from "@/types/api/social";

export function useLikers(postId: string, options: { pageSize?: number; enabled?: boolean } = {}) {
  const pageSize = options.pageSize ?? 20;
  const query = useInfiniteQuery({
    queryKey: ["likers", postId, pageSize],
    queryFn: ({ pageParam }) => getPostLikes(postId, { page: pageParam, results: pageSize }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.currentPage < last.totalPages ? last.currentPage + 1 : undefined),
    enabled: options.enabled ?? true,
    staleTime: 30_000,
  });

  const likers: Author[] = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);
  const total = query.data?.pages[0]?.totalResults ?? 0;

  return { ...query, likers, total };
}
