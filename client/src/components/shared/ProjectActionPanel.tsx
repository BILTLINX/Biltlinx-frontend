"use client";

import Image from "next/image";
import Link from "next/link";
import { BookmarkIcon } from "@/components/shared/BookmarkIcon";
import { DetailAside } from "@/components/shared/DetailAside";
import { NavIcon } from "@/components/shared/NavIcon";
import { Button } from "@/components/ui/Button";
import { useProjectFollow } from "@/hooks/useProjects";
import type { ProjectDetailView } from "@/lib/project-mapper";
import { initialsOf } from "@/lib/initials";
import { shareContent } from "@/lib/share";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5";
const ROUNDED = "rounded-[10px] lg:rounded-[10px]";
const UTILITY_BUTTON =
  "flex items-center justify-center gap-1.5 rounded-[10px] border border-gray-200 py-2 text-[13px] font-medium leading-[19px] text-[#334155] hover:bg-gray-50";

interface ProjectActionPanelProps {
  detail: ProjectDetailView;
  onBookVisit: () => void;
  onReserve: () => void;
}

function Avatar({ src, name, size }: { src: string | null; name: string; size: number }) {
  return (
    <span className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eef2ff] text-xs font-semibold text-brand-900" style={{ width: size, height: size }}>
      {src ? <Image src={src} alt="" fill className="object-cover" sizes={`${size}px`} /> : initialsOf(name)}
    </span>
  );
}

/** The right column of a project page (Figma node 1060:30692): price and booking actions, the developer and the project team. */
export function ProjectActionPanel({ detail, onBookVisit, onReserve }: ProjectActionPanelProps) {
  const { project, developer } = detail;
  const { following, toggle } = useProjectFollow(project.id, project.following);
  const canReserve = detail.unitTypes.some((unit) => unit.isActive && unit.available > 0);

  return (
    <DetailAside className="xl:w-[380px]">
      <section className={`${CARD} gap-3.5`}>
        <p className="text-[22px] font-bold leading-[30px] text-[#0f172a]">{project.priceFrom}</p>
        <p className="text-xs leading-[17px] text-gray-500">
          {project.availableUnits} of {project.totalUnits} units left · {detail.followers} following
        </p>
        {detail.isOwner ? (
          <Link
            href={`/manage/projects/${project.id}`}
            className="flex h-12 items-center justify-center rounded-[10px] bg-brand-900 text-sm font-medium text-white hover:bg-brand-900/90"
          >
            Manage this project
          </Link>
        ) : (
          <>
            <Button variant="primary" onClick={onBookVisit} className={`h-12 ${ROUNDED}`}>
              Book a site visit
            </Button>
            <Button variant="outline" onClick={onReserve} disabled={!canReserve} className={`h-11 ${ROUNDED}`}>
              {canReserve ? "Reserve a unit" : "Sold out"}
            </Button>
          </>
        )}
        {detail.brochureUrl && (
          <a
            href={detail.brochureUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-full items-center justify-center rounded-[10px] bg-[#eff5ff] px-4 text-sm font-medium text-brand-900 hover:bg-[#e2edff]"
          >
            Download brochure
          </a>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={toggle} aria-pressed={following} className={UTILITY_BUTTON}>
            <BookmarkIcon saved={following} size={16} />
            {following ? "Following" : "Follow project"}
          </button>
          <button
            type="button"
            onClick={() => shareContent({ title: project.name, path: "" })}
            className={UTILITY_BUTTON}
          >
            <NavIcon icon="/icons/post-options-copy-link.svg" size={14} className="bg-[#334155]" />
            Share
          </button>
        </div>
      </section>

      <section className={CARD}>
        <div className="flex items-center gap-3">
          <Avatar src={developer.avatar} name={developer.name} size={48} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="truncate text-[15px] font-bold leading-[22px] text-[#0f172a]">{developer.name}</p>
            <p className="text-xs leading-[17px] text-gray-500">{developer.summary}</p>
          </div>
        </div>
        {developer.badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {developer.badges.map((badge) => (
              <span key={badge} className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium leading-[14px] text-[#16a34a]">
                {badge}
              </span>
            ))}
          </div>
        )}
      </section>

      {detail.team.length > 0 && (
        <section className={CARD}>
          <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Project team</h2>
          {detail.team.map((member) => (
            <div key={member.id} className="flex items-center gap-2.5">
              <Avatar src={member.avatar} name={member.name} size={32} />
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate text-[13px] font-semibold leading-[19px] text-[#0f172a]">{member.name}</p>
                <p className="truncate text-xs leading-[17px] text-gray-500">{member.role}</p>
              </div>
            </div>
          ))}
        </section>
      )}
    </DetailAside>
  );
}
