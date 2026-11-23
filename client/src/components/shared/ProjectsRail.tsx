"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { RailCta } from "@/components/shared/RailCta";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProjectUpdates } from "@/hooks/useProjects";
import { formatRelative } from "@/lib/format";
import { FALLBACK_PROJECT_IMAGE } from "@/lib/project-mapper";

/** Projects side cards (Figma node 1042:21544): latest site updates. */
export function ProjectsRail() {
  const [followedOnly, setFollowedOnly] = useState(false);
  const updates = useProjectUpdates(followedOnly);

  return (
    <div className="flex w-full flex-col gap-4">
      <RailCta title="Building something?" body="Start a project so people can follow it from groundbreaking to handover." label="Start a project" href="/manage/projects" />

      <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Latest site updates</h2>
          <button type="button" onClick={() => setFollowedOnly((value) => !value)} aria-pressed={followedOnly} className="shrink-0 text-[13px] font-medium text-brand-900">
            {followedOnly ? "Following ›" : "All ›"}
          </button>
        </div>
        {updates.isPending && <Skeleton className="h-9 w-full" />}
        {updates.data?.length === 0 && (
          <p className="text-xs leading-[17px] text-gray-500">{followedOnly ? "No updates from the projects you follow yet." : "No site updates yet."}</p>
        )}
        {updates.data?.map((update) => (
          <Link key={update.id} href={`/projects/${update.projectId}`} className="flex items-center gap-2.5">
            <span className="relative block size-9 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
              <Image src={update.photoUrl ?? FALLBACK_PROJECT_IMAGE} alt="" fill className="object-cover" sizes="36px" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-[13px] font-semibold leading-[19px] text-[#0f172a]">{update.projectName}</p>
              <p className="truncate text-xs leading-[17px] text-gray-500">
                {update.note} · {formatRelative(update.createdAt)}
              </p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
