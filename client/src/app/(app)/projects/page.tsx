"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PageContainer } from "@/components/shared/PageContainer";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { ProjectsRail } from "@/components/shared/ProjectsRail";
import { filterList, FilterPanel, type FilterSection } from "@/components/shared/FilterPanel";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { PROJECT_FILTERS, PROJECTS } from "@/lib/dummy-projects";
import { useSearchTerm } from "@/context/SearchContext";

const STATUS_SECTIONS: FilterSection[] = [
  {
    type: "options",
    label: "Status",
    key: "status",
    display: "chips",
    multiple: true,
    options: PROJECT_FILTERS.filter((item) => item !== "All").map((item) => ({ value: item, label: item })),
  },
];

export default function ProjectsPage() {
  const router = useRouter();
  const [statuses, setStatuses] = useState<string[]>([]);
  const [followed, setFollowed] = useState<string[]>([]);
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  const term = useSearchTerm();
  const projects = useMemo(() => {
    return PROJECTS.filter(
      (project) =>
        (statuses.length === 0 || statuses.some((status) => (status === "Following" ? followed.includes(project.id) : project.stage === status))) &&
        (!term || `${project.name} ${project.developer} ${project.area}`.toLowerCase().includes(term)),
    );
  }, [statuses, term, followed]);

  function toggleFollow(id: string) {
    setFollowed((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

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
          <Button
            variant="primary"
            onClick={comingSoon("Start a project")}
            className="h-10 w-auto shrink-0 self-start rounded-[10px] px-4 sm:self-auto lg:rounded-[10px]"
          >
            Start a project
          </Button>
        </div>

        <FilterPanel
          sections={STATUS_SECTIONS}
          values={{ status: statuses }}
          onChange={(next) => setStatuses(filterList(next, "status"))}
        />

        {projects.length > 0 ? (
          <div className="flex flex-col gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                following={followed.includes(project.id)}
                onToggleFollow={() => toggleFollow(project.id)}
              />
            ))}
          </div>
        ) : (
          term ? (
            <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">No projects match your search.</p>
          ) : (
            <EmptyState
              icon="projects"
              title="No projects here yet"
              body="No developer has listed a project at this stage. Follow developers to hear first when they break ground."
              primary={{ label: "Show all projects", onClick: () => setStatuses([]) }}
              secondary={{ label: "Start a project", onClick: comingSoon("Start a project") }}
            />
          )
        )}

        <div className="xl:hidden">
          <ProjectsRail />
        </div>
      </PageContainer>
    </AppShell>
  );
}
