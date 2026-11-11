"use client";

import Link from "next/link";
import { use, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { MilestonesPanel, ReservationsPanel, TeamPanel, UnitsPanel, UpdatesPanel, VisitsPanel } from "@/components/shared/ManageProjectPanels";
import { PageContainer } from "@/components/shared/PageContainer";
import { ProjectDetailsForm } from "@/components/shared/ProjectDetailsForm";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProjectDetail } from "@/hooks/useProjects";
import { errorMessage } from "@/lib/errors";
import { PROJECT_STATUS_TONE } from "@/lib/project-mapper";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "details", label: "Details" },
  { id: "units", label: "Units" },
  { id: "milestones", label: "Milestones" },
  { id: "team", label: "Team" },
  { id: "updates", label: "Site updates" },
  { id: "reservations", label: "Reservations" },
  { id: "visits", label: "Site visits" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ManageProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isPending, isError, error } = useProjectDetail(id);
  const [tab, setTab] = useState<TabId>("details");

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Projects", href: "/manage/projects" }, { label: data?.card.name ?? "Project" }]} />
        {isPending && <Skeleton className="h-40 w-full rounded-2xl" />}
        {isError && <p className="text-sm text-[#dc2626]">{errorMessage(error)}</p>}
        {data && !data.isOwner && (
          <p className="text-sm text-gray-500">
            This project belongs to someone else.{" "}
            <Link href={`/projects/${id}`} className="font-medium text-brand-900">
              View it instead
            </Link>
          </p>
        )}
        {data?.isOwner && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="min-w-0 flex-1 truncate text-2xl font-bold leading-8 text-[#0f172a]">{data.card.name}</h1>
              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", PROJECT_STATUS_TONE[data.card.status])}>{data.card.status}</span>
              {data.card.status === "Published" && (
                <Link href={`/projects/${id}`} className="text-[13px] font-medium text-brand-900">
                  View public page
                </Link>
              )}
            </div>
            <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-gray-200">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "shrink-0 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium",
                    tab === item.id ? "border-brand-900 text-brand-900" : "border-transparent text-gray-500 hover:text-[#0f172a]",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {tab === "details" && <ProjectDetailsForm initial={data} />}
            {tab === "units" && <UnitsPanel detail={data} />}
            {tab === "milestones" && <MilestonesPanel detail={data} />}
            {tab === "team" && <TeamPanel detail={data} />}
            {tab === "updates" && <UpdatesPanel detail={data} />}
            {tab === "reservations" && <ReservationsPanel projectId={id} />}
            {tab === "visits" && <VisitsPanel projectId={id} />}
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}
