"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getMediaItems, MediaCarousel, PostFollowButton, PostStatsBar } from "@/components/shared/PostCard";
import { Button } from "@/components/ui/Button";
import { PostOptionsControl } from "@/components/shared/PostOptionsControl";
import { comingSoonHref } from "@/lib/coming-soon";
import { renderWithHashtags } from "@/lib/hashtags";
import type { PostCardData } from "@/types/post";

interface PostDetailCardProps {
  post: PostCardData;
  commentsCount: number;
}

/** Full post on the detail page (Figma node 1055:28102): header, complete text, media, listing attachment and engagement row. */
export function PostDetailCard({ post, commentsCount }: PostDetailCardProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const [saved, setSaved] = useState(false);
  const mediaItems = getMediaItems(post);
  const [primary, secondary] = post.actions ?? [];
  const body = post.variant === "poll" ? post.question : post.text;
  const subtitle = [post.roleLine.replace(/\s*\|\s*$/, ""), post.postedAt, "Public"].filter(Boolean).join(" · ");
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <article id={`post-${post.id}`} className="flex w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-center gap-3 p-4 sm:p-5">
        <span className="relative block size-11 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
          {post.avatarPlaceholder ? (
            <Image src="/icons/avatar-placeholder-user.svg" alt="" fill className="p-2.5" sizes="44px" />
          ) : (
            <Image src={post.avatar} alt={post.authorName} fill className="object-cover" sizes="44px" />
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <p className="text-[15px] font-bold leading-[22px] text-[#0f172a]">{post.authorName}</p>
            {post.verified && (
              <span className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium leading-[14px] text-[#16a34a]">
                {post.verified === "organization" ? "Business verified ✓" : "Verified ✓"}
              </span>
            )}
          </div>
          <p className="truncate text-xs leading-[17px] text-gray-500">{subtitle}</p>
        </div>
        <PostFollowButton following={following} onToggle={() => setFollowing((v) => !v)} name={post.authorName} />
        <PostOptionsControl
          post={post}
          saved={saved}
          onToggleSave={() => setSaved((v) => !v)}
          following={following}
          onToggleFollow={() => setFollowing((v) => !v)}
          className="relative block size-[23px] shrink-0"
        >
          <Image src="/icons/more-horizontal.svg" alt="" fill sizes="23px" className="sm:hidden" />
          <Image src="/icons/menu-03.svg" alt="" fill sizes="23px" className="hidden sm:block" />
        </PostOptionsControl>
      </div>

      {body && (
        <p className="whitespace-pre-line px-4 pb-4 text-[15px] leading-[22px] text-[#334155] sm:px-5">
          {renderWithHashtags(body)}
        </p>
      )}

      {mediaItems.length > 0 && (
        <MediaCarousel items={mediaItems} className="h-[260px] rounded-none sm:h-[360px] sm:rounded-none lg:h-[460px]" />
      )}

      {post.priceLine && (
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-[22px] font-bold leading-[30px] text-[#0f172a]">
              {post.priceLine}
              {post.priceSuffix && <span className="text-sm font-medium text-gray-500"> {post.priceSuffix}</span>}
            </p>
            {post.subLine && <p className="text-[13px] leading-[19px] text-gray-500">{post.subLine}</p>}
          </div>
          {[primary, secondary].map(
            (action) =>
              action && (
                <Button
                  key={action.label}
                  variant={action.variant}
                  onClick={comingSoon(action.label)}
                  className="h-11 w-auto shrink-0 whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]"
                >
                  {action.label}
                </Button>
              ),
          )}
        </div>
      )}

      <div className="px-4 py-3.5 sm:px-5">
        <PostStatsBar
          post={{ ...post, comments: commentsCount }}
          saved={saved}
          onToggleSave={() => setSaved((v) => !v)}
          showComments={false}
          onToggleComments={() => document.getElementById("post-comments")?.scrollIntoView({ behavior: "smooth" })}
        />
      </div>
    </article>
  );
}
