"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageContainer } from "@/components/shared/PageContainer";
import { RequestActionPanel } from "@/components/shared/RequestActionPanel";
import { RequestDetailContent } from "@/components/shared/RequestDetailContent";
import { getRequestDetail, type JobRequest } from "@/lib/dummy-requests";
import { loadPostedRequests } from "@/lib/posted-requests";

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [posted, setPosted] = useState<JobRequest[]>([]);
  const detail = getRequestDetail(id, posted);

  // Requests the visitor posted live in local storage, so they are only known after mount.
  useEffect(() => setPosted(loadPostedRequests()), []);

  return (
    <AppShell activeKey="services" activeChildKey="request-board" contentFullWidth>
      <PageContainer>
        {detail ? (
          <>
            <Breadcrumbs crumbs={detail.breadcrumbs} />
            <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
              <RequestDetailContent detail={detail} />
              <RequestActionPanel detail={detail} />
            </div>
          </>
        ) : (
          <>
            <Link href="/request-board" className="self-start text-sm font-medium text-brand-900">
              ‹ Back to request board
            </Link>
            <p className="text-sm text-gray-500">This request is no longer available.</p>
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}
