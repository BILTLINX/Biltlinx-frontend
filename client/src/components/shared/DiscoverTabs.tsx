"use client";

import { DISCOVER_TABS, type DiscoverTab } from "@/lib/discover-tabs";

interface DiscoverTabsProps {
  activeTab: DiscoverTab;
  onTabChange: (tab: DiscoverTab) => void;
}

/** Discover's category pills (For You, Following, ...), shown in the shared top bar on desktop. */
export function DiscoverTabs({ activeTab, onTabChange }: DiscoverTabsProps) {
  return (
    <div role="tablist" aria-label="Reel category" className="no-scrollbar flex min-w-0 items-center gap-1.5 overflow-x-auto">
      {DISCOVER_TABS.map((tab) =>
        tab === activeTab ? (
          <div key={tab} className="shrink-0 rounded-[22px] bg-brand-600/[0.22] p-0.5">
            <button type="button" role="tab" aria-selected onClick={() => onTabChange(tab)} className="rounded-full bg-brand-900 px-5 py-1.5 text-xs font-bold text-white">
              {tab}
            </button>
          </div>
        ) : (
          <button key={tab} type="button" role="tab" aria-selected={false} onClick={() => onTabChange(tab)} className="shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-xs text-night-700 hover:bg-gray-50">
            {tab}
          </button>
        ),
      )}
    </div>
  );
}
