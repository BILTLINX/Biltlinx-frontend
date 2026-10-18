"use client";

import Link from "next/link";
import { use } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageContainer } from "@/components/shared/PageContainer";
import { PropertyActionPanel } from "@/components/shared/PropertyActionPanel";
import { PropertyDetailContent } from "@/components/shared/PropertyDetailContent";
import { PropertyGallery } from "@/components/shared/PropertyGallery";
import { usePostsFeed } from "@/context/PostsContext";
import { getPropertyDetail } from "@/lib/dummy-property-detail";
import { FEED_POSTS } from "@/lib/dummy-posts";

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { posts } = usePostsFeed();
  const detail = getPropertyDetail(id, [...posts, ...FEED_POSTS]);

  return (
    <AppShell activeKey="property" activeChildKey="properties" contentFullWidth>
      <PageContainer>
        {detail ? (
          <>
            <Breadcrumbs crumbs={detail.breadcrumbs} />
            <PropertyGallery gallery={detail.gallery} title={detail.listing.title} />
            <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
              <PropertyDetailContent detail={detail} />
              <PropertyActionPanel detail={detail} />
            </div>
          </>
        ) : (
          <>
            <Link href="/properties" className="self-start text-sm font-medium text-brand-900">
              ‹ Back to properties
            </Link>
            <p className="text-sm text-gray-500">This property is no longer available.</p>
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}
