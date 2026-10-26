"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { CommunityDetailContent } from "@/components/shared/CommunityDetailContent";
import { CommunitySidePanel } from "@/components/shared/CommunitySidePanel";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { getCommunityDetail } from "@/lib/dummy-communities";
import { shareContent } from "@/lib/share";

export default function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const detail = getCommunityDetail(id);
  const [joined, setJoined] = useState(false);

  return (
    <AppShell activeKey="communities" contentFullWidth>
      <PageContainer>
        {detail ? (
          <>
            <Breadcrumbs crumbs={detail.breadcrumbs} />
            <div className="relative h-[120px] w-full overflow-hidden rounded-2xl bg-[#eef2ff] sm:h-[180px]">
              <Image src={detail.community.image} alt="" fill priority className="object-cover" sizes="(min-width: 1280px) 1100px, 100vw" />
            </div>
            <header className="flex w-full flex-wrap items-center gap-x-4 gap-y-3">
              <div className="flex min-w-[220px] flex-1 flex-col gap-1">
                <h1 className="text-2xl font-bold leading-8 text-[#0f172a] sm:text-[26px] sm:leading-[34px]">{detail.community.name}</h1>
                <p className="text-sm leading-5 text-gray-500">
                  Public community · {detail.community.members} members · {detail.activity}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant={joined ? "outline" : "primary"}
                  onClick={() => setJoined((value) => !value)}
                  aria-pressed={joined}
                  className="h-11 w-auto rounded-[10px] px-4 lg:rounded-[10px]"
                >
                  {joined ? "Joined" : "Join community"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareContent({ title: detail.community.name, path: `#community-${detail.community.id}` })}
                  className="h-11 w-auto rounded-[10px] px-4 lg:rounded-[10px]"
                >
                  Share
                </Button>
              </div>
            </header>
            <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
              <CommunityDetailContent detail={detail} joined={joined} />
              <CommunitySidePanel detail={detail} />
            </div>
          </>
        ) : (
          <>
            <Link href="/communities" className="self-start text-sm font-medium text-brand-900">
              ‹ Back to communities
            </Link>
            <p className="text-sm text-gray-500">This community is no longer available.</p>
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}
