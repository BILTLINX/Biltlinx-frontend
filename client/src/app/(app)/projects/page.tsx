"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { filterList, FilterPanel, type FilterSection } from "@/components/shared/FilterPanel";
import { PageContainer } from "@/components/shared/PageContainer";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { ProjectsRail } from "@/components/shared/ProjectsRail";
import { SearchEmpty } from "@/components/shared/SearchEmpty";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDebouncedSearch } from "@/context/SearchContext";
import { useProjectsList } from "@/hooks/useProjects";
import { errorMessage } from "@/lib/errors";
import { FOLLOWING_FILTER, PROJECT_STAGES } from "@/lib/project-mapper";

const STATUS_SECTIONS: FilterSection[] = [
  {
    type: "options",
    label: "Status",
    key: "status",
    display: "chips",
    multiple: true,
    options: [...PROJECT_STAGES.map((stage) => ({ value: stage.value, label: stage.label })), { value: FOLLOWING_FILTER, label: FOLLOWING_FILTER }],
  },
];

export default function ProjectsPage() {
  const router = useRouter();
  const [statuses, setStatuses] = useState<string[]>([]);
  const term = useDebouncedSearch();

  const followed = statuses.includes(FOLLOWING_FILTER);
  const stages = useMemo(() => statuses.filter((status) => status !== FOLLOWING_FILTER), [statuses]);
  const list = useProjectsList({ q: term || undefined, stage: stages.length === 1 ? stages[0] : undefined, followed: followed || undefined });
  const projects = useMemo(
    () => (stages.length > 1 ? list.projects.filter((project) => stages.includes(project.stageKey)) : list.projects),
    [list.projects, stages],
  );

  return (
    <AppShell activeKey="property" activeChildKey="projects" contentFullWidth rightRail={<ProjectsRail />}>
      <PageContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Projects</h1>
            <p className="text-sm leading-5 text-gray-500">
              Follow developments and builds across Ghana, from groundbreaking to handover.
            </p>
          </div>
          <FilterPanel
            className="shrink-0 sm:max-w-[45%] sm:justify-end"
            sections={STATUS_SECTIONS}
            values={{ status: statuses }}
            onChange={(next) => setStatuses(filterList(next, "status"))}
          />
        </div>

        {list.isPending ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-[210px] w-full rounded-2xl" />
            <Skeleton className="h-[210px] w-full rounded-2xl" />
          </div>
        ) : list.isError ? (
          <p className="text-sm text-[#dc2626]">{errorMessage(list.error)}</p>
        ) : projects.length > 0 ? (
          <div className="flex flex-col gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            {list.hasNextPage && (
              <Button variant="outline" onClick={() => void list.fetchNextPage()} disabled={list.isFetchingNextPage} className="mx-auto w-auto px-6">
                {list.isFetchingNextPage ? "Loading…" : "Show more projects"}
              </Button>
            )}
          </div>
        ) : term ? (
          <SearchEmpty noun="projects" />
        ) : (
          <EmptyState
            icon="projects"
            title={followed ? "You are not following any project yet" : "No projects here yet"}
            body="No developer has listed a project at this stage. Follow developers to hear first when they break ground."
            primary={{ label: "Show all projects", onClick: () => setStatuses([]) }}
            secondary={{ label: "Start a project", onClick: () => router.push("/manage/projects") }}
          />
        )}

        <div className="xl:hidden">
          <ProjectsRail />
        </div>
      </PageContainer>
    </AppShell>
  );
}
