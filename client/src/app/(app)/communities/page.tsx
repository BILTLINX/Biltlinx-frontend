"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PageContainer } from "@/components/shared/PageContainer";
import { CommunitiesRail } from "@/components/shared/CommunitiesRail";
import { CommunityCard } from "@/components/shared/CommunityCard";
import { DiscussionRow } from "@/components/shared/DiscussionRow";
import { NavIcon } from "@/components/shared/NavIcon";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import {
  COMMUNITIES,
  COMMUNITY_FILTERS,
  DISCUSSIONS,
  FILTER_TYPES,
  type CommunityFilter,
} from "@/lib/dummy-communities";
import { cn } from "@/lib/utils";

export default function CommunitiesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<CommunityFilter>("For you");
  const [query, setQuery] = useState("");
  const [joined, setJoined] = useState<string[]>([]);
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  const communities = useMemo(() => {
    const term = query.trim().toLowerCase();
    const type = FILTER_TYPES[filter];
    return COMMUNITIES.filter(
      (community) =>
        (filter === "My communities" ? joined.includes(community.id) : !type || community.type === type) &&
        (!term || `${community.name} ${community.description}`.toLowerCase().includes(term)),
    );
  }, [filter, query, joined]);

  const discussions = useMemo(() => {
    const term = query.trim().toLowerCase();
    return DISCUSSIONS.filter(
      (discussion) =>
        communities.some((community) => community.id === discussion.communityId) &&
        (!term || discussion.question.toLowerCase().includes(term)),
    );
  }, [communities, query]);

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

        <label className="flex h-12 items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4">
          <NavIcon icon="/icons/search-02.svg" size={15} className="shrink-0 bg-gray-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search communities and discussions"
            aria-label="Search communities and discussions"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
          />
        </label>

        <div role="tablist" aria-label="Community filter" className="flex flex-wrap gap-2">
          {COMMUNITY_FILTERS.map((item) => {
            const active = item === filter;
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(item)}
                className={cn(
                  "whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-medium leading-[18px]",
                  active ? "bg-brand-900 text-white" : "border border-gray-200 bg-white text-[#334155] hover:bg-gray-50",
                )}
              >
                {item}
              </button>
            );
          })}
        </div>

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
            <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              {filter === "My communities" ? "You haven’t joined any communities yet." : "No communities match your search."}
            </p>
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
