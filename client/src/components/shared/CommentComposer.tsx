"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { showErrorToast } from "@/components/shared/AppToast";
import { EmojiPicker } from "@/components/shared/EmojiPicker";
import { useSession } from "@/context/SessionContext";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { cn } from "@/lib/utils";
import type { CommentAttachments } from "@/types/comment";

const IMAGE_ACCEPT = ["image/png", "image/jpeg", "image/gif", "image/webp"];

interface CommentComposerProps {
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: (attachments: CommentAttachments) => void;
  textOnly?: boolean;
}

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

/** The "Add a comment" bar shown in the comments sheet/modal: text, emoji,
 * a photo attachment and a recorded voice note.
 *
 * Object-URL lifecycle: the image preview is derived from the selected
 * `File` via `useMemo`, and a paired cleanup effect revokes it whenever it
 * changes or the composer unmounts — unless it's been handed off to
 * `onSubmit`, in which case `handedOffRef` marks it as now owned by the
 * posted comment (mirrors the pattern in PostStoryModal). This closes the
 * leak the previous version had: it created object URLs ad hoc and only
 * ever revoked them on explicit removal, never on unmount or after a
 * successful submit. */
export function CommentComposer({ draft, onDraftChange, onSubmit, textOnly = false }: CommentComposerProps) {
  const { user } = useSession();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  const handedOffRef = useRef<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const imagePreview = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : undefined), [imageFile]);

  useEffect(() => {
    if (!imagePreview) return;
    return () => {
      if (!handedOffRef.current.has(imagePreview)) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    if (!audioUrl) return;
    return () => {
      if (!handedOffRef.current.has(audioUrl)) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const recorder = useVoiceRecorder({ onRecorded: setAudioUrl });

  const canSend = !recorder.isRecording && (draft.trim().length > 0 || !!imagePreview || !!audioUrl);

  const removeAttachment = (kind: keyof CommentAttachments) => {
    if (kind === "image") setImageFile(null);
    else setAudioUrl(undefined);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!IMAGE_ACCEPT.includes(file.type)) {
      showErrorToast("Only PNG, JPEG, GIF or WEBP images are supported");
      return;
    }
    setImageFile(file);
  };

  const submit = () => {
    if (!canSend) return;
    // Mark these as owned by the comment being posted before clearing local
    // state, so the cleanup effects above skip revoking them.
    if (imagePreview) handedOffRef.current.add(imagePreview);
    if (audioUrl) handedOffRef.current.add(audioUrl);
    onSubmit({ image: imagePreview, audio: audioUrl });
    setImageFile(null);
    setAudioUrl(undefined);
  };

  return (
    <div className="flex w-full flex-col gap-2 rounded-3xl bg-gray-100 p-2">
      {(imagePreview || audioUrl) && (
        <div className="flex flex-wrap items-center gap-2 px-1 pt-1">
          {imagePreview && (
            <div className="relative size-16 shrink-0">
              <Image
                src={imagePreview}
                alt="Attached photo"
                fill
                unoptimized
                className="rounded-xl object-cover"
                sizes="64px"
              />
              <RemoveButton label="Remove photo" onClick={() => removeAttachment("image")} />
            </div>
          )}
          {audioUrl && (
            <div className="relative flex min-w-0 items-center rounded-full bg-white py-1 pl-1 pr-3">
              <audio controls src={audioUrl} className="h-8 w-[200px] max-w-full" />
              <RemoveButton label="Remove voice note" onClick={() => removeAttachment("audio")} />
            </div>
          )}
        </div>
      )}

      <div className="flex w-full items-center gap-3">
        <span className="relative block size-10 shrink-0">
          <Image
            src={user?.profilePicUrl ?? "/icons/avatar-placeholder-user.svg"}
            alt=""
            fill
            className="rounded-full bg-[#eef2ff] object-cover"
            sizes="40px"
          />
          {user?.isVerified && (
            <span className="absolute -bottom-0.5 -right-0.5 block size-4">
              <Image src="/icons/avatar-verified-lg.svg" alt="" fill sizes="16px" />
            </span>
          )}
        </span>

        {recorder.isRecording ? (
          <p className="flex min-w-0 flex-1 items-center gap-2 text-[12px] font-medium text-black" role="status">
            <span className="size-2 shrink-0 animate-pulse rounded-full bg-like" />
            Recording… {formatClock(recorder.seconds)}
          </p>
        ) : (
          <input
            type="text"
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submit();
            }}
            placeholder="Add a comment"
            aria-label="Add a comment"
            className="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-black placeholder:text-black/35 focus:outline-none"
          />
        )}

        <button
          type="button"
          aria-label="Send comment"
          disabled={!canSend}
          onClick={submit}
          className={cn("relative block size-6 shrink-0 transition-opacity", !canSend && "opacity-40")}
        >
          <Image src="/icons/send-alt-filled.svg" alt="" fill sizes="24px" />
        </button>

        <div className="flex shrink-0 items-center gap-3 rounded-full border border-gray-200 bg-white/10 px-3 py-[9px] sm:gap-4 sm:px-[17px]">
          <EmojiPicker onSelect={(emoji) => onDraftChange(draft + emoji)} side="bottom">
            <Image src="/icons/emoji-add.svg" alt="" width={16} height={16} />
          </EmojiPicker>
          {!textOnly && (
          <button
            type="button"
            aria-label="Add photo"
            onClick={() => fileInputRef.current?.click()}
            className="flex size-3.5 items-center justify-center"
          >
            <Image src="/icons/gallery-01.svg" alt="" width={11} height={11} />
          </button>
          )}
          {!textOnly && (
          <button
            type="button"
            aria-label={recorder.isRecording ? "Stop recording" : "Record voice note"}
            aria-pressed={recorder.isRecording}
            onClick={recorder.isRecording ? recorder.stop : recorder.start}
            className="flex size-3.5 items-center justify-center"
          >
            {recorder.isRecording ? (
              <span className="size-2.5 rounded-sm bg-like" />
            ) : (
              <Image src="/icons/mic-02.svg" alt="" width={10} height={13} />
            )}
          </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={IMAGE_ACCEPT.join(",")}
          aria-label="Attach a photo"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {recorder.error && (
        <p className="px-2 pb-1 text-[11px] text-like" role="alert">
          {recorder.error}
        </p>
      )}
    </div>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-night-900 text-white"
    >
      <svg width="8" height="8" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  );
}
