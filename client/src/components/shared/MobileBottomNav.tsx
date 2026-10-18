"use client";

import { useState } from "react";
import { MobileNavGrid } from "@/components/shared/MobileNavGrid";
import { NavIcon } from "@/components/shared/NavIcon";
import { NAV_DESTINATIONS } from "@/components/shared/nav-items";

interface MobileBottomNavProps {
  activeKey?: string;
  activeChildKey?: string;
}

/** A single floating menu button that expands into a grid of every nav
 * category's sub-items (see MobileNavGrid) — replaces the old per-category
 * icon bar on mobile. Stays on screen at all times (no scroll-hide). The
 * button's icon mirrors whichever nav item is currently active (defaulting
 * to Home) instead of a generic hamburger, and swaps to a close icon while
 * the grid is open. */
export function MobileBottomNav({ activeKey = "feed", activeChildKey = "home" }: MobileBottomNavProps) {
  const [open, setOpen] = useState(false);

  const activeChild = NAV_DESTINATIONS.find(
    (destination) => destination.parentKey === activeKey && (destination.key === activeChildKey || destination.key === activeKey),
  );
  const activeIcon = activeChild?.icon ?? "/icons/home-03.svg";

  return (
    <div className="fixed bottom-4 left-4 z-50 lg:hidden">
      <div className="rounded-full p-0.5 drop-shadow-[0px_4px_2px_rgba(0,0,0,0.25)]">
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="relative flex size-14 items-center justify-center rounded-full shadow-[0px_12px_30px_rgba(0,0,0,0.12),0px_2px_6px_rgba(0,0,0,0.06)]"
        >
          <span aria-hidden className="absolute inset-0 rounded-full bg-[rgba(245,247,250,0.94)] backdrop-blur-[10px]" />
          <span aria-hidden className="absolute inset-0 rounded-full shadow-[inset_0px_1px_0px_rgba(255,255,255,0.9)]" />
          {open ? (
            <svg className="relative" width="26" height="26" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 4L16 16M16 4L4 16" stroke="#1465e6" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <NavIcon icon={activeIcon} color="brand" size={22} className="relative" />
          )}
        </button>
      </div>

      <MobileNavGrid open={open} onClose={() => setOpen(false)} activeKey={activeKey} activeChildKey={activeChildKey} />
    </div>
  );
}
