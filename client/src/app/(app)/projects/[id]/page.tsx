"use client";

import Link from "next/link";
import { use } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageContainer } from "@/components/shared/PageContainer";
import { ProjectActionPanel } from "@/components/shared/ProjectActionPanel";
import { ProjectDetailContent } from "@/components/shared/ProjectDetailContent";
import { PropertyGallery } from "@/components/shared/PropertyGallery";
import { getProjectDetail } from "@/lib/dummy-project-detail";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const detail = getProjectDetail(id);

  return (
    <AppShell activeKey="property" activeChildKey="projects" contentFullWidth>
      <PageContainer>
        {detail ? (
          <>
            <Breadcrumbs crumbs={detail.breadcrumbs} />
            <PropertyGallery gallery={detail.gallery} title={detail.project.name} />
            <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
              <ProjectDetailContent detail={detail} />
              <ProjectActionPanel detail={detail} />
            </div>
          </>
        ) : (
          <>
            <Link href="/projects" className="self-start text-sm font-medium text-brand-900">
              ‹ Back to projects
            </Link>
            <p className="text-sm text-gray-500">This project is no longer available.</p>
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}
