"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FollowButton } from "@/components/shared/FollowButton";
import { NavIcon } from "@/components/shared/NavIcon";
import { Tooltip } from "@/components/shared/Tooltip";
import { useSession } from "@/context/SessionContext";
import { useFollowAccount } from "@/hooks/useFollowAccount";
import { useLikers } from "@/hooks/useLikers";
import type { Author } from "@/types/api/social";
import { cn } from "@/lib/utils";
import { useAnimatedSheet } from "@/hooks/useAnimatedSheet";
import { MODAL_FRAME } from "@/lib/modal-styles";


interface LikesBottomSheetProps {
  open: boolean;
  onClose: () => void;
  postId: string;
  count: number;
}

/** Opened from a post's "Liked by X and N others" row: a bottom sheet on
 * mobile, and a centered All/Followers modal with Follow/Following actions
 * on desktop (Figma node 539:81165). Both variants share the same
 * All/Followers list, with its tabs pinned to the top of the scroll area. */
export function LikesBottomSheet({ open, onClose, postId, count }: LikesBottomSheetProps) {
  const { mounted, closing } = useAnimatedSheet(open);

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[130] flex items-end bg-black/50 sm:hidden"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Likes"
      >
        <div
          onClick={(event) => event.stopPropagation()}
          className={cn(
            "flex max-h-[75vh] w-full flex-col gap-2 rounded-t-[32px] bg-white pb-4 pt-4 shadow-[0px_-4px_8px_0px_rgba(69,71,69,0.15)]",
            closing ? "animate-sheet-slide-down" : "animate-sheet-slide-up",
          )}
        >
          <div className="h-[3px] w-[152px] shrink-0 self-center rounded-[20px] bg-[#334154]" />

          <div className="flex w-full shrink-0 items-center gap-2.5 px-6">
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="flex size-6 shrink-0 items-center justify-center text-night-900"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 4V16M10 16L4 10M10 16L16 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p className="flex-1 text-center text-lg font-bold tracking-[-0.54px] text-black">
              {count} {count === 1 ? "Like" : "Likes"}
            </p>
            <span className="size-6 shrink-0" aria-hidden />
          </div>

          <LikesTabbedList postId={postId} enabled={mounted} className="px-6" variant="sheet" />
        </div>
      </div>

      <div
        className="fixed inset-0 z-[130] hidden items-center justify-center bg-black/50 p-4 sm:flex"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Likes"
      >
        <div onClick={(event) => event.stopPropagation()} className={cn("relative w-full max-w-[680px]", MODAL_FRAME)}>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute -right-3 -top-3 z-10 flex size-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-md hover:bg-gray-50"
          >
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <div className="flex max-h-[calc(85vh-1.25rem)] w-full flex-col rounded-2xl bg-white p-6">
            <LikesTabbedList postId={postId} enabled={mounted} variant="modal" />
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

function LikesTabbedList({
  postId,
  enabled,
  className,
  variant,
}: {
  postId: string;
  enabled: boolean;
  className?: string;
  variant: "sheet" | "modal";
}) {
  const [tab, setTab] = useState<"all" | "following">("all");
  const { user } = useSession();
  const { likers, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useLikers(postId, { enabled });
  const rows = tab === "all" ? likers : likers.filter((liker) => liker.isFollowedByMe);

  return (
    <div className={cn("no-scrollbar flex w-full flex-1 flex-col overflow-y-auto overflow-x-hidden", className)}>
      <div
        className={cn(
          "sticky top-0 z-10 flex w-full shrink-0 gap-4 border-b border-[#ebebeb]",
          variant === "modal" ? "bg-white/95 backdrop-blur-[8px]" : "bg-white",
        )}
      >
        {(["all", "following"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "flex flex-col items-center gap-1.5 px-1 pb-0 text-sm capitalize",
              tab === key ? "text-brand-900" : "text-[#64748a]",
            )}
          >
            {key}
            <span className={cn("h-0.5 w-full rounded-full", tab === key ? "bg-brand-900" : "bg-transparent")} />
          </button>
        ))}
      </div>

      <div className="flex w-full flex-col gap-2 pt-2">
        {isPending && <p className="py-4 text-center text-xs text-gray-500">Loading…</p>}
        {isError && (
          <button type="button" onClick={() => void refetch()} className="py-4 text-center text-xs font-bold text-brand-900">
            Could not load likes. Try again
          </button>
        )}
        {!isPending && !isError && rows.length === 0 && (
          <p className="py-4 text-center text-xs text-gray-500">
            {tab === "following" ? "Nobody you follow has liked this yet." : "No likes yet."}
          </p>
        )}
        {rows.map((liker) => (
          <LikerRow key={liker.id} liker={liker} variant={variant} isSelf={liker.id === user?.id} />
        ))}
        {hasNextPage && (
          <button
            type="button"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
            className="py-2 text-center text-xs font-bold text-brand-900"
          >
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </button>
        )}
      </div>
    </div>
  );
}

function LikerRow({ liker, variant, isSelf }: { liker: Author; variant: "sheet" | "modal"; isSelf: boolean }) {
  const { following, toggle } = useFollowAccount(liker.id, liker.isFollowedByMe);

  return (
    <div className="flex h-14 w-full items-center justify-between gap-2 rounded-xl border border-[#e2e8f0] px-3">
      <span className="flex min-w-0 items-center gap-2">
        {variant === "modal" && (
          <span className="relative block size-8 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
            <Image src={liker.profilePicUrl ?? "/icons/avatar-placeholder-user.svg"} alt="" fill sizes="32px" className="object-cover" />
          </span>
        )}
        <span className="truncate text-sm font-medium text-[#111826]">{liker.username}</span>
      </span>

      {isSelf ? null : variant === "sheet" ? (
        <Tooltip label={following ? "Following" : "Follow"}>
          <button
            type="button"
            aria-pressed={following}
            aria-label={following ? `Following ${liker.username}` : `Follow ${liker.username}`}
            onClick={toggle}
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full border",
              following ? "border-brand-900 bg-brand-900" : "border-brand-900 bg-white",
            )}
          >
            <NavIcon
              icon={following ? "/icons/check-circle.svg" : "/icons/user-add-01.svg"}
              color={following ? "white" : "brand"}
              size={16}
            />
          </button>
        </Tooltip>
      ) : (
        <FollowButton following={following} onToggle={toggle} name={liker.username} />
      )}
    </div>
  );
}
