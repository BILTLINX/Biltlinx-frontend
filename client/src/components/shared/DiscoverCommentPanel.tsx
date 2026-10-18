"use client";

import Image from "next/image";
import { useState } from "react";
import { EmojiPicker } from "@/components/shared/EmojiPicker";
import { useSession } from "@/context/SessionContext";
import { useCommentLike, useComments } from "@/hooks/useComments";
import type { CommentItem } from "@/types/comment";

interface DiscoverCommentPanelProps {
  reelId: string;
  onClose: () => void;
}

/** The reel comments panel (Figma node 791:38240 + the quick-action toolbar
 * at 791:38337) — rendered in `AppShell`'s `railAccessory` slot (see
 * discover/page.tsx), so it pops up in that same gap between the reel's
 * comment button and the story rail rather than as a centered modal. */
export function DiscoverCommentPanel({ reelId, onClose }: DiscoverCommentPanelProps) {
  const { user } = useSession();
  const thread = useComments(reelId);
  const [draft, setDraft] = useState("");

  async function submit() {
    const text = draft.trim();
    if (!text) return;
    if (await thread.add(text)) setDraft("");
  }

  const canSend = draft.trim().length > 0 && !thread.adding;

  return (
    // Matches the reel video's own height formula exactly (see the `h-[min(...)]`
    // on the video column in DiscoverReelCard.tsx) so the panel's bottom edge
    // lines up with the reel's, since both start from the same top offset
    // (this panel's wrapper in discover/page.tsx uses the same `pt-[12px]`
    // as the reel wrapper's `xl:py-[12px]`).
    <div className="flex h-[min(780px,calc(100vh-91px))] w-[358px] flex-col items-start gap-[12px]">
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-[30px] border border-brand-900 bg-white">
        <div className="flex h-[48px] shrink-0 items-center justify-between border-b border-gray-200 px-[20px]">
          <h2 className="text-[14px] font-bold tracking-[-0.21px] text-[#181a1f]">Add comment</h2>
          <button
            type="button"
            aria-label="Close comments"
            onClick={onClose}
            className="flex items-center justify-center rounded-full p-1 hover:bg-gray-50"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 2L14 14M14 2L2 14" stroke="#94a3b7" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="no-scrollbar flex flex-1 flex-col gap-[10px] overflow-y-auto px-[20px] py-[14px]">
          {thread.isPending && <p className="text-[12px] text-gray-500">Loading comments…</p>}
          {!thread.isPending && thread.comments.length === 0 && <p className="text-[12px] text-gray-500">No comments yet.</p>}
          {thread.comments.map((comment) => (
            <DiscoverCommentRow key={comment.id} comment={comment} onDelete={thread.remove} />
          ))}
          {thread.hasNextPage && (
            <button type="button" onClick={() => void thread.fetchNextPage()} className="text-left text-[11px] font-bold text-brand-900">
              Load more comments
            </button>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-[10px] border-t border-gray-200 px-[20px] pb-[18px] pt-[14px]">
          <div className="flex w-full items-center gap-[10px]">
            <span className="relative block size-5 shrink-0 overflow-hidden rounded-full bg-gray-100">
              <Image src={user?.profilePicUrl ?? "/icons/avatar-placeholder-user.svg"} alt="" fill sizes="20px" className="object-cover" />
            </span>
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void submit();
              }}
              placeholder="Enter your comment"
              aria-label="Enter your comment"
              className="min-w-0 flex-1 bg-transparent text-[12px] text-night-900 placeholder:text-[#94a3b7] focus:outline-none"
            />
            <button
              type="button"
              aria-label="Send comment"
              disabled={!canSend}
              onClick={() => void submit()}
              className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-brand-900 transition-opacity disabled:opacity-40"
            >
              <span className="relative block size-4">
                <Image src="/icons/send-alt-filled.svg" alt="" fill sizes="16px" />
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex w-fit shrink-0 items-center gap-[12px] rounded-full border border-brand-900 bg-white px-[13px] py-[7px] shadow-sm">
        <EmojiPicker onSelect={(emoji) => setDraft((current) => current + emoji)} side="top">
          <Image src="/icons/emoji-add.svg" alt="Add emoji" width={14} height={14} />
        </EmojiPicker>
      </div>
    </div>
  );
}

function DiscoverCommentRow({ comment, onDelete }: { comment: CommentItem; onDelete: (id: string) => Promise<boolean> }) {
  const like = useCommentLike(comment);

  return (
    <div className="flex w-full flex-col items-start gap-[3px]">
      <div className="flex w-full items-center gap-[6px]">
        <span className="relative block size-5 shrink-0 overflow-hidden rounded-full bg-gray-100">
          {comment.avatar ? (
            <Image src={comment.avatar} alt="" fill sizes="20px" className="object-cover" />
          ) : (
            <span className="absolute left-1/2 top-1/2 block size-3.5 -translate-x-1/2 -translate-y-1/2">
              <Image src="/icons/avatar-placeholder-user.svg" alt="" fill sizes="14px" />
            </span>
          )}
        </span>
        <p className="whitespace-nowrap text-[13px] font-bold text-brand-900">{comment.authorName}</p>
        <p className="whitespace-nowrap text-[11px] text-[#9398a1]">{comment.postedAt}</p>
      </div>
      <div className="flex w-full flex-col items-start gap-1 pl-[26px]">
        {comment.text && <p className="w-full whitespace-pre-line text-[12px] leading-[17px] text-[#42454b]">{comment.text}</p>}
        <div className="flex items-center gap-[12px]">
          <button type="button" onClick={like.toggle} aria-pressed={like.liked} className="text-[10px] font-bold text-brand-900">
            {like.liked ? "Liked" : "Like"}
            {like.count > 0 ? ` · ${like.count}` : ""}
          </button>
          {comment.isOwn && (
            <button type="button" onClick={() => void onDelete(comment.id)} className="text-[10px] font-bold text-like">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
