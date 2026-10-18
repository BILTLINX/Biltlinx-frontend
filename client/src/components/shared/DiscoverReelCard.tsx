"use client";

import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { FollowButton } from "@/components/shared/FollowButton";
import { NavIcon } from "@/components/shared/NavIcon";
import { ReelActionRail } from "@/components/shared/ReelActionRail";
import { ReelMobileHeader } from "@/components/shared/ReelMobileHeader";
import { ReelOptionsPopover, ReelOptionsSheet } from "@/components/shared/ReelOptionsMenu";
import {
  ReelLikeBurst,
  ReelMuteButton,
  ReelPlayButton,
  ReelPostButton,
  ReelProgressBar,
} from "@/components/shared/ReelPlayerControls";
import { Tooltip } from "@/components/shared/Tooltip";
import { useFollowAccount } from "@/hooks/useFollowAccount";
import { useLikeBurst } from "@/hooks/useLikeBurst";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useReelFeedback } from "@/hooks/useReelFeedback";
import { useReelVideo } from "@/hooks/useReelVideo";
import type { DiscoverTab } from "@/lib/discover-tabs";
import { notifyError } from "@/lib/errors";
import { likePost, unlikePost } from "@/lib/social-api";
import { shareContent } from "@/lib/share";
import { cn } from "@/lib/utils";
import type { DiscoverReel } from "@/types/reel";

interface DiscoverReelCardProps {
  reel: DiscoverReel;
  className?: string;
  /** Opens the comments panel for this reel — the desktop side panel above
   * `xl:`, the mobile bottom sheet below it (see discover/page.tsx). */
  onOpenComments?: () => void;
  /** Opens the "Post a Reel" composer (see discover/page.tsx). */
  onOpenPostComposer?: () => void;
  /** Drive the mobile in-video "Reels ⌄" filter dropdown (tabs live behind a
   * dropdown on mobile instead of DiscoverTopBar's row, hidden below `xl:`). */
  activeTab?: DiscoverTab;
  onTabChange?: (tab: DiscoverTab) => void;
  /** Feed-wide "Auto-scroll" setting — lives in discover/page.tsx, not
   * per-card, so every reel plays once (instead of looping) and hands off to
   * the next one consistently as you move through the feed. */
  autoScroll?: boolean;
  onToggleAutoScroll?: () => void;
  onAutoScrollNext?: () => void;
}

/** Strips the "(More)" marker the dummy captions carry. */
function cleanCaption(caption: string): string {
  return caption.replace(" (More)", "");
}

const TEXT_SHADOW = "[text-shadow:0_1px_3px_rgba(0,0,0,0.5)]";

