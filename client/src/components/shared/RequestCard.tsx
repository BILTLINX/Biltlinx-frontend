"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { SendQuoteModal } from "@/components/shared/SendQuoteModal";
import { Button } from "@/components/ui/Button";
import type { JobRequest } from "@/lib/dummy-requests";
import { cn } from "@/lib/utils";

/** One job request (Figma node 1043:22477): category and timing, quote count, title, location and budget, poster, and view / quote actions. */
export function RequestCard({ request }: { request: JobRequest }) {
  const router = useRouter();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const detailHref = `/request-board/${request.id}`;

  return (
    <>
      <article className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#eff5ff] px-2.5 py-1 text-xs font-medium leading-4 text-brand-900">
              {request.category}
            </span>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium leading-4",
                request.urgent
                  ? "bg-[#fee2e2] text-[#dc2626]"
                  : "bg-[#f1f5f9] text-[#334155]",
              )}
            >
              {request.timing}
            </span>
          </div>
          <p className="shrink-0 whitespace-nowrap text-[13px] font-medium leading-[19px] text-gray-500">
            {request.quotes} {request.quotes === 1 ? "quote" : "quotes"}
          </p>
        </div>

        <h2 className="text-[17px] font-bold leading-[25px] text-[#0f172a]">
          <Link
            href={detailHref}
            className="hover:text-brand-900 hover:underline"
          >
            {request.title}
          </Link>
        </h2>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs leading-[17px] text-gray-500">
          <p className="flex items-center gap-1.5">
            <NavIcon
              icon="/icons/post-options-location.svg"
              size={12}
              className="bg-gray-500"
            />
            {request.location}
          </p>
          <p className="flex items-center gap-1.5">
            <NavIcon
              icon="/icons/wallet-01.svg"
              size={12}
              className="bg-gray-500"
            />
            {request.budget}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="relative block size-7 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
              <Image
                src={request.posterAvatar}
                alt=""
                fill
                className="object-cover"
                sizes="28px"
              />
            </span>
            <p className="text-xs leading-[17px] text-gray-500">
              Posted by {request.poster} · {request.postedAgo}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(detailHref)}
              className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]"
            >
              View details
            </Button>
            <Button
              variant="primary"
              onClick={() => setQuoteOpen(true)}
              className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]"
            >
              Send quote
            </Button>
          </div>
        </div>
      </article>
      {quoteOpen && (
        <SendQuoteModal
          open
          onClose={() => setQuoteOpen(false)}
          request={{ poster: request.poster, title: request.title }}
        />
      )}
    </>
  );
}
