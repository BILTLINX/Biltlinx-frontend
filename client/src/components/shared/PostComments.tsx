"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CommentComposer } from "@/components/shared/CommentComposer";
import { NavIcon } from "@/components/shared/NavIcon";
import { useAnimatedSheet } from "@/hooks/useAnimatedSheet";
import { useCommentLike, useComments } from "@/hooks/useComments";
import { renderWithHashtags } from "@/lib/hashtags";
import { cn } from "@/lib/utils";
import type { CommentItem } from "@/types/comment";
import type { PostCardData } from "@/types/post";
import { MODAL_FRAME } from "@/lib/modal-styles";


export const DEFAULT_COMMENTS: CommentItem[] = [
  {
    id: "c1",
    authorName: "Jane Doe",
    postedAt: "17s ago",
    text: "We are very good. Your story is very inspiring!\nDon't stop keep going.",
    likes: 20,
  },
  { id: "c2", authorName: "John Doe", postedAt: "1m ago", text: "Cool Champ.", likes: 20 },
  { id: "c3", authorName: "Jane Doe", postedAt: "20m ago", text: "Cool Champ." },
];

interface CommentsModalProps {
  open: boolean;
  post: PostCardData;
  like: { liked: boolean; count: number; toggle: () => void };
  onShare: () => void;
  onClose: () => void;
}

/** Full comments dialog — shared by every "feed card" (all of PostCard's
 * variants) so they all get the exact same comments experience: a bottom
 * sheet on mobile (matching every other sheet's slide up/down + down-arrow
 * dismiss convention), a centered modal on desktop. */
