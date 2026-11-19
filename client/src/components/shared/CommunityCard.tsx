"use client";

import Image from "next/image";
import Link from "next/link";
import { NavIcon } from "@/components/shared/NavIcon";
import { memberCount, type Community } from "@/lib/dummy-communities";
import { cn } from "@/lib/utils";

interface CommunityCardProps {
  community: Community;
  joined: boolean;
  onToggleJoin: () => void;
}

const ACTION = "flex h-10 shrink-0 items-center justify-center rounded-full px-[18px] text-sm font-semibold leading-[1.35]";

/** A suggested community (Figma node 1532:48255): photo with its type, name, one-line purpose, and member count with Join. The whole card opens the community. */
export function CommunityCard({ community, joined, onToggleJoin }: CommunityCardProps) {
  const href = `/communities/${community.id}`;

  return (
    <article className="relative flex min-w-0 flex-col gap-2.5 overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white p-2 shadow-[0px_10px_24px_-6px_rgba(15,23,41,0.08)]">
      <div className="relative h-[132px] w-full overflow-hidden rounded-[18px] bg-[#eef2ff]">
        <Image src={community.image} alt="" fill className="object-cover" sizes="(min-width: 1440px) 280px, (min-width: 640px) 45vw, 100vw" />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold leading-[1.35] text-[#0f172a]">{community.type}</span>
      </div>

      <div className="flex flex-col gap-0.5 px-1.5 leading-[1.35]">
        <h3 className="truncate text-base font-bold text-[#0f172a]">{community.name}</h3>
        <p className="truncate text-[13px] text-[#475569]">{community.description}</p>
      </div>

      <div className="flex items-center gap-1.5 rounded-full bg-[#eef4ff] py-1 pl-3 pr-1">
        <NavIcon icon="/icons/community-members.svg" size={16} className="bg-[#1465E6]" />
        <p className="min-w-0 flex-1 truncate text-[13px] font-semibold leading-[1.35] text-[#0f172a]">{memberCount(community)}</p>
        {/* You cannot leave a community you started, so its card opens it instead. */}
        {community.mine ? (
          <Link href={href} className={cn(ACTION, "relative z-10 border border-[#e2e8f0] bg-white text-[#0f172a] hover:bg-gray-50")}>
            Open
          </Link>
        ) : (
          <button
            type="button"
            onClick={onToggleJoin}
            aria-pressed={joined}
            className={cn(ACTION, "relative z-10", joined ? "border border-[#e2e8f0] bg-white text-[#0f172a] hover:bg-gray-50" : "bg-[#1465e6] text-white hover:bg-[#0f52c0]")}
          >
            {joined ? "Joined" : "Join"}
          </button>
        )}
      </div>

      {/* Last, so it sits over the photo and text; the button above it keeps its own click. */}
      <Link href={href} aria-label={community.name} className="absolute inset-0" />
    </article>
  );
}
