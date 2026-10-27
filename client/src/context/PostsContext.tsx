"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { showErrorToast } from "@/components/shared/AppToast";
import { FEED_KEY } from "@/hooks/useFeed";
import type { PropertyListing, ServiceListing, StayListing } from "@/lib/dummy-listings";
import { notifyError } from "@/lib/errors";
import { createPost, deletePost } from "@/lib/social-api";
import { uploadAll } from "@/lib/upload";
import type { CreatePostInput, MediaInput } from "@/types/api/social";

export type NewPostInput =
  | { kind: "media"; text: string; files: File[] }
  | { kind: "poll"; question: string; options: string[] }
  | { kind: "article"; headline: string; body: string; files?: File[] }
  | { kind: "property"; note: string; listing: PropertyListing }
  | { kind: "stay"; note: string; listing: StayListing }
  | { kind: "service"; note: string; files: File[]; listing?: ServiceListing };

async function uploadFiles(files: File[]): Promise<MediaInput[]> {
  const uploaded = await uploadAll(files);
  return uploaded.map(({ path, contentType, name }) => ({ path, contentType, name }));
}

async function toRequest(input: NewPostInput): Promise<CreatePostInput | null> {
  switch (input.kind) {
    case "media":
      return { kind: "Text", description: input.text.trim(), media: await uploadFiles(input.files) };
    case "article":
      return {
        kind: "Text",
        title: input.headline.trim() || undefined,
        description: input.body.trim(),
        media: await uploadFiles(input.files ?? []),
      };
    case "poll":
      return {
        kind: "Poll",
        description: input.question.trim(),
        pollOptions: input.options.map((option) => option.trim()).filter(Boolean),
      };
    case "service":
      return { kind: "Text", description: input.note.trim(), media: await uploadFiles(input.files) };
    default:
      return null;
  }
}

interface PostsContextValue {
  addPost: (input: NewPostInput) => Promise<boolean>;
  removePost: (id: string) => Promise<boolean>;
}

const PostsContext = createContext<PostsContextValue | null>(null);

export function PostsProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const refresh = useCallback(() => queryClient.invalidateQueries({ queryKey: FEED_KEY }), [queryClient]);

  const create = useMutation({
    mutationFn: async (input: NewPostInput) => {
      const request = await toRequest(input);
      if (!request) return false;
      await createPost(request);
      return true;
    },
    onSuccess: (created) => {
      if (created) void refresh();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => void refresh(),
  });

  const addPost = useCallback(
    async (input: NewPostInput) => {
      if (input.kind === "property" || input.kind === "stay") {
        showErrorToast("Listings are posted from the listing wizard, which is coming soon.");
        return false;
      }
      try {
        return await create.mutateAsync(input);
      } catch (error) {
        notifyError(error, "Your post could not be published.");
        return false;
      }
    },
    [create],
  );

  const removePost = useCallback(
    async (id: string) => {
      try {
        await remove.mutateAsync(id);
        return true;
      } catch (error) {
        notifyError(error, "The post could not be deleted.");
        return false;
      }
    },
    [remove],
  );

  const value = useMemo(() => ({ addPost, removePost }), [addPost, removePost]);
  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}

export function usePostsFeed() {
  const context = useContext(PostsContext);
  if (!context) throw new Error("usePostsFeed must be used within a PostsProvider");
  return context;
}
