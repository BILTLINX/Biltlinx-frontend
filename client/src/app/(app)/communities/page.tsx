"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { filterList, FilterPanel, type FilterSection } from "@/components/shared/FilterPanel";
import { PageContainer } from "@/components/shared/PageContainer";
import { CommunitiesRail } from "@/components/shared/CommunitiesRail";
import { CommunityCard } from "@/components/shared/CommunityCard";
import { DiscussionRow } from "@/components/shared/DiscussionRow";
import { EmptyState } from "@/components/shared/EmptyState";
import { comingSoonHref } from "@/lib/coming-soon";
import {
  COMMUNITIES,
  COMMUNITY_FILTERS,
  DISCUSSIONS,
  FILTER_TYPES,
} from "@/lib/dummy-communities";
import { useSearchTerm } from "@/context/SearchContext";

const SHOW_SECTIONS: FilterSection[] = [
  {
    type: "options",
    label: "Show",
    key: "show",
    display: "chips",
    multiple: true,
    options: COMMUNITY_FILTERS.filter((item) => item !== "For you").map((item) => ({ value: item, label: item })),
  },
];

export default function CommunitiesPage() {
  const router = useRouter();
  const [shows, setShows] = useState<string[]>([]);
  const [joined, setJoined] = useState<string[]>([]);
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  const term = useSearchTerm();
  const mineOnly = shows.length === 1 && shows[0] === "My communities";
  const communities = useMemo(() => {
    return COMMUNITIES.filter(
      (community) =>
        (shows.length === 0 ||
          shows.some((show) => (show === "My communities" ? joined.includes(community.id) : community.type === FILTER_TYPES[show as keyof typeof FILTER_TYPES]))) &&
        (!term || `${community.name} ${community.description}`.toLowerCase().includes(term)),
    );
  }, [shows, term, joined]);

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
          <FilterPanel
            className="shrink-0 sm:max-w-[45%] sm:justify-end"
            sections={SHOW_SECTIONS}
            values={{ show: shows }}
            onChange={(next) => setShows(filterList(next, "show"))}
          />
        </div>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">
              {mineOnly ? "Your communities" : "Suggested for you"}
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
            mineOnly ? (
              <EmptyState
                icon="communities"
                title="You haven’t joined a community yet"
                body="Find your estate, your trade or fellow diaspora buyers. Ask questions, share tips, swap trusted contacts."
                primary={{ label: "Explore communities", onClick: () => setShows([]) }}
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
