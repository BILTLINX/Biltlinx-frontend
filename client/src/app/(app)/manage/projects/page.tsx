"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageContainer } from "@/components/shared/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { PROJECTS_KEY, useMyProjects } from "@/hooks/useProjects";
import { errorMessage, notifyError } from "@/lib/errors";
import { FALLBACK_PROJECT_IMAGE, PROJECT_STATUS_TONE } from "@/lib/project-mapper";
import { deleteProject, pauseProject, publishProject } from "@/lib/projects-api";
import { cn } from "@/lib/utils";

export default function ManageProjectsPage() {
  const queryClient = useQueryClient();
  const projects = useMyProjects();
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const toggle = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) => (publish ? publishProject(id) : pauseProject(id)),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      showSuccessToast(variables.publish ? "Your project is live" : "Your project is paused");
    },
    onError: (error) => notifyError(error, "That could not be done."),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      setConfirmingDelete(null);
      void queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
    onError: (error) => notifyError(error),
  });

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Projects" }]} />
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Your projects</h1>
            <p className="text-sm leading-5 text-gray-500">Developments you are building, with their units, milestones, site updates and reservations.</p>
          </div>
          <Link href="/manage/projects/new" className="flex h-10 items-center rounded-[10px] bg-brand-900 px-5 text-sm font-medium text-white hover:bg-brand-900/90">
            New project
          </Link>
        </div>

        {projects.isPending && <Skeleton className="h-28 w-full rounded-2xl" />}
        {projects.isError && <p className="text-sm text-[#dc2626]">{errorMessage(projects.error)}</p>}
        {projects.data?.length === 0 && (
          <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            You have not started a project yet.{" "}
            <Link href="/manage/projects/new" className="font-medium text-brand-900">
              Create your first one
            </Link>
          </p>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {projects.data?.map((project) => (
            <article key={project.id} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4">
              <span className="relative block h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-[#eef2ff]">
                <Image src={project.coverUrl ?? FALLBACK_PROJECT_IMAGE} alt="" fill className="object-cover" sizes="112px" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <h2 className="min-w-0 flex-1 truncate text-[15px] font-bold text-[#0f172a]">{project.name}</h2>
                  <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium", PROJECT_STATUS_TONE[project.status])}>{project.status}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {project.stageLabel} · {project.areaLabel} · {project.availableUnits}/{project.totalUnits} units left
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-3 text-[13px] font-medium">
                  <Link href={`/manage/projects/${project.id}`} className="text-brand-900">
                    Manage
                  </Link>
                  {project.status === "Published" && (
                    <Link href={`/projects/${project.id}`} className="text-brand-900">
                      View
                    </Link>
                  )}
                  {project.status === "Published" ? (
                    <button type="button" onClick={() => toggle.mutate({ id: project.id, publish: false })} className="text-[#b45309]">
                      Pause
                    </button>
                  ) : (
                    <button type="button" onClick={() => toggle.mutate({ id: project.id, publish: true })} className="text-[#16a34a]">
                      Publish
                    </button>
                  )}
                  {confirmingDelete === project.id ? (
                    <>
                      <button type="button" onClick={() => remove.mutate(project.id)} className="text-[#dc2626]">
                        Confirm delete
                      </button>
                      <button type="button" onClick={() => setConfirmingDelete(null)} className="text-gray-500">
                        Keep
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setConfirmingDelete(project.id)} className="text-[#dc2626]">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </PageContainer>
    </AppShell>
  );
}
