"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { FollowButton } from "@/components/shared/FollowButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useFollowAccount } from "@/hooks/useFollowAccount";
import { getSuggestions } from "@/lib/social-api";
import type { SuggestedAccount } from "@/types/api/social";

export function WhoToFollowCard() {
  const { data, isPending, isError } = useQuery({ queryKey: ["suggestions"], queryFn: () => getSuggestions(5), staleTime: 60_000 });

  return (
    <div className="flex w-full flex-col gap-[15px] rounded-[15px] border border-[#e6d7ef] bg-white p-[11px]">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-bold text-gray-700">Who to follow</p>
      </div>
      {isPending && (
        <div className="flex flex-col gap-[15px]">
          <Skeleton className="h-[61px] w-full rounded-2xl" />
          <Skeleton className="h-[61px] w-full rounded-2xl" />
        </div>
      )}
      {isError && <p className="text-[11px] text-gray-500">Suggestions are unavailable right now.</p>}
      {data && data.length === 0 && (
        <EmptyState
          size="compact"
          icon="follow"
          title="No suggestions yet"
          body="Pick your interests and we’ll suggest people worth following."
          primary={{ label: "Choose interests", href: "/onboarding/personal" }}
          className="rounded-none border-0 p-0"
        />
      )}
      {data && data.length > 0 && (
        <ul className="flex flex-col gap-[15px]">
          {data.map((suggestion) => (
            <WhoToFollowRow key={suggestion.account.id} suggestion={suggestion} />
          ))}
        </ul>
      )}
    </div>
  );
}

function WhoToFollowRow({ suggestion }: { suggestion: SuggestedAccount }) {
  const { account } = suggestion;
  const { following, toggle } = useFollowAccount(account.id, account.isFollowedByMe);
  const role = suggestion.bio ?? (account.organizationName !== account.username ? account.organizationName : "");

  return (
    <li className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className="relative block h-[61px] w-[101px] shrink-0">
          <span className="relative block size-full overflow-hidden rounded-2xl bg-[#eef2ff]">
            {account.profilePicUrl ? (
              <Image src={account.profilePicUrl} alt={account.username} fill className="object-cover" sizes="101px" />
            ) : (
              <span className="absolute left-1/2 top-1/2 block size-[30px] -translate-x-1/2 -translate-y-1/2">
                <Image src="/icons/avatar-placeholder-user.svg" alt="" fill sizes="30px" />
              </span>
            )}
          </span>
          {account.isVerified && (
            <span className="absolute -bottom-1 -right-1 block size-[15px]">
              <Image src="/icons/avatar-verified-3xl-alt.svg" alt="Verified" fill sizes="15px" />
            </span>
          )}
        </span>
        <div className="flex min-w-0 flex-col">
          <p className="truncate text-[11px] font-bold text-gray-700">{account.username}</p>
          {role && <p className="truncate text-[7.6px] text-gray-500">{role}</p>}
        </div>
      </div>
      <FollowButton following={following} onToggle={toggle} name={account.username} />
    </li>
  );
}
