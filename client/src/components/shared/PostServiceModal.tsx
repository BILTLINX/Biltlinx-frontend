"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { showErrorToast, showSuccessToast } from "@/components/shared/AppToast";
import { NavIcon } from "@/components/shared/NavIcon";
import { Tooltip } from "@/components/shared/Tooltip";
import { useAnimatedSheet } from "@/hooks/useAnimatedSheet";
import { DUMMY_SERVICES, type ServiceListing } from "@/lib/dummy-listings";
import { cn } from "@/lib/utils";
import { usePostsFeed } from "@/context/PostsContext";
import { MODAL_FRAME } from "@/lib/modal-styles";


const MEDIA_ACCEPT = ["image/png", "image/jpeg", "image/gif", "video/mp4", "video/quicktime", "video/webm"];

type ServiceTab = "listing" | "general";

const TABS: { key: ServiceTab; label: string }[] = [
  { key: "listing", label: "One of My Services" },
  { key: "general", label: "General Work Updates" },
];

interface PostServiceModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: ServiceTab;
}

export function PostServiceModal({ open, onClose, initialTab = "listing" }: PostServiceModalProps) {
  const { addPost } = usePostsFeed();
  const [tab, setTab] = useState<ServiceTab>(initialTab);
  const [note, setNote] = useState("");
  const [listingId, setListingId] = useState<string>(DUMMY_SERVICES[0].id);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listing = tab === "listing" ? (DUMMY_SERVICES.find((item) => item.id === listingId) ?? null) : null;

  const previews = useMemo(
    () => files.map((file) => ({ url: URL.createObjectURL(file), isVideo: file.type.startsWith("video/") })),
    [files],
  );

  const { mounted, closing } = useAnimatedSheet(open);

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

  function resetState() {
    setTab(initialTab);
    setNote("");
    setListingId(DUMMY_SERVICES[0].id);
    setFiles([]);
  }

  function handleClose() {
    resetState();
    onClose();
  }

  function handlePost() {
    if (tab === "listing" && !listing) {
      showErrorToast("Choose a service listing to post");
      return;
    }
    addPost({ kind: "service", note, files, listing: listing ?? undefined });
    showSuccessToast(tab === "listing" ? "Your service has been posted" : "Your work update has been posted");
    resetState();
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Promote a service"
    >
      <div onClick={(event) => event.stopPropagation()} className={cn("relative w-full sm:max-w-[720px]", MODAL_FRAME)}>
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
            "flex max-h-[85vh] sm:max-h-[calc(90vh-1.25rem)] w-full flex-col gap-6 overflow-y-auto overflow-x-hidden rounded-t-3xl bg-white/95 p-6 shadow-[0px_24px_60px_-15px_rgba(0,0,0,0.15)] backdrop-blur-[8px] sm:rounded-2xl sm:bg-white",
            closing ? "max-sm:animate-sheet-slide-down" : "max-sm:animate-sheet-slide-up",
          )}
        >
          <div className="h-[3px] w-[152px] shrink-0 self-center rounded-[20px] bg-[#334154] sm:hidden" />

          <div className="flex w-full items-center gap-2.5">
            <button
              type="button"
              aria-label="Close"
              onClick={handleClose}
              className="flex size-6 shrink-0 items-center justify-center text-night-900 sm:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 4V16M10 16L4 10M10 16L16 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p className="flex-1 text-center text-lg font-bold tracking-[-0.54px] text-black sm:text-left sm:font-semibold sm:tracking-[-0.36px] sm:text-[#111826]">
              Promote a Service
            </p>
            <span className="size-6 shrink-0 sm:hidden" aria-hidden />
          </div>

          <div className="flex w-full items-start gap-4 border-b border-[#ebebeb]">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={cn(
                  "flex flex-col items-center gap-0.5 pb-0",
                  tab === item.key ? "text-brand-900" : "text-gray-500",
                )}
              >
                <span className="px-1 py-0.5 text-sm">{item.label}</span>
                <span className={cn("h-[2px] w-full rounded-full", tab === item.key ? "bg-brand-900" : "bg-transparent")} />
              </button>
            ))}
          </div>

          <div className="flex w-full items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[13px] font-extrabold text-[#4f46e5]">
              SL
            </span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
              placeholder="Describe the work - what you did, where and what is included....."
              className="w-full flex-1 resize-none rounded-lg px-3 py-3.5 text-base leading-6 text-night-900 placeholder:text-[#475568] focus:outline-none"
            />
            <Tooltip label="Clear note" side="bottom">
              <button
                type="button"
                aria-label="Clear note"
                onClick={() => setNote("")}
                className="flex size-6 shrink-0 items-center justify-center"
              >
                <NavIcon icon="/icons/poll-close-outline.svg" color="night" size={16} />
              </button>
            </Tooltip>
          </div>

          {tab === "listing" && (
            <div className="flex w-full flex-col gap-2.5 rounded-2xl border border-[#e2e8f0] p-4">
              <p className="text-sm text-[#111826]">Choose a service listings</p>
              <div className="flex w-full items-center gap-4">
                <ServiceDropdown value={listingId} onChange={setListingId} />
                <Tooltip label="Remove listing">
                  <button
                    type="button"
                    aria-label="Remove listing"
                    onClick={() => setListingId("")}
                    className="flex size-8 shrink-0 items-center justify-center"
                  >
                    <NavIcon icon="/icons/poll-trash-delete.svg" color="night" size={16} className="bg-[#ef4444]" />
                  </button>
                </Tooltip>
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            multiple
            accept={MEDIA_ACCEPT.join(",")}
            className="hidden"
            onChange={(event) => addFiles(event.target.files)}
          />

          {previews.length === 0 ? (
            <div className="flex h-[120px] w-full flex-col items-center justify-center gap-1.5 rounded-[27px] border border-dashed border-[#cbd5e0] bg-[#f8fafc] px-6 text-center sm:rounded-lg">
              <p className="text-xs text-[#19161d]">Add before / after photos (recommended)</p>
              <p className="text-xs text-[#86888a]">or</p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex h-6 items-center justify-center gap-1.5 rounded-[40px] border border-[#e2e8f0] bg-[#e8edf5] px-2 text-xs text-[#19161d]"
              >
                Choose files
                <NavIcon icon="/icons/create-menu-upload-arrow.svg" color="night" className="bg-[#19161d]" size={14} />
              </button>
            </div>
          ) : (
            <div className="flex w-full flex-wrap gap-2.5">
              {previews.map((preview, index) => (
                <div key={preview.url} className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-[61px] sm:w-[97px] sm:rounded-md">
                  {preview.isVideo ? (
                    <video src={preview.url} className="size-full object-cover" muted />
                  ) : (
                    <Image src={preview.url} alt="" fill className="object-cover" sizes="97px" />
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
                className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-[#cbd5e0] text-[#94a3b8] hover:border-brand-900 hover:text-brand-900 sm:h-[61px] sm:w-[97px] sm:rounded-md"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M10 3V17M3 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}

          <div className="flex w-full items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex h-8 items-center justify-center rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 text-sm text-red-500 sm:rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePost}
              disabled={tab === "listing" && !listing}
              className="flex h-8 flex-1 items-center justify-center rounded-xl bg-brand-900 px-3 text-sm text-white hover:bg-brand-900/90 disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-lg"
            >
              Post All
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ServiceDropdown({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLButtonElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const selected = DUMMY_SERVICES.find((item) => item.id === value);

  function toggleOpen() {
    setOpen((v) => {
      const next = !v;
      if (next) {
        const rect = rootRef.current?.getBoundingClientRect();
        if (rect) setPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
      }
      return next;
    });
  }

  return (
    <div className="relative min-w-0 flex-1">
      <button
        ref={rootRef}
        type="button"
        aria-expanded={open}
        onClick={toggleOpen}
        className="flex h-12 w-full items-center justify-between gap-2 rounded-lg border border-[#cbd5e0] bg-white px-3 text-left"
      >
        <span className="min-w-0 flex-1 truncate text-sm text-[#334154]">
          {selected ? selected.title : "Select a service listing"}
        </span>
        <NavIcon
          icon="/icons/poll-chevron-down.svg"
          color="night"
          size={16}
          className={cn("shrink-0 transition-transform duration-150", open && "rotate-180")}
        />
      </button>

      {open &&
        position &&
        createPortal(
          <div className="fixed inset-0 z-[130] bg-black/50" onClick={() => setOpen(false)}>
            <div
              onClick={(event) => event.stopPropagation()}
              style={{ top: position.top, left: position.left, width: position.width }}
              className="absolute flex max-h-[220px] flex-col gap-0.5 overflow-y-auto rounded-lg border border-[#cbd5e0] bg-white p-1 shadow-[0px_24px_60px_-15px_rgba(0,0,0,0.15)]"
            >
              {DUMMY_SERVICES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full flex-col items-start gap-0.5 rounded p-2 text-left text-sm text-[#0f1621]",
                    item.id === value && "bg-[#f8fafc]",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{item.title}</span>
                  <span className="text-xs text-gray-500">{item.rate}</span>
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export type { ServiceListing };
