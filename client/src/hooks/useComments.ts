import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { notifyError } from "@/lib/errors";
import { formatRelative } from "@/lib/format";
import { addComment, deleteComment, getComments, likeComment, unlikeComment } from "@/lib/social-api";
import type { Comment } from "@/types/api/social";
import type { CommentItem } from "@/types/comment";

const COMMENT_PAGE_SIZE = 10;

export function mapComment(comment: Comment, now: Date = new Date()): CommentItem {
  return {
    id: comment.id,
    authorId: comment.author.id,
    authorName: comment.author.username,
    avatar: comment.author.profilePicUrl ?? undefined,
    postedAt: formatRelative(comment.createdAt, now),
    text: comment.body,
    likes: comment.likeCount,
    parentId: comment.parentCommentId,
    replyCount: comment.replyCount,
    likedByMe: comment.likedByMe,
    isOwn: comment.isOwn,
  };
}

function commentsKey(postId: string, parentCommentId?: string) {
  return ["comments", postId, parentCommentId ?? "top"] as const;
}

export function useComments(postId: string, options: { parentCommentId?: string; enabled?: boolean } = {}) {
  const queryClient = useQueryClient();
  const { parentCommentId, enabled = true } = options;

  const query = useInfiniteQuery({
    queryKey: commentsKey(postId, parentCommentId),
    queryFn: ({ pageParam }) => getComments(postId, { parentCommentId, page: pageParam, results: COMMENT_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.currentPage < last.totalPages ? last.currentPage + 1 : undefined),
    enabled,
  });

  const comments = useMemo(() => {
    const seen = new Set<string>();
    const mapped: CommentItem[] = [];
    for (const page of query.data?.pages ?? []) {
      for (const comment of page.items) {
        if (seen.has(comment.id)) continue;
        seen.add(comment.id);
        mapped.push(mapComment(comment));
      }
    }
    return mapped;
  }, [query.data]);

  const totalResults = query.data?.pages[0]?.totalResults ?? 0;

  const add = useMutation({
    mutationFn: (input: { body: string; parentCommentId?: string }) => addComment(postId, input),
    onSuccess: (_created, input) => {
      void queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      void queryClient.invalidateQueries({ queryKey: ["post", postId] });
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      if (input.parentCommentId) void queryClient.invalidateQueries({ queryKey: ["comments", postId, "top"] });
    },
    onError: (error) => notifyError(error, "Your comment could not be posted."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      void queryClient.invalidateQueries({ queryKey: ["post", postId] });
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (error) => notifyError(error, "The comment could not be deleted."),
  });

  return {
    comments,
    totalResults,
    isPending: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    add: (body: string, parent?: string) => add.mutateAsync({ body, parentCommentId: parent }).then(() => true, () => false),
    remove: (id: string) => remove.mutateAsync(id).then(() => true, () => false),
    adding: add.isPending,
  };
}

interface Snapshot {
  key: string;
  liked: boolean;
  count: number;
}

export function useCommentLike(comment: CommentItem) {
  const serverKey = `${comment.likedByMe ?? false}:${comment.likes ?? 0}`;
  const [override, setOverride] = useState<Snapshot | null>(null);
  const live =
    override && override.key === serverKey ? override : { key: serverKey, liked: comment.likedByMe ?? false, count: comment.likes ?? 0 };

  const mutation = useMutation({
    mutationFn: (next: boolean) => (next ? likeComment(comment.id) : unlikeComment(comment.id)),
  });

  function toggle() {
    const next = !live.liked;
    setOverride({ key: serverKey, liked: next, count: Math.max(0, live.count + (next ? 1 : -1)) });
    mutation.mutate(next, {
      onError: (error) => {
        setOverride(null);
        notifyError(error);
      },
    });
  }

  return { liked: live.liked, count: live.count, toggle };
}
