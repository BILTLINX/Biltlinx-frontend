"use client";

import { CenteredDialog } from "@/components/shared/CenteredDialog";

interface DeletePostModalProps {
  open: boolean;
  /** Cancel / Escape — the caller returns the user to the post options. */
  onCancel: () => void;
  onConfirm: () => void;
  likes: number;
  comments: number;
}

/** Delete-post confirmation (Figma node 1054:30692). */
export function DeletePostModal({ open, onCancel, onConfirm, likes, comments }: DeletePostModalProps) {
  return (
    <CenteredDialog open={open} onClose={onCancel} labelledBy="delete-post-title" className="max-w-[420px]">
      <div className="flex flex-col gap-2.5 px-7 pb-5 pt-7">
        <h2 id="delete-post-title" className="text-xl font-bold leading-7 text-[#0f172a]">
          Delete this post?
        </h2>
        <p className="text-sm leading-5 text-gray-500">
          It will be removed from the feed and your profile, along with {likes} likes and {comments} comments. This
          can’t be undone.
        </p>
        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-[10px] border border-gray-200 bg-white px-[18px] text-sm font-medium text-[#0f172a] hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-11 rounded-[10px] bg-[#dc2626] px-[18px] text-sm font-medium text-white hover:bg-[#dc2626]/90"
          >
            Delete post
          </button>
        </div>
      </div>
    </CenteredDialog>
  );
}
