"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { createPortal } from "react-dom";
import { showErrorToast, showSuccessToast } from "@/components/shared/AppToast";
import { NavIcon } from "@/components/shared/NavIcon";
import { useAnimatedSheet } from "@/hooks/useAnimatedSheet";
import { cn } from "@/lib/utils";
import type { PostedStory } from "@/types/story";
import { MODAL_FRAME } from "@/lib/modal-styles";


const STORY_MEDIA_ACCEPT = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "video/mp4",
  "video/x-matroska",
  "video/x-msvideo",
  "video/quicktime",
  "video/webm",
];

export const VIDEO_ONLY_ACCEPT = ["video/mp4", "video/x-matroska", "video/x-msvideo", "video/quicktime", "video/webm"];

interface PostStoryModalProps {
  open: boolean;
  onClose: () => void;
  onPost: (story: PostedStory) => void;
  /** Lets callers reuse this composer for a differently-labeled single-media
   * post (e.g. Discover's "Post a Reel") instead of duplicating the whole
   * modal just to change copy/accepted file types. Defaults keep the
   * original "add to your story" behavior for existing callers. */
  title?: string;
  ctaLabel?: string;
  accept?: string[];
  dropHint?: string;
  missingMediaError?: string;
  postedMessage?: string;
}

/** Single-image/video "add to your story" composer — a lighter-weight
 * sibling of CreatePostModal, since a story is just one piece of media plus
 * an optional caption rather than a full post. */
export function PostStoryModal({
  open,
  onClose,
  onPost,
  title = "Add to your Story",
  ctaLabel = "Share to Story",
  accept = STORY_MEDIA_ACCEPT,
  dropHint = "PNG, JPEG, GIF, MP4, MKV, AVI",
  missingMediaError = "Add a photo or video for your story",
  postedMessage = "Your story has been posted",
}: PostStoryModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // Set right before handing a preview URL off to onPost, so the cleanup
  // below doesn't revoke a URL the parent is now displaying elsewhere.
  const handedOffUrlRef = useRef<string | null>(null);

  const preview = useMemo(
    () => (file ? { url: URL.createObjectURL(file), isVideo: file.type.startsWith("video/") } : null),
    [file],
  );

  useEffect(() => {
    if (!preview) return;
    const { url } = preview;
    return () => {
      if (url !== handedOffUrlRef.current) URL.revokeObjectURL(url);
    };
  }, [preview]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const { mounted, closing } = useAnimatedSheet(open);
  if (!mounted) return null;

  function pickFile(list: FileList | null) {
    const picked = list?.[0];
    if (!picked) return;
    if (!accept.includes(picked.type)) {
      showErrorToast(`Only ${dropHint} files are supported`);
      return;
    }
    setFile(picked);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    pickFile(event.dataTransfer.files);
  }

  function resetState() {
    setFile(null);
    setCaption("");
  }

  function handleClose() {
    resetState();
    onClose();
  }

  function handlePost() {
    if (!preview) {
      showErrorToast(missingMediaError);
      return;
    }
    handedOffUrlRef.current = preview.url;
    onPost({ url: preview.url, isVideo: preview.isVideo, caption: caption.trim() || undefined, file: file ?? undefined });
    showSuccessToast(postedMessage);
    resetState();
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div onClick={(event) => event.stopPropagation()} className={cn("relative w-full sm:max-w-[420px]", MODAL_FRAME)}>
        <button
          type="button"
          aria-label="Close"
          onClick={handleClose}
          className="absolute -right-3 -top-3 z-10 hidden size-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-md hover:bg-gray-50 sm:flex"
        >
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div
          className={cn(
            "flex max-h-[90vh] sm:max-h-[calc(90vh-1.25rem)] w-full flex-col gap-4 overflow-y-auto rounded-t-3xl bg-white/95 p-6 shadow-[0px_24px_60px_-15px_rgba(0,0,0,0.15)] backdrop-blur-[8px] sm:rounded-2xl sm:bg-white",
            closing ? "max-sm:animate-sheet-slide-down" : "max-sm:animate-sheet-slide-up",
          )}
        >
          <div className="h-[3px] w-[152px] shrink-0 self-center rounded-[20px] bg-[#334154] sm:hidden" />

          <div className="flex w-full shrink-0 items-center gap-2.5 sm:hidden">
            <button
              type="button"
              aria-label="Close"
              onClick={handleClose}
              className="flex size-6 shrink-0 items-center justify-center text-night-900"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 4V16M10 16L4 10M10 16L16 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p className="flex-1 text-center text-lg font-bold tracking-[-0.54px] text-black">{title}</p>
            <span className="size-6 shrink-0" aria-hidden />
          </div>

          <p className="hidden text-lg font-semibold leading-6 tracking-[-0.36px] text-[#111826] sm:block">
            {title}
          </p>

          <input
            ref={inputRef}
            type="file"
            accept={accept.join(",")}
            className="hidden"
            onChange={(event) => pickFile(event.target.files)}
          />

          <input
            type="text"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Add a caption (optional)...."
            className="w-full border-none bg-transparent p-0 text-sm text-night-900 placeholder:text-gray-400 focus:outline-none"
          />

          {preview ? (
            <div className="relative aspect-[9/16] w-full max-h-[420px] shrink-0 overflow-hidden rounded-xl bg-gray-100">
              {preview.isVideo ? (
                <video src={preview.url} className="size-full object-cover" muted autoPlay loop playsInline />
              ) : (
                <Image src={preview.url} alt="" fill className="object-cover" sizes="420px" />
              )}
              <button
                type="button"
                aria-label="Choose a different file"
                onClick={() => inputRef.current?.click()}
                className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <NavIcon icon="/icons/create-menu-upload-arrow.svg" color="white" size={16} />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              className={cn(
                "flex min-h-[220px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-6 text-center",
                dragActive ? "border-brand-900 bg-brand-900/5" : "border-[#cbd5e0] bg-[#cbd5e0]/30",
              )}
            >
              <p className="text-xs text-[#19161d]">Drag and drop files here</p>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  inputRef.current?.click();
                }}
                className="flex h-11 items-center justify-center gap-2 rounded-[40px] bg-[#e2e5f0] px-4 text-sm font-medium text-[#19161d]"
              >
                Choose files
                <NavIcon icon="/icons/create-menu-upload-arrow.svg" color="night" className="bg-[#19161d]" size={16} />
              </button>
              <p className="text-[11px] text-[#86888a]">{dropHint}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handlePost}
            className="flex h-12 w-full shrink-0 items-center justify-center rounded-full bg-brand-900 text-sm font-medium text-white hover:bg-brand-900/90"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
