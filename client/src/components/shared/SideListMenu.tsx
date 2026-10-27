"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { NavIcon } from "@/components/shared/NavIcon";
import { VisibilityRow } from "@/components/shared/VisibilityRow";
import { cn } from "@/lib/utils";

interface SideListMenuProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  items: string[];
  /** Single-select: fires once and the caller closes the menu. */
  onSelect?: (item: string) => void;
  /** Multi-select: header with a title, a search toggle, and checkmarks for each selected item. */
  multiple?: boolean;
  searchable?: boolean;
  title?: string;
  selected?: string[];
  onToggle?: (item: string) => void;
  /** Leading icon shown before every row (e.g. the organization logo glyph). */
  icon?: string;
}

export function SideListMenu({
  open,
  onClose,
  anchorRef,
  items,
  onSelect,
  multiple = false,
  searchable = false,
  title,
  selected = [],
  onToggle,
  icon,
}: SideListMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition({ top: rect.top, left: rect.right + 8 });
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      if (anchorRef.current?.contains(event.target as Node)) return;
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
  }, [open, onClose, anchorRef]);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) {
      setSearchOpen(false);
      setQuery("");
    }
  }

  if (!open || !position) return null;

  const filteredItems = query.trim()
    ? items.filter((item) => item.toLowerCase().includes(query.trim().toLowerCase()))
    : items;

  return createPortal(
    <div data-side-list-menu className="fixed inset-0 z-[120] bg-black/50" onClick={onClose}>
    <div
      ref={menuRef}
      onClick={(event) => event.stopPropagation()}
      style={{ top: position.top, left: position.left }}
      className="absolute flex w-[264px] flex-col rounded-[26px] border border-[rgba(15,22,33,0.12)] bg-white p-2.5 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.18)]"
    >
    <div className="flex w-full flex-col gap-2.5 rounded-2xl bg-white/90 p-2.5">
      {title && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <p className="flex-1 truncate text-sm font-semibold leading-5 text-[#001f3f]">{title}</p>
            {searchable && (
              <button
                type="button"
                aria-label="Search"
                aria-pressed={searchOpen}
                onClick={() => setSearchOpen((v) => !v)}
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full",
                  searchOpen ? "bg-brand-900" : "bg-[#a8c9fd]",
                )}
              >
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="6.5" cy="6.5" r="5" stroke="white" strokeWidth="1.5" />
                  <path d="M10.5 10.5L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
          {searchOpen && (
            <div className="flex h-7 w-full items-center gap-2 overflow-hidden rounded-lg border border-[#e2e8f0] bg-white px-3">
              <NavIcon icon="/icons/visibility-search-sm.svg" color="night" size={12} />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search..."
                className="min-w-0 flex-1 bg-transparent text-xs leading-5 text-[#334155] placeholder:text-[#53575a] focus:outline-none"
              />
            </div>
          )}
        </div>
      )}

      <div className="no-scrollbar flex max-h-[184px] w-full flex-col gap-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <p className="px-3 py-2 text-xs text-[#64748a]">No matches</p>
        ) : (
          filteredItems.map((item, index) => (
            <VisibilityRow
              key={`${item}-${index}`}
              icon={icon}
              label={item}
              selected={selected.includes(item)}
              onClick={() => (multiple ? onToggle?.(item) : onSelect?.(item))}
            />
          ))
        )}
      </div>
    </div>
    </div>
    </div>,
    document.body,
  );
}
