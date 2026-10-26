"use client";

import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { EventDetailContent } from "@/components/shared/EventDetailContent";
import { EventRsvpPanel } from "@/components/shared/EventRsvpPanel";
import { PageContainer } from "@/components/shared/PageContainer";
import { getEventDetail } from "@/lib/dummy-communities";

export default function EventDetailPage({ params }: { params: Promise<{ id: string; eventId: string }> }) {
  const { id, eventId } = use(params);
  const detail = getEventDetail(id, eventId);

  return (
    <AppShell activeKey="communities" contentFullWidth>
      <PageContainer>
        {detail ? (
          <>
            <Breadcrumbs crumbs={detail.breadcrumbs} />
            <div className="relative h-[160px] w-full overflow-hidden rounded-2xl bg-[#eef2ff] sm:h-[260px]">
              <Image src={detail.cover} alt="" fill priority className="object-cover" sizes="(min-width: 1280px) 1100px, 100vw" />
            </div>
            <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
              <EventDetailContent detail={detail} />
              <EventRsvpPanel detail={detail} />
            </div>
          </>
        ) : (
          <>
            <Link href={`/communities/${id}`} className="self-start text-sm font-medium text-brand-900">
              ‹ Back to community
            </Link>
            <p className="text-sm text-gray-500">This event is no longer available.</p>
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}
