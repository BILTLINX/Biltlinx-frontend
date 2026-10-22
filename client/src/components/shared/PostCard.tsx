"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { BookmarkIcon } from "@/components/shared/BookmarkIcon";
import { FollowButton } from "@/components/shared/FollowButton";
import { LikesBottomSheet } from "@/components/shared/LikesBottomSheet";
import { MediaLoadError } from "@/components/shared/MediaLoadError";
import { NavIcon } from "@/components/shared/NavIcon";
import { PostOptionsControl } from "@/components/shared/PostOptionsControl";
import { RequestViewingModal } from "@/components/shared/RequestViewingModal";
import { CommentsModal } from "@/components/shared/PostComments";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMediaLoadState } from "@/hooks/useMediaLoadState";
import { useFollowAccount } from "@/hooks/useFollowAccount";
import { useIsClamped } from "@/hooks/useIsClamped";
import { useLikers } from "@/hooks/useLikers";
import { usePostLike, usePostPoll } from "@/hooks/usePostState";
import { Tooltip } from "@/components/shared/Tooltip";
import { comingSoonHref } from "@/lib/coming-soon";
import { renderWithHashtags } from "@/lib/hashtags";
import { sharePost } from "@/lib/post-actions";
import { cn } from "@/lib/utils";
import type { MediaItem, PostCardData } from "@/types/post";

export function getMediaItems(post: PostCardData): MediaItem[] {
  if (post.media) return post.media;
  if (post.video) return [{ url: post.video, isVideo: true }];
  if (post.images) return post.images.map((url) => ({ url }));
  if (post.image) return [{ url: post.image }];
  return [];
}

interface PostCardProps {
  post: PostCardData;
  currentUserAvatarInitials?: string;
}

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [textExpanded, setTextExpanded] = useState(false);
  const { ref: textRef, clamped: textClamped } = useIsClamped<HTMLParagraphElement>(textExpanded, post.text);
  const [saved, setSaved] = useState(false);
  const like = usePostLike(post);
  const mediaItems = getMediaItems(post);

  return (
    <article className="flex w-full flex-col gap-[15px] rounded-[29px] border border-gray-200 bg-white p-[15px] sm:rounded-[15px]">
      <PostHeader post={post} saved={saved} onToggleSave={() => setSaved((v) => !v)} />

      <div className="h-px w-full bg-gray-200" />

      {post.variant === "poll" ? (
        <PollBody post={post} />
      ) : (
        <>
          {(post.text || mediaItems.length > 0) && (
            // Mobile shows the image first with the caption below it;
            // desktop keeps the caption above the image.
            <div className="flex w-full flex-col-reverse gap-[15px] sm:flex-col">
              {post.text && (
                <div className="flex w-full items-end gap-0.5 text-[12px] leading-5 sm:text-sm">
                  <p ref={textRef} className={cn("min-w-0 flex-1 whitespace-pre-line text-[#1e293b]", !textExpanded && "line-clamp-4")}>
                    {renderWithHashtags(post.text)}
                  </p>
                  {textClamped && (
                    <button
                      type="button"
                      onClick={() => setTextExpanded((v) => !v)}
                      className="shrink-0 font-bold text-gray-400"
                    >
                      {textExpanded ? "less" : "more"}
                    </button>
                  )}
                </div>
              )}

              {mediaItems.length > 0 && <MediaCarousel items={mediaItems} />}
            </div>
          )}

          {(post.priceLine || post.actions) && <div className="h-px w-full bg-gray-200" />}

          {post.priceLine && <PriceRow post={post} />}

          {post.actions && <ActionsRow post={post} />}
        </>
      )}

      <div className="h-px w-full bg-gray-200" />

      <PostStatsBar post={post} like={like} saved={saved} onToggleSave={() => setSaved((v) => !v)} showComments={showComments} onToggleComments={() => setShowComments((v) => !v)} />

      <CommentsModal
        open={showComments}
        post={post}
        like={like}
        onShare={() => sharePost(post)}
        onClose={() => setShowComments(false)}
      />
    </article>
  );
}

