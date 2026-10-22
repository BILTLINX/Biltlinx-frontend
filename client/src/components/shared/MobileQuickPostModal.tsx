"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { showErrorToast, showSuccessToast } from "@/components/shared/AppToast";
import { EmojiPicker } from "@/components/shared/EmojiPicker";
import { NavIcon } from "@/components/shared/NavIcon";
import { MobileVisibilityMenu } from "@/components/shared/MobileVisibilityMenu";
import { DURATION_OPTIONS, PollDurationDropdown } from "@/components/shared/PollDurationDropdown";
import { DEFAULT_VISIBILITY, getVisibilityIcon, type PostVisibility } from "@/components/shared/VisibilityMenu";
import { usePostsFeed } from "@/context/PostsContext";
import { useAnimatedSheet } from "@/hooks/useAnimatedSheet";
import { useAccountBadge } from "@/hooks/useDisplayName";
import { cn } from "@/lib/utils";

const MEDIA_ACCEPT = ["image/png", "image/jpeg", "image/gif", "video/mp4", "video/quicktime", "video/webm"];

const TOOLBAR_ACTIONS = [
  { key: "italic", label: "Italic", glyph: "I", className: "italic" },
  { key: "bold", label: "Bold", glyph: "B", className: "font-bold" },
  { key: "h1", label: "Heading", glyph: "H", className: "font-bold" },
  { key: "link", label: "Link", glyph: null, className: "" },
  { key: "quote", label: "Quote", glyph: "”", className: "font-bold" },
  { key: "bullet", label: "Bullet list", glyph: "•", className: "" },
] as const;

const MAX_POLL_OPTIONS = 6;

export type QuickComposerMode = "post" | "article" | "poll";

interface MobileQuickPostModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: QuickComposerMode;
}

