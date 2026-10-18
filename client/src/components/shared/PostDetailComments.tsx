"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { comingSoonHref } from "@/lib/coming-soon";
import { cn } from "@/lib/utils";
import type { DetailComment } from "@/types/comment";

const CURRENT_USER_AVATAR = "/icons/avatar-sample.jpg";

interface PostDetailCommentsProps {
  comments: DetailComment[];
  /** Total on the post, which can exceed what's loaded here. */
  totalCount: number;
  onAdd: (text: string) => void;
}

/** Comment thread on the post detail page (Figma node 1055:28162). */
export function PostDetailComments({ comments, totalCount, onAdd }: PostDetailCommentsProps) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const loadedCount = comments.reduce((sum, comment) => sum + 1 + (comment.replies?.length ?? 0), 0);
  const remaining = totalCount - loadedCount;

  function submit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onAdd(text);
    setDraft("");
  }

  return (
    <section id="post-comments" className="flex w-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Comments · {totalCount}</h2>
        <span className="text-[13px] font-medium text-brand-900">Most relevant ▾</span>
      </div>

      <form onSubmit={submit} className="flex items-center gap-2.5">
        <Avatar src={CURRENT_USER_AVATAR} size={36} />
        <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full bg-[#f1f5f9] px-3.5">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a comment…"
            aria-label="Add a comment"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
          />
          <button type="submit" aria-label="Post comment" disabled={!draft.trim()} className="disabled:opacity-50">
            <NavIcon icon="/icons/post-options-share-to.svg" size={18} className="bg-brand-900" />
          </button>
        </div>
      </form>

      {comments.map((comment) => (
        <div key={comment.id} className="flex flex-col gap-4">
          <CommentRow comment={comment} />
          {comment.replies?.map((reply) => (
            <CommentRow key={reply.id} comment={reply} nested />
          ))}
        </div>
      ))}

      {remaining > 0 && (
        <button
          type="button"
          onClick={() => router.push(comingSoonHref("More comments"))}
          className="self-start text-[13px] font-medium text-brand-900"
        >
          View {remaining} more comments
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

function CommentRow({ comment, nested }: { comment: DetailComment; nested?: boolean }) {
  const [liked, setLiked] = useState(false);
  const likes = (comment.likes ?? 0) + (liked ? 1 : 0);

  return (
    <div className={cn("flex items-start gap-2.5", nested && "pl-6 sm:pl-[46px]")}>
      <Avatar src={comment.avatar} size={nested ? 28 : 36} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-col gap-1 rounded-[14px] bg-[#f8fafc] px-3.5 py-2.5">
          <div className="flex flex-wrap items-center gap-x-1.5">
            <p className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">{comment.authorName}</p>
            {comment.badge && <p className="text-[11px] font-medium leading-4 text-gray-500">· {comment.badge}</p>}
          </div>
          <p className="whitespace-pre-line text-[13px] leading-[19px] text-[#334155]">{comment.text}</p>
        </div>
        <div className="flex gap-3.5 px-3.5 text-xs font-medium leading-[17px] text-gray-500">
          <span>{comment.postedAt}</span>
          <button type="button" onClick={() => setLiked((v) => !v)} aria-pressed={liked} className={cn(liked && "text-brand-900")}>
            Like · {likes}
          </button>
          <button type="button">Reply</button>
        </div>
      </div>
    </div>
  );
}
