"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavIcon } from "@/components/shared/NavIcon";
import { shareContent } from "@/lib/share";
import { cn } from "@/lib/utils";
import { StoryRing } from "@/components/shared/StoryRing";
import { PostStoryModal } from "@/components/shared/PostStoryModal";
import { useMyStories, useStoryGroups, useStoryViewer } from "@/hooks/useMyStories";
import { useScrollRail } from "@/hooks/useScrollRail";
import type { MyStory } from "@/types/story";

/** "Stories" card at the top of the "/home" dashboard — a horizontally
 * scrollable rail of avatars, each ringed in the Instagram-style gradient
 * that marks an unseen story. "Your story" doubles as the entry point for
 * actually posting one (you can post more than one, like the others' rails),
 * and each posted story expires — is dropped from the list — 24h after
 * posting, same as real stories. */
export function StoriesRow() {
  const stories = useMyStories();
  const { others, isPending } = useStoryGroups();
  const groupViewer = useStoryViewer();
  const { ref: railRef, canScroll, atEnd, scroll: scrollRail } = useScrollRail<HTMLDivElement>();
  const { activeStories } = stories;
  const latestStory = activeStories[activeStories.length - 1];

  return (
    <div className="flex w-full flex-col gap-3 rounded-[28px] border border-gray-200 bg-white p-4 sm:rounded-2xl">
      <div className="flex h-[18px] w-full items-center justify-between">
        <p className="text-[16px] font-bold text-gray-700">Stories</p>
        {canScroll && (
          <button
            type="button"
            onClick={scrollRail}
            aria-label={atEnd ? "Back to the first stories" : "Show more stories"}
            // Keeps the 18px header height from Figma while giving a bigger tap target.
            className="-my-[7px] flex h-8 w-10 items-center justify-center rounded-lg hover:bg-gray-50"
          >
            <NavIcon
              icon="/icons/chevron-right.svg"
              color="night"
              size={10}
              className={cn("bg-night-900 transition-transform duration-200", atEnd && "rotate-180")}
            />
          </button>
        )}
      </div>

      <div ref={railRef} className="no-scrollbar flex w-full min-w-0 touch-pan-x items-start gap-5 overflow-x-auto pb-2">
        <StoryItem
          label="Your story"
          avatar={latestStory?.url ?? "/images/stories/your-story.jpg"}
          addBadge
          hasStory={activeStories.length > 0}
          onClick={stories.openYourStory}
        />
        {isPending && [0, 1, 2, 3].map((n) => <span key={n} className="size-14 shrink-0 animate-pulse rounded-full bg-gray-200" />)}
        {others.map((group) => (
          <StoryItem
            key={group.author.id}
            label={group.author.username}
            avatar={group.author.profilePicUrl ?? group.stories[0]?.media.url ?? "/icons/avatar-placeholder-user.svg"}
            hasStory={group.hasUnseen}
            onClick={() => groupViewer.open(group)}
          />
        ))}
      </div>

      <PostStoryModal open={stories.composerOpen} onClose={() => stories.setComposerOpen(false)} onPost={stories.addStory} />

      {groupViewer.viewing && groupViewer.stories.length > 0 && (
        <MyStoryViewer
          readOnly
          label={`${groupViewer.viewing.author.username}'s story`}
          stories={groupViewer.stories}
          initialIndex={Math.max(0, groupViewer.viewing.stories.findIndex((story) => !story.seen))}
          onViewed={groupViewer.markSeen}
          onClose={groupViewer.close}
          onDelete={() => undefined}
          onAddAnother={() => undefined}
        />
      )}

      {stories.viewerIndex !== null && activeStories.length > 0 && (
        <MyStoryViewer
          stories={activeStories}
          initialIndex={stories.viewerIndex}
          onClose={() => stories.setViewerIndex(null)}
          onDelete={stories.deleteStory}
          onAddAnother={() => {
            stories.setViewerIndex(null);
            stories.setComposerOpen(true);
          }}
        />
      )}
    </div>
  );
}

