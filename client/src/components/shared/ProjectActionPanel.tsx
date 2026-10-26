"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookmarkIcon } from "@/components/shared/BookmarkIcon";
import { NavIcon } from "@/components/shared/NavIcon";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import type { ProjectDetail } from "@/lib/dummy-project-detail";
import { shareContent } from "@/lib/share";
import { DetailAside } from "@/components/shared/DetailAside";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5";
const ROUNDED = "rounded-[10px] lg:rounded-[10px]";
const UTILITY_BUTTON =
  "flex items-center justify-center gap-1.5 rounded-[10px] border border-gray-200 py-2 text-[13px] font-medium leading-[19px] text-[#334155] hover:bg-gray-50";

/** The right column of a project page (Figma node 1060:30692): price and booking actions, the developer and the project team. */
export function ProjectActionPanel({ detail }: { detail: ProjectDetail }) {
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const { project, developer } = detail;
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <DetailAside className="xl:w-[380px]">
      <section className={`${CARD} gap-3.5`}>
        <p className="text-[22px] font-bold leading-[30px] text-[#0f172a]">{project.priceFrom}</p>
        <p className="text-xs leading-[17px] text-gray-500">2-bed · 9 units left</p>
        <Button variant="primary" onClick={comingSoon("Book a site visit")} className={`h-12 ${ROUNDED}`}>
          Book a site visit
        </Button>
        <Button variant="outline" onClick={comingSoon("Reserve a unit")} className={`h-11 ${ROUNDED}`}>
          Reserve a unit
        </Button>
        <button
          type="button"
          onClick={comingSoon("Download brochure")}
          className="h-10 w-full rounded-[10px] bg-[#eff5ff] px-4 text-sm font-medium text-brand-900 hover:bg-[#e2edff]"
        >
          Download brochure
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setFollowing((v) => !v)} aria-pressed={following} className={UTILITY_BUTTON}>
            <BookmarkIcon saved={following} size={16} />
            {following ? "Following" : "Follow project"}
          </button>
          <button
            type="button"
            onClick={() => shareContent({ title: project.name, path: `#project-${project.id}` })}
            className={UTILITY_BUTTON}
          >
            <NavIcon icon="/icons/post-options-copy-link.svg" size={14} className="bg-[#334155]" />
            Share
          </button>
        </div>
      </section>

      <section className={CARD}>
        <div className="flex items-center gap-3">
          <span className="relative block size-12 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
            <Image src={developer.avatar} alt="" fill className="object-cover" sizes="48px" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="truncate text-[15px] font-bold leading-[22px] text-[#0f172a]">{developer.name}</p>
            <p className="truncate text-xs leading-[17px] text-gray-500">{developer.summary}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {developer.badges.map((badge) => (
            <span key={badge} className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium leading-[14px] text-[#16a34a]">
              {badge}
            </span>
          ))}
        </div>
        <Button variant="outline" onClick={comingSoon("View developer")} className={`h-[38px] ${ROUNDED}`}>
          View developer
        </Button>
      </section>

      <section className={CARD}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Project team</h2>
        {detail.team.map((member) => (
          <div key={member.id} className="flex items-center gap-2.5">
            <span className="relative block size-8 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
              <Image src={member.avatar} alt="" fill className="object-cover" sizes="32px" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="truncate text-[13px] font-semibold leading-[19px] text-[#0f172a]">{member.name}</p>
              <p className="truncate text-xs leading-[17px] text-gray-500">{member.role}</p>
            </div>
          </div>
        ))}
      </section>
    </DetailAside>
  );
}
