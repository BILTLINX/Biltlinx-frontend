"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PageContainer } from "@/components/shared/PageContainer";
import { NavIcon } from "@/components/shared/NavIcon";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { ProjectsRail } from "@/components/shared/ProjectsRail";
import { FilterDropdown } from "@/components/shared/FilterDropdown";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { PROJECT_FILTERS, PROJECTS, type ProjectFilter } from "@/lib/dummy-projects";
import { cn } from "@/lib/utils";

const FILTER_FIELDS = [
  { label: "Stage", value: "Any stage" },
  { label: "Type", value: "Residential" },
];

export default function ProjectsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<ProjectFilter>("All");
  const [query, setQuery] = useState("");
  const [followed, setFollowed] = useState<string[]>([]);
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  const projects = useMemo(() => {
    const term = query.trim().toLowerCase();
    return PROJECTS.filter(
      (project) =>
        (filter === "All" || (filter === "Following" ? followed.includes(project.id) : project.stage === filter)) &&
        (!term || `${project.name} ${project.developer} ${project.area}`.toLowerCase().includes(term)),
    );
  }, [filter, query, followed]);

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

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4">
            <NavIcon icon="/icons/search-02.svg" size={15} className="bg-gray-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects, developers or areas"
              aria-label="Search projects"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
            />
          </label>
          <div className="grid grid-cols-2 gap-3 sm:flex">
            {FILTER_FIELDS.map((field) => (
              <button
                key={field.label}
                type="button"
                onClick={comingSoon(`${field.label} filter`)}
                className="flex h-12 min-w-0 flex-col items-start justify-center rounded-xl border border-gray-200 bg-white px-4 text-left sm:w-[170px]"
              >
                <span className="text-[11px] font-medium leading-[14px] text-gray-500">{field.label}</span>
                <span className="w-full truncate text-sm font-medium leading-5 text-[#0f172a]">{field.value}</span>
              </button>
            ))}
          </div>
        </div>

        <FilterDropdown label="Status" value={filter} onChange={(value) => setFilter(value as typeof filter)} options={PROJECT_FILTERS.map((item) => ({ value: item, label: item }))} />

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
          query.trim() ? (
            <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">No projects match your search.</p>
          ) : (
            <EmptyState
              icon="projects"
              title="No projects here yet"
              body="No developer has listed a project at this stage. Follow developers to hear first when they break ground."
              primary={{ label: "Show all projects", onClick: () => setFilter("All") }}
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
