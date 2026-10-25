"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDeferredValue, useMemo, useState } from "react";
import { FEED_KEY, useFeed } from "@/hooks/useFeed";
import { DISCOVER_TABS, type DiscoverTab } from "@/lib/discover-tabs";
import { notifyError } from "@/lib/errors";
import { createPost } from "@/lib/social-api";
import { uploadMedia } from "@/lib/upload";
import type { PostCardData } from "@/types/post";
import type { DiscoverReel } from "@/types/reel";
import type { PostedStory } from "@/types/story";

function toReel(post: PostCardData): DiscoverReel | null {
  const video = post.media?.find((item) => item.isVideo);
  if (!video) return null;
  return {
    id: post.id,
    authorId: post.authorId ?? "",
    authorName: post.authorName,
    authorAvatar: post.avatar,
    verified: Boolean(post.verified),
    following: post.authorFollowed ?? false,
    isOwn: post.isOwn ?? false,
    caption: post.text ?? "",
    video: video.url,
    poster: post.avatar,
    likes: post.likes,
    likedByMe: post.likedByMe ?? false,
    comments: post.comments,
    shares: 0,
    reposts: 0,
    saves: 0,
  };
}

/** Data layer for the Discover screen: reels are feed posts that carry a
 * video, filtered server-side, with tab and search driving the query. */
export function useDiscoverReels() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<DiscoverTab>(DISCOVER_TABS[0]);
  const search = useDeferredValue(query.trim());

  const feed = useFeed({
    hasVideo: true,
    q: search || undefined,
    scope: activeTab === "Following" ? "following" : undefined,
  });

  const reels = useMemo(() => feed.posts.map(toReel).filter((reel): reel is DiscoverReel => reel !== null), [feed.posts]);

  const create = useMutation({
    mutationFn: async ({ file, caption }: PostedStory) => {
      if (!file) throw new Error("Missing video");
      const media = await uploadMedia(file);
      await createPost({
        kind: "Text",
        description: caption ?? "",
        media: [{ path: media.path, contentType: media.contentType, name: media.name }],
      });
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: FEED_KEY }),
    onError: (error) => notifyError(error, "Your reel could not be posted."),
  });

  return {
    reels,
    loading: feed.isPending,
    isError: feed.isError,
    refetch: feed.refetch,
    hasNextPage: feed.hasNextPage,
    fetchNextPage: feed.fetchNextPage,
    isFetchingNextPage: feed.isFetchingNextPage,
    query,
    setQuery,
    activeTab,
    setActiveTab,
    addReel: (story: PostedStory) => create.mutate(story),
  };
}