export function MobileQuickPostModal({ open, onClose, initialMode = "post" }: MobileQuickPostModalProps) {
  const { addPost } = usePostsFeed();
  const badge = useAccountBadge();
  const [mode, setMode] = useState<QuickComposerMode>(initialMode);
  const [text, setText] = useState("");
  const [bodyEmpty, setBodyEmpty] = useState(true);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [duration, setDuration] = useState(DURATION_OPTIONS[0]);
  const [files, setFiles] = useState<File[]>([]);
  const previews = useMemo(
    () => files.map((file) => ({ url: URL.createObjectURL(file), isVideo: file.type.startsWith("video/") })),
    [files],
  );
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [visibility, setVisibility] = useState<PostVisibility>(DEFAULT_VISIBILITY);
  const visibilityTriggerRef = useRef<HTMLButtonElement | null>(null);

  const { mounted, closing } = useAnimatedSheet(open);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setMode(initialMode);
  }

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

  useEffect(() => {
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [previews]);

  if (!mounted) return null;

  const pollReady = pollQuestion.trim().length > 0 && pollOptions.filter((option) => option.trim()).length >= 2;

  function resetState() {
    setText("");
    if (bodyRef.current) bodyRef.current.innerHTML = "";
    setBodyEmpty(true);
    setPollQuestion("");
    setPollOptions(["", ""]);
    setDuration(DURATION_OPTIONS[0]);
    setFiles([]);
    setVisibility(DEFAULT_VISIBILITY);
    setVisibilityOpen(false);
  }

  function withTrailingOption(list: string[]) {
    const allFilled = list.every((option) => option.trim().length > 0);
    return allFilled && list.length < MAX_POLL_OPTIONS ? [...list, ""] : list;
  }

  function updatePollOption(index: number, value: string) {
    setPollOptions((current) => withTrailingOption(current.map((option, i) => (i === index ? value : option))));
  }

  function removePollOption(index: number) {
    setPollOptions((current) => withTrailingOption(current.filter((_, i) => i !== index)));
  }

  function handleClose() {
    resetState();
    onClose();
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = Array.from(list).filter((file) => MEDIA_ACCEPT.includes(file.type));
    if (next.length === 0 && list.length > 0) {
      showErrorToast("Only PNG, JPEG, GIF, MP4, MOV or WEBM files are supported");
      return;
    }
    setFiles((current) => [...current, ...next]);
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, i) => i !== index));
  }

  function handleBodyInput() {
    setBodyEmpty((bodyRef.current?.textContent?.trim().length ?? 0) === 0);
  }

  function applyFormat(command: string, value?: string) {
    bodyRef.current?.focus();
    document.execCommand(command, false, value);
    handleBodyInput();
  }

  function handleToolbarAction(key: (typeof TOOLBAR_ACTIONS)[number]["key"]) {
    switch (key) {
      case "italic":
        return applyFormat("italic");
      case "bold":
        return applyFormat("bold");
      case "h1":
        return applyFormat("formatBlock", "h1");
      case "quote":
        return applyFormat("formatBlock", "blockquote");
      case "bullet":
        return applyFormat("insertUnorderedList");
      case "link": {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          showErrorToast("Select some text first to turn it into a link");
          return;
        }
        return applyFormat("createLink", "https://");
      }
    }
  }

  function handlePost() {
    if (mode === "poll") {
      const filledOptions = pollOptions.map((option) => option.trim()).filter(Boolean);
      if (!pollQuestion.trim() || filledOptions.length < 2) {
        showErrorToast("Add a question and at least two options before posting");
        return;
      }
      addPost({ kind: "poll", question: pollQuestion, options: pollOptions });
      showSuccessToast("Your poll has been shared");
      resetState();
      onClose();
      return;
    }

    const hasContent = mode === "article" ? !bodyEmpty : text.trim() || files.length > 0;
    if (!hasContent) {
      showErrorToast(mode === "article" ? "Add some content before posting" : "Add a caption or a file before posting");
      return;
    }
    if (mode === "article") {
      addPost({ kind: "article", headline: "", body: bodyRef.current?.textContent ?? "", files });
    } else {
      addPost({ kind: "media", text, files });
    }
    showSuccessToast(mode === "article" ? "Your article has been shared" : "Your post has been shared");
    resetState();
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={mode === "article" ? "Create an article" : mode === "poll" ? "Create a poll" : "Create a post"}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "flex w-full max-h-[85vh] flex-col rounded-t-3xl bg-white/95 p-6 shadow-[0px_24px_60px_-15px_rgba(0,0,0,0.15)] backdrop-blur-[8px]",
          closing ? "animate-sheet-slide-down" : "animate-sheet-slide-up",
          mode === "poll" ? "gap-4" : "gap-3",
          mode === "article" ? "overflow-hidden" : "overflow-y-auto",
        )}
      >
        <div className="h-[3px] w-[152px] shrink-0 self-center rounded-[20px] bg-[#334154]" />

        <div className="flex w-full shrink-0 items-center gap-2.5">
          <button type="button" aria-label="Close" onClick={handleClose} className="flex size-6 shrink-0 items-center justify-center text-night-900">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 4V16M10 16L4 10M10 16L16 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <p className="flex-1 text-center text-lg font-bold tracking-[-0.54px] text-black">Make a post</p>
          <span className="size-6 shrink-0" aria-hidden />
        </div>

        <div className="flex w-full shrink-0 items-center gap-2.5">
          <span className="relative block size-12 shrink-0">
            <span className="relative block size-full overflow-hidden rounded-full bg-[#eef2ff]">
              <Image src={badge.avatar} alt="" fill className="object-cover" sizes="48px" />
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 block size-[17px]">
              <Image src="/icons/avatar-verified-badge-green.svg" alt="" fill sizes="17px" />
            </span>
          </span>
          <div className="flex flex-col">
            <p className="text-[15px] font-bold text-night-900">{badge.name}</p>
            <p className="text-xs capitalize text-gray-500">{badge.role}</p>
          </div>
        </div>

        {mode === "poll" ? (
          <input
            value={pollQuestion}
            onChange={(event) => setPollQuestion(event.target.value)}
            placeholder="What’s your question?...."
            className="w-full text-sm leading-6 text-night-900 placeholder:text-gray-400 focus:outline-none"
          />
        ) : mode === "post" ? (
          <div className="flex w-full flex-col">
            <textarea
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                const el = event.target;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
              }}
              rows={1}
              placeholder="What’s happening twin? Write something down..."
              className="w-full resize-none overflow-y-auto text-sm leading-6 text-night-900 placeholder:text-gray-400 focus:outline-none"
              style={{ maxHeight: 200 }}
            />
            {previews.length === 0 && (
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragActive(false);
                  addFiles(event.dataTransfer.files);
                }}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                className={cn(
                  "flex w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-[27px] border px-4 py-8 text-center",
                  dragActive ? "border-brand-900 bg-brand-900/5" : "border-[#e2e8f0] bg-[#f8fafc]",
                )}
              >
                <p className="text-xs text-[#1e2024]">Drag and drop files here</p>
                <div className="flex w-full flex-col items-center gap-2.5">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      inputRef.current?.click();
                    }}
                    className="flex h-10 items-center justify-center gap-1.5 rounded-[40px] bg-[#e2e5f0] px-3 text-sm font-medium text-[#19161d]"
                  >
                    Choose files
                    <NavIcon icon="/icons/cloud-upload-outline.svg" color="night" size={16} className="bg-[#19161d]" />
                  </button>
                  <p className="text-xs text-[#53575a]">PNG, JPEG, GIF, MP4, MKV, AVI</p>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {mode === "poll" && (
          <div className="flex w-full flex-col gap-4 rounded-[17px] border border-[#e2e8f0] bg-[#f8fafc] p-[3px]">
            <div className="flex w-full flex-col gap-1">
              {pollOptions.map((option, index) => {
                const required = index < 2;
                const filled = option.trim().length > 0;
                const active = required || filled;
                return (
                  <div
                    key={index}
                    className={cn(
                      "flex h-12 w-full items-center gap-2 rounded-2xl border px-3",
                      active ? "border-[#e2e8f0] bg-white" : "border-dashed border-[#e2e8f0] bg-gray-50/60",
                    )}
                  >
                    <NavIcon
                      icon="/icons/poll-option-edit.svg"
                      color="night"
                      size={16}
                      className={cn("shrink-0", active ? "bg-gray-400" : "bg-gray-300")}
                    />
                    <input
                      value={option}
                      onChange={(event) => updatePollOption(index, event.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className={cn(
                        "w-full flex-1 text-sm focus:outline-none",
                        active ? "text-[#111826] placeholder:text-[#111826]/70" : "text-gray-400 placeholder:text-gray-400",
                      )}
                    />
                    {index >= 2 && (
                      <button
                        type="button"
                        aria-label={`Remove option: ${option}`}
                        onClick={() => removePollOption(index)}
                        className="shrink-0"
                      >
                        <NavIcon icon="/icons/poll-option-delete.svg" color="night" size={16} className="bg-red-500" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex w-full flex-col gap-1">
              <p className="text-[13px] text-[#111826]">
                Poll Duration<span className="text-[#ef4444]">*</span>
              </p>
              <PollDurationDropdown value={duration} onChange={setDuration} />
            </div>
          </div>
        )}

        {mode === "article" && (
          <>
            <div className="flex w-full shrink-0 items-center gap-3.5">
              {TOOLBAR_ACTIONS.map((action) =>
                action.key === "link" ? (
                  <button
                    key={action.key}
                    type="button"
                    aria-label={action.label}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleToolbarAction(action.key)}
                  >
                    <NavIcon icon="/icons/article-toolbar-link-bold.svg" color="night" size={12} />
                  </button>
                ) : (
                  <button
                    key={action.key}
                    type="button"
                    aria-label={action.label}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleToolbarAction(action.key)}
                    className={cn("text-sm text-[#001f3f]", action.className)}
                  >
                    {action.glyph}
                  </button>
                ),
              )}
            </div>
            <div className="h-px w-full shrink-0 bg-gray-200" />
            <div
              className="relative w-full max-h-[220px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e0 transparent" }}
            >
              {bodyEmpty && (
                <p className="pointer-events-none absolute left-0 top-0 text-sm text-gray-400">
                  What’s happening twin? Write something down...
                </p>
              )}
              <div
                ref={bodyRef}
                contentEditable
                onInput={handleBodyInput}
                role="textbox"
                aria-multiline="true"
                aria-label="Article body"
                className="min-h-[70px] w-full text-sm text-night-900 focus:outline-none [&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:text-gray-600 [&_h1]:text-lg [&_h1]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-brand-900 [&_a]:underline"
              />
            </div>
          </>
        )}

        {previews.length > 0 && (
          <div className="flex w-full flex-wrap gap-2">
            {previews.map((preview, index) => (
              <div key={preview.url} className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {preview.isVideo ? (
                  <video src={preview.url} className="size-full object-cover" muted />
                ) : (
                  <Image src={preview.url} alt="" fill className="object-cover" sizes="64px" />
                )}
                <button
                  type="button"
                  aria-label="Remove file"
                  onClick={() => removeFile(index)}
                  className="absolute left-1 top-1 flex size-4 items-center justify-center rounded-full bg-white text-[10px] leading-none text-night-900"
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              type="button"
              aria-label="Add more media"
              onClick={() => inputRef.current?.click()}
              className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-[#cbd5e0] text-[#94a3b8]"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 3V17M3 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        <div className="mt-auto flex w-full shrink-0 flex-col gap-3.5">
        <div className="h-px w-full shrink-0 bg-[#f5f5f5]" />
        <div className="flex w-full items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={MEDIA_ACCEPT.join(",")}
            className="hidden"
            onChange={(event) => addFiles(event.target.files)}
          />
          <div className="flex items-center gap-2 border-r border-[#86b3fb] pr-3">
            <button type="button" aria-label="Media" onClick={() => setMode("post")}>
              <NavIcon icon="/icons/media-gallery.svg" color="brand" size={18} className="bg-[#337df2]" />
            </button>
            <button type="button" aria-label="Poll" onClick={() => setMode("poll")}>
              <NavIcon icon="/icons/poll-bar-chart.svg" color="brand" size={18} className="bg-[#337df2]" />
            </button>
            <button type="button" aria-label="Article" onClick={() => setMode("article")}>
              <NavIcon icon="/icons/article-document.svg" color="brand" size={18} className="bg-[#337df2]" />
            </button>
          </div>
          <button
            ref={visibilityTriggerRef}
            type="button"
            aria-label="Post visibility"
            onClick={() => setVisibilityOpen((v) => !v)}
          >
            <NavIcon icon={getVisibilityIcon(visibility)} color="brand" size={20} className="bg-[#337df2]" />
          </button>
          {mode === "post" && (
            <EmojiPicker onSelect={(emoji) => setText((current) => current + emoji)} align="start" />
          )}
          {(mode === "poll" || mode === "article" || (mode === "post" && previews.length > 0)) && (
            <button type="button" aria-label="Attach images" onClick={() => inputRef.current?.click()} className="ml-auto">
              <NavIcon icon="/icons/poll-add-alt.svg" color="brand" size={18} className="bg-[#337df2]" />
            </button>
          )}
          <MobileVisibilityMenu
            open={visibilityOpen}
            onClose={() => setVisibilityOpen(false)}
            value={visibility}
            onChange={(next) => {
              setVisibility(next);
              if (next.kind === "everyone" || next.kind === "followings") setVisibilityOpen(false);
            }}
            anchorRef={visibilityTriggerRef}
          />
        </div>
        <button
          type="button"
          onClick={handlePost}
          className={cn(
            "flex h-8 w-full items-center justify-center rounded-xl text-sm text-white",
            mode === "poll" && !pollReady ? "bg-[#86b3fb]" : "bg-brand-900 hover:bg-brand-900/90",
          )}
        >
          Post
        </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
