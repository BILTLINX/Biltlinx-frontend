"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { MODAL_FRAME } from "@/lib/modal-styles";

interface CenteredDialogProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
  className?: string;
}

/** A dialog centered on screen over the same dimmed backdrop as the create-post modal. Closes on Escape or a click outside it. */
export function CenteredDialog({ open, onClose, labelledBy, children, className }: CenteredDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Element;
      // A dropdown opened from inside the dialog renders in a portal; clicking it isn't clicking outside.
      if (target.closest?.("[data-dialog-popover]")) return;
      if (!dialogRef.current?.contains(target)) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cn(
          "flex max-h-[calc(100dvh-2rem)] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white",
          MODAL_FRAME,
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