function PostHeader({ post, saved, onToggleSave }: { post: PostCardData; saved: boolean; onToggleSave: () => void }) {
  const { following, toggle: toggleFollow } = useFollowAccount(post.authorId, post.authorFollowed);

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="relative block size-[46px] shrink-0">
          <span
            className={cn(
              "relative block size-full overflow-hidden rounded-full",
              post.avatarPlaceholder && "flex items-center justify-center bg-[#eef2ff]",
            )}
          >
            {post.avatarPlaceholder ? (
              <span className="relative block size-[27px]">
                <Image src="/icons/avatar-placeholder-user.svg" alt="" fill sizes="27px" />
              </span>
            ) : (
              <Image src={post.avatar} alt={post.authorName} fill className="object-cover" sizes="46px" />
            )}
          </span>
          {post.verified && (
            <span className="absolute -bottom-0.5 -right-0.5 block size-[17px]">
              <Image
                src={
                  post.verified === "individual"
                    ? "/icons/avatar-verified-badge-green.svg"
                    : "/icons/avatar-verified-badge.svg"
                }
                alt=""
                fill
                sizes="17px"
              />
            </span>
          )}
        </span>
        <div className="flex flex-col items-start whitespace-nowrap">
          <p className="text-[12px] font-bold text-brand-900 sm:text-[13px]">{post.authorName}</p>
          <p className="text-[9.5px] text-gray-500">
            {post.roleLine} <span className="font-medium">{post.postedAt}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {post.variant !== "poll" && !post.isOwn && (
          <PostFollowButton following={following} onToggle={toggleFollow} name={post.authorName} />
        )}
        <PostOptionsControl
          post={post}
          saved={saved}
          onToggleSave={onToggleSave}
          following={following}
          onToggleFollow={toggleFollow}
          className="relative block size-[23px] shrink-0"
        >
          <Image src="/icons/more-horizontal.svg" alt="" fill sizes="23px" className="sm:hidden" />
          <Image src="/icons/menu-03.svg" alt="" fill sizes="23px" className="hidden sm:block" />
        </PostOptionsControl>
      </div>
    </div>
  );
}

/** Follow control used in post headers: an icon-only toggle on mobile, the standard pill from sm up. */
export function PostFollowButton({ following, onToggle, name }: { following: boolean; onToggle: () => void; name: string }) {
  return (
    <>
      <Tooltip label={following ? "Following" : "Follow"} className="sm:hidden">
        <button
          type="button"
          onClick={onToggle}
          aria-label={following ? "Following" : "Follow"}
          aria-pressed={following}
          className="flex size-[38px] shrink-0 items-center justify-center rounded-lg"
        >
          <NavIcon
            icon={following ? "/icons/check-circle.svg" : "/icons/user-add-01.svg"}
            color="brand"
            size={20}
            className="shrink-0"
          />
        </button>
      </Tooltip>
      <FollowButton following={following} onToggle={onToggle} name={name} className="hidden sm:flex" />
    </>
  );
}

