"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

const VIEWPORT_MARGIN = 8;

interface FloatingMenuProps {
  open: boolean;
  onClose: () => void;
  /** The button the menu opens from. */
  anchorRef: RefObject<HTMLElement | null>;
  /** Menu width in px; it is never wider than the screen. */
  width: number;
  /** Which edge of the button the menu lines up with. */
  align?: "start" | "end";
  role?: string;
  id?: string;
  "aria-label"?: string;
  "aria-multiselectable"?: boolean;
  children: ReactNode;
}

/**
 * The shared menu frame (post options, filter dropdowns): a white card, drawn
 * above the page from the screen's own layer. It opens under its button, flips above when it only fits there, and closes
 * on Escape, a click outside, or when the page scrolls or resizes, since it no longer sits where it opened.
 */
export function FloatingMenu({ open, onClose, anchorRef, width: menuWidth, align = "end", role, id, children, ...aria }: FloatingMenuProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ top?: number; bottom?: number; left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(menuWidth, window.innerWidth - VIEWPORT_MARGIN * 2);
    const wanted = align === "end" ? rect.right - width : rect.left;
    const left = Math.max(VIEWPORT_MARGIN, Math.min(wanted, window.innerWidth - width - VIEWPORT_MARGIN));
    // Opens under the button; only flips above when the real menu height doesn't fit below but does fit above.
    const height = panelRef.current?.offsetHeight ?? 0;
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_MARGIN;
    if (height > spaceBelow && rect.top - VIEWPORT_MARGIN > spaceBelow) {
      setPosition({ bottom: window.innerHeight - rect.top + 4, left, width });
    } else {
      setPosition({ top: rect.bottom + 4, left, width });
    }
  }, [open, anchorRef, menuWidth, align]);

  useEffect(() => {
    if (!open) return;
    const handleScroll = (event: Event) => {
      if (panelRef.current?.contains(event.target as Node)) return;
      onClose();
    };
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", onClose);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", onClose);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={panelRef}
      id={id}
      role={role}
      {...aria}
      style={position ? { top: position.top, bottom: position.bottom, left: position.left, width: position.width } : { top: 0, left: 0, width: menuWidth, visibility: "hidden" }}
      className="fixed z-[120] rounded-[22px] border border-[rgba(15,22,33,0.12)] bg-white p-2 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.18)]"
    >
      <div className="flex max-h-[calc(100dvh-4rem)] flex-col overflow-y-auto overscroll-contain rounded-2xl bg-white/90 p-1">{children}</div>
    </div>,
    document.body,
  );
}