export function CommentsModal({ open, post, like, onShare, onClose }: CommentsModalProps) {
  const { mounted, closing } = useAnimatedSheet(open);
  const [draft, setDraft] = useState("");
  const thread = useComments(post.id, { enabled: mounted });
  const commentsCount = thread.isPending ? post.comments : thread.totalResults;

  useEffect(() => {
    if (!mounted) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  async function submit() {
    const text = draft.trim();
    if (!text) return;
    if (await thread.add(text)) setDraft("");
  }

  const body = (
    <>
      <CommentComposer draft={draft} onDraftChange={setDraft} onSubmit={() => void submit()} textOnly />

      <div className="flex w-full items-center justify-between px-2.5">
        <button
          type="button"
          aria-pressed={like.liked}
          aria-label={`${like.count} Likes`}
          onClick={like.toggle}
          className="flex items-center gap-2"
        >
          <NavIcon
            key={like.liked ? "liked" : "unliked"}
            icon={like.liked ? "/icons/heart-like-filled.svg" : "/icons/heart-like.svg"}
            color="night"
            size={20}
            className={like.liked ? "bg-like animate-like-pop" : undefined}
          />
          <span className={cn("text-xs font-bold", like.liked ? "text-like" : "text-brand-900")}>{like.count} Likes</span>
        </button>
        <span className="flex items-center gap-4">
          <button type="button" aria-label="Share" onClick={onShare} className="text-xs font-bold text-brand-900 underline">
            Share
          </button>
          <span className="text-xs font-bold text-brand-900">{commentsCount} Comments</span>
        </span>
      </div>

      <div className="flex w-full flex-col items-center">
        {thread.isPending && <p className="py-4 text-xs text-gray-500">Loading comments…</p>}
        {thread.isError && (
          <button type="button" onClick={() => void thread.refetch()} className="py-4 text-xs font-bold text-brand-900">
            Could not load comments. Try again
          </button>
        )}
        {!thread.isPending && !thread.isError && thread.comments.length === 0 && (
          <p className="py-4 text-xs text-gray-500">No comments yet. Be the first to comment.</p>
        )}
        {thread.comments.map((comment) => (
          <ThreadCommentRow
            key={comment.id}
            postId={post.id}
            comment={comment}
            onReply={thread.add}
            onDelete={thread.remove}
          />
        ))}
      </div>

      {thread.hasNextPage && (
        <button
          type="button"
          disabled={thread.isFetchingNextPage}
          onClick={() => void thread.fetchNextPage()}
          className="text-left text-[11px] font-bold text-brand-900"
        >
          {thread.isFetchingNextPage ? "Loading…" : "Load More Comments"}
        </button>
      )}
    </>
  );

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[120] flex items-end bg-black/50 sm:hidden"
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

          <div className="no-scrollbar flex w-full flex-1 flex-col gap-5 overflow-y-auto px-6">{body}</div>
        </div>
      </div>

      <div
        className="fixed inset-0 z-[120] hidden items-center justify-center bg-black/50 p-4 sm:flex"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Comments"
      >
        <div onClick={(event) => event.stopPropagation()} className={cn("relative w-full max-w-[770px]", MODAL_FRAME)}>
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

          <div className="flex max-h-[calc(85vh-1.25rem)] w-full flex-col gap-5 overflow-y-auto overflow-x-hidden rounded-2xl bg-white p-6">
            {body}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

function ThreadCommentRow({
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
  const like = useCommentLike(comment);
  const [replying, setReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const replies = useComments(postId, { parentCommentId: comment.id, enabled: showReplies });

  async function submitReply() {
    const text = replyDraft.trim();
    if (!text) return;
    if (await onReply(text, comment.id)) {
      setReplyDraft("");
      setReplying(false);
      setShowReplies(true);
    }
  }

  return (
    <div className="flex w-full flex-col">
      <CommentBubble comment={comment} like={like} onDelete={comment.isOwn ? () => void onDelete(comment.id) : undefined}>
        <button
          type="button"
          aria-expanded={replying}
          onClick={() => setReplying((v) => !v)}
          className="text-[10px] font-bold leading-[18px] text-brand-900"
        >
          Reply
        </button>
        {(comment.replyCount ?? 0) > 0 && (
          <button
            type="button"
            aria-expanded={showReplies}
            onClick={() => setShowReplies((v) => !v)}
            className="text-[10px] font-bold leading-[18px] text-gray-500"
          >
            {showReplies ? "Hide replies" : `View ${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}`}
          </button>
        )}
      </CommentBubble>

      {(showReplies || replying) && (
        <div className="ml-[65px] flex flex-col">
          {showReplies && replies.isPending && <p className="py-2 text-[11px] text-gray-500">Loading replies…</p>}
          {showReplies &&
            replies.comments.map((reply) => (
              <ReplyRow key={reply.id} reply={reply} onDelete={onDelete} />
            ))}
          {showReplies && replies.hasNextPage && (
            <button type="button" onClick={() => void replies.fetchNextPage()} className="py-1 text-left text-[11px] font-bold text-brand-900">
              More replies
            </button>
          )}
          {replying && (
            <div className="flex w-full items-center gap-2 rounded-3xl bg-gray-100 p-2">
              <input
                type="text"
                autoFocus
                value={replyDraft}
                onChange={(event) => setReplyDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void submitReply();
                }}
                placeholder={`Reply to ${comment.authorName}`}
                className="min-w-0 flex-1 bg-transparent px-2 text-[11px] text-night-900/70 placeholder:text-night-900/40 focus:outline-none"
              />
              <button type="button" aria-label="Send reply" onClick={() => void submitReply()} className="relative block size-[23px] shrink-0">
                <Image src="/icons/send-alt-filled.svg" alt="" fill sizes="23px" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReplyRow({ reply, onDelete }: { reply: CommentItem; onDelete: (id: string) => Promise<boolean> }) {
  const like = useCommentLike(reply);
  return <CommentBubble comment={reply} like={like} isReply onDelete={reply.isOwn ? () => void onDelete(reply.id) : undefined} />;
}

function CommentBubble({
  comment,
  like,
  isReply = false,
  onDelete,
  children,
}: {
  comment: CommentItem;
  like: { liked: boolean; count: number; toggle: () => void };
  isReply?: boolean;
  onDelete?: () => void;
  children?: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const avatarSize = isReply ? 36 : 50;

  return (
    <div className="flex w-full items-start gap-[15px] py-2.5">
      <span
        className="relative block shrink-0 overflow-hidden rounded-full bg-[#eef2ff]"
        style={{ width: avatarSize, height: avatarSize }}
      >
        {comment.avatar ? (
          <Image src={comment.avatar} alt={comment.authorName} fill className="object-cover" sizes={`${avatarSize}px`} />
        ) : (
          <span className="absolute left-1/2 top-1/2 block size-6 -translate-x-1/2 -translate-y-1/2">
            <Image src="/icons/avatar-placeholder-user.svg" alt="" fill sizes="24px" />
          </span>
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col items-start">
        <div className="flex w-full items-start justify-between gap-2">
          <p className="text-[14px] font-bold text-brand-900">{comment.authorName}</p>
          <p className="mt-0.5 shrink-0 font-rubik text-[10px] font-medium leading-5 text-[#646464]">{comment.postedAt}</p>
        </div>
        <div className="flex w-full items-end gap-1 font-rubik text-[14px] leading-[1.5] text-[#646464]">
          <p className={cn("min-w-0 flex-1 whitespace-pre-line", !expanded && "line-clamp-4")}>{renderWithHashtags(comment.text)}</p>
          {comment.text.length > 160 && (
            <button type="button" onClick={() => setExpanded((v) => !v)} className="shrink-0 text-[11px] font-bold text-gray-400">
              {expanded ? "less" : "more"}
            </button>
          )}
        </div>
        <div className="flex items-center gap-[15px]">
          <button
            type="button"
            onClick={like.toggle}
            aria-pressed={like.liked}
            aria-label={like.liked ? "Unlike comment" : "Like comment"}
            className="flex items-center gap-1"
          >
            <NavIcon
              key={like.liked ? "liked" : "unliked"}
              icon={like.liked || like.count > 0 ? "/icons/heart-like-filled.svg" : "/icons/heart-like.svg"}
              color="brand"
              size={14}
              className={cn(like.liked || like.count > 0 ? "bg-like-soft" : "bg-gray-400", like.liked && "animate-like-pop")}
            />
            {like.count > 0 ? (
              <span className="font-rubik text-[10px] font-bold uppercase text-brand-900">{like.count}</span>
            ) : (
              <span className="text-[10px] font-bold text-gray-400">Like</span>
            )}
          </button>
          {children}
          {onDelete && (
            <button type="button" onClick={onDelete} className="text-[10px] font-bold leading-[18px] text-like">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Exported so other comment UIs that want the same full-size row (avatar,
 * name, timestamp, text, attachments, like/reply) can reuse it — e.g.
 * Discover's mobile comment sheet — instead of rebuilding it. */
export function CommentRow({ comment, isReply = false }: { comment: CommentItem; isReply?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [replies, setReplies] = useState<CommentItem[]>([]);

  const submitReply = () => {
    const text = replyDraft.trim();
    if (!text) return;
    setReplies((prev) => [
      ...prev,
      { id: `${comment.id}-r${prev.length + 1}`, authorName: "You", postedAt: "Just now", text },
    ]);
    setReplyDraft("");
    setReplying(false);
  };

  const avatarSize = isReply ? 36 : 50;

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full items-start gap-[15px] py-2.5">
        <span
          className="relative block shrink-0 overflow-hidden rounded-full bg-[#eef2ff]"
          style={{ width: avatarSize, height: avatarSize }}
        >
          {comment.avatar ? (
            <Image src={comment.avatar} alt={comment.authorName} fill className="object-cover" sizes={`${avatarSize}px`} />
          ) : (
            <span className="absolute left-1/2 top-1/2 block size-6 -translate-x-1/2 -translate-y-1/2">
              <Image src="/icons/avatar-placeholder-user.svg" alt="" fill sizes="24px" />
            </span>
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col items-start">
          <div className="flex w-full items-start justify-between gap-2">
            <p className="text-[14px] font-bold text-brand-900">{comment.authorName}</p>
            <p className="mt-0.5 shrink-0 font-rubik text-[10px] font-medium leading-5 text-[#646464]">
              {comment.postedAt}
            </p>
          </div>
          <div className="flex w-full items-end gap-1 font-rubik text-[14px] leading-[1.5] text-[#646464]">
            <p className={cn("min-w-0 flex-1 whitespace-pre-line", !expanded && "line-clamp-4")}>
              {renderWithHashtags(comment.text)}
            </p>
            <button type="button" onClick={() => setExpanded((v) => !v)} className="shrink-0 text-[11px] font-bold text-gray-400">
              {expanded ? "less" : "more"}
            </button>
          </div>
          {comment.image && (
            <span className="relative my-1 block h-40 w-full max-w-[240px] overflow-hidden rounded-xl bg-gray-100">
              <Image src={comment.image} alt="Photo attached to comment" fill unoptimized className="object-cover" sizes="240px" />
            </span>
          )}
          {comment.audio && <audio controls src={comment.audio} className="my-1 h-8 w-full max-w-[240px]" />}
          <div className="flex items-center gap-[15px]">
            <CommentLikeButton initialLikes={comment.likes ?? 0} />
            {!isReply && (
              <button
                type="button"
                aria-expanded={replying}
                onClick={() => setReplying((v) => !v)}
                className="text-[10px] font-bold leading-[18px] text-brand-900"
              >
                Reply
              </button>
            )}
          </div>
        </div>
      </div>

      {(replies.length > 0 || replying) && (
        <div className="ml-[65px] flex flex-col">
          {replies.map((reply) => (
            <CommentRow key={reply.id} comment={reply} isReply />
          ))}
          {replying && (
            <div className="flex w-full items-center gap-2 rounded-3xl bg-gray-100 p-2">
              <input
                type="text"
                autoFocus
                value={replyDraft}
                onChange={(event) => setReplyDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submitReply();
                }}
                placeholder={`Reply to ${comment.authorName}`}
                className="min-w-0 flex-1 bg-transparent px-2 text-[11px] text-night-900/70 placeholder:text-night-900/40 focus:outline-none"
              />
              <button
                type="button"
                aria-label="Send reply"
                onClick={submitReply}
                className="relative block size-[23px] shrink-0"
              >
                <Image src="/icons/send-alt-filled.svg" alt="" fill sizes="23px" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Exported so other compact comment UIs (e.g. Discover's comment panel)
 * can reuse the exact same like-toggle visuals instead of rebuilding them. */
export function CommentLikeButton({ initialLikes }: { initialLikes: number }) {
  const [liked, setLiked] = useState(false);
  const likeCount = initialLikes + (liked ? 1 : 0);
  const filled = liked || likeCount > 0;

  return (
    <button
      type="button"
      onClick={() => setLiked((v) => !v)}
      aria-pressed={liked}
      aria-label={liked ? "Unlike comment" : "Like comment"}
      className="flex items-center gap-1"
    >
      <NavIcon
        key={liked ? "liked" : "unliked"}
        icon={filled ? "/icons/heart-like-filled.svg" : "/icons/heart-like.svg"}
        color="brand"
        size={14}
        className={cn(filled ? "bg-like-soft" : "bg-gray-400", liked && "animate-like-pop")}
      />
      {likeCount > 0 ? (
        <span className="font-rubik text-[10px] font-bold uppercase text-brand-900">{likeCount}</span>
      ) : (
        <span className="text-[10px] font-bold text-gray-400">Like</span>
      )}
    </button>
  );
}