export function MediaCarousel({ items, className }: { items: MediaItem[]; className?: string }) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const hasMultiple = items.length > 1;
  const current = items[index];
  const media = useMediaLoadState(current.url);

  const goTo = (next: number) => setIndex((next + items.length) % items.length);

  return (
    <div className={cn("relative h-[285px] w-full overflow-hidden rounded-[29px] sm:rounded-[15px]", className)}>
      {current.isVideo ? (
        <video src={current.url} controls className="size-full object-cover" />
      ) : media.failed ? (
        <MediaLoadError onRetry={media.retry} className="absolute inset-0" />
      ) : (
        <button
          type="button"
          aria-label="View full image"
          onClick={() => setLightboxOpen(true)}
          className="absolute inset-0 block size-full"
        >
          {/* Shown until the image reports loaded — the more meaningful state on a slow
              connection, where the request can sit pending for seconds rather than failing outright. */}
          {!media.loaded && <Skeleton className="absolute inset-0 rounded-none" />}
          <Image
            key={media.retryKey}
            src={current.url}
            alt=""
            fill
            className={cn("object-cover transition-opacity duration-300", media.loaded ? "opacity-100" : "opacity-0")}
            sizes="770px"
            {...media.imageProps}
          />
        </button>
      )}

      {lightboxOpen &&
        createPortal(
          <MediaLightbox items={items} index={index} onIndexChange={goTo} onClose={() => setLightboxOpen(false)} />,
          document.body,
        )}

      {hasMultiple && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between px-4">
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => goTo(index - 1)}
              className="pointer-events-auto flex size-[21px] items-center justify-center rounded-full bg-white shadow-[0px_0px_10px_rgba(69,71,69,0.25)]"
            >
              <span className="relative block h-3 w-[5.5px] rotate-180">
                <Image src="/icons/carousel-arrow.svg" alt="" fill sizes="6px" />
              </span>
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => goTo(index + 1)}
              className="pointer-events-auto flex size-[21px] items-center justify-center rounded-full bg-white shadow-[0px_0px_10px_rgba(69,71,69,0.25)]"
            >
              <span className="relative block h-3 w-[5.5px]">
                <Image src="/icons/carousel-arrow.svg" alt="" fill sizes="6px" />
              </span>
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-[11px] flex items-center justify-center gap-2.5">
            {items.map((item, dot) => (
              <button
                key={item.url + dot}
                type="button"
                aria-label={`Go to image ${dot + 1}`}
                onClick={() => goTo(dot)}
                className={cn("size-[9.5px] rounded-full", dot === index ? "bg-brand-600" : "bg-white")}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MediaLightbox({
  items,
  index,
  onIndexChange,
  onClose,
}: {
  items: MediaItem[];
  index: number;
  onIndexChange: (next: number) => void;
  onClose: () => void;
}) {
  const current = items[index];
  const media = useMediaLoadState(current.url);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onIndexChange(index - 1);
      if (event.key === "ArrowRight") onIndexChange(index + 1);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [index, onIndexChange, onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div className="relative h-full w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
        {current.isVideo ? (
          <video src={current.url} controls autoPlay className="size-full object-contain" />
        ) : media.failed ? (
          <MediaLoadError onRetry={media.retry} className="absolute inset-0 rounded-xl" />
        ) : (
          <>
            {!media.loaded && <Skeleton className="absolute inset-0 rounded-xl" />}
            <Image
              key={media.retryKey}
              src={current.url}
              alt=""
              fill
              className={cn("object-contain transition-opacity duration-300", media.loaded ? "opacity-100" : "opacity-0")}
              sizes="100vw"
              {...media.imageProps}
            />
          </>
        )}
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(event) => {
              event.stopPropagation();
              onIndexChange(index - 1);
            }}
            className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <span className="relative block h-3 w-[5.5px] rotate-180">
              <Image src="/icons/carousel-arrow.svg" alt="" fill sizes="6px" className="invert" />
            </span>
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(event) => {
              event.stopPropagation();
              onIndexChange(index + 1);
            }}
            className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <span className="relative block h-3 w-[5.5px]">
              <Image src="/icons/carousel-arrow.svg" alt="" fill sizes="6px" className="invert" />
            </span>
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[13px] font-medium text-white">
            {index + 1} / {items.length}
          </div>
        </>
      )}
    </div>
  );
}

function PollBody({ post }: { post: PostCardData }) {
  const { poll, vote, pending } = usePostPoll(post);
  const [questionExpanded, setQuestionExpanded] = useState(false);
  const { ref: questionRef, clamped: questionClamped } = useIsClamped<HTMLParagraphElement>(questionExpanded, post.question);

  const options = poll?.options ?? [];
  const counts = options.map((option) => option.voteCount);
  const total = poll?.totalVotes ?? 0;
  const leadingCount = counts.reduce((best, count) => Math.max(best, count), 0);
  const votedId = poll?.myVoteOptionId ?? null;

  return (
    <div className="flex w-full flex-col gap-[15px]">
      {post.participantAvatars && (
        <div className="flex items-center -space-x-1">
          {post.participantAvatars.map((avatar, index) => (
            <span
              key={avatar + index}
              className="relative block size-[38px] shrink-0 overflow-hidden rounded-xl ring-2 ring-white"
            >
              <Image src={avatar} alt="" fill className="object-cover" sizes="38px" />
            </span>
          ))}
        </div>
      )}

      {post.question && (
        <div className="flex w-full items-end gap-0.5 text-[12px] leading-5 sm:text-[13px]">
          <p ref={questionRef} className={cn("min-w-0 flex-1 whitespace-pre-line text-[#1e293b]", !questionExpanded && "line-clamp-4")}>
            {post.question}{" "}
            {post.hashtags && <span className="font-semibold text-[#f088b6]">{post.hashtags}</span>}
          </p>
          {questionClamped && (
            <button
              type="button"
              onClick={() => setQuestionExpanded((v) => !v)}
              className="shrink-0 font-bold text-gray-400"
            >
              {questionExpanded ? "less" : "more"}
            </button>
          )}
        </div>
      )}

      {poll && (
        <div className="flex w-full flex-col gap-[15px] rounded-[15px] border border-gray-200 p-[15px]">
          <div className="flex w-full flex-col gap-2">
            {options.map((option, index) => {
              const percent = total > 0 ? Math.round((counts[index] / total) * 100) : 0;
              const leading = leadingCount > 0 && counts[index] === leadingCount;
              const voted = option.id === votedId;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => vote(option.id)}
                  disabled={pending || poll.isClosed}
                  aria-pressed={voted}
                  aria-label={`Vote for ${option.label}`}
                  className="flex w-full items-center justify-between text-[12px] sm:text-[13px]"
                >
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2 py-2 transition-all",
                      leading ? "bg-brand-900 text-white" : "bg-gray-100 text-night-900",
                      voted && "ring-2 ring-brand-600 ring-offset-1",
                    )}
                    style={{ width: `${Math.max(percent, 18)}%` }}
                  >
                    <span className="font-semibold">{percent}%</span>
                    <span className={cn(leading ? "text-white" : "text-gray-600")}>{option.label}</span>
                    {voted && (
                      <span className="relative block size-[19px] shrink-0">
                        <Image src="/icons/check-circle.svg" alt="" fill sizes="19px" />
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-gray-400">{counts[index].toLocaleString()}</span>
                </button>
              );
            })}
          </div>
          <p className="text-left text-[11px] font-medium text-gray-600">
            {poll.isClosed ? "Closed" : "Open"} — {total.toLocaleString()} {total === 1 ? "vote" : "votes"} total
            {votedId !== null && " · you voted"}
          </p>
        </div>
      )}
    </div>
  );
}

