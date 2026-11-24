"use client";

import Image from "next/image";
import { useState } from "react";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { cn } from "@/lib/utils";
import type { PortfolioItemDto, PortfolioMediaDto } from "@/types/api/schema";

const isVideo = (file: PortfolioMediaDto) => Boolean(file.contentType?.startsWith("video/"));

/** One finished project (or a photo set) from a provider's portfolio: every photo or video with its stage and caption, the year and the description. */
export function ProjectDetailDialog({ item, onClose }: { item: PortfolioItemDto; onClose: () => void }) {
  const files = (item.media ?? []).filter((file) => file.url);
  const [index, setIndex] = useState(0);
  const current = files[index];

  return (
    <CenteredDialog open onClose={onClose} labelledBy="project-detail-title" className="max-w-[720px]">
      <div className="flex shrink-0 items-start justify-between gap-3 px-5 pb-3 pt-4 sm:px-6">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 id="project-detail-title" className="text-lg font-bold leading-7 text-[#0f172a] sm:text-xl">
            {item.title ?? "Project"}
          </h2>
          {item.completedYear && <p className="text-[13px] leading-[19px] text-gray-500">Completed {item.completedYear}</p>}
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="-mr-1 shrink-0 p-1 text-lg text-gray-500 hover:text-[#0f172a]">
          ✕
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-5 pb-5 sm:px-6">
        {current ? (
          <>
            <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-[#eef2ff]">
              {isVideo(current) ? (
                <video key={current.url} src={current.url ?? undefined} controls className="size-full object-contain" />
              ) : (
                <Image src={current.url as string} alt={current.caption ?? item.title ?? ""} fill unoptimized className="object-contain" sizes="720px" />
              )}
              {current.stage && current.stage !== "Work" && <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#0f172a]">{current.stage}</span>}
            </div>
            {current.caption && <p className="text-[13px] leading-[19px] text-gray-500">{current.caption}</p>}

            {files.length > 1 && (
              <div className="no-scrollbar flex gap-2 overflow-x-auto">
                {files.map((file, at) => (
                  <button
                    key={`${file.url}-${at}`}
                    type="button"
                    aria-label={`Show ${at + 1} of ${files.length}`}
                    aria-current={at === index}
                    onClick={() => setIndex(at)}
                    className={cn("relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-[#eef2ff] ring-2", at === index ? "ring-brand-900" : "ring-transparent")}
                  >
                    {isVideo(file) ? <span className="flex size-full items-center justify-center bg-[#0f172a] text-xs font-medium text-white">Video</span> : <Image src={file.url as string} alt="" fill unoptimized className="object-cover" sizes="80px" />}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="rounded-xl bg-[#f8fafc] p-4 text-center text-sm text-gray-500">No photos were added to this project.</p>
        )}

        {item.description && <p className="whitespace-pre-line text-sm leading-6 text-[#334155]">{item.description}</p>}
      </div>
    </CenteredDialog>
  );
}
