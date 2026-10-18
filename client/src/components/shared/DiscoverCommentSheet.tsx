"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CommentComposer } from "@/components/shared/CommentComposer";
import { ThreadCommentRow } from "@/components/shared/PostComments";
import { useAnimatedSheet } from "@/hooks/useAnimatedSheet";
import { useComments } from "@/hooks/useComments";
import { cn } from "@/lib/utils";

interface DiscoverCommentSheetProps {
  open: boolean;
  reelId: string;
  onClose: () => void;
}

/** Mobile counterpart to `DiscoverCommentPanel`'s desktop side panel — a
 * bottom sheet matching the app's comments-sheet convention (slide up/down,
 * rounded-top, drag handle), backed by the same comment API as every post. */
export function DiscoverCommentSheet({ open, reelId, onClose }: DiscoverCommentSheetProps) {
  const [draft, setDraft] = useState("");
  const { mounted, closing } = useAnimatedSheet(open);
  const thread = useComments(reelId, { enabled: mounted && reelId !== "" });

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted]);

  async function submit() {
    const text = draft.trim();
    if (!text) return;
    if (await thread.add(text)) setDraft("");
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-end bg-black/50 xl:hidden"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Comments"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "flex max-h-[85vh] w-full flex-col gap-4 rounded-t-[32px] bg-white pb-4 pt-4 shadow-[0px_-4px_8px_0px_rgba(69,71,69,0.15)]",
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
          <p className="flex-1 text-center text-lg font-bold tracking-[-0.54px] text-black">Comments</p>
          <span className="size-6 shrink-0" aria-hidden />
        </div>

        <CommentComposer draft={draft} onDraftChange={setDraft} onSubmit={() => void submit()} textOnly />

        <div className="no-scrollbar flex w-full flex-1 flex-col gap-2 overflow-y-auto px-6">
          {thread.isPending && <p className="py-4 text-xs text-gray-500">Loading comments…</p>}
          {!thread.isPending && thread.comments.length === 0 && <p className="py-4 text-xs text-gray-500">No comments yet.</p>}
          {thread.comments.map((comment) => (
            <ThreadCommentRow key={comment.id} postId={reelId} comment={comment} onReply={thread.add} onDelete={thread.remove} />
          ))}
          {thread.hasNextPage && (
            <button type="button" onClick={() => void thread.fetchNextPage()} className="text-left text-[11px] font-bold text-brand-900">
              Load More Comments
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