function PriceRow({ post }: { post: PostCardData }) {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex flex-col gap-1 whitespace-nowrap text-gray-700">
        <p className="text-[16px] font-semibold sm:text-[19px]">
          {post.priceLine}
          {post.priceSuffix && <span className="text-[9px] font-normal sm:text-[10.5px]">{post.priceSuffix}</span>}
        </p>
        <p className="text-[11px] font-light sm:text-[13px]">
          {post.variant === "property" ? (
            <Link href={`/properties/${post.id}`} className="hover:text-brand-900 hover:underline">
              {post.subLine}
            </Link>
          ) : (
            post.subLine
          )}
        </p>
      </div>

      {post.beds !== undefined && post.baths !== undefined ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="relative block h-[15px] w-[17px]">
              <Image src="/icons/bed-single-01.svg" alt="" fill sizes="17px" />
            </span>
            <span className="text-[9.5px] font-light text-gray-700">
              {post.beds}
              <span className="hidden sm:inline"> bedroom</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="relative block h-[15px] w-[17px]">
              <Image src="/icons/bathtub-02.svg" alt="" fill sizes="17px" />
            </span>
            <span className="text-[9.5px] font-light text-gray-700">
              {post.baths}
              <span className="hidden sm:inline"> bathroom</span>
            </span>
          </div>
        </div>
      ) : post.rating ? (
        <div className="flex items-center gap-1">
          <span className="relative block size-[13px]">
            <Image src="/icons/star-filled.svg" alt="" fill sizes="13px" />
          </span>
          <span className="text-[8px] font-light text-gray-700">{post.rating}</span>
        </div>
      ) : null}
    </div>
  );
}

function ActionsRow({ post }: { post: PostCardData }) {
  const router = useRouter();
  const [viewingOpen, setViewingOpen] = useState(false);
  const [primary, secondary] = post.actions ?? [];
  // Property posts open their own detail page; other variants' secondary actions aren't built yet.
  const opensViewing = post.variant === "property" && primary?.label === "Request viewing";
  const secondaryHref = post.variant === "property" ? `/properties/${post.linkId ?? post.id}` : comingSoonHref(secondary?.label ?? "");
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        {primary && (
          <Button
            variant="primary"
            onClick={() => (opensViewing ? setViewingOpen(true) : router.push(comingSoonHref(primary.label)))}
            className="h-auto w-auto rounded-xl px-3 py-1.5 text-[10px] sm:h-[38px] sm:rounded-lg sm:px-[15px] sm:py-0 sm:text-[13px]"
          >
            {primary.label}
          </Button>
        )}
        {secondary && (
          <Button
            variant={secondary.variant}
            onClick={() => router.push(secondaryHref)}
            className="h-auto w-auto rounded-xl px-3 py-1.5 text-[10px] sm:h-[38px] sm:rounded-lg sm:px-[15px] sm:py-0 sm:text-[13px]"
          >
            {secondary.label}
          </Button>
        )}
      </div>
      {post.messageHostLabel && (
        <Button
          variant="outline-brand"
          onClick={() => router.push(comingSoonHref(post.messageHostLabel!))}
          className="h-auto w-auto rounded-xl px-3 py-1.5 text-[10px] sm:h-[38px] sm:rounded-lg sm:px-[15px] sm:py-0 sm:text-[13px]"
        >
          {post.messageHostLabel}
        </Button>
      )}
      {opensViewing && (
        <RequestViewingModal
          open={viewingOpen}
          onClose={() => setViewingOpen(false)}
          property={{
            id: post.linkId ?? post.id,
            title: post.subLine ?? "Property",
            summary: `${post.priceLine ?? ""}${post.priceSuffix ?? ""}`,
            image: post.images?.[0] ?? post.image ?? "/images/marketplace/property-sale.jpg",
          }}
        />
      )}
    </div>
  );
}

