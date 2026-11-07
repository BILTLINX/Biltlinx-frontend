"use client";

import Image from "next/image";
import { NavIcon } from "@/components/shared/NavIcon";
import { Tooltip } from "@/components/shared/Tooltip";
import { MyStoryViewer } from "@/components/shared/StoriesRow";
import { useAccountBadge } from "@/hooks/useDisplayName";
import { useStoryGroups, useStoryViewer } from "@/hooks/useMyStories";
import { StoryRing } from "@/components/shared/StoryRing";
import type { MyStory } from "@/types/story";

interface DiscoverStoryRailProps {
  activeStories: MyStory[];
  onYourStoryClick: () => void;
  /** `vertical` is the desktop aside (Figma node 789:36669); `horizontal` is
   * the mobile bar that sits beneath the top nav instead. Both are driven by
   * the same lifted story state (see `useMyStories`/discover/page.tsx)
   * so posting a story stays in sync regardless of which layout is visible
   * at the current viewport. */
  layout?: "vertical" | "horizontal";
}

/** Discover's "channel stories" rail — the same posting/viewing mechanics as
 * the home dashboard's `StoriesRow` (`PostStoryModal` to post,
 * `MyStoryViewer` to view/delete your own, a 24h lifetime), just laid out
 * either as a narrow full-height aside or a horizontal bar. */
export function DiscoverStoryRail({ activeStories, onYourStoryClick, layout = "vertical" }: DiscoverStoryRailProps) {
  const latestStory = activeStories[activeStories.length - 1];
  const { avatar } = useAccountBadge();
  const { others, isPending } = useStoryGroups();
  const groupViewer = useStoryViewer();
  const yourStoryLabel = activeStories.length > 0 ? "View your story" : "Add to your story";

  const yourStoryButton = (
    <Tooltip label={yourStoryLabel} side="bottom" align="end">
      <button
        type="button"
        onClick={onYourStoryClick}
        aria-label={yourStoryLabel}
        className="relative flex size-[48px] shrink-0 items-center justify-center"
      >
        <StoryRing active={activeStories.length > 0} className="size-[48px]">
          <Image src={latestStory?.url ?? avatar} alt="" fill sizes="42px" className="object-cover" />
        </StoryRing>
        <span className="absolute bottom-[-2px] right-0 flex size-5 items-center justify-center rounded-full border-2 border-white bg-brand-900 text-[11px] font-bold leading-none text-white">
          +
        </span>
      </button>
    </Tooltip>
  );

  const nobodyElse = !isPending && others.length === 0;
  const nobodyElseLabel = "No stories from other people yet";

  const channelAvatars = (sizeClass: string) =>
    others.slice(0, 8).map((group) => (
      <Tooltip key={group.author.id} label={group.author.username} side="bottom" align="end">
        <button
          type="button"
          onClick={() => groupViewer.open(group)}
          aria-label={`${group.author.username}'s story`}
          className="shrink-0 rounded-full"
        >
          <StoryRing active={group.hasUnseen} className={sizeClass}>
            <Image
              src={group.author.profilePicUrl ?? group.stories[0]?.media.url ?? "/icons/avatar-placeholder-user.svg"}
              alt=""
              fill
              sizes="32px"
              className="object-cover"
            />
          </StoryRing>
        </button>
      </Tooltip>
    ));

  const viewer = groupViewer.viewing && groupViewer.stories.length > 0 && (
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
  );

  if (layout === "horizontal") {
    return (
      <div className="no-scrollbar flex w-full items-center gap-[16px] overflow-x-auto border-b border-gray-200 bg-white px-[15px] py-[12px]">
        {yourStoryButton}
        {channelAvatars("size-[48px]")}
        {nobodyElse && (
          <p className="shrink-0 text-xs leading-[1.45] text-gray-500">
            <span className="block font-semibold text-[#0f172a]">{nobodyElseLabel}</span>
            Stories from people you follow show up here for 24 hours.
          </p>
        )}
        {viewer}
      </div>
    );
  }

  return (
    <div className="flex h-full w-[59px] shrink-0 flex-col items-center justify-between border-l border-gray-200 bg-white py-[24px]">
      <div className="flex flex-col items-center gap-[16px]">
        {channelAvatars("size-[32px]")}
        {nobodyElse && (
          <Tooltip label={`${nobodyElseLabel}. Stories from people you follow show up here for 24 hours.`} side="bottom" align="end">
            <span tabIndex={0} aria-label={nobodyElseLabel} className="flex size-[32px] shrink-0 items-center justify-center rounded-full border border-dashed border-gray-300 bg-gray-50">
              <NavIcon icon="/icons/user-group.svg" size={14} className="bg-gray-400" />
            </span>
          </Tooltip>
        )}
        {yourStoryButton}
      </div>
      {viewer}
    </div>
  );
}
