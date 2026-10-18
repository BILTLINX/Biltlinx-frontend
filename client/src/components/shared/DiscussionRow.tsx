"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { comingSoonHref } from "@/lib/coming-soon";
import type { Discussion } from "@/lib/dummy-communities";

/** A discussion from one of your communities (Figma node 1044:22182). */
export function DiscussionRow({ discussion, communityName }: { discussion: Discussion; communityName: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(comingSoonHref("Discussion"))}
      className="flex w-full items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left hover:bg-gray-50"
    >
      <span className="relative block size-10 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
        <Image src={discussion.avatar} alt="" fill className="object-cover" sizes="40px" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="flex flex-wrap items-center gap-x-1.5">
          <span className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">{discussion.author}</span>
          <span className="text-xs leading-[17px] text-gray-500">in {communityName}</span>
        </span>
        <span className="text-[15px] font-medium leading-[22px] text-[#0f172a]">{discussion.question}</span>
        <span className="text-xs leading-[17px] text-gray-500">{discussion.meta}</span>
      </span>
    </button>
  );
}
