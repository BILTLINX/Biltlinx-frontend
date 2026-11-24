"use client";

import Image from "next/image";
import { useSession } from "@/context/SessionContext";
import { mapPost } from "@/lib/post-mapper";
import type { Post, PostKind } from "@/types/api/social";

export interface FeedPostPreviewInput {
  kind: Extract<PostKind, "Property" | "Stay" | "Service">;
  title: string;
  description: string;
  /** Public URLs of the photos, first one first. */
  photos: string[];
  /** The listing details the feed post carries (price, city, bedrooms and so on). */
  metaData?: Record<string, unknown>;
}

/**
 * A short version of the post a listing becomes in the feed: who posted it, the cover photo, the headline details and a line of the caption.
 * What it shows comes through the same mapping the feed uses, so it never claims more than the post will carry.
 */
export function FeedPostPreview({ post }: { post: FeedPostPreviewInput }) {
  const { user } = useSession();
  const preview: Post = {
    id: "preview",
    kind: post.kind,
    author: {
      id: user?.id ?? "",
      username: user?.username ?? "You",
      organizationName: "",
      organizationId: "",
      profilePicUrl: user?.profilePicUrl ?? null,
      isVerified: false,
      isFollowedByMe: false,
    },
    title: post.title,
    description: post.description,
    hashtags: [],
    metaData: post.metaData ?? null,
    media: post.photos.map((url) => ({ name: "", contentType: "image/jpeg", url, isVideo: false })),
    poll: null,
    likeCount: 0,
    commentCount: 0,
    likedByMe: false,
    isOwn: true,
    createdAt: new Date().toISOString(),
  };
  const card = mapPost(preview);
  const cover = card.media?.[0]?.url;
  const rooms = [card.beds !== undefined ? `${card.beds} bed` : null, card.baths !== undefined ? `${card.baths} bath` : null].filter(Boolean).join(" · ");

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <p className="text-[15px] font-bold text-[#0f172a]">Preview</p>
        <p className="text-[13px] text-gray-500">This is how it will look in the feed.</p>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3.5">
        <div className="flex items-center gap-2.5">
          <span className="relative block size-9 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
            <Image src={card.avatarPlaceholder ? "/icons/avatar-placeholder-user.svg" : card.avatar} alt="" fill sizes="36px" className={card.avatarPlaceholder ? "scale-50 object-contain" : "object-cover"} />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[13px] font-bold text-brand-900">{card.authorName}</span>
            <span className="text-[11px] text-gray-500">Just now</span>
          </span>
        </div>

        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#eef2ff]">
          {cover ? <Image src={cover} alt="" fill unoptimized className="object-cover" sizes="320px" /> : <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">Your first photo shows here</span>}
        </div>

        <div className="flex flex-col gap-0.5">
          {card.priceLine && (
            <p className="text-lg font-semibold leading-6 text-[#0f172a]">
              {card.priceLine}
              {card.priceSuffix && <span className="text-xs font-normal text-gray-500">{card.priceSuffix}</span>}
            </p>
          )}
          <p className={card.priceLine ? "truncate text-[13px] text-[#334155]" : "truncate text-base font-semibold text-[#0f172a]"}>{card.subLine}</p>
          {rooms && <p className="text-xs text-gray-500">{rooms}</p>}
        </div>

        {card.text && <p className="line-clamp-2 text-[13px] leading-5 text-[#334155]">{card.text}</p>}
      </div>
    </div>
  );
}
