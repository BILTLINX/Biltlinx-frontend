"use client";

import { SearchEmpty } from "@/components/shared/SearchEmpty";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { FilterDropdown } from "@/components/shared/FilterDropdown";
import { PageContainer } from "@/components/shared/PageContainer";
import { CommunitiesRail } from "@/components/shared/CommunitiesRail";
import { CommunityCard } from "@/components/shared/CommunityCard";
import { CreateCommunityModal } from "@/components/shared/CreateCommunityModal";
import { DiscussionRow } from "@/components/shared/DiscussionRow";
import { EmptyState } from "@/components/shared/EmptyState";
import { NavIcon } from "@/components/shared/NavIcon";
import { useCommunities } from "@/hooks/useCommunities";
import { comingSoonHref } from "@/lib/coming-soon";
import {
  COMMUNITY_FILTERS,
  DISCUSSIONS,
  FILTER_TYPES,
} from "@/lib/dummy-communities";
import { useSearch } from "@/context/SearchContext";

const SHOW_OPTIONS = COMMUNITY_FILTERS.map((item) => ({ value: item, label: item }));

export default function CommunitiesPage() {
  const router = useRouter();
  const [show, setShow] = useState<string>(COMMUNITY_FILTERS[0]);
  const [joined, setJoined] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const { communities: all } = useCommunities();
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));
  const startCommunity = () => setCreating(true);

  // The same text as the search in the top bar, so the two always agree.
  const { query, setQuery } = useSearch();
  const term = query.trim().toLowerCase();
  const mineOnly = show === "My communities";
  const communities = useMemo(() => {
    return all.filter(
      (community) =>
        (show === "For you" ||
          (mineOnly ? community.mine || joined.includes(community.id) : community.type === FILTER_TYPES[show as keyof typeof FILTER_TYPES])) &&
        (!term || `${community.name} ${community.description}`.toLowerCase().includes(term)),
    );
  }, [all, show, mineOnly, term, joined]);

  const discussions = useMemo(() => {
    return DISCUSSIONS.filter((discussion) => communities.some((community) => community.id === discussion.communityId) && (!term || discussion.question.toLowerCase().includes(term)));
  }, [communities, term]);

  function toggleJoin(id: string) {
    setJoined((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <AppShell activeKey="communities" contentFullWidth rightRail={<CommunitiesRail onCreate={startCommunity} />}>
      <PageContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Communities</h1>
            <p className="text-sm leading-5 text-gray-500">Ask questions, share know-how and meet neighbours, builders and owners.</p>
          </div>
        </div>

        <label className="flex h-12 items-center gap-2.5 rounded-xl border border-[#e2e8f0] bg-white px-4 focus-within:border-brand-900">
          <NavIcon icon="/icons/search-02.svg" size={18} className="bg-[#64748b]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search communities and discussions"
            aria-label="Search communities and discussions"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
          />
        </label>

        <FilterDropdown label="Show" options={SHOW_OPTIONS} value={show} onChange={setShow} />

        <section className="@container flex min-w-0 flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">
              {mineOnly ? "Your communities" : "Suggested for you"}
            </h2>
            <button type="button" onClick={comingSoon("All communities")} className="text-[13px] font-medium text-brand-900">
              See all ›
            </button>
          </div>
          {communities.length > 0 ? (
            // One row that scrolls sideways, sized by the room the list has rather than the screen: three cards wide when there is room, two when there is less, and one with the next peeking in when it is narrow. The padding keeps the card shadows from being clipped.
            <div className="no-scrollbar -mb-3 grid snap-x auto-cols-[85%] @[520px]:auto-cols-[calc((100%-1rem)/2)] @[760px]:auto-cols-[calc((100%-2rem)/3)] grid-flow-col gap-4 overflow-x-auto pb-3 *:snap-start">
              {communities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  joined={joined.includes(community.id)}
                  onToggleJoin={() => toggleJoin(community.id)}
                />
              ))}
            </div>
          ) : (
            mineOnly ? (
              <EmptyState
                icon="communities"
                title="You haven’t joined a community yet"
                body="Find your estate, your trade or fellow diaspora buyers. Ask questions, share tips, swap trusted contacts."
                primary={{ label: "Explore communities", onClick: () => setShow(COMMUNITY_FILTERS[0]) }}
                secondary={{ label: "Start a community", onClick: startCommunity }}
              />
            ) : (
              <SearchEmpty noun="communities" />
            )
          )}
        </section>

        {discussions.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Discussions from your communities</h2>
            <div className="flex flex-col gap-6">
              {discussions.map((discussion) => (
                <DiscussionRow
                  key={discussion.id}
                  discussion={discussion}
                  communityName={all.find((community) => community.id === discussion.communityId)?.name ?? ""}
                />
              ))}
            </div>
          </section>
        )}

        <div className="xl:hidden">
          <CommunitiesRail onCreate={startCommunity} />
        </div>
      </PageContainer>
      <CreateCommunityModal open={creating} onClose={() => setCreating(false)} />
    </AppShell>
  );
}
