"use client";

import Link from "next/link";
import { use, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PageContainer } from "@/components/shared/PageContainer";
import { PostDetailCard } from "@/components/shared/PostDetailCard";
import { PostDetailComments } from "@/components/shared/PostDetailComments";
import { PostDetailSidebar } from "@/components/shared/PostDetailSidebar";
import { usePostsFeed } from "@/context/PostsContext";
import { DETAIL_COMMENTS } from "@/lib/dummy-post-detail";
import { FEED_POSTS } from "@/lib/dummy-posts";
import type { DetailComment } from "@/types/comment";

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { posts } = usePostsFeed();
  const post = [...posts, ...FEED_POSTS].find((candidate) => candidate.id === id);
  const [addedComments, setAddedComments] = useState<DetailComment[]>([]);

  function addComment(text: string) {
    setAddedComments((current) => [
      { id: `local-${Date.now()}`, authorName: "You", avatar: "/icons/avatar-sample.jpg", postedAt: "Just now", text },
      ...current,
    ]);
  }

  return (
    <AppShell activeKey="feed" activeChildKey="feed-page" contentFullWidth>
      <PageContainer>
        <Link href="/feed" className="self-start text-sm font-medium text-brand-900">
          ‹ Back to feed
        </Link>
        {post ? (
          <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
            <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
              <PostDetailCard post={post} commentsCount={post.comments + addedComments.length} />
              <PostDetailComments
                comments={[...addedComments, ...DETAIL_COMMENTS]}
                totalCount={post.comments + addedComments.length}
                onAdd={addComment}
              />
            </div>
            <div className="w-full shrink-0 xl:w-[340px]">
              <PostDetailSidebar post={post} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">This post is no longer available.</p>
        )}
      </PageContainer>
    </AppShell>
  );
}
