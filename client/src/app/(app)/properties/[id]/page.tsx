"use client";

import Link from "next/link";
import { use } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageContainer } from "@/components/shared/PageContainer";
import { PropertyActionPanel } from "@/components/shared/PropertyActionPanel";
import { PropertyDetailContent } from "@/components/shared/PropertyDetailContent";
import { PropertyGallery } from "@/components/shared/PropertyGallery";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProperty } from "@/hooks/useProperties";
import { errorKind } from "@/lib/errors";

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { property, detail, similar } = useProperty(id);

  return (
    <AppShell activeKey="property" activeChildKey="properties" contentFullWidth>
      <PageContainer>
        {property.isPending && (
          <>
            <Skeleton className="h-[320px] w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </>
        )}
        {detail && (
          <>
            <Breadcrumbs crumbs={detail.breadcrumbs} />
            <PropertyGallery gallery={detail.gallery} title={detail.card.title} />
            <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
              <PropertyDetailContent detail={detail} similar={similar} />
              <PropertyActionPanel detail={detail} />
            </div>
          </>
        )}
        {property.isError && (
          <>
            <Link href="/properties" className="self-start text-sm font-medium text-brand-900">
              ‹ Back to properties
            </Link>
            {errorKind(property.error) === "notFound" ? (
              <p className="text-sm text-gray-500">This property is no longer available.</p>
            ) : (
              <button type="button" onClick={() => void property.refetch()} className="self-start text-sm font-medium text-brand-900">
                Could not load this property. Try again
              </button>
            )}
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}
