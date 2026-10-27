"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

interface AnchoredPanelProps {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  /** Used to decide whether the panel fits below the trigger or has to open above it. */
  estimatedHeight: number;
  /** The panel is as wide as its trigger, but never narrower than this. */
  minWidth?: number;
  children: ReactNode;
}

interface Position {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
}

/**
 * The floating panel behind the app's dropdowns (option lists, the date picker's calendar): a portal anchored to
 * its trigger that flips above it when there is no room below, and closes on Escape or a click outside. It is marked
 * `data-dialog-popover` so a dialog it is opened from doesn't treat a click inside it as a click outside the dialog.
 */
export function AnchoredPanel({ open, onClose, triggerRef, estimatedHeight, minWidth = 0, children }: AnchoredPanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<Position | null>(null);

  useEffect(() => {
    if (!open) return;
    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(Math.max(rect.width, minWidth), window.innerWidth - 16);
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < estimatedHeight && rect.top > spaceBelow) {
        setPosition({ bottom: window.innerHeight - rect.top + 4, left, width });
      } else {
        setPosition({ top: rect.bottom + 4, left, width });
      }
    }
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, estimatedHeight, minWidth, triggerRef]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, triggerRef]);

  if (!open || !position) return null;

  return createPortal(
    <div
      ref={panelRef}
      data-dialog-popover
      style={{ top: position.top, bottom: position.bottom, left: position.left, width: position.width }}
      className="fixed z-[130] rounded-2xl border border-gray-200 bg-white p-1.5 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.18)]"
    >
      <div className="flex flex-col gap-1">{children}</div>
    </div>,
    document.body,
  );
}