export function PostStatsBar({
  post,
  like,
  saved,
  onToggleSave,
  showComments,
  onToggleComments,
}: {
  post: PostCardData;
  like: { liked: boolean; count: number; toggle: () => void };
  saved: boolean;
  onToggleSave: () => void;
  showComments: boolean;
  onToggleComments: () => void;
}) {
  const { liked, count: likeCount, toggle: toggleLike } = like;
  const [likesSheetOpen, setLikesSheetOpen] = useState(false);
  const preview = useLikers(post.id, { pageSize: 3, enabled: likeCount > 0 });
  const previewNames = preview.likers.map((liker) => liker.username);

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full items-center justify-between sm:justify-start sm:gap-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6">
          <button
            type="button"
            className="flex items-center gap-2"
            aria-pressed={liked}
            aria-label={`${likeCount} Likes`}
            onClick={toggleLike}
          >
            <NavIcon
              key={liked ? "liked" : "unliked"}
              icon={liked ? "/icons/heart-like-filled.svg" : "/icons/heart-like.svg"}
              color="night"
              size={23}
              className={liked ? "bg-like animate-like-pop" : undefined}
            />
            <span
              className={cn(
                "hidden text-[11px] font-bold sm:inline",
                liked ? "text-like" : "text-brand-900",
              )}
            >
              {likeCount} Likes
            </span>
          </button>
          <button
            type="button"
            className="flex items-center gap-2"
            aria-expanded={showComments}
            aria-label={`${post.comments} Comments`}
            onClick={onToggleComments}
          >
            <span className="relative block size-[23px] shrink-0">
              <Image src="/icons/message-03.svg" alt="" fill sizes="23px" />
            </span>
            <span className="hidden text-[11px] font-bold text-brand-900 sm:inline">{post.comments} Comments</span>
          </button>
          <button type="button" className="flex items-center gap-2" aria-label={post.shareLabel ?? "Share"} onClick={() => sharePost(post)}>
            <span className="relative block size-[23px] shrink-0">
              <Image src="/icons/share-05.svg" alt="" fill sizes="23px" />
            </span>
            <span className="hidden text-[11px] font-bold text-brand-900 sm:inline">
              {post.shareLabel ?? "Share"}
            </span>
          </button>
        </div>
        <button
          type="button"
          className="flex items-center gap-2"
          aria-label={saved ? "Saved" : "Save"}
          onClick={onToggleSave}
        >
          <BookmarkIcon saved={saved} />
          <span className="hidden text-[11px] font-bold text-brand-900 sm:inline">{saved ? "Saved" : "Save"}</span>
        </button>
      </div>


      {likeCount > 0 && (
        <button
          type="button"
          onClick={() => setLikesSheetOpen(true)}
          className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start"
        >
          <p className="min-w-0 flex-1 truncate text-left text-[11px] text-gray-600 sm:flex-none">
            {previewNames.length > 0 ? (
              <>
                Liked by <span className="font-bold text-brand-900">{previewNames[0]}</span>
                {likeCount > 1 && (
                  <>
                    {" "}
                    and{" "}
                    <span className="font-bold text-brand-900">
                      {likeCount - 1} {likeCount - 1 === 1 ? "other" : "others"}
                    </span>
                  </>
                )}
              </>
            ) : (
              <span className="font-bold text-brand-900">
                {likeCount} {likeCount === 1 ? "like" : "likes"}
              </span>
            )}
          </p>
          <span className="flex shrink-0 items-center -space-x-2 sm:order-first sm:mr-1">
            {preview.likers.slice(0, 3).map((liker) => (
              <span key={liker.id} className="relative block size-[22px] shrink-0 overflow-hidden rounded-full bg-[#eef2ff] ring-2 ring-white">
                <Image src={liker.profilePicUrl ?? "/icons/avatar-placeholder-user.svg"} alt="" fill sizes="22px" className="object-cover" />
              </span>
            ))}
            {likeCount > 3 && (
              <span className="relative flex size-[22px] shrink-0 items-center justify-center rounded-full bg-night-900 text-[8px] font-bold text-white ring-2 ring-white">
                +{likeCount - 3}
              </span>
            )}
          </span>
        </button>
      )}

      <LikesBottomSheet open={likesSheetOpen} onClose={() => setLikesSheetOpen(false)} postId={post.id} count={likeCount} />
    </div>
  );
}
