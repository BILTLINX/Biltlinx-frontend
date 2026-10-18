import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { notifyError } from "@/lib/errors";
import { mapPost } from "@/lib/post-mapper";
import { likePost, unlikePost, unvotePoll, votePoll } from "@/lib/social-api";
import type { PostCardData } from "@/types/post";

interface Snapshot<T> {
  key: string;
  value: T;
}

function overrideFor<T>(snapshot: Snapshot<T> | null, key: string, fallback: T): T {
  return snapshot && snapshot.key === key ? snapshot.value : fallback;
}

export function usePostLike(post: PostCardData) {
  const serverKey = `${post.likedByMe ?? false}:${post.likes}`;
  const [override, setOverride] = useState<Snapshot<{ liked: boolean; count: number }> | null>(null);
  const live = overrideFor(override, serverKey, { liked: post.likedByMe ?? false, count: post.likes });

  const mutation = useMutation({
    mutationFn: (next: boolean) => (next ? likePost(post.id) : unlikePost(post.id)),
  });

  function toggle() {
    const next = !live.liked;
    setOverride({ key: serverKey, value: { liked: next, count: Math.max(0, live.count + (next ? 1 : -1)) } });
    mutation.mutate(next, {
      onError: (error) => {
        setOverride(null);
        notifyError(error);
      },
    });
  }

  return { liked: live.liked, count: live.count, toggle };
}

export function usePostPoll(post: PostCardData) {
  const serverKey = post.poll ? `${post.poll.myVoteOptionId}:${post.poll.totalVotes}` : "none";
  const [override, setOverride] = useState<Snapshot<PostCardData["poll"]> | null>(null);
  const poll = overrideFor(override, serverKey, post.poll);

  const mutation = useMutation({
    mutationFn: (optionId: string | null) => (optionId ? votePoll(post.id, optionId) : unvotePoll(post.id)),
    onSuccess: (updated) => setOverride({ key: serverKey, value: mapPost(updated).poll }),
    onError: (error) => notifyError(error),
  });

  function vote(optionId: string) {
    if (!poll || poll.isClosed) return;
    mutation.mutate(poll.myVoteOptionId === optionId ? null : optionId);
  }

  return { poll, vote, pending: mutation.isPending };
}
