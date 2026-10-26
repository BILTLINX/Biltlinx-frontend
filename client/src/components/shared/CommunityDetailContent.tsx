"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { comingSoonHref } from "@/lib/coming-soon";
import { COMMUNITY_TABS, type CommunityDetail } from "@/lib/dummy-communities";
import { cn } from "@/lib/utils";

interface CommunityDetailContentProps {
  detail: CommunityDetail;
  joined: boolean;
}

function Avatar({ src, size }: { src: string; size: number }) {
  return (
    <span className="relative block shrink-0 overflow-hidden rounded-full bg-[#eef2ff]" style={{ width: size, height: size }}>
      <Image src={src} alt="" fill className="object-cover" sizes={`${size}px`} />
    </span>
  );
}

/** The left column of a community page (Figma node 1087:37549): tabs, the post composer prompt and the feed. */
export function CommunityDetailContent({ detail, joined }: CommunityDetailContentProps) {
  const router = useRouter();
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
      <div role="tablist" aria-label="Community sections" className="no-scrollbar flex overflow-x-auto border-b border-gray-200">
        {COMMUNITY_TABS.map((tab) => {
          const active = tab.key === "posts";
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={active ? undefined : comingSoon(tab.label.split(" · ")[0])}
              className={cn(
                "-mb-px shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-[13px] leading-[19px]",
                active ? "border-brand-900 font-semibold text-brand-900" : "border-transparent font-medium text-gray-500 hover:text-[#0f172a]",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2.5 rounded-2xl border border-gray-200 p-3.5">
        <Avatar src={detail.viewerAvatar} size={36} />
        <button
          type="button"
          disabled={!joined}
          onClick={comingSoon("New community post")}
          className="min-w-0 flex-1 truncate rounded-full bg-[#f1f5f9] px-3.5 py-2.5 text-left text-sm leading-5 text-[#94a3b8] enabled:hover:bg-[#e9eef5]"
        >
          {joined ? "Share something with the community" : "Join to post in this community"}
        </button>
      </div>

      {detail.posts.map((post) => (
        <article key={post.id} className="flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2.5">
            <Avatar src={post.avatar} size={36} />
            <div className="flex min-w-0 flex-col">
              <p className="truncate text-sm font-semibold leading-5 text-[#0f172a]">{post.author}</p>
              <p className="text-xs leading-[17px] text-gray-500">{post.postedAgo}</p>
            </div>
          </div>
          <p className="text-sm leading-5 text-[#334155]">{post.text}</p>
          <p className="text-xs font-medium leading-[17px] text-gray-500">{post.stat}</p>
        </article>
      ))}
    </div>
  );
}
