"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PageContainer } from "@/components/shared/PageContainer";
import { CommunitiesRail } from "@/components/shared/CommunitiesRail";
import { CommunityCard } from "@/components/shared/CommunityCard";
import { DiscussionRow } from "@/components/shared/DiscussionRow";
import { FilterDropdown } from "@/components/shared/FilterDropdown";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import {
  COMMUNITIES,
  COMMUNITY_FILTERS,
  DISCUSSIONS,
  FILTER_TYPES,
  type CommunityFilter,
} from "@/lib/dummy-communities";
import { useSearchTerm } from "@/context/SearchContext";

export default function CommunitiesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<CommunityFilter>("For you");
  const [joined, setJoined] = useState<string[]>([]);
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  const term = useSearchTerm();
  const communities = useMemo(() => {
    const type = FILTER_TYPES[filter];
    return COMMUNITIES.filter(
      (community) =>
        (filter === "My communities" ? joined.includes(community.id) : !type || community.type === type) &&
        (!term || `${community.name} ${community.description}`.toLowerCase().includes(term)),
    );
  }, [filter, term, joined]);

  const discussions = useMemo(() => {
    return DISCUSSIONS.filter((discussion) => communities.some((community) => community.id === discussion.communityId) && (!term || discussion.question.toLowerCase().includes(term)));
  }, [communities, term]);

  function toggleJoin(id: string) {
    setJoined((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <AppShell activeKey="communities" contentFullWidth rightRail={<CommunitiesRail />}>
      <PageContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Communities</h1>
            <p className="text-sm leading-5 text-gray-500">
              Ask questions, share know-how and meet neighbours, builders and owners.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={comingSoon("Create a community")}
            className="h-10 w-auto shrink-0 self-start rounded-[10px] px-4 sm:self-auto lg:rounded-[10px]"
          >
            Create a community
          </Button>
        </div>


        <FilterDropdown label="Show" value={filter} onChange={(value) => setFilter(value as typeof filter)} options={COMMUNITY_FILTERS.map((item) => ({ value: item, label: item }))} />

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">
              {filter === "My communities" ? "Your communities" : "Suggested for you"}
            </h2>
            <button type="button" onClick={comingSoon("All communities")} className="text-[13px] font-medium text-brand-900">
              See all ›
            </button>
          </div>
          {communities.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-4">
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
            filter === "My communities" ? (
              <EmptyState
                icon="communities"
                title="You haven’t joined a community yet"
                body="Find your estate, your trade or fellow diaspora buyers. Ask questions, share tips, swap trusted contacts."
                primary={{ label: "Explore communities", onClick: () => setFilter("For you") }}
                secondary={{ label: "Start a community", onClick: comingSoon("Create a community") }}
              />
            ) : (
              <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">No communities match your search.</p>
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
                  communityName={COMMUNITIES.find((community) => community.id === discussion.communityId)?.name ?? ""}
                />
              ))}
            </div>
          </section>
        )}

        <div className="xl:hidden">
          <CommunitiesRail />
        </div>
      </PageContainer>
    </AppShell>
  );
}
