"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { useSession } from "@/context/SessionContext";
import { useCommentLike, useComments } from "@/hooks/useComments";
import { cn } from "@/lib/utils";
import type { CommentItem } from "@/types/comment";

/** Comment thread on the post detail page (Figma node 1055:28162). */
export function PostDetailComments({ postId, totalCount }: { postId: string; totalCount: number }) {
  const { user } = useSession();
  const thread = useComments(postId);
  const [draft, setDraft] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    if (await thread.add(text)) setDraft("");
  }

  return (
    <section id="post-comments" className="flex w-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Comments · {thread.isPending ? totalCount : thread.totalResults}</h2>
      </div>

      <form onSubmit={submit} className="flex items-center gap-2.5">
        <Avatar src={user?.profilePicUrl ?? undefined} size={36} />
        <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full bg-[#f1f5f9] px-3.5">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a comment…"
            aria-label="Add a comment"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
          />
          <button type="submit" aria-label="Post comment" disabled={!draft.trim() || thread.adding} className="disabled:opacity-50">
            <NavIcon icon="/icons/post-options-share-to.svg" size={18} className="bg-brand-900" />
          </button>
        </div>
      </form>

      {thread.isPending && <p className="text-[13px] text-gray-500">Loading comments…</p>}
      {thread.isError && (
        <button type="button" onClick={() => void thread.refetch()} className="self-start text-[13px] font-medium text-brand-900">
          Could not load comments. Try again
        </button>
      )}
      {!thread.isPending && !thread.isError && thread.comments.length === 0 && (
        <p className="text-[13px] text-gray-500">No comments yet. Be the first to comment.</p>
      )}

      {thread.comments.map((comment) => (
        <ThreadItem key={comment.id} postId={postId} comment={comment} onReply={thread.add} onDelete={thread.remove} />
      ))}

      {thread.hasNextPage && (
        <button
          type="button"
          disabled={thread.isFetchingNextPage}
          onClick={() => void thread.fetchNextPage()}
          className="self-start text-[13px] font-medium text-brand-900"
        >
          {thread.isFetchingNextPage ? "Loading…" : "View more comments"}
        </button>
      )}
    </section>
  );
}

function Avatar({ src, size }: { src?: string; size: number }) {
  return (
    <span className="relative block shrink-0 overflow-hidden rounded-full bg-[#eef2ff]" style={{ width: size, height: size }}>
      {src && <Image src={src} alt="" fill className="object-cover" sizes={`${size}px`} />}
    </span>
  );
}

function ThreadItem({
  postId,
  comment,
  onReply,
  onDelete,
}: {
  postId: string;
  comment: CommentItem;
  onReply: (body: string, parentCommentId?: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [replying, setReplying] = useState(false);
  const [draft, setDraft] = useState("");
  const replies = useComments(postId, { parentCommentId: comment.id, enabled: showReplies });

  async function submit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    if (await onReply(text, comment.id)) {
      setDraft("");
      setReplying(false);
      setShowReplies(true);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <CommentRow comment={comment} onDelete={onDelete}>
        <button type="button" onClick={() => setReplying((v) => !v)}>
          Reply
        </button>
        {(comment.replyCount ?? 0) > 0 && (
          <button type="button" onClick={() => setShowReplies((v) => !v)}>
            {showReplies ? "Hide replies" : `View ${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}`}
          </button>
        )}
      </CommentRow>
      {showReplies && replies.isPending && <p className="pl-6 text-xs text-gray-500 sm:pl-[46px]">Loading replies…</p>}
      {showReplies && replies.comments.map((reply) => <CommentRow key={reply.id} comment={reply} nested onDelete={onDelete} />)}
      {showReplies && replies.hasNextPage && (
        <button type="button" onClick={() => void replies.fetchNextPage()} className="self-start pl-6 text-xs font-medium text-brand-900 sm:pl-[46px]">
          More replies
        </button>
      )}
      {replying && (
        <form onSubmit={submit} className="flex items-center gap-2 pl-6 sm:pl-[46px]">
          <input
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={`Reply to ${comment.authorName}`}
            aria-label="Write a reply"
            className="h-9 min-w-0 flex-1 rounded-full bg-[#f1f5f9] px-3.5 text-[13px] focus:outline-none"
          />
          <button type="submit" disabled={!draft.trim()} className="text-[13px] font-medium text-brand-900 disabled:opacity-50">
            Send
          </button>
        </form>
      )}
    </div>
  );
}

function CommentRow({
  comment,
  nested,
  onDelete,
  children,
}: {
  comment: CommentItem;
  nested?: boolean;
  onDelete: (id: string) => Promise<boolean>;
  children?: React.ReactNode;
}) {
  const like = useCommentLike(comment);

  return (
    <div className={cn("flex items-start gap-2.5", nested && "pl-6 sm:pl-[46px]")}>
      <Avatar src={comment.avatar} size={nested ? 28 : 36} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-col gap-1 rounded-[14px] bg-[#f8fafc] px-3.5 py-2.5">
          <p className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">{comment.authorName}</p>
          <p className="whitespace-pre-line text-[13px] leading-[19px] text-[#334155]">{comment.text}</p>
        </div>
        <div className="flex gap-3.5 px-3.5 text-xs font-medium leading-[17px] text-gray-500">
          <span>{comment.postedAt}</span>
          <button type="button" onClick={like.toggle} aria-pressed={like.liked} className={cn(like.liked && "text-brand-900")}>
            Like · {like.count}
          </button>
          {children}
          {comment.isOwn && (
            <button type="button" onClick={() => void onDelete(comment.id)} className="text-like">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
