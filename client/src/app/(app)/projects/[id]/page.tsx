"use client";

import Link from "next/link";
import { use, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageContainer } from "@/components/shared/PageContainer";
import { ProjectActionPanel } from "@/components/shared/ProjectActionPanel";
import { ProjectDetailContent } from "@/components/shared/ProjectDetailContent";
import { ProjectReserveModal } from "@/components/shared/ProjectReserveModal";
import { ProjectVisitModal } from "@/components/shared/ProjectVisitModal";
import { PropertyGallery } from "@/components/shared/PropertyGallery";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProjectDetail } from "@/hooks/useProjects";
import { errorMessage } from "@/lib/errors";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { detail, isPending, isError, error } = useProjectDetail(id);
  const [visitOpen, setVisitOpen] = useState(false);
  const [reserve, setReserve] = useState<{ open: boolean; unitId: string | null; run: number }>({ open: false, unitId: null, run: 0 });

  function openReserve(unitId: string | null) {
    setReserve((current) => ({ open: true, unitId, run: current.run + 1 }));
  }

  return (
    <AppShell activeKey="property" activeChildKey="projects" contentFullWidth>
      <PageContainer>
        {detail ? (
          <>
            <Breadcrumbs crumbs={detail.breadcrumbs} />
            <PropertyGallery gallery={detail.gallery} title={detail.project.name} />
            <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
              <ProjectDetailContent detail={detail} onReserve={openReserve} />
              <ProjectActionPanel detail={detail} onBookVisit={() => setVisitOpen(true)} onReserve={() => openReserve(null)} />
            </div>
            <ProjectVisitModal open={visitOpen} onClose={() => setVisitOpen(false)} projectId={detail.project.id} projectName={detail.project.name} />
            <ProjectReserveModal
              key={reserve.run}
              open={reserve.open}
              onClose={() => setReserve((current) => ({ ...current, open: false }))}
              projectId={detail.project.id}
              projectName={detail.project.name}
              units={detail.unitTypes}
              initialUnitId={reserve.unitId}
            />
          </>
        ) : isPending ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-[320px] w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            <Link href="/projects" className="self-start text-sm font-medium text-brand-900">
              ‹ Back to projects
            </Link>
            <p className="text-sm text-gray-500">{isError ? errorMessage(error, "This project is no longer available.") : "This project is no longer available."}</p>
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}
