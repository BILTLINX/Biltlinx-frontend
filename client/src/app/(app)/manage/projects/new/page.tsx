"use client";

import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageContainer } from "@/components/shared/PageContainer";
import { ProjectDetailsForm } from "@/components/shared/ProjectDetailsForm";

export default function NewProjectPage() {
  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Projects", href: "/manage/projects" }, { label: "New project" }]} />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">New project</h1>
          <p className="text-sm leading-5 text-gray-500">Start with the basics. You add unit types, milestones and the team next, then publish.</p>
        </div>
        <ProjectDetailsForm />
      </PageContainer>
    </AppShell>
  );
}