function StoryItem({
  href,
  label,
  avatar,
  addBadge,
  hasStory,
  onClick,
}: {
  href?: string;
  label: string;
  avatar: string;
  addBadge?: boolean;
  hasStory?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="relative block size-14 shrink-0">
        <StoryRing active={addBadge ? !!hasStory : (hasStory ?? true)} className="size-full">
          <Image src={avatar} alt="" fill className="object-cover" sizes="56px" />
        </StoryRing>
        {addBadge && (
          <span className="absolute -bottom-0.5 right-0 flex size-5 items-center justify-center rounded-full border-2 border-white bg-brand-900 text-[11px] font-bold leading-none text-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
            +
          </span>
        )}
      </span>
      <span className="w-full truncate pt-1.5 text-center text-[11px] font-medium text-reel-ink">{label}</span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="flex w-14 shrink-0 flex-col items-center">
        {content}
      </button>
    );
  }

  return (
    <Link href={href!} className="flex w-14 shrink-0 flex-col items-center">
      {content}
    </Link>
  );
}

/** Full-screen viewer for the signed-in user's own posted stories — shared
 * by any "your story" entry point (the home dashboard's `StoriesRow` and
 * Discover's vertical `DiscoverStoryRail`) so the posting/viewing mechanics
 * stay identical wherever a story avatar appears. */
export function MyStoryViewer({
  stories,
  initialIndex,
  onClose,
  onDelete,
  onAddAnother,
  readOnly = false,
  label = "Your story",
  onViewed,
}: {
  stories: MyStory[];
  initialIndex: number;
  onClose: () => void;
  onDelete: (id: string) => void;
  onAddAnother: () => void;
  readOnly?: boolean;
  label?: string;
  onViewed?: (id: string) => void;
}) {
  const [requestedIndex, setIndex] = useState(initialIndex);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // The list shrinks in place when a story is deleted or expires out from
  // under the viewer — derive an in-range index instead of pointing past the end.
  const index = Math.max(0, Math.min(requestedIndex, stories.length - 1));

  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  const currentId = stories[index]?.id;
  useEffect(() => {
    if (currentId) onViewed?.(currentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId]);

  if (stories.length === 0) return null;
  const story = stories[index];

  function goNext() {
    if (index >= stories.length - 1) {
      onClose();
      return;
    }
    setIndex(index + 1);
  }

  function goPrev() {
    setIndex(Math.max(0, index - 1));
  }

  function handleShare() {
    setMenuOpen(false);
    shareContent({ title: "My story", text: story.caption, path: `#my-story-${story.id}` });
  }

  function handleSave() {
    setMenuOpen(false);
    const link = document.createElement("a");
    link.href = story.url;
    link.download = story.isVideo ? "my-story.webm" : "my-story.jpg";
    link.click();
  }

  function handleDelete() {
    setMenuOpen(false);
    onDelete(story.id);
    if (stories.length <= 1) onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div onClick={(event) => event.stopPropagation()} className="relative flex max-h-[85vh] w-full max-w-[420px] flex-col">
        <div className="absolute -top-11 left-0 right-0 flex items-center justify-between gap-2">
          {readOnly ? <span aria-hidden="true" /> : (
          <button
            type="button"
            aria-label="Add another story"
            onClick={onAddAnother}
            className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 3V17M3 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          )}

          <div className="flex items-center gap-2">
            {!readOnly && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                aria-label="Story options"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="5" cy="12" r="2" fill="currentColor" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                  <circle cx="19" cy="12" r="2" fill="currentColor" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-10 flex w-40 flex-col gap-1 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex h-9 w-full items-center rounded-lg px-3 text-left text-[13px] text-night-700 hover:bg-gray-50"
                  >
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex h-9 w-full items-center rounded-lg px-3 text-left text-[13px] text-night-700 hover:bg-gray-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex h-9 w-full items-center rounded-lg px-3 text-left text-[13px] text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            )}

            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-gray-900">
          {stories.length > 1 && (
            <div className="absolute inset-x-2 top-2 z-10 flex gap-1">
              {stories.map((s, i) => (
                <span key={s.id} className={cn("h-[3px] flex-1 rounded-full", i <= index ? "bg-white" : "bg-white/30")} />
              ))}
            </div>
          )}

          {story.isVideo ? (
            <video
              key={story.id}
              src={story.url}
              className="size-full object-cover"
              muted
              autoPlay
              loop
              controls
              playsInline
            />
          ) : (
            <Image key={story.id} src={story.url} alt="" fill className="object-cover" sizes="420px" />
          )}

          {story.caption && (
            <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10 text-sm text-white">
              {story.caption}
            </p>
          )}

          {stories.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous story"
                onClick={goPrev}
                disabled={index === 0}
                className="absolute inset-y-0 left-0 w-1/3 disabled:cursor-default"
              />
              <button type="button" aria-label="Next story" onClick={goNext} className="absolute inset-y-0 right-0 w-1/3" />
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
