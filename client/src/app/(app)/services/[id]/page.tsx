"use client";

import Link from "next/link";
import { use, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageContainer } from "@/components/shared/PageContainer";
import { PropertyGallery } from "@/components/shared/PropertyGallery";
import { ServiceActionPanel } from "@/components/shared/ServiceActionPanel";
import { ServiceDetailContent } from "@/components/shared/ServiceDetailContent";
import { getServiceDetail } from "@/lib/dummy-service-detail";

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const detail = getServiceDetail(id);
  const [optionId, setOptionId] = useState(detail?.options[0].id ?? "");

  return (
    <AppShell activeKey="services" activeChildKey="services" contentFullWidth>
      <PageContainer>
        {detail ? (
          <>
            <Breadcrumbs crumbs={detail.breadcrumbs} />
            <PropertyGallery gallery={detail.gallery} title={detail.service.title} />
            <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
              <ServiceDetailContent detail={detail} optionId={optionId} onOptionChange={setOptionId} />
              <ServiceActionPanel detail={detail} optionId={optionId} />
            </div>
          </>
        ) : (
          <>
            <Link href="/services" className="self-start text-sm font-medium text-brand-900">
              ‹ Back to services
            </Link>
            <p className="text-sm text-gray-500">This service is no longer available.</p>
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}
