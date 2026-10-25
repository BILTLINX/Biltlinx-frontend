"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { showSuccessToast } from "@/components/shared/AppToast";
import { FeedRightRail } from "@/components/shared/FeedRightRail";
import { MobileQuickPostModal, type QuickComposerMode } from "@/components/shared/MobileQuickPostModal";
import { NewPostsPill } from "@/components/shared/NewPostsPill";
import { PostCard } from "@/components/shared/PostCard";
import { TrustedListingsBanner } from "@/components/shared/TrustedListingsBanner";
import { PostCardSkeleton } from "@/components/shared/PostCardSkeleton";
import { useSession } from "@/context/SessionContext";
import { usePostsFeed } from "@/context/PostsContext";
import { useFeed, useNewPosts } from "@/hooks/useFeed";
import { usePostModals, type PostModalType } from "@/hooks/usePostModals";
import { comingSoonHref } from "@/lib/coming-soon";
import { errorMessage } from "@/lib/errors";
import type { FeedQuery } from "@/types/api/social";

interface FeedTab {
  label: string;
  query: Pick<FeedQuery, "scope" | "kind">;
}

const FEED_TABS: FeedTab[] = [
  { label: "All Posts", query: {} },
  { label: "Following", query: { scope: "following" } },
  { label: "Properties", query: { kind: "Property" } },
  { label: "Stay", query: { kind: "Stay" } },
  { label: "Services", query: { kind: "Service" } },
];

const COMPOSER_ACTIONS = [
  { key: "media", label: "Media", icon: "/icons/media-gallery.svg" },
  { key: "poll", label: "Poll", icon: "/icons/poll-bar-chart.svg" },
  { key: "article", label: "Article", icon: "/icons/article-document.svg" },
  { key: "property", label: "Property", icon: "/icons/building-03.svg" },
  { key: "stay", label: "Stay", icon: "/icons/guest-house-sm.svg" },
  { key: "service", label: "Service", icon: "/icons/map-pin-02-sm.svg" },
  { key: "project", label: "Project", icon: "/icons/briefcase-09.svg" },
  { key: "events", label: "Events", icon: "/icons/event-calendar-01.svg" },
];

/** The desktop composer's icons the mobile card doesn't show up front; the "more" toggle reveals these. */
const MORE_COMPOSER_ACTIONS = COMPOSER_ACTIONS.filter((action) =>
  ["property", "stay", "service", "project", "events"].includes(action.key),
);

export default function FeedPage() {
  return (
    <Suspense fallback={null}>
      <FeedContent />
    </Suspense>
  );
}

function FeedContent() {
  const hashtag = useSearchParams().get("hashtag") ?? undefined;
  const [activeTab, setActiveTab] = useState(FEED_TABS[0].label);
  const tab = FEED_TABS.find((candidate) => candidate.label === activeTab) ?? FEED_TABS[0];
  const { posts, isPending, isError, error, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useFeed({ ...tab.query, hashtag });
  const { count: newPostsCount, reveal } = useNewPosts(tab.query.scope);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, posts.length]);

  return (
    <AppShell
      activeKey="feed"
      activeChildKey="feed-page"
      rightRail={<FeedRightRail />}
      header={
        <div className="pb-[15px]">
          <FeedTabs activeTab={activeTab} onSelect={setActiveTab} />
        </div>
      }
    >
      <TrustedListingsBanner />
      <div className="flex w-full flex-col gap-[15px]">
        {hashtag && (
          <p className="text-[13px] font-medium text-gray-700">
            Showing posts tagged #{hashtag}{" "}
            <a href="/feed" className="text-brand-900 hover:underline">
              Clear
            </a>
          </p>
        )}
        <NewPostsPill count={newPostsCount} onReveal={reveal} />
        <ComposerCard />
        {isPending && (
          <>
            <PostCardSkeleton />
            <PostCardSkeleton />
          </>
        )}
        {isError && (
          <div className="flex w-full flex-col items-center gap-3 rounded-[15px] border border-gray-200 bg-white p-[15px] py-9 text-center">
            <p className="text-[13px] text-gray-500">{errorMessage(error, "We could not load the feed.")}</p>
            <button type="button" onClick={() => void refetch()} className="text-[13px] font-medium text-brand-900 hover:underline">
              Try again
            </button>
          </div>
        )}
        {!isPending && !isError && posts.length === 0 && (
          <div className="flex w-full flex-col items-center gap-[15px] rounded-[15px] border border-gray-200 bg-white p-[15px] py-9 text-center">
            <p className="text-[13px] text-gray-500">
              {tab.query.scope === "following" ? "Follow people to see their posts here." : "No posts here yet. Check back soon."}
            </p>
          </div>
        )}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {isFetchingNextPage && <PostCardSkeleton />}
        {hasNextPage && <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />}
      </div>
    </AppShell>
  );
}

