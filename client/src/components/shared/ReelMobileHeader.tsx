"use client";

import { useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { ChevronDownIcon } from "@/components/shared/ReelIcons";
import { ReelPostButton } from "@/components/shared/ReelPlayerControls";
import { DISCOVER_TABS, type DiscoverTab } from "@/lib/discover-tabs";
import { cn } from "@/lib/utils";

interface ReelMobileHeaderProps {
  activeTab?: DiscoverTab;
  onTabChange?: (tab: DiscoverTab) => void;
  onOpenPostComposer?: () => void;
  onOpenOptions: () => void;
  optionsOpen: boolean;
}

/** Transparent overlay header floating over a mobile reel — post (+), the
 * "Reels ⌄" tab filter dropdown, and "more". Mobile has no navbar, so these
 * are the controls DiscoverTabs and the top bar provide on desktop.
 *
 * `sticky`, not `fixed`: each reel's wrapper is exactly one viewport tall and
 * is what the scroll-snap stack aligns to, so a sticky child pins to the top
 * for exactly as long as *this* reel is in view, then hands off to the next
 * reel's own header — no global state or scroll tracking needed. */
export function ReelMobileHeader({
  activeTab,
  onTabChange,
  onOpenPostComposer,
  onOpenOptions,
  optionsOpen,
}: ReelMobileHeaderProps) {
  const [tabMenuOpen, setTabMenuOpen] = useState(false);

  return (
    <div
      onClick={(event) => event.stopPropagation()}
      className="sticky top-0 z-30 flex items-center justify-between px-4 pb-2 pt-[max(14px,env(safe-area-inset-top))]"
    >
      <ReelPostButton onClick={onOpenPostComposer} iconSize={14} className="size-9" />

      <div className="relative">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={tabMenuOpen}
          onClick={() => setTabMenuOpen((open) => !open)}
          className="flex items-center gap-1 text-[16px] font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]"
        >
          Reels
          <ChevronDownIcon className={cn("transition-transform", tabMenuOpen && "rotate-180")} />
        </button>

        {tabMenuOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setTabMenuOpen(false)} />
            <div className="absolute left-1/2 top-full z-30 mt-2 w-[180px] -translate-x-1/2 rounded-[16px] border border-white/15 bg-black/35 p-1.5 shadow-[0px_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              {DISCOVER_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    onTabChange?.(tab);
                    setTabMenuOpen(false);
                  }}
                  className={cn(
                    "block w-full rounded-[10px] px-3 py-2 text-left text-[13px] font-medium",
                    tab === activeTab ? "bg-white/25 text-white" : "text-white/85 hover:bg-white/10",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <button
        type="button"
        aria-label="More options"
        aria-haspopup="dialog"
        aria-expanded={optionsOpen}
        onClick={onOpenOptions}
        className="flex size-9 items-center justify-center"
      >
        <NavIcon icon="/icons/more-horizontal.svg" color="white" size={22} />
      </button>
    </div>
  );
}
