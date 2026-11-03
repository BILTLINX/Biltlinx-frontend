"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Tooltip } from "@/components/shared/Tooltip";
import { useHasActionNeeded } from "@/hooks/useActionNeeded";
import { useHasUnreadMessages } from "@/hooks/useMessaging";
import { comingSoonHref } from "@/lib/coming-soon";
import { DISCOVER_TABS, type DiscoverTab } from "@/lib/discover-tabs";
import { cn } from "@/lib/utils";

interface DiscoverTopBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  activeTab: DiscoverTab;
  onTabChange: (tab: DiscoverTab) => void;
  /** Rendered as a second row directly beneath the nav bar, inside the same
   * non-scrolling `topNav` slot — so it's genuinely pinned under the navbar
   * rather than needing `position: sticky` (used for the mobile horizontal
   * story bar, hidden once the desktop vertical aside takes over). */
  below?: ReactNode;
}

/** The Discover screen's own nav/filter bar (Figma node 789:35857) — it
 * replaces the shared `TopNav` for this screen rather than stacking below
 * it, so it carries the same bar "effect" (height, border, logo position)
 * as `TopNav` while owning search, category filters, and the account
 * affordances Figma specifies for this screen. */
export function DiscoverTopBar({ query, onQueryChange, activeTab, onTabChange, below }: DiscoverTopBarProps) {
  const hasUnreadMessages = useHasUnreadMessages();
  const hasActionNeeded = useHasActionNeeded();
  return (
    // Hidden entirely below `xl:` — mobile Discover has no navbar/story-rail
    // chrome at all (the video takes the full screen), with its own minimal
    // back/filter/more controls overlaid directly on the reel instead (see
    // DiscoverReelCard's mobile branch).
    <div className="hidden w-full shrink-0 flex-col xl:flex">
      <header className="flex h-[67px] w-full shrink-0 items-center border-b border-gray-200 bg-white px-[15px] py-2 sm:px-[23px]">
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex min-w-0 shrink-0 items-center gap-[15px] md:gap-[24px]">
          <Link href="/home" aria-label="Home" className="relative size-[34px] shrink-0 sm:hidden">
            <Image src="/brand/mobile%20logo.png" alt="Biltlinx" fill className="object-contain" sizes="34px" priority />
          </Link>
          <Link href="/home" aria-label="Home" className="relative hidden h-[36px] w-[72px] shrink-0 sm:block">
            <Image src="/icons/logo-biltlinx.png" alt="Biltlinx" fill className="object-contain" sizes="72px" priority />
          </Link>

          <label className="relative hidden w-[256px] shrink-0 lg:block">
            <span className="sr-only">Search Discover</span>
            <span className="pointer-events-none absolute inset-y-0 left-[14px] flex items-center">
              <span className="relative block size-4">
                <Image src="/icons/search.svg" alt="" fill sizes="16px" />
              </span>
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search Discover"
              className="w-full rounded-full border border-gray-200 bg-white py-[10px] pl-[41px] pr-[17px] text-[12px] text-night-900 placeholder:text-[#53575a] focus:border-brand-600 focus:outline-none"
            />
          </label>
        </div>

        <div className="no-scrollbar flex min-w-0 items-center gap-[6px] overflow-x-auto">
          {DISCOVER_TABS.map((tab) =>
            tab === activeTab ? (
              <div key={tab} className="shrink-0 rounded-[22px] bg-brand-600/[0.22] p-0.5">
                <button
                  type="button"
                  onClick={() => onTabChange(tab)}
                  className="rounded-full bg-brand-900 px-[20px] py-[6px] text-[12px] font-bold text-white"
                >
                  {tab}
                </button>
              </div>
            ) : (
              <button
                key={tab}
                type="button"
                onClick={() => onTabChange(tab)}
                className="shrink-0 whitespace-nowrap rounded-full px-[16px] py-[6px] text-[12px] text-night-700 hover:bg-gray-50"
              >
                {tab}
              </button>
            ),
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 py-1 sm:gap-2">
          <Tooltip label="Messages" side="bottom" className="hidden sm:inline-flex">
            <Link
              href="/messages"
              aria-label="Messages"
              className="relative flex size-[38px] items-center justify-center rounded-full hover:bg-gray-50"
            >
              <span className="relative block size-[19px] shrink-0">
                <Image src="/icons/message-programming.svg" alt="" fill sizes="19px" />
              </span>
              {hasUnreadMessages && <span className="absolute right-[7px] top-[8px] size-1.5 rounded-full border border-[#f5f0f9] bg-red-500" />}
            </Link>
          </Tooltip>

          <Tooltip label="Notifications" side="bottom" className="hidden sm:inline-flex">
            <Link
              href="/notifications"
              aria-label="Notifications"
              className="relative flex size-[38px] items-center justify-center rounded-full hover:bg-gray-50"
            >
              <span className="relative block size-[19px] shrink-0">
                <Image src="/icons/notification.svg" alt="" fill sizes="19px" />
              </span>
              {hasActionNeeded && <span className="absolute right-[7px] top-[8px] size-1.5 rounded-full border border-[#f5f0f9] bg-red-500" />}
            </Link>
          </Tooltip>

          <Tooltip label="Account" side="bottom" align="end">
            <Link href={comingSoonHref("Account")} aria-label="Account" className={cn("relative block size-8 shrink-0 overflow-hidden rounded-full")}>
              <Image src="/images/avatar-golden-palm.png" alt="" fill sizes="32px" className="object-cover" />
              <span className="absolute -bottom-0.5 -right-0.5 block size-3.5">
                <Image src="/icons/avatar-verified-badge-green.svg" alt="" fill sizes="14px" />
              </span>
            </Link>
          </Tooltip>
        </div>
      </div>
    </header>
    {below}
    </div>
  );
}
