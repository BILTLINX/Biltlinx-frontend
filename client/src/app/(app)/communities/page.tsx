"use client";

import { SearchEmpty } from "@/components/shared/SearchEmpty";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { filterList, filterText, FilterPanel, type FilterSection, type FilterValues } from "@/components/shared/FilterPanel";
import { PageContainer } from "@/components/shared/PageContainer";
import { CommunitiesRail } from "@/components/shared/CommunitiesRail";
import { CommunityCard } from "@/components/shared/CommunityCard";
import { CreateCommunityModal } from "@/components/shared/CreateCommunityModal";
import { DiscussionRow } from "@/components/shared/DiscussionRow";
import { EmptyState } from "@/components/shared/EmptyState";
import { useCommunities } from "@/hooks/useCommunities";
import { DISCUSSIONS, FILTER_TYPES } from "@/lib/dummy-communities";
import { useSearch } from "@/context/SearchContext";

const TYPE_OPTIONS = Object.entries(FILTER_TYPES).map(([label, value]) => ({ label, value: value as string }));
const EMPTY_FILTERS: FilterValues = { show: "", type: [] };
const SECTIONS: FilterSection[] = [
  { type: "options", label: "Show", key: "show", display: "chips", options: [{ label: "My communities", value: "mine" }] },
  { type: "options", label: "Type", key: "type", display: "chips", multiple: true, options: TYPE_OPTIONS },
];

export default function CommunitiesPage() {
  const [filters, setFilters] = useState<FilterValues>(EMPTY_FILTERS);
  const [joined, setJoined] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [seeAll, setSeeAll] = useState(false);
  const { communities: all } = useCommunities();
  const startCommunity = () => setCreating(true);

  // The same text as the search in the top bar, so the two always agree.
  const { query } = useSearch();
  const term = query.trim().toLowerCase();
  const mineOnly = filterText(filters, "show") === "mine";
  const types = filterList(filters, "type");
  const communities = useMemo(() => {
    return all.filter(
      (community) =>
        (!mineOnly || community.mine || joined.includes(community.id)) &&
        (types.length === 0 || types.includes(community.type)) &&
        (!term || `${community.name} ${community.description}`.toLowerCase().includes(term)),
    );
  }, [all, mineOnly, types, term, joined]);

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
          <FilterPanel className="shrink-0 sm:max-w-[45%] sm:justify-end" sections={SECTIONS} values={filters} onChange={setFilters} />
        </div>

        <section className="@container flex min-w-0 flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">
              {mineOnly ? "Your communities" : "Suggested for you"}
            </h2>
            {communities.length > 0 && (
              <button type="button" onClick={() => setSeeAll((current) => !current)} aria-expanded={seeAll} className="text-[13px] font-medium text-brand-900">
                {seeAll ? "Show fewer" : "See all ›"}
              </button>
            )}
          </div>
          {communities.length > 0 ? (
            // One row that scrolls sideways, sized by the room the list has rather than the screen: three cards wide when there is room, two when there is less, and one with the next peeking in when it is narrow. The padding keeps the card shadows from being clipped. "See all" lays every community out in a wrapping grid of the same widths instead.
            <div
              className={
                seeAll
                  ? "grid grid-cols-1 gap-4 @[520px]:grid-cols-2 @[760px]:grid-cols-3"
                  : "no-scrollbar -mb-3 grid snap-x auto-cols-[85%] @[520px]:auto-cols-[calc((100%-1rem)/2)] @[760px]:auto-cols-[calc((100%-2rem)/3)] grid-flow-col gap-4 overflow-x-auto pb-3 *:snap-start"
              }
            >
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
                primary={{ label: "Explore communities", onClick: () => setFilters(EMPTY_FILTERS) }}
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