const LINKED_COMPOSER_KEYS = ["media", "poll", "article", "property", "stay", "service"] as const;

function ComposerCard() {
  const initials = useInitials();
  const { openPostModal, modals } = usePostModals();

  return (
    <>
      <div className="hidden w-full flex-col gap-[15px] rounded-[15px] border border-gray-200 bg-white p-[15px] sm:flex">
        <div className="flex w-full items-center justify-center gap-2.5">
          <span className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[13px] font-extrabold text-[#4f46e5]">
            {initials}
          </span>
          <button
            type="button"
            onClick={() => openPostModal("media")}
            className="flex w-full items-center justify-between rounded-3xl bg-gray-100 p-2"
          >
            <p className="text-[11px] font-medium text-black/35">Add your comment</p>
            <span className="relative block size-[23px] shrink-0">
              <Image src="/icons/send-alt-filled.svg" alt="" fill sizes="23px" />
            </span>
          </button>
        </div>

        <div className="h-px w-full bg-gray-200" />

        <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:gap-[17px]">
          {COMPOSER_ACTIONS.map((action) =>
            (LINKED_COMPOSER_KEYS as readonly string[]).includes(action.key) ? (
              <button
                key={action.key}
                type="button"
                aria-label={action.label}
                onClick={() => openPostModal(action.key as PostModalType)}
                className="flex items-center gap-2 text-[11px] font-bold text-gray-500 hover:text-brand-900"
              >
                <span className="relative block size-4 shrink-0 sm:size-[13px]">
                  <Image src={action.icon} alt="" fill sizes="16px" />
                </span>
                <span className="hidden sm:inline">{action.label}</span>
              </button>
            ) : (
              <Link
                key={action.key}
                href={comingSoonHref(action.label)}
                aria-label={action.label}
                className="flex items-center gap-2 text-[11px] font-bold text-gray-500 hover:text-brand-900"
              >
                <span className="relative block size-4 shrink-0 sm:size-[13px]">
                  <Image src={action.icon} alt="" fill sizes="16px" />
                </span>
                <span className="hidden sm:inline">{action.label}</span>
              </Link>
            ),
          )}
        </div>
      </div>

      {modals}
      <MobileComposerCard />
    </>
  );
}

function MobileComposerCard() {
  const initials = useInitials();
  const { openPostModal, modals } = usePostModals();
  const { addPost } = usePostsFeed();
  const [commentDraft, setCommentDraft] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [quickPostOpen, setQuickPostOpen] = useState(false);
  const [quickPostMode, setQuickPostMode] = useState<QuickComposerMode>("post");

  function submitComment() {
    const text = commentDraft.trim();
    if (!text) return;
    setCommentDraft("");
    void addPost({ kind: "media", text, files: [] }).then((created) => {
      if (created) showSuccessToast("Your post has been shared");
    });
  }

  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:hidden">
      <div className="flex w-full items-center gap-2.5">
        <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-base font-extrabold text-[#4f46e5]">
          {initials}
          <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-[1.5px] border-white bg-[#22c55e]" />
        </span>
        <div className="flex w-full items-center justify-between gap-2 rounded-3xl border border-transparent bg-gray-100 p-2 focus-within:border-brand-900 focus-within:bg-white">
          <input
            type="text"
            value={commentDraft}
            onChange={(event) => setCommentDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submitComment();
            }}
            placeholder="Add a comment"
            className="min-w-0 flex-1 bg-transparent text-xs text-night-900 placeholder:text-black/35 focus:outline-none"
          />
          <button
            type="button"
            aria-label="Send"
            onClick={submitComment}
            disabled={!commentDraft.trim()}
            className="relative block size-6 shrink-0 disabled:opacity-30"
          >
            <Image src="/icons/send-alt-filled.svg" alt="" fill sizes="24px" />
          </button>
        </div>
      </div>

      <div className="h-px w-full bg-gray-200" />

      <div className="flex w-full flex-wrap items-center gap-[18px]">
        <button
          type="button"
          aria-label="Media"
          onClick={() => {
            setQuickPostMode("post");
            setQuickPostOpen(true);
          }}
        >
          <span className="relative block size-3.5">
            <Image src="/icons/media-gallery.svg" alt="" fill sizes="14px" />
          </span>
        </button>
        <button
          type="button"
          aria-label="Poll"
          onClick={() => {
            setQuickPostMode("poll");
            setQuickPostOpen(true);
          }}
        >
          <span className="relative block size-3.5">
            <Image src="/icons/poll-bar-chart.svg" alt="" fill sizes="14px" />
          </span>
        </button>
        <button
          type="button"
          aria-label="Article"
          onClick={() => {
            setQuickPostMode("article");
            setQuickPostOpen(true);
          }}
        >
          <span className="relative block size-3.5">
            <Image src="/icons/article-document.svg" alt="" fill sizes="14px" />
          </span>
        </button>

        {moreOpen &&
          MORE_COMPOSER_ACTIONS.map((action) =>
            action.key === "property" || action.key === "stay" || action.key === "service" ? (
              <button
                key={action.key}
                type="button"
                aria-label={action.label}
                onClick={() => {
                  openPostModal(action.key as PostModalType);
                  setMoreOpen(false);
                }}
              >
                <span className="relative block size-3.5">
                  <Image src={action.icon} alt="" fill sizes="14px" />
                </span>
              </button>
            ) : (
              <Link key={action.key} href={comingSoonHref(action.label)} aria-label={action.label}>
                <span className="relative block size-3.5">
                  <Image src={action.icon} alt="" fill sizes="14px" />
                </span>
              </Link>
            ),
          )}

        <button type="button" aria-label="More options" aria-expanded={moreOpen} onClick={() => setMoreOpen((v) => !v)}>
          <span className="relative block size-4">
            <Image src="/icons/more-horizontal.svg" alt="" fill sizes="16px" />
          </span>
        </button>
      </div>

      {modals}
      <MobileQuickPostModal open={quickPostOpen} onClose={() => setQuickPostOpen(false)} initialMode={quickPostMode} />
    </div>
  );
}

function FeedTabs({ activeTab, onSelect }: { activeTab: string; onSelect: (label: string) => void }) {
  return (
    <div className="no-scrollbar flex h-[42px] w-full touch-pan-x items-center overflow-x-auto rounded-[15px] border border-[#e6e7ec] bg-white pl-[15px] pr-2.5">
      {FEED_TABS.map((tab) => (
        <button
          key={tab.label}
          type="button"
          onClick={() => onSelect(tab.label)}
          className={
            tab.label === activeTab
              ? "flex h-full shrink-0 items-center justify-center whitespace-nowrap border-b-2 border-brand-600 p-[15px] text-[12px] font-medium text-brand-600"
              : "flex h-full shrink-0 items-center justify-center whitespace-nowrap border-b border-[#e6e7ec] p-[15px] text-[12px] text-[#111826]"
          }
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function useInitials() {
  const { user } = useSession();
  return (user?.username ?? "").slice(0, 2).toUpperCase() || "ME";
}