export function DiscoverReelCard({
  reel,
  className,
  onOpenComments,
  onOpenPostComposer,
  activeTab,
  onTabChange,
  autoScroll,
  onToggleAutoScroll,
  onAutoScrollNext,
}: DiscoverReelCardProps) {
  // JS-driven, not CSS `xl:hidden`/`hidden xl:grid` — each layout embeds its
  // own <video>, and CSS-only dual-mounting would create two real videos
  // sharing one ref/autoplay cycle (wasted bandwidth; the ref would only
  // control one). The hook's server snapshot is always `false`, so SSR/first
  // paint uses the desktop layout and corrects right after mount.
  const isMobile = useMediaQuery("(max-width: 1279px)");
  const prefersReducedMotion = usePrefersReducedMotion();

  const { videoRef, playing, muted, progress, togglePlayback, toggleMute, seekToRatio, seekBySeconds } = useReelVideo({
    autoPlay: !prefersReducedMotion,
    remountKey: isMobile,
  });
  const likeMutation = useMutation({
    mutationFn: (next: boolean) => (next ? likePost(reel.id) : unlikePost(reel.id)),
  });
  const likes = useLikeBurst(prefersReducedMotion, {
    initialLiked: reel.likedByMe,
    onChange: (next) =>
      likeMutation.mutate(next, {
        onError: (error) => {
          likes.setLiked(!next);
          notifyError(error);
        },
      }),
  });
  const { feedback, choose: chooseFeedback } = useReelFeedback();

  const { following, toggle: toggleFollow } = useFollowAccount(reel.authorId, reel.following);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [shareCount, setShareCount] = useState(reel.shares);
  const [mobileOptionsOpen, setMobileOptionsOpen] = useState(false);
  const [desktopOptionsOpen, setDesktopOptionsOpen] = useState(false);

  const likeCount = Math.max(0, reel.likes + (likes.liked ? 1 : 0) - (reel.likedByMe ? 1 : 0));
  const saveCount = saved ? reel.saves + 1 : reel.saves;
  const captionText = cleanCaption(reel.caption);

  function handleShare() {
    shareContent({ title: `${reel.authorName}'s reel`, text: captionText, path: `#reel-${reel.id}` });
    setShareCount((count) => count + 1);
  }

  const videoEl = (
    <video
      ref={videoRef}
      src={reel.video}
      poster={reel.poster}
      aria-label={reel.caption}
      autoPlay={!prefersReducedMotion}
      // Looping is the default; with feed-wide Auto-scroll on, each reel
      // plays once and `onEnded` hands off to the next one.
      loop={!autoScroll}
      onEnded={autoScroll ? onAutoScrollNext : undefined}
      // Always `true` in markup (autoplay would be blocked otherwise) — real
      // mute/unmute is owned by useReelVideo, which sets the DOM property.
      muted
      playsInline
      // No onClick: tap-to-toggle lives on the surrounding container so
      // tapping *anywhere* on the reel works. Every control stops its own click.
      className="absolute inset-0 size-full object-cover"
    />
  );

  const actionRailProps = {
    prefersReducedMotion,
    liked: likes.liked,
    likeCount,
    onToggleLike: likes.toggleLike,
    commentCount: reel.comments,
    onOpenComments,
    shareCount,
    onShare: handleShare,
    repostCount: reel.reposts,
    saved,
    saveCount,
    onToggleSave: () => setSaved((value) => !value),
  };

  const playerControls = (
    <>
      <ReelLikeBurst particles={likes.particles} onParticleDone={likes.removeParticle} />
      <ReelProgressBar progress={progress} onSeekToRatio={seekToRatio} onSeekBySeconds={seekBySeconds} />
      <ReelPlayButton playing={playing} onToggle={togglePlayback} />
      <ReelMuteButton muted={muted} onToggle={toggleMute} />
    </>
  );

  const optionsProps = {
    autoScroll,
    onToggleAutoScroll,
    feedback,
    onChooseFeedback: chooseFeedback,
  };

  if (isMobile) {
    // Full-screen, TikTok/Reels-style takeover — no app chrome above it
    // (DiscoverTopBar and the story rail are hidden below `xl:`), so the
    // controls that would live in a navbar float over the video instead.
    // `100vh`, not `100dvh`: AppShell's outer shell is `h-screen` (100vh), and
    // matching that unit exactly is what makes the reel fill the viewport with
    // no gap, regardless of the mobile address bar.
    return (
      // `onClick` on the container (not just the <video>) is what makes
      // tapping anywhere — scrim, empty caption space — toggle playback.
      <div onClick={togglePlayback} className={cn("relative h-screen w-full overflow-hidden bg-black", className)}>
        {videoEl}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
        {playerControls}

        <ReelMobileHeader
          activeTab={activeTab}
          onTabChange={onTabChange}
          onOpenPostComposer={onOpenPostComposer}
          onOpenOptions={() => setMobileOptionsOpen(true)}
          optionsOpen={mobileOptionsOpen}
        />

        <div
          onClick={(event) => event.stopPropagation()}
          className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 pb-6"
        >
          <div className="flex min-w-0 flex-col items-start gap-2">
            <div className="flex items-center gap-[6px]">
              <div className="relative size-9 shrink-0 overflow-hidden rounded-full border border-white/40">
                <Image src={reel.authorAvatar} alt="" fill sizes="36px" className="object-cover" />
              </div>
              <p className={cn("whitespace-nowrap text-[14px] font-bold text-white", TEXT_SHADOW)}>{reel.authorName}</p>
              <FollowButton following={following} onToggle={toggleFollow} name={reel.authorName} />
            </div>
            <p className={cn("line-clamp-2 text-[13px] font-medium text-white", TEXT_SHADOW)}>{captionText}</p>
          </div>

          <ReelActionRail tone="overlay" {...actionRailProps} />
        </div>

        <ReelOptionsSheet open={mobileOptionsOpen} onClose={() => setMobileOptionsOpen(false)} {...optionsProps} />
      </div>
    );
  }

  // Desktop: author/caption, video and the action rail as three columns
  // (Figma's layout), symmetrically centered via the `minmax(0,1fr)` outer
  // columns. `xl:pl-[40px]` pushes the whole row off the sidebar without
  // touching the tight 4px gap between the caption column and the video.
  return (
    <div className={cn("grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-0 xl:pl-[40px]", className)}>
      {/* `justify-end` pins the author/caption to the video's bottom edge
          (this column stretches to the video's row height). `max-w-[293px]`
          with `w-full` lets it shrink with the grid as the sidebar
          expands/collapses instead of overflowing. */}
      <div className="mr-1 flex w-full max-w-[293px] flex-col items-start justify-end gap-[8px] justify-self-end">
        <div className="flex w-full min-w-0 items-center gap-[6px]">
          <div className="flex min-w-0 items-center gap-2">
            <div className="relative size-[40px] shrink-0 overflow-hidden rounded-full">
              <Image src={reel.authorAvatar} alt="" fill sizes="40px" className="object-cover" />
              {reel.verified && (
                <span className="absolute bottom-[-2px] right-[-2px] flex size-4 items-center justify-center rounded-full border-2 border-white bg-brand-600">
                  <span className="block size-1.5 rounded-full bg-white" />
                </span>
              )}
            </div>
            <p className="truncate text-[14px] font-bold text-brand-900">{reel.authorName}</p>
          </div>
          <FollowButton following={following} onToggle={toggleFollow} name={reel.authorName} />
        </div>
        <p className="text-[14px] font-medium leading-[16px] text-black">
          {expanded || captionText.length <= 70 ? (
            captionText
          ) : (
            <>
              {captionText.slice(0, 70)}…{" "}
              <button type="button" onClick={() => setExpanded(true)} className="font-bold text-gray-500 hover:text-brand-900">
                More
              </button>
            </>
          )}
        </p>
      </div>

      {/* Height-driven, not width-driven: fills almost the whole
          `calc(100vh-67px)` slot the page gives each reel, capped at the
          design's native 780px; width follows from the 402:716 aspect ratio. */}
      <div
        onClick={togglePlayback}
        className="relative aspect-[402/716] h-[min(780px,calc(100vh-91px))] w-auto max-w-[402px] shrink-0 overflow-hidden rounded-[16px] bg-gray-100"
      >
        {videoEl}
        <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-reel-from to-reel-to" />
        {playerControls}
        <ReelPostButton onClick={onOpenPostComposer} iconSize={12} className="absolute left-3 top-3 size-7 transition-transform hover:scale-105" />
      </div>

      <ReelActionRail tone="light" {...actionRailProps}>
        <div className="relative">
          <Tooltip label="More options" side="bottom" align="end">
            <button
              type="button"
              aria-label="More options"
              aria-haspopup="menu"
              aria-expanded={desktopOptionsOpen}
              onClick={() => setDesktopOptionsOpen((open) => !open)}
              className="flex size-5 items-center justify-center"
            >
              <NavIcon icon="/icons/more-horizontal.svg" color="night" size={20} />
            </button>
          </Tooltip>

          {desktopOptionsOpen && <ReelOptionsPopover onClose={() => setDesktopOptionsOpen(false)} {...optionsProps} />}
        </div>
      </ReelActionRail>
    </div>
  );
}
