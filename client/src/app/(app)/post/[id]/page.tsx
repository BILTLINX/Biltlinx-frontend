"use client";

import Link from "next/link";
import { use } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PageContainer } from "@/components/shared/PageContainer";
import { PostCardSkeleton } from "@/components/shared/PostCardSkeleton";
import { PostDetailCard } from "@/components/shared/PostDetailCard";
import { PostDetailComments } from "@/components/shared/PostDetailComments";
import { usePost } from "@/hooks/useFeed";
import { errorKind } from "@/lib/errors";

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { post, isPending, isError, error, refetch } = usePost(id);

  return (
    <AppShell activeKey="feed" activeChildKey="feed-page" contentFullWidth>
      <PageContainer>
        <Link href="/feed" className="self-start text-sm font-medium text-brand-900">
          ‹ Back to feed
        </Link>
        {isPending && <PostCardSkeleton />}
        {isError && errorKind(error) === "notFound" && <p className="text-sm text-gray-500">This post is no longer available.</p>}
        {isError && errorKind(error) !== "notFound" && (
          <button type="button" onClick={() => void refetch()} className="self-start text-sm font-medium text-brand-900">
            Could not load this post. Try again
          </button>
        )}
        {post && (
          <div className="flex w-full max-w-3xl flex-col gap-4">
            <PostDetailCard post={post} commentsCount={post.comments} />
            <PostDetailComments postId={post.id} totalCount={post.comments} />
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}
