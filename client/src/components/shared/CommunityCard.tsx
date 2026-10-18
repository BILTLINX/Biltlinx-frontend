"use client";

import Image from "next/image";
import Link from "next/link";
import type { Community } from "@/lib/dummy-communities";
import { cn } from "@/lib/utils";

interface CommunityCardProps {
  community: Community;
  joined: boolean;
  onToggleJoin: () => void;
}

/** A suggested community (Figma node 1044:22155): cover image, name, type and size, blurb and a join button. */
export function CommunityCard({ community, joined, onToggleJoin }: CommunityCardProps) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <Link href={`/communities/${community.id}`} aria-label={community.name} className="relative block h-[110px] w-full shrink-0">
        <Image
          src={community.image}
          alt=""
          fill
          className="object-cover"
          sizes="(min-width: 1440px) 280px, (min-width: 640px) 45vw, 100vw"
        />
      </Link>
      <div className="flex flex-1 flex-col items-start gap-2 p-4">
        <h3 className="text-base font-bold leading-[23px] text-[#0f172a]">
          <Link href={`/communities/${community.id}`} className="hover:text-brand-900 hover:underline">
            {community.name}
          </Link>
        </h3>
        <p className="text-xs font-medium leading-[17px] text-gray-500">
          {community.type} · {community.members} members
        </p>
        <p className="text-[13px] leading-[19px] text-[#475569]">{community.description}</p>
        <button
          type="button"
          onClick={onToggleJoin}
          aria-pressed={joined}
          className={cn(
            "mt-auto h-9 w-full rounded-[10px] px-4 text-sm font-medium",
            joined
              ? "border border-gray-200 bg-white text-[#0f172a] hover:bg-gray-50"
              : "bg-[#eff5ff] text-brand-900 hover:bg-[#e2edff]",
          )}
        >
          {joined ? "Joined" : "Join"}
        </button>
      </div>
    </article>
  );
}
