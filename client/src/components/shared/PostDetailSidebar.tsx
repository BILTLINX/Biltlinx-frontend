"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { comingSoonHref } from "@/lib/coming-soon";
import { DETAIL_AUTHOR_LISTINGS, DETAIL_AUTHOR_PROFILE } from "@/lib/dummy-post-detail";
import { cn } from "@/lib/utils";
import type { PostCardData } from "@/types/post";

/** Author summary and their other listings, shown beside the post (Figma nodes 1055:28209 and 1055:28226). */
export function PostDetailSidebar({ post }: { post: PostCardData }) {
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const firstName = post.authorName.split(" ")[0];

  return (
    <div className="flex w-full flex-col gap-4">
      <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="relative block size-12 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
            {!post.avatarPlaceholder && <Image src={post.avatar} alt="" fill className="object-cover" sizes="48px" />}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="truncate text-[15px] font-bold leading-[22px] text-[#0f172a]">{post.authorName}</p>
            <p className="truncate text-xs leading-[17px] text-gray-500">{DETAIL_AUTHOR_PROFILE.subtitle}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DETAIL_AUTHOR_PROFILE.badges.map((badge) => (
            <span key={badge} className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium leading-[14px] text-[#16a34a]">
              {badge}
            </span>
          ))}
        </div>
        <p className="text-xs leading-[17px] text-gray-500">{DETAIL_AUTHOR_PROFILE.stats}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFollowing((v) => !v)}
            aria-pressed={following}
            className={cn(
              "h-10 flex-1 rounded-[10px] px-4 text-sm font-medium",
              following
                ? "border border-brand-900 bg-white text-brand-900"
                : "bg-brand-900 text-white hover:bg-brand-900/90",
            )}
          >
            {following ? "Following" : "Follow"}
          </button>
          <button
            type="button"
            onClick={() => router.push(comingSoonHref("View profile"))}
            className="h-10 flex-1 rounded-[10px] border border-gray-200 bg-white px-4 text-sm font-medium text-[#0f172a] hover:bg-gray-50"
          >
            View profile
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-[15px] font-bold leading-[22px] text-[#0f172a]">More from {firstName}</h2>
        {DETAIL_AUTHOR_LISTINGS.map((listing) => (
          <button
            key={listing.id}
            type="button"
            onClick={() => router.push(comingSoonHref("View listing"))}
            className="flex items-center gap-2.5 text-left"
          >
            <span className="relative block h-[52px] w-16 shrink-0 overflow-hidden rounded-lg">
              <Image src={listing.image} alt="" fill className="object-cover" sizes="64px" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm font-bold leading-5 text-[#0f172a]">{listing.price}</span>
              <span className="truncate text-xs leading-[17px] text-gray-500">{listing.summary}</span>
            </span>
          </button>
        ))}
      </section>
    </div>
  );
}
