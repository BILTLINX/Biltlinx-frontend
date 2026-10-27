"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { showErrorToast, showSuccessToast } from "@/components/shared/AppToast";
import { NavIcon } from "@/components/shared/NavIcon";
import { Tooltip } from "@/components/shared/Tooltip";
import { useAnimatedSheet } from "@/hooks/useAnimatedSheet";
import { DUMMY_STAYS, type StayListing } from "@/lib/dummy-listings";
import { cn } from "@/lib/utils";
import { usePostsFeed } from "@/context/PostsContext";
import { MODAL_FRAME } from "@/lib/modal-styles";


interface PostStayModalProps {
  open: boolean;
  onClose: () => void;
}

export function PostStayModal({ open, onClose }: PostStayModalProps) {
  const { addPost } = usePostsFeed();
  const [note, setNote] = useState("");
  const [listingId, setListingId] = useState<string>(DUMMY_STAYS[0].id);
  const listing = DUMMY_STAYS.find((item) => item.id === listingId) ?? null;

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

  if (!mounted) return null;

  function resetState() {
    setNote("");
    setListingId(DUMMY_STAYS[0].id);
  }

  function handleClose() {
    resetState();
    onClose();
  }

  function handlePost() {
    if (!listing) {
      showErrorToast("Choose a room / unit type to post");
      return;
    }
    addPost({ kind: "stay", note, listing });
    showSuccessToast("Your stay has been posted");
    resetState();
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Share a stay"
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
              Share a Stay
            </p>
            <span className="size-6 shrink-0 sm:hidden" aria-hidden />
          </div>

          <div className="flex w-full items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[13px] font-extrabold text-[#4f46e5]">
              SL
            </span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
              placeholder="Highlight what makes this room special…"
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

          <div className="flex w-full flex-col gap-2.5 rounded-2xl border border-[#e2e8f0] p-4">
            <p className="text-sm text-[#111826]">Choose room / unit type</p>
            <div className="flex w-full items-center gap-4">
              <StayDropdown value={listingId} onChange={setListingId} />
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

          {listing && (
            <div className="flex w-full items-stretch overflow-hidden rounded-2xl border border-[#e2e8f0]">
              <span className="relative h-[120px] w-[35%] shrink-0 sm:w-[203px]">
                <Image src={listing.image} alt="" fill className="object-cover" sizes="(max-width: 640px) 35vw, 203px" />
              </span>
              <div className="flex flex-1 flex-col justify-end gap-1 bg-[#f8fafc] px-4 py-3">
                <p className="text-lg font-semibold text-[#334154] sm:text-xl">
                  {listing.priceLine}
                  {listing.priceSuffix && <span className="text-xs font-normal">{listing.priceSuffix}</span>}
                </p>
                <p className="text-xs font-bold text-[#334154]">{listing.subLine}</p>
                <p className="text-[9px] font-light text-[#334154]">
                  {listing.location} - {listing.beds} Bed | {listing.baths} Bath
                </p>
              </div>
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
              disabled={!listing}
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

function StayDropdown({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLButtonElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const selected = DUMMY_STAYS.find((item) => item.id === value);

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
          {selected ? selected.title : "Select a room / unit type"}
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
              {DUMMY_STAYS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded p-2 text-left text-sm text-[#0f1621]",
                    item.id === value && "bg-[#f8fafc]",
                  )}
                >
                  <span className="relative size-9 shrink-0 overflow-hidden rounded-md">
                    <Image src={item.image} alt="" fill className="object-cover" sizes="36px" />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.title}</span>
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export type { StayListing };
