"use client";

import Link from "next/link";
import { NavIcon } from "@/components/shared/NavIcon";
import { PostCard } from "@/components/shared/PostCard";
import { PostCardSkeleton } from "@/components/shared/PostCardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useFeed } from "@/hooks/useFeed";
import { usePostModals } from "@/hooks/usePostModals";

const PREVIEW_COUNT = 2;

/** "/home" dashboard's condensed look at the full "/feed" stream — the same
 * top-of-feed posts a viewer would see first on "/feed" (their own posts,
 * newest first, then the dummy stream), just capped to the top two. */
export function FeedPreviewSection() {
  const { posts, isPending, isError } = useFeed({}, { pageSize: PREVIEW_COUNT });
  const previewPosts = posts.slice(0, PREVIEW_COUNT);
  const { openPostModal, modals } = usePostModals();

  return (
    <section className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[15px] font-bold text-night-900">From your Feed</h2>
        <Link href="/feed" className="flex items-center gap-1 text-[12.5px] font-medium text-brand-600">
          Open Feed
          <NavIcon icon="/icons/chevron-right.svg" color="brand" size={10} />
        </Link>
      </div>

      <div className="flex w-full flex-col gap-[15px]">
        {isPending && <PostCardSkeleton />}
        {isError && <p className="text-[13px] text-gray-500">We could not load your feed right now.</p>}
        {!isPending && !isError && previewPosts.length === 0 && (
          <EmptyState
            size="section"
            icon="feed"
            title="Your feed is quiet"
            body="Follow agents, builders and artisans near you and their posts will land here."
            primary={{ label: "Find people to follow", href: "/professionals" }}
            secondary={{ label: "Create a post", onClick: () => openPostModal("media") }}
          />
        )}
        {previewPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {modals}
    </section>
  );
}
