"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { getTrendingHashtags } from "@/lib/social-api";

export function TrendingHashtagsCard() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["trending-hashtags"],
    queryFn: () => getTrendingHashtags(5),
    staleTime: 5 * 60_000,
  });

  return (
    <div className="flex w-full flex-col gap-[15px] rounded-[15px] border border-[#e6d7ef] bg-white p-[11px]">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-bold text-gray-700">Trending Hashtags</p>
      </div>
      {isPending && <Skeleton className="h-[90px] w-full rounded-lg" />}
      {isError && <p className="text-[11px] text-gray-500">Trends are unavailable right now.</p>}
      {data && data.length === 0 && (
        <EmptyState size="compact" icon="trends" title="No trends yet" body="The hashtags people use most will show up here." className="rounded-none border-0 p-0" />
      )}
      {data && data.length > 0 && (
        <ul className="flex flex-col gap-2">
          {data.map((hashtag) => (
            <li key={hashtag.tag} className="flex items-center justify-between gap-2">
              <Link href={`/feed?hashtag=${encodeURIComponent(hashtag.tag)}`} className="text-[11px] font-bold text-gray-700 hover:text-brand-900">
                #{hashtag.tag}
              </Link>
              <p className="text-[9.5px] font-bold text-brand-900">
                {hashtag.postCount} {hashtag.postCount === 1 ? "post" : "posts"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
