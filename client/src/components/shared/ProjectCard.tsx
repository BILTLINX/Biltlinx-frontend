"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { Project, ProjectStage } from "@/lib/dummy-projects";
import { cn } from "@/lib/utils";

const STAGE_PILL: Record<ProjectStage, string> = {
  "Selling now": "bg-[#dcfce7] text-[#16a34a]",
  "Under construction": "bg-[#eff5ff] text-brand-900",
  Planning: "bg-[#fef3c7] text-[#b45309]",
  Completed: "bg-[#f1f5f9] text-[#334155]",
};

interface ProjectCardProps {
  project: Project;
  following: boolean;
  onToggleFollow: () => void;
}

/** One development (Figma node 1042:21581): photo, stage, developer and area, construction progress, price and follow / view actions. */
export function ProjectCard({ project, following, onToggleFollow }: ProjectCardProps) {
  const router = useRouter();

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:gap-5">
      <div className="relative h-[170px] w-full shrink-0 overflow-hidden rounded-xl sm:w-[240px]">
        <Image
          src={project.image}
          alt={project.name}
          fill
          className="object-cover"
          sizes="(min-width: 640px) 240px, 100vw"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <h2 className="text-lg font-bold leading-[26px] text-[#0f172a]">
            <Link href={`/projects/${project.id}`} className="hover:text-brand-900 hover:underline">
              {project.name}
            </Link>
          </h2>
          <span
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium leading-4",
              STAGE_PILL[project.stage],
            )}
          >
            {project.stage}
          </span>
        </div>
        <p className="text-[13px] leading-[19px] text-gray-500">
          {project.developer} · {project.area}
        </p>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-start justify-between text-xs leading-[17px]">
            <span className="font-medium text-[#334155]">Construction progress</span>
            <span className="font-bold text-[#0f172a]">{project.progress}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Construction progress"
            aria-valuenow={project.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
          >
            <div className="h-full rounded-full bg-brand-900" style={{ width: `${project.progress}%` }} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex flex-col gap-0.5">
            <p className="text-base font-bold leading-[23px] text-[#0f172a]">{project.priceFrom}</p>
            <p className="text-xs leading-[17px] text-gray-500">{project.summary}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onToggleFollow}
              aria-pressed={following}
              className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]"
            >
              {following ? "Following" : "Follow"}
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push(`/projects/${project.id}`)}
              className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]"
            >
              View project
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
