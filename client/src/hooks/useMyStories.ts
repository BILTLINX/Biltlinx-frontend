"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { notifyError } from "@/lib/errors";
import { parseApiDate } from "@/lib/format";
import { createStory, deleteStory as deleteStoryRequest, getStories, viewStory } from "@/lib/social-api";
import { uploadMedia } from "@/lib/upload";
import type { StoryGroup, StoryItem } from "@/types/api/social";
import type { MyStory, PostedStory } from "@/types/story";

export const STORIES_KEY = ["stories"] as const;

export function toStory(item: StoryItem): MyStory {
  return {
    id: item.id,
    url: item.media.url,
    isVideo: item.media.isVideo,
    caption: item.caption ?? undefined,
    postedAt: parseApiDate(item.createdAt).getTime(),
  };
}

export function useStoryGroups() {
  const query = useQuery({ queryKey: STORIES_KEY, queryFn: getStories, staleTime: 60_000 });
  const groups: StoryGroup[] = useMemo(() => query.data ?? [], [query.data]);
  const mine = groups.find((group) => group.isOwn) ?? null;
  const others = useMemo(() => groups.filter((group) => !group.isOwn), [groups]);
  return { ...query, groups, mine, others };
}

export function useStoryViewer() {
  const queryClient = useQueryClient();
  const [viewing, setViewing] = useState<StoryGroup | null>(null);

  const markSeen = useMutation({
    mutationFn: (id: string) => viewStory(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: STORIES_KEY }),
  });

  return {
    viewing,
    open: setViewing,
    close: () => setViewing(null),
    stories: useMemo(() => viewing?.stories.map(toStory) ?? [], [viewing]),
    markSeen: (id: string) => markSeen.mutate(id),
  };
}

/** The signed-in user's own stories — posting, viewing and deleting — shared
 * by every "your story" surface (the home dashboard's `StoriesRow` and
 * Discover's `DiscoverStoryRail`). The server owns the 24h expiry. */
export function useMyStories() {
  const queryClient = useQueryClient();
  const { mine } = useStoryGroups();
  const [composerOpen, setComposerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const activeStories = useMemo(() => mine?.stories.map(toStory) ?? [], [mine]);

  const create = useMutation({
    mutationFn: async (story: PostedStory) => {
      if (!story.file) throw new Error("Missing file");
      const media = await uploadMedia(story.file);
      await createStory({ media: { path: media.path, contentType: media.contentType, name: media.name }, caption: story.caption });
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: STORIES_KEY }),
    onError: (error) => notifyError(error, "Your story could not be posted."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteStoryRequest(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: STORIES_KEY }),
    onError: (error) => notifyError(error, "The story could not be deleted."),
  });

  function openYourStory() {
    if (activeStories.length > 0) setViewerIndex(0);
    else setComposerOpen(true);
  }

  return {
    activeStories,
    composerOpen,
    setComposerOpen,
    viewerIndex,
    setViewerIndex,
    addStory: (story: PostedStory) => create.mutate(story),
    deleteStory: (id: string) => remove.mutate(id),
    openYourStory,
  };
}
